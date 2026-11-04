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
function facts(model, selected, action = "text-to-model") {
  return { task_type: action, ...Object.fromEntries(fieldsByModel[model].map(key => [key, selected.includes(key) ? 1 : 0])) };
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
    assert.deepEqual(Object.keys(profile.schema).sort(), ["task_type", ...fieldsByModel[model]].sort());
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
    assert.equal(Object.entries(usage).filter(([, value]) => typeof value === "number").reduce((sum, [key, value]) => sum + value * (prices[model][key] || 0), 0), expected);
  }
  const usage = plugin.extractUsage(context(versions[0], { texture_quality: 'extreme', geometry_quality: 'detailed', quad: true }));
  assert.equal(Object.entries(usage).filter(([, value]) => typeof value === "number").reduce((sum, [key, value]) => sum + value * prices[versions[0]][key], 0), 65);
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
  const legacyBody = { input: "task_origin", model: "v3.0-20250812" };
  const intent = decode(legacyBody, 'models/texture');
  assert.equal(intent.model, 'tripo');
  assert.deepEqual(intent.requestBody, legacyBody);
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

const generationInputs = {
  'text-to-model': { prompt: 'a wooden chair' },
  'image-to-model': { input: 'https://example.com/chair.png' },
  'multiview-to-model': { inputs: [{ front: 'https://example.com/front.png' }, { left: 'https://example.com/left.png' }] },
};

test('all five models route and settle each generation method under the same official model identity', () => {
  for (const model of versions) {
    const profile = plugin.meta.usageProfiles.find(profile => profile.models.includes(model));
    assert.deepEqual(profile.schema.task_type.enum, Object.keys(generationInputs));
    assert.deepEqual([...new Set(profile.examples.map(example => example.facts.task_type))].sort(), Object.keys(generationInputs).sort());
    for (const [action, input] of Object.entries(generationInputs)) {
      const body = { model, ...structuredClone(input), texture: false, pbr: false };
      const original = structuredClone(body);
      const intent = decode(body, 'generation/' + action);
      assert.equal(intent.model, model);
      assert.equal(intent.action, action);
      assert.deepEqual(intent.requestBody, body);
      const ctx = { model, upstreamModel: model, action, requestBody: intent.requestBody, baseUrl: 'https://openapi.tripo3d.com/v3', authHeader: 'Bearer fixture' };
      const expected = facts(model, ['a_untextured_model_count'], action);
      assert.deepEqual(plugin.extractUsage(ctx), expected);
      const request = plugin.buildSubmitRequest(ctx);
      assert.equal(request.url, 'https://openapi.tripo3d.com/v3/generation/' + action);
      assert.equal(request.body.model, model);
      assert.deepEqual(request.body, body);
      const submitted = plugin.parseSubmitResponse(ctx, { body: { code: 0, data: { task_id: 'task_fixture' } } });
      assert.deepEqual(submitted.state, expected);
      assert.deepEqual(plugin.extractUsageOnComplete({ action, model, upstreamModel: model, state: submitted.state }, { status: 'SUCCESS' }), expected);
      assert.deepEqual(body, original);
    }
  }
});

test('generation method comes from the route and supports separate text, image and multiview prices', () => {
  const prices = {
    [versions[0]]: { 'text-to-model': [10, 20], 'image-to-model': [20, 30], 'multiview-to-model': [20, 30] },
    [versions[3]]: { 'text-to-model': [30, 40], 'image-to-model': [40, 50], 'multiview-to-model': [40, 50] },
    [versions[4]]: { 'text-to-model': [100, 110], 'image-to-model': [100, 110], 'multiview-to-model': [100, 110] },
  };
  for (const [model, byMethod] of Object.entries(prices)) {
    for (const [action, expectedPrices] of Object.entries(byMethod)) {
      const body = { model, ...structuredClone(generationInputs[action]), task_type: 'text-to-model' };
      const intent = decode(body, 'generation/' + action);
      for (const textured of [false, true]) {
        const usage = plugin.extractUsage({ model, upstreamModel: model, action: intent.action, requestBody: { ...intent.requestBody, texture: textured, pbr: textured } });
        assert.equal(usage.task_type, action);
        assert.equal(usage.a_untextured_model_count * byMethod[usage.task_type][0] + usage.b_textured_model_count * byMethod[usage.task_type][1], expectedPrices[textured ? 1 : 0]);
      }
    }
  }
});

