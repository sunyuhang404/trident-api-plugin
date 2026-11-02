import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { serialize, deserialize } from 'node:v8';

const structuredClone = value => deserialize(serialize(value));

const pluginPath = process.env.TRIPO_PLUGIN_PATH || new URL('../plugins/tasks/tripo/1.0.0/plugin.js', import.meta.url);
const source = fs.readFileSync(pluginPath, 'utf8');
const plugin = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
globalThis.utils = { json: { clone: value => structuredClone(value) } };
const versions = ['v3.1-20260211', 'v3.0-20250812', 'v2.5-20250123', 'P1-20260311', 'P2-20260801'];
const baseFields = ['a_untextured_model_count', 'b_textured_model_count'];
const textureFields = [...baseFields, 'c_hd_texture_count', 'd_texture_8k_count'];
const hFields = [...textureFields, 'f_quad_count', 'e_ultra_geometry_count', 'g_low_poly_count', 'h_parts_count'];
const fieldsByModel = {
  'v3.1-20260211': hFields,
  'v3.0-20250812': hFields,
  'v2.5-20250123': baseFields,
  'P1-20260311': textureFields,
  'P2-20260801': [...textureFields, 'f_quad_count'],
};
function facts(model, selected) {
  return Object.fromEntries(fieldsByModel[model].map(key => [key, selected.includes(key) ? 1 : 0]));
}
function decode(body, suffix = 'generation/text-to-model') {
  return plugin.native.decodeSubmit({ path: '/tripo/v3/' + suffix, body: { kind: 'json', value: body } });
}
function context(model, options = {}) {
  return { model, upstreamModel: model, action: 'text-to-model', requestBody: { model, prompt: 'a wooden chair', ...options } };
}

test('official models resolve independently and expose only their applicable prices', () => {
  assert.deepEqual(plugin.meta.models, ['tripo', ...versions]);
  for (const model of versions) {
    const body = { model, prompt: 'a wooden chair', texture: false, pbr: false };
    const original = structuredClone(body);
    const intent = decode(body);
    assert.equal(intent.model, model);
    assert.deepEqual(intent.requestBody, body);
    assert.deepEqual(body, original);
    const profile = plugin.meta.usageProfiles.find(profile => profile.models.includes(model));
    assert.deepEqual(Object.keys(profile.schema).sort(), [...fieldsByModel[model]].sort());
    for (const example of profile.examples) {
      assert.deepEqual(Object.keys(example.facts).sort(), Object.keys(profile.schema).sort());
    }
    assert.deepEqual(plugin.extractUsage(context(model, { texture: false, pbr: false })), facts(model, ['a_untextured_model_count']));
    assert.deepEqual(plugin.extractUsage(context(model)), facts(model, ['b_textured_model_count']));
  }
});

test('default model and PBR texture defaults preserve the upstream request semantics', () => {
  const body = { prompt: 'a wooden chair' };
  const intent = decode(body);
  assert.equal(intent.model, versions[0]);
  assert.equal(intent.requestBody.model, versions[0]);
  assert.deepEqual(body, { prompt: 'a wooden chair' });
  const expected = facts(versions[0], ['b_textured_model_count']);
  assert.deepEqual(plugin.extractUsage(context(versions[0], { texture: false })), expected);
  assert.deepEqual(plugin.extractUsage(context(versions[0], { texture: true, pbr: false })), expected);
  assert.deepEqual(plugin.extractUsage(context(versions[0], { texture: false, pbr: false })), facts(versions[0], ['a_untextured_model_count']));
});

