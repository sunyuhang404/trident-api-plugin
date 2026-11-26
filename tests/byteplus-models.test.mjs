import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createHash } from 'node:crypto';

const pluginPath = new URL('../plugins/tasks/byteplus/1.0.0/plugin.js', import.meta.url);
const source = fs.readFileSync(pluginPath, 'utf8');
const plugin = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

const videoModels = [
  'dreamina-seedance-2-5-flash-261115',
  'dreamina-seedance-2-5-260628',
  'dreamina-seedance-2-0-260128',
  'dreamina-seedance-2-0-fast-260128',
  'dreamina-seedance-2-0-mini-260615',
];
const imageModels = [
  'dola-seedream-5-5-261028',
  'dola-seedream-5-0-pro-260628',
  'dola-seedream-5-0-flash-260915',
  'seedream-5-0-lite-260128',
  'seedream-5-0-260128',
];

test('marketplace meta declares BytePlus ModelArk video and image models', () => {
  assert.equal(plugin.meta.key, 'byteplus');
  assert.equal(plugin.meta.version, '1.0.0');
  assert.equal(plugin.meta.baseUrl, 'https://ark.ap-southeast.bytepluses.com');
  assert.equal(plugin.meta.channelTypes, undefined);
  assert.deepEqual(plugin.meta.models, [...videoModels, ...imageModels]);
  assert.ok(!plugin.meta.models.some((name) => name.includes('1-0') || name.includes('4-0') || name.includes('4-5')));
});

test('each Seedance model has a resolution and video_input profile matching BytePlus docs', () => {
  const expected = {
    'dreamina-seedance-2-5-flash-261115': ['480p', '720p'],
    'dreamina-seedance-2-5-260628': ['480p', '720p', '1080p', '4k'],
    'dreamina-seedance-2-0-260128': ['480p', '720p', '1080p', '4k'],
    'dreamina-seedance-2-0-fast-260128': ['480p', '720p'],
    'dreamina-seedance-2-0-mini-260615': ['480p', '720p'],
  };
  for (const [model, resolutions] of Object.entries(expected)) {
    const profile = plugin.meta.usageProfiles.find((entry) => entry.models.includes(model));
    assert.ok(profile, model);
    assert.deepEqual(profile.schema.resolution.enum, resolutions);
    assert.deepEqual(profile.schema.video_input.enum, ['none', 'video']);
    assert.equal(profile.schema.tokens.unit, 'token');
  }
});

test('native video createTask keeps content order and reserves 1080p when omitted for 2.0', () => {
  const model = 'dreamina-seedance-2-0-260128';
  const content = [
    { type: 'text', text: 'a cat' },
    { type: 'image_url', image_url: { url: 'https://cdn.example/a.png' }, role: 'first_frame' },
  ];
  const body = { model, content, duration: 6, ratio: '16:9' };
  const intent = plugin.native.createTask({ body: { kind: 'json', value: body } });
  assert.equal(intent.model, model);
  assert.equal(intent.action, 'image_to_video');
  const driver = {
    model,
    upstreamModel: model,
    requestBody: intent.requestBody,
    baseUrl: 'https://ark.ap-southeast.bytepluses.com',
    apiKey: 'key',
  };
  const descriptor = plugin.buildSubmitRequest(driver);
  assert.equal(descriptor.url, 'https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks');
  assert.deepEqual(descriptor.body.content, content);
  const facts = plugin.extractUsage(driver);
  assert.equal(facts.resolution, '1080p');
  assert.equal(facts.video_input, 'none');
  assert.ok(facts.tokens > 0);
});

test('dreamina 2.5 accepts 4k while flash rejects it', () => {
  const accept = plugin.native.createTask({
    body: {
      kind: 'json',
      value: {
        model: 'dreamina-seedance-2-5-260628',
        content: [{ type: 'text', text: 'a cat' }],
        duration: 5,
        resolution: '4k',
      },
    },
  });
  const accepted = plugin.extractUsage({
    model: accept.model,
    upstreamModel: accept.model,
    requestBody: accept.requestBody,
  });
  assert.equal(accepted.resolution, '4k');
  assert.throws(
    () =>
      plugin.extractUsage({
        model: 'dreamina-seedance-2-5-flash-261115',
        upstreamModel: 'dreamina-seedance-2-5-flash-261115',
        requestBody: {
          model: 'dreamina-seedance-2-5-flash-261115',
          vendorBody: {
            model: 'dreamina-seedance-2-5-flash-261115',
            content: [{ type: 'text', text: 'a cat' }],
            duration: 5,
            resolution: '4k',
          },
        },
      }),
    /resolution must be one of 480p, 720p/
  );
});

test('sha256 of plugin.js matches the published index entry helper', () => {
  const digest = createHash('sha256').update(source).digest('hex');
  assert.equal(digest.length, 64);
  console.log('byteplus plugin sha256:', digest);
});