test('image and multiview model mappings preserve input references and freeze the selected method', () => {
  for (const action of ['image-to-model', 'multiview-to-model']) {
    const input = action === 'image-to-model' ? { input: 'public_origin' } : { inputs: [{ task_id: 'public_origin' }] };
    const body = { model: versions[0], ...input, texture_quality: 'extreme' };
    const ctx = { model: 'alias', upstreamModel: versions[4], action, requestBody: body, originTasks: [{ taskId: 'public_origin', upstreamTaskId: 'upstream_origin' }], baseUrl: 'https://gateway.example', authHeader: 'Bearer fixture', upstream: { kind: 'new_api' } };
    const original = structuredClone(body);
    const intent = decode(body, 'generation/' + action);
    assert.deepEqual(intent.originTaskIds, ['public_origin']);
    const request = plugin.buildSubmitRequest(ctx);
    assert.equal(request.url, 'https://gateway.example/tripo/v3/generation/' + action);
    assert.equal(request.body.model, versions[4]);
    assert.equal(action === 'image-to-model' ? request.body.input : request.body.inputs[0].task_id, 'upstream_origin');
    const expected = facts(versions[4], ['b_textured_model_count', 'd_texture_8k_count'], action);
    assert.deepEqual(plugin.extractUsage(ctx), expected);
    const submitted = plugin.parseSubmitResponse(ctx, { body: { code: 0, data: { task_id: 'task_fixture' } } });
    assert.deepEqual(plugin.extractUsageOnComplete({ action, model: 'alias', upstreamModel: versions[4], state: submitted.state }, { status: 'SUCCESS' }), expected);
    assert.deepEqual(body, original);
  }
});

test('completion accepts old text facts while refusing missing, invalid or mismatched methods for new tasks', () => {
  const model = versions[0];
  const oldState = facts(model, ['b_textured_model_count']);
  delete oldState.task_type;
  assert.deepEqual(plugin.extractUsageOnComplete({ model, upstreamModel: model, action: 'text-to-model', state: oldState }, { status: 'SUCCESS' }), facts(model, ['b_textured_model_count']));
  for (const action of Object.keys(generationInputs)) {
    const task = { model, upstreamModel: model, action, state: facts(model, ['b_textured_model_count'], action) };
    assert.equal(plugin.extractUsageOnComplete({ ...task, state: { ...task.state, task_type: 'unknown' } }, { status: 'SUCCESS' }), null);
    const other = action === 'text-to-model' ? 'image-to-model' : 'text-to-model';
    assert.equal(plugin.extractUsageOnComplete({ ...task, state: { ...task.state, task_type: other } }, { status: 'SUCCESS' }), null);
    if (action !== 'text-to-model') assert.equal(plugin.extractUsageOnComplete({ ...task, state: oldState }, { status: 'SUCCESS' }), null);
  }
});

test('all generation routes validate billing options and require the documented image inputs and model', () => {
  for (const [action, input] of Object.entries(generationInputs)) {
    const body = { model: versions[0], ...structuredClone(input) };
    assert.throws(() => decode({ ...body, texture: 'false' }, 'generation/' + action), /must be a boolean/);
    assert.throws(() => plugin.extractUsage({ model: versions[0], action, requestBody: { ...body, texture_quality: 'invalid' } }), /texture quality/);
    assert.throws(() => decode({ ...body, generate_parts: true }, 'generation/' + action), /texture=false and pbr=false/);
    const parts = plugin.extractUsage({ model: versions[0], action, requestBody: { ...body, texture: false, pbr: false, generate_parts: true, quad: true } });
    assert.deepEqual(parts, facts(versions[0], ['a_untextured_model_count', 'h_parts_count'], action));
    if (action !== 'text-to-model') {
      assert.throws(() => decode(input, 'generation/' + action), /model is required/);
      assert.throws(() => decode({ model: versions[0] }, 'generation/' + action), /input/i);
    }
  }
});

test('submission and polling normalize channel credentials to one Bearer prefix', () => {
  const cases = [
    { authHeader: 'tsk_fixture', apiKey: 'tsk_unused' },
    { authHeader: 'Bearer tsk_fixture' },
    { authHeader: 'bearer tsk_fixture' },
    { authHeader: '  Bearer   tsk_fixture  ' },
    { apiKey: 'tsk_fixture' },
    { apiKey: 'Bearer tsk_fixture' },
    { authHeader: '  ', apiKey: 'tsk_fixture' },
    { authHeader: 'Bearer tsk_fixture', apiKey: 'tsk_unused', upstream: { kind: 'new_api' } },
  ];
  for (const credentials of cases) {
    const ctx = { ...context(versions[0]), baseUrl: 'https://openapi.tripo3d.com/v3', taskId: 'task_fixture', ...credentials };
    const original = structuredClone(ctx);
    for (const build of [plugin.buildSubmitRequest, plugin.buildQueryRequest]) {
      const request = build(ctx);
      assert.equal(request.headers.Authorization, 'Bearer tsk_fixture');
      assert.equal(request.url.includes('tsk_fixture'), false);
    }
    assert.deepEqual(ctx, original);
  }
});