test('HD and 8K upgrades each add to one textured base price without adding each other', () => {
  for (const model of [versions[0], versions[1], versions[3], versions[4]]) {
    assert.deepEqual(plugin.extractUsage(context(model, { texture_quality: 'detailed' })), facts(model, ['b_textured_model_count', 'c_hd_texture_count']));
    assert.deepEqual(plugin.extractUsage(context(model, { texture_quality: 'extreme' })), facts(model, ['b_textured_model_count', 'd_texture_8k_count']));
    assert.deepEqual(plugin.extractUsage(context(model, { texture_quality: 'extreme', texture: false, pbr: false })), facts(model, ['a_untextured_model_count']));
    assert.deepEqual(plugin.extractUsage(context(model, { texture_quality: 'fast', texture_version: 'v3.5-20260815' })), facts(model, ['b_textured_model_count']));
  }
});

test('geometry options bill only effective features for the selected model', () => {
  const model = versions[0];
  assert.deepEqual(plugin.extractUsage(context(model, { quad: true, smart_low_poly: true, geometry_quality: 'detailed' })), facts(model, ['b_textured_model_count', 'f_quad_count', 'g_low_poly_count', 'e_ultra_geometry_count']));
  assert.deepEqual(plugin.extractUsage(context(model, { texture: false, pbr: false, generate_parts: true, quad: true })), facts(model, ['a_untextured_model_count', 'h_parts_count']));
  assert.deepEqual(plugin.extractUsage(context(model, { texture: false, pbr: false, generate_parts: true, smart_low_poly: true, quad: true })), facts(model, ['a_untextured_model_count', 'g_low_poly_count', 'f_quad_count']));
  assert.deepEqual(plugin.extractUsage(context(versions[2], { quad: true, geometry_quality: 'detailed', texture_quality: 'extreme' })), facts(versions[2], ['b_textured_model_count']));
  assert.deepEqual(plugin.extractUsage(context(versions[3], { quad: true, smart_low_poly: true, geometry_quality: 'detailed' })), facts(versions[3], ['b_textured_model_count']));
  assert.deepEqual(plugin.extractUsage(context(versions[4], { quad: true })), facts(versions[4], ['b_textured_model_count', 'f_quad_count']));
});

test('a model price configuration can reproduce separate H, P1 and P2 base prices', () => {
  const prices = {
    [versions[0]]: { a_untextured_model_count: 10, b_textured_model_count: 20, c_hd_texture_count: 10, d_texture_8k_count: 20, f_quad_count: 5, e_ultra_geometry_count: 20, g_low_poly_count: 10, h_parts_count: 20 },
    [versions[3]]: { a_untextured_model_count: 30, b_textured_model_count: 40 },
    [versions[4]]: { a_untextured_model_count: 100, b_textured_model_count: 110 },
  };
  for (const [model, expected] of [[versions[0], 10], [versions[3], 30], [versions[4], 100]]) {
    const usage = plugin.extractUsage(context(model, { texture: false, pbr: false }));
    assert.equal(Object.entries(usage).reduce((sum, [key, value]) => sum + value * (prices[model][key] || 0), 0), expected);
  }
  const usage = plugin.extractUsage(context(versions[0], { texture_quality: 'extreme', geometry_quality: 'detailed', quad: true }));
  assert.equal(Object.entries(usage).reduce((sum, [key, value]) => sum + value * prices[versions[0]][key], 0), 65);
});

test('final channel model mapping agrees with usage, upstream body and frozen completion facts', () => {
  const ctx = { ...context(versions[0], { texture: false, pbr: false }), model: 'mapped-alias', upstreamModel: versions[4], baseUrl: 'https://openapi.tripo3d.com/v3', authHeader: 'Bearer fixture', originTasks: [] };
  const original = structuredClone(ctx.requestBody);
  const request = plugin.buildSubmitRequest(ctx);
  assert.equal(request.body.model, versions[4]);
  assert.equal(request.body.texture, false);
  assert.equal(request.body.pbr, false);
  assert.equal(request.url, 'https://openapi.tripo3d.com/v3/generation/text-to-model');
  assert.equal(request.model, undefined);
  const expected = facts(versions[4], ['a_untextured_model_count']);
  assert.deepEqual(plugin.extractUsage(ctx), expected);
  const submitted = plugin.parseSubmitResponse(ctx, { body: { code: 0, data: { task_id: 'task_fixture' } } });
  assert.deepEqual(submitted.state, expected);
  assert.deepEqual(plugin.extractUsageOnComplete({ action: ctx.action, model: ctx.model, upstreamModel: ctx.upstreamModel, state: submitted.state }, { status: 'SUCCESS' }), expected);
  assert.deepEqual(ctx.requestBody, original);
});