test('missing or malformed credentials fail without including their value in errors', () => {
  const cases = [
    [{}, 'A Tripo API key is required.'],
    [{ authHeader: '  ', apiKey: '  ' }, 'A Tripo API key is required.'],
    [{ authHeader: 'Bearer' }, 'A Tripo API key is required.'],
    [{ apiKey: 'Bearer   ' }, 'A Tripo API key is required.'],
    [{ authHeader: 'Bearer', apiKey: 'tsk_unused' }, 'A Tripo API key is required.'],
    [{ authHeader: 'Basic fixture_secret' }, 'The Tripo API key format is invalid.'],
    [{ authHeader: 'tsk_fixture\r\nX-Injected: secret' }, 'The Tripo API key format is invalid.'],
    [{ apiKey: 'tsk_fixture secret' }, 'The Tripo API key format is invalid.'],
  ];
  for (const [credentials, message] of cases) {
    const ctx = { ...context(versions[0]), baseUrl: 'https://openapi.tripo3d.com/v3', taskId: 'task_fixture', ...credentials };
    for (const build of [plugin.buildSubmitRequest, plugin.buildQueryRequest]) {
      assert.throws(() => build(ctx), { message });
    }
  }
});


test('completed model tasks list and download all three outputs with URL fields or compatible aliases', () => {
  for (const suffix of ['_url', '']) {
    const data = { code: 0, data: { output: {
      ['model' + suffix]: 'https://cdn.example/model.glb',
      ['rendered_image' + suffix]: 'https://cdn.example/render.png',
      ['generated_image' + suffix]: 'https://cdn.example/generated.jpeg',
    } } };
    const before = structuredClone(data);
    assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data }), [
      { key: 'model', type: 'file' },
      { key: 'rendered_image', type: 'image' },
      { key: 'generated_image', type: 'image' },
    ]);
    for (const method of ['GET', 'HEAD']) {
      for (const key of ['model', 'rendered_image', 'generated_image']) {
        assert.deepEqual(plugin.buildContentRequest({ data, artifactKey: key, clientRequest: { method } }), {
          url: data.data.output[key + suffix], method, credentialless: true,
        });
      }
    }
    assert.deepEqual(data, before);
  }
});

test('generated image URL takes precedence and falls back to its compatible alias', () => {
  for (const [value, expected] of [
    ['https://cdn.example/primary.png', 'https://cdn.example/primary.png'],
    ['', 'https://cdn.example/fallback.png'],
    ['invalid', 'https://cdn.example/fallback.png'],
  ]) {
    const data = { data: { output: { generated_image_url: value, generated_image: 'https://cdn.example/fallback.png' } } };
    assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data }), [{ key: 'generated_image', type: 'image' }]);
    assert.equal(plugin.buildContentRequest({ data, artifactKey: 'generated_image', clientRequest: { method: 'GET' } }).url, expected);
  }
});

test('missing or invalid generated images preserve existing artifacts and cannot be downloaded', () => {
  for (const value of [undefined, null, '', 'invalid', 'javascript:alert(1)', { url: 'https://cdn.example/nested.png' }]) {
    const data = { data: { output: { model_url: 'https://cdn.example/model.glb', rendered_image_url: 'https://cdn.example/render.png', generated_image_url: value } } };
    assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data }), [{ key: 'model', type: 'file' }, { key: 'rendered_image', type: 'image' }]);
    assert.throws(() => plugin.buildContentRequest({ data, artifactKey: 'generated_image', clientRequest: { method: 'GET' } }), /requested artifact is not available/);
  }
  assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data: { data: { output: {} } } }), []);
  assert.deepEqual(plugin.listArtifacts({ status: 'IN_PROGRESS', data: { data: { output: { generated_image_url: 'https://cdn.example/generated.png' } } } }), []);
});

function smartSegmentTask(type = 'smartsegment_image') {
  return {
    task_id: 'gateway_parent', status: 'SUCCESS',
    data: { code: 0, data: { task_id: 'upstream_parent', type, status: 'success', output: {
      seg_task_id: 'upstream_segment', model_task_id: 'upstream_model',
      seg_model_url: 'https://cdn.tripo3d.ai/seg.glb', mask_url: 'https://cdn.tripo3d.ai/mask.png',
    } } },
  };
}

test('smart segmentation presents parent-bound child references without modifying persisted results', () => {
  for (const type of ['smartsegment_image', 'smartsegment_model']) {
    const task = smartSegmentTask(type);
    const before = structuredClone(task);
    for (const present of [plugin.native.taskCreated, plugin.native.taskStatus]) {
      const response = present({}, task);
      assert.equal(response.data.task_id, task.task_id);
      assert.equal(response.data.output.seg_task_id, 'tripo-child:gateway_parent:seg_task_id');
      assert.equal(response.data.output.model_task_id, 'tripo-child:gateway_parent:model_task_id');
      assert.equal(response.data.output.seg_model_url, task.data.data.output.seg_model_url);
      assert.deepEqual(task, before);
      assert.deepEqual(present({}, task), response);
    }
  }
  const task = smartSegmentTask();
  delete task.data.data.output.model_task_id;
  assert.equal(plugin.native.taskStatus({}, task).data.output.model_task_id, undefined);
  const pending = { ...task, status: 'IN_PROGRESS', data: { code: 0, data: { type: 'smartsegment_image', status: 'running' } } };
  assert.equal(plugin.native.taskStatus({}, pending).data.output, undefined);
  const normal = smartSegmentTask('mesh_segmentation');
  assert.equal(plugin.native.taskStatus({}, normal).data.output.seg_task_id, 'upstream_segment');
});

test('smart segmentation children authorize the parent and resolve only its persisted child for subsequent tasks', () => {
  for (const field of ['seg_task_id', 'model_task_id']) {
    for (const kind of ['vendor', 'new_api']) {
      const task = smartSegmentTask();
      const response = plugin.native.taskStatus({}, task);
      const body = { input: response.data.output[field], part_names: ['part0'], completion_mode: 'quick_cap' };
      const intent = decode(body, 'mesh/complete');
      assert.deepEqual(intent.originTaskIds, ['gateway_parent']);
      assert.equal(intent.model, 'tripo');
      const origin = { taskId: task.task_id, upstreamTaskId: 'upstream_parent', action: 'smartsegment', status: 'SUCCESS', data: task.data };
      const ctx = { model: 'tripo', action: intent.action, requestBody: intent.requestBody, originTasks: [origin], baseUrl: 'https://provider.example', authHeader: 'Bearer fixture', upstream: { kind } };
      const before = structuredClone(ctx);
      const request = plugin.buildSubmitRequest(ctx);
      assert.equal(request.body.input, task.data.data.output[field]);
      assert.equal(request.url, 'https://provider.example' + (kind === 'new_api' ? '/tripo/v3' : '') + '/mesh/complete');
      assert.equal(plugin.extractUsage(ctx).task_type, 'complete-quick');
      assert.deepEqual(ctx, before);
    }
  }
});

test('smart segmentation model children support normal postprocessing without changing other parameters', () => {
  const task = smartSegmentTask();
  const input = plugin.native.taskStatus({}, task).data.output.model_task_id;
  const cases = [
    ['models/texture', { input, model: 'v3.5-20260815', texture_quality: 'fast', texture_prompt: { image: { file_token: 'file_reference' } } }],
    ['models/convert', { input, format: 'FBX', texture_packaging: 'zip' }],
    ['animations/rig', { input, model: 'v3.0-20260909', rig_type: 'biped', spec: 'vrm' }],
  ];
  for (const [suffix, body] of cases) {
    const intent = decode(body, suffix);
    assert.deepEqual(intent.originTaskIds, ['gateway_parent']);
    const request = plugin.buildSubmitRequest({ model: 'tripo', action: intent.action, requestBody: intent.requestBody,
      originTasks: [{ taskId: task.task_id, action: 'smartsegment', status: 'SUCCESS', data: task.data }],
      baseUrl: 'https://provider.example', apiKey: 'fixture' });
    assert.deepEqual(request.body, { ...body, input: 'upstream_model' });
    assert.equal(body.input, input);
  }
});