test('unconfigured model identities and malformed billing options are rejected before submission', () => {
  for (const model of ['', null, 3, 'tripo', 'v9', 'P3-20260801', 'toString']) {
    assert.throws(() => decode({ prompt: 'a chair', model }), /model is not supported/);
  }
  for (const key of ['texture', 'pbr', 'quad', 'smart_low_poly', 'generate_parts']) {
    for (const value of ['false', 0, null]) {
      assert.throws(() => decode({ model: versions[0], prompt: 'a chair', [key]: value }), /must be a boolean/);
      assert.throws(() => plugin.extractUsage(context(versions[0], { [key]: value })), /must be a boolean/);
    }
  }
  assert.throws(() => decode({ prompt: 'a chair', texture_quality: 'invalid' }), /texture quality/);
  assert.throws(() => decode({ prompt: 'a chair', geometry_quality: 'invalid' }), /geometry quality/);
  assert.throws(() => decode({ prompt: 'a chair', texture_quality: 'fast' }), /texture_version/);
  assert.throws(() => decode({ prompt: 'a chair', generate_parts: true }), /texture=false and pbr=false/);
});

test('completion preserves the reservation on invalid state and does not emit usage on failure', () => {
  const model = versions[0];
  const state = facts(model, ['b_textured_model_count']);
  const task = { action: 'text-to-model', model, upstreamModel: model, state };
  for (const value of [-1, 2, NaN, Infinity, '1', null]) {
    assert.equal(plugin.extractUsageOnComplete({ ...task, state: { ...state, f_quad_count: value } }, { status: 'SUCCESS' }), null);
  }
  assert.equal(plugin.extractUsageOnComplete({ ...task, state: { ...state, a_untextured_model_count: 1 } }, { status: 'SUCCESS' }), null);
  assert.equal(plugin.extractUsageOnComplete({ ...task, state: {} }, { status: 'SUCCESS' }), null);
  assert.equal(plugin.extractUsageOnComplete(task, { status: 'FAILURE' }), null);
  const before = structuredClone(state);
  assert.deepEqual(plugin.extractUsageOnComplete(task, { status: 'SUCCESS' }), before);
  assert.deepEqual(state, before);
});

test('other task routes and existing tripo task settlement retain the legacy contract', () => {
  const body = { input: 'https://example.com/image.png', model: versions[4], texture: false, pbr: false };
  const intent = decode(body, 'generation/image-to-model');
  assert.equal(intent.model, 'tripo');
  assert.deepEqual(intent.requestBody, body);
  const usage = plugin.extractUsage({ model: 'tripo', action: 'image-to-model', requestBody: body });
  assert.equal(usage.task_type, 'image-to-model');
  assert.equal(usage.a_task, 1);
  assert.equal(usage.e_p_series, 1);
  assert.equal(usage.b_texture, 0);
  assert.deepEqual(plugin.extractUsageOnComplete({ model: 'tripo', action: 'image-to-model', state: usage }, { status: 'SUCCESS' }), usage);
  const oldTextUsage = plugin.extractUsage({ model: 'tripo', action: 'text-to-model', requestBody: { prompt: 'a chair' } });
  assert.deepEqual(plugin.extractUsageOnComplete({ model: 'tripo', action: 'text-to-model', state: oldTextUsage }, { status: 'SUCCESS' }), oldTextUsage);
  assert.equal(plugin.extractUsage({ model: versions[0], action: 'text-to-model', usagePurpose: 'billing_ratios', requestBody: {} }), null);
});