test('child references cannot select arbitrary IDs or fields and reject malformed parents', () => {
  const invalid = [
    'tripo-child:', 'tripo-child::seg_task_id', 'tripo-child:parent:other_field',
    'tripo-child:parent:seg_task_id:injected', 'tripo-child:%:seg_task_id',
    'tripo-child:%20parent:seg_task_id', 'tripo-child:parent%20:seg_task_id',
    'tripo-child:%70arent:seg_task_id', 'tripo-child:' + 'a'.repeat(129) + ':seg_task_id',
  ];
  for (const input of invalid) {
    assert.throws(() => decode({ input }, 'mesh/complete'), /child reference is invalid/);
    assert.throws(() => plugin.buildSubmitRequest({ model: 'tripo', action: 'complete', requestBody: { input }, originTasks: [] }), /child reference is invalid/);
  }
});

test('child references fail closed when the authorized successful smart segmentation parent or child is unavailable', () => {
  const task = smartSegmentTask();
  const origin = { taskId: task.task_id, upstreamTaskId: 'upstream_parent', action: 'smartsegment', status: 'SUCCESS', data: task.data };
  const origins = [
    [], [{ ...origin, taskId: 'different_parent' }], [{ ...origin, status: 'IN_PROGRESS' }],
    [{ ...origin, status: 'FAILURE' }], [{ ...origin, action: 'text-to-model' }],
    [{ ...origin, data: null }], [{ ...origin, data: { code: 0, data: { output: {} } } }],
  ];
  for (const value of [null, '', 42, { task_id: 'untrusted' }, 'https://example.com/model.glb', 'file_fixture']) {
    origins.push([{ ...origin, data: { code: 0, data: { output: { seg_task_id: value } } } }]);
  }
  for (const originTasks of origins) {
    assert.throws(() => plugin.buildSubmitRequest({ model: 'tripo', action: 'complete', requestBody: { input: 'tripo-child:gateway_parent:seg_task_id' }, originTasks }), /child task is not available/);
  }
});

test('child references compose across new-api gateways without exposing or trusting caller-supplied upstream IDs', () => {
  const upstreamTask = smartSegmentTask();
  upstreamTask.task_id = 'upstream_gateway_parent';
  const upstreamResult = plugin.native.taskStatus({}, upstreamTask);
  const downstreamTask = { task_id: 'downstream_parent', status: 'SUCCESS', data: upstreamResult };
  const downstreamResult = plugin.native.taskStatus({}, downstreamTask);
  const intent = decode({ input: downstreamResult.data.output.seg_task_id }, 'mesh/complete');
  assert.deepEqual(intent.originTaskIds, ['downstream_parent']);
  const downstreamRequest = plugin.buildSubmitRequest({ model: 'tripo', action: 'complete', requestBody: intent.requestBody,
    originTasks: [{ taskId: 'downstream_parent', action: 'smartsegment', status: 'SUCCESS', data: upstreamResult }],
    baseUrl: 'https://upstream-gateway.example', apiKey: 'fixture', upstream: { kind: 'new_api' } });
  assert.equal(downstreamRequest.body.input, 'tripo-child:upstream_gateway_parent:seg_task_id');
  const upstreamIntent = decode(downstreamRequest.body, 'mesh/complete');
  assert.deepEqual(upstreamIntent.originTaskIds, ['upstream_gateway_parent']);
  const vendorRequest = plugin.buildSubmitRequest({ model: 'tripo', action: 'complete', requestBody: upstreamIntent.requestBody,
    originTasks: [{ taskId: upstreamTask.task_id, action: 'smartsegment', status: 'SUCCESS', data: upstreamTask.data }],
    baseUrl: 'https://provider.example', apiKey: 'fixture' });
  assert.equal(vendorRequest.body.input, 'upstream_segment');
});

test('encoded public parent IDs round-trip while ordinary task, URL and file-token inputs keep existing behavior', () => {
  const task = smartSegmentTask();
  task.task_id = 'gateway:parent';
  const input = plugin.native.taskStatus({}, task).data.output.model_task_id;
  assert.equal(input, 'tripo-child:gateway%3Aparent:model_task_id');
  assert.deepEqual(decode({ input }, 'models/texture').originTaskIds, ['gateway:parent']);
  for (const input of ['gateway_parent', 'https://example.com/model.glb', 'file_fixture']) {
    const intent = decode({ input }, 'models/texture');
    assert.deepEqual(intent.originTaskIds, input === 'gateway_parent' ? ['gateway_parent'] : []);
    const request = plugin.buildSubmitRequest({ model: 'tripo', action: 'texture', requestBody: intent.requestBody,
      originTasks: [{ taskId: 'gateway_parent', upstreamTaskId: 'upstream_parent' }],
      baseUrl: 'https://provider.example', apiKey: 'fixture' });
    assert.equal(request.body.input, input === 'gateway_parent' ? 'upstream_parent' : input);
  }
});

test('postprocessing exposes segmented models, masks and UV previews through the artifact download contract', () => {
  for (const [output, expected] of [
    [{ seg_model_url: 'https://cdn.tripo3d.ai/segment.glb', mask_url: 'https://cdn.tripo3d.ai/mask.png' }, [{ key: 'seg_model', type: 'file' }, { key: 'mask', type: 'image' }]],
    [{ model_url: 'https://cdn.tripo3d.ai/model.glb', uv_render_url: 'https://cdn.tripo3d.ai/uv.webp' }, [{ key: 'model', type: 'file' }, { key: 'uv_render', type: 'image' }]],
  ]) {
    const data = { code: 0, data: { task_id: 'fixture', status: 'success', output } };
    const before = structuredClone(data);
    assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data }), expected);
    for (const artifact of expected) for (const method of ['GET', 'HEAD']) {
      assert.deepEqual(plugin.buildContentRequest({ data, artifactKey: artifact.key, clientRequest: { method } }), {
        url: output[artifact.key + '_url'], method, credentialless: true,
      });
    }
    assert.deepEqual(data, before);
    assert.deepEqual(plugin.listArtifacts({ status: 'IN_PROGRESS', data }), []);
  }
  const data = { code: 0, data: { status: 'success', output: { seg_model_url: 'https://cdn.tripo3d.ai/segment.glb' } } };
  assert.equal(plugin.parseTaskResult({}, data).url, data.data.output.seg_model_url);
  for (const field of ['seg_model', 'mask', 'uv_render']) for (const value of [null, '', 'invalid', 'javascript:alert(1)', { url: 'https://example.com/file' }]) {
    const data = { code: 0, data: { output: { [field + '_url']: value } } };
    assert.deepEqual(plugin.listArtifacts({ status: 'SUCCESS', data }), []);
    assert.throws(() => plugin.buildContentRequest({ data, artifactKey: field, clientRequest: { method: 'GET' } }), /artifact is not available/);
  }
});

function uploadContext(action = 'file-upload', options = {}) {
  return { model: 'tripo', upstreamModel: 'tripo', action, publicTaskId: 'gateway_upload', baseUrl: 'https://provider.example/v3', apiKey: 'fixture', requestBody: {}, ...options };
}

test('multipart uploads forward the opaque file through the selected channel and return reusable owned references', () => {
  for (const filename of ['reference.PNG', 'model.glb']) for (const kind of ['vendor', 'new_api']) {
    const file = { ref: 'request_file:file', field: 'file', filename, size: 123, mimeType: 'application/octet-stream' };
    const body = { kind: 'multipart', fields: {}, files: [file] };
    const before = structuredClone(body);
    const intent = plugin.native.decodeFileUpload({ body });
    const ctx = uploadContext('file-upload', { files: [file], requestBody: intent.requestBody, upstream: { kind } });
    const request = plugin.buildSubmitRequest(ctx);
    assert.equal(intent.model, 'tripo');
    assert.equal(request.url, 'https://provider.example/v3' + (kind === 'new_api' ? '/tripo/v3' : '') + '/files');
    assert.equal(request.bodyType, 'multipart');
    assert.deepEqual(request.parts, [{ name: 'file', fileRef: file.ref, filename: 'upload.' + filename.split('.').at(-1).toLowerCase() }]);
    assert.equal(request.headers['Content-Type'], undefined);
    assert.equal(request.headers.Authorization, 'Bearer fixture');
    const parsed = plugin.parseSubmitResponse(ctx, { body: { code: 0, data: { file_token: 'file_vendor' } } });
    assert.equal(parsed.immediate.status, 'SUCCESS');
    const task = { task_id: ctx.publicTaskId, status: 'SUCCESS', data: parsed.taskData };
    const response = plugin.native.taskCreated({}, task);
    assert.equal(response.data.file_token, 'tripo-file:gateway_upload');
    assert.equal(plugin.native.taskStatus({}, task).data.file_token, response.data.file_token);
    const next = decode({ model: versions[0], input: response.data.file_token }, 'generation/image-to-model');
    assert.deepEqual(next.originTaskIds, ['gateway_upload']);
    const upstream = plugin.buildSubmitRequest(uploadContext(next.action, { model: next.model, upstreamModel: next.model, requestBody: next.requestBody,
      originTasks: [{ taskId: task.task_id, action: intent.action, status: 'SUCCESS', data: task.data }] }));
    assert.equal(upstream.body.input, 'file_vendor');
    assert.deepEqual(body, before);
  }
});

test('presigned uploads retain the upload URL and expiry while binding the file token to a gateway task', () => {
  const intent = plugin.native.decodeFilePresign({ body: { kind: 'json', value: { format: 'GLB' } } });
  const ctx = uploadContext(intent.action, { requestBody: intent.requestBody });
  assert.deepEqual(plugin.buildSubmitRequest(ctx).body, { format: 'glb' });
  assert.equal(plugin.buildSubmitRequest(ctx).url, 'https://provider.example/v3/files/presign');
  const data = { file_token: 'file_presigned', presigned_url: 'https://storage.example/upload?signature=fixture', expires_in: 1800 };
  const parsed = plugin.parseSubmitResponse(ctx, { body: { code: 0, data } });
  const response = plugin.native.taskCreated({}, { task_id: 'gateway_presign', status: 'SUCCESS', data: parsed.taskData });
  assert.equal(response.data.file_token, 'tripo-file:gateway_presign');
  assert.equal(response.data.presigned_url, data.presigned_url);
  assert.equal(response.data.expires_in, 1800);
  const body = { input: response.data.file_token };
  const intent2 = decode(body, 'models/import');
  assert.deepEqual(intent2.originTaskIds, ['gateway_presign']);
  const request = plugin.buildSubmitRequest(uploadContext(intent2.action, { requestBody: body,
    originTasks: [{ taskId: 'gateway_presign', action: 'file-presign', status: 'SUCCESS', data: parsed.taskData }] }));
  assert.equal(request.body.input, 'file_presigned');
});

test('upload requests reject missing, unsupported and oversized files before upstream submission', () => {
  const file = { ref: 'request_file:file', field: 'file', filename: 'image.png', size: 1, mimeType: 'image/png' };
  for (const body of [{ kind: 'json', value: {} }, { kind: 'multipart', files: [] }, { kind: 'multipart', files: [file, file] }]) {
    assert.throws(() => plugin.native.decodeFileUpload({ body }), /Exactly one/);
  }
  for (const change of [{ field: 'other' }, { filename: 'image.png.exe' }, { filename: 'image.png:stream' }, { filename: 'image\u0000.png' }, { size: 0 }, { size: -1 }, { size: 1.5 }, { size: 20 * 1024 * 1024 + 1 }, { filename: 'model.glb', size: 150 * 1024 * 1024 + 1 }]) {
    const candidate = { ...file, ...change };
    assert.throws(() => plugin.native.decodeFileUpload({ body: { kind: 'multipart', files: [candidate] } }));
    assert.throws(() => plugin.buildSubmitRequest(uploadContext('file-upload', { requestBody: { fileRef: file.ref }, files: [candidate] })));
  }
  for (const [filename, size] of [['image.jpg', 20 * 1024 * 1024], ['model.glb', 150 * 1024 * 1024]]) {
    assert.equal(plugin.native.decodeFileUpload({ body: { kind: 'multipart', files: [{ ...file, filename, size }] } }).action, 'file-upload');
  }
  assert.throws(() => plugin.buildSubmitRequest(uploadContext('file-upload', { requestBody: { fileRef: 'forged' }, files: [file] })), /file field/);
  for (const value of [null, {}, { format: 'exe' }, { format: '.glb' }, { format: 2 }]) {
    assert.throws(() => plugin.native.decodeFilePresign({ body: { kind: 'json', value } }), /format is not supported/);
  }
});

test('upload failures and malformed upstream tokens or presigned URLs cannot become successful file references', () => {
  for (const action of ['file-upload', 'file-presign']) {
    assert.throws(() => plugin.parseSubmitResponse(uploadContext(action), { body: { code: 1004, message: 'invalid file' } }), /invalid file/);
    for (const file_token of [undefined, '', 123, {}, 'invalid', 'tripo-file:%']) {
      assert.throws(() => plugin.parseSubmitResponse(uploadContext(action), { body: { code: 0, data: { file_token } } }));
    }
  }
  for (const change of [{ presigned_url: 'http://storage.example/file' }, { presigned_url: 'javascript:alert(1)' }, { expires_in: 0 }, { expires_in: '1800' }]) {
    assert.throws(() => plugin.parseSubmitResponse(uploadContext('file-presign'), { body: { code: 0, data: { file_token: 'file_vendor', presigned_url: 'https://storage.example/file', expires_in: 1800, ...change } } }), /valid upload URL/);
  }
});

test('file references bind nested reference images and multiview inputs without interpreting prompt text', () => {
  const reference = 'tripo-file:gateway_upload';
  const raw = { code: 0, data: { file_token: 'file_vendor' } };
  const origin = { taskId: 'gateway_upload', action: 'file-upload', status: 'SUCCESS', data: raw };
  const cases = [
    ['generation/multiview-to-model', { model: versions[0], inputs: [{ front: reference }, { left: { file_token: reference } }] }],
    ['generation/multiview-to-model', { model: versions[0], inputs: [reference, reference, '', ''] }],
    ['models/texture', { input: 'https://example.com/model.glb', texture_prompt: { image: { file_token: reference } } }],
    ['models/texture', { input: 'https://example.com/model.glb', texture_prompt: { text: reference, style_image: { file_token: reference } } }],
    ['mesh/segment', { input: 'https://example.com/model.glb', ref_image: reference }],
  ];
  for (const [suffix, body] of cases) {
    const before = structuredClone(body);
    const intent = decode(body, suffix);
    assert.deepEqual(intent.originTaskIds, ['gateway_upload']);
    const request = plugin.buildSubmitRequest(uploadContext(intent.action, { model: intent.model, upstreamModel: intent.model, requestBody: intent.requestBody, originTasks: [origin] }));
    const expected = JSON.parse(JSON.stringify(body).replaceAll(reference, 'file_vendor'));
    if (expected.texture_prompt?.text) expected.texture_prompt.text = reference;
    assert.deepEqual(request.body, expected);
    assert.deepEqual(body, before);
  }
  assert.deepEqual(decode({ prompt: reference }, 'generation/text-to-model').originTaskIds, []);
});

test('file references reject unknown owners, wrong task types, unavailable uploads and malformed reference IDs', () => {
  const origin = { taskId: 'gateway_upload', action: 'file-upload', status: 'SUCCESS', data: { code: 0, data: { file_token: 'file_vendor' } } };
  for (const origins of [[], [{ ...origin, taskId: 'someone_else' }], [{ ...origin, action: 'text-to-model' }], [{ ...origin, status: 'FAILURE' }], [{ ...origin, data: null }]]) {
    assert.throws(() => plugin.buildSubmitRequest(uploadContext('import', { requestBody: { input: 'tripo-file:gateway_upload' }, originTasks: origins })), /uploaded file is not available/);
  }
  for (const reference of ['tripo-file:', 'tripo-file:%', 'tripo-file:%20parent', 'tripo-file:%70arent', 'tripo-file:' + 'a'.repeat(129)]) {
    assert.throws(() => decode({ input: reference }, 'models/import'), /file reference is invalid/);
  }
});

test('file references compose through upstream new-api gateways and retain zero generation quantities at settlement', () => {
  for (const action of ['file-upload', 'file-presign']) {
    const ctx = uploadContext(action);
    const facts = plugin.extractUsage(ctx);
    assert.equal(facts.task_type, action);
    assert.equal(Object.entries(facts).filter(([key]) => key !== 'task_type').every(([, value]) => value === 0), true);
    const data = { file_token: 'file_vendor', ...(action === 'file-presign' ? { presigned_url: 'https://storage.example/file', expires_in: 1800 } : {}) };
    const parsed = plugin.parseSubmitResponse(ctx, { body: { code: 0, data } });
    assert.deepEqual(plugin.extractUsageOnComplete({ model: 'tripo', action, state: parsed.state }, parsed.immediate), facts);
    assert.equal(plugin.extractUsageOnComplete({ model: 'tripo', action, state: parsed.state }, { status: 'FAILURE' }), null);
    const upstream = plugin.native.taskCreated({}, { task_id: 'upstream_upload', status: 'SUCCESS', data: parsed.taskData });
    const downstreamParsed = plugin.parseSubmitResponse(ctx, { body: upstream });
    const downstream = plugin.native.taskCreated({}, { task_id: 'downstream_upload', status: 'SUCCESS', data: downstreamParsed.taskData });
    const intent = decode({ input: downstream.data.file_token }, 'models/import');
    assert.deepEqual(intent.originTaskIds, ['downstream_upload']);
    const request = plugin.buildSubmitRequest(uploadContext(intent.action, { requestBody: intent.requestBody, upstream: { kind: 'new_api' },
      originTasks: [{ taskId: 'downstream_upload', action, status: 'SUCCESS', data: downstreamParsed.taskData }] }));
    assert.equal(request.body.input, 'tripo-file:upstream_upload');
    const next = decode(request.body, 'models/import');
    assert.deepEqual(next.originTaskIds, ['upstream_upload']);
  }
});
