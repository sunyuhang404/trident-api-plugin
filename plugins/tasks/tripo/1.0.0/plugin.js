// Tripo OpenAPI v3 task plugin.
// https://developers.tripo3d.com/zh/docs/introduction

// Kept separate from `meta`. The marketplace preview only reads a static
// `export const meta` that the rest of the file does not reference.
const TASK_TYPES = [
  "text-to-model",
  "image-to-model",
  "multiview-to-model",
  "text-to-image",
  "image-to-image",
  "image-to-multiview",
  "edit-multiview",
  "image-to-splat",
  "image-to-depth",
  "texture",
  "convert",
  "import",
  "segment",
  "smartsegment",
  "complete",
  "decimate",
  "uv",
  "rig-check",
  "rig",
  "retarget",
];

// These three requests accept texture. Tripo defaults both texture and pbr to
// true, and pbr true forces texture on.
const TEXTURED_ACTIONS = ["text-to-model", "image-to-model", "multiview-to-model"];

export const meta = {
  apiVersion: 1,
  key: "tripo",
  name: "Tripo",
  icon: "text:Tr",
  description: {
    en: "Tripo 3D generation through the Tripo OpenAPI v3",
    zh: "通过 Tripo OpenAPI v3 生成三维模型",
  },
  version: "1.0.3",
  author: { name: "sunyuhang404", url: "https://github.com/sunyuhang404/trident-api-plugin" },
  website: "https://github.com/sunyuhang404/trident-api-plugin",
  baseUrl: "https://openapi.tripo3d.com/v3",
  allowedHosts: ["cdn.tripo3d.ai"],
  models: ["tripo"],
  fetchMode: "per_task",
  auth: "api_key",
  upstreams: ["vendor", "new_api"],
  routes: [
    { method: "POST", path: "/tripo/v3/generation/text-to-model", type: "submit", action: "text-to-model", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/image-to-model", type: "submit", action: "image-to-model", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/multiview-to-model", type: "submit", action: "multiview-to-model", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/text-to-image", type: "submit", action: "text-to-image", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/image-to-image", type: "submit", action: "image-to-image", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/image-to-multiview", type: "submit", action: "image-to-multiview", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/edit-multiview", type: "submit", action: "edit-multiview", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/image-to-splat", type: "submit", action: "image-to-splat", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/generation/image-to-depth", type: "submit", action: "image-to-depth", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/models/texture", type: "submit", action: "texture", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/models/convert", type: "submit", action: "convert", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/models/import", type: "submit", action: "import", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/mesh/segment", type: "submit", action: "segment", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/mesh/smartsegment", type: "submit", action: "smartsegment", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/mesh/complete", type: "submit", action: "complete", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/mesh/decimate", type: "submit", action: "decimate", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/mesh/uv", type: "submit", action: "uv", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/animations/rig-check", type: "submit", action: "rig-check", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/animations/rig", type: "submit", action: "rig", decode: "decodeSubmit", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/animations/retarget", type: "submit", action: "retarget", decode: "decodeSubmit", render: "taskCreated" },
    { method: "GET", path: "/tripo/v3/tasks/:task_id", type: "query", render: "taskStatus" },
  ],
  usageSchema: {
    // Official list-price amount for this request. The admin unit price is a multiplier: 1 charges that amount.
    official_amount: {
      type: "number",
      unit: "count",
      unitLabel: { en: "list price", zh: "标价" },
      description: { en: "Official charge unit price", zh: "官方费用单价" },
    },
  },
  usageExamples: [
    { label: "text to 3d", facts: { official_amount: 1.4 } },
    { label: "text to 3d without texture", facts: { official_amount: 0.7 } },
    { label: "image to 3d", facts: { official_amount: 2.1 } },
    { label: "p2 text to 3d", facts: { official_amount: 7 } },
    { label: "retarget three animations", facts: { official_amount: 2.1 } },
    { label: "seedream image", facts: { official_amount: 0.35 } },
  ],
};

const ENDPOINT_SUFFIX = {
  "text-to-model": "/generation/text-to-model",
  "image-to-model": "/generation/image-to-model",
  "multiview-to-model": "/generation/multiview-to-model",
  "text-to-image": "/generation/text-to-image",
  "image-to-image": "/generation/image-to-image",
  "image-to-multiview": "/generation/image-to-multiview",
  "edit-multiview": "/generation/edit-multiview",
  "image-to-splat": "/generation/image-to-splat",
  "image-to-depth": "/generation/image-to-depth",
  texture: "/models/texture",
  convert: "/models/convert",
  "import": "/models/import",
  segment: "/mesh/segment",
  smartsegment: "/mesh/smartsegment",
  complete: "/mesh/complete",
  decimate: "/mesh/decimate",
  uv: "/mesh/uv",
  "rig-check": "/animations/rig-check",
  rig: "/animations/rig",
  retarget: "/animations/retarget",
};

const OUTPUT_FILES = [
  ["model", "model_url"],
  ["base_model", "base_model_url"],
  ["pbr_model", "pbr_model_url"],
];

function trimmed(value) {
  return String(value || "").trim();
}

function actionFromPath(path) {
  const value = String(path || "");
  const actions = Object.keys(ENDPOINT_SUFFIX).sort(function (left, right) {
    return ENDPOINT_SUFFIX[right].length - ENDPOINT_SUFFIX[left].length;
  });
  for (let i = 0; i < actions.length; i += 1) {
    if (value.endsWith(ENDPOINT_SUFFIX[actions[i]])) return actions[i];
  }
  return "";
}

function isHTTPURL(value) {
  const url = trimmed(value);
  return url.indexOf("https://") === 0 || url.indexOf("http://") === 0;
}

function isFileToken(value) {
  return trimmed(value).indexOf("file_") === 0;
}

function isTaskReference(value) {
  const text = trimmed(value);
  return !!text && !isHTTPURL(text) && !isFileToken(text);
}

function pushId(ids, value) {
  const text = trimmed(value);
  if (text && ids.indexOf(text) < 0) ids.push(text);
}

function originTaskIds(body) {
  const ids = [];
  if (isTaskReference(body.input)) pushId(ids, body.input);
  pushId(ids, body.task_id);
  if (Array.isArray(body.inputs)) {
    for (const item of body.inputs) {
      if (item && typeof item === "object" && !Array.isArray(item)) pushId(ids, item.task_id);
    }
  }
  return ids;
}

function validateSubmitBody(body, action) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("A JSON object body is required.");
  if (TASK_TYPES.indexOf(action) < 0) throw new Error("This task path is not supported.");
  if ((action === "text-to-model" || action === "text-to-image") && !trimmed(body.prompt)) throw new Error("A prompt is required.");
  if (typeof body.prompt === "string" && body.prompt.length > 1024) throw new Error("The prompt must be at most 1024 characters.");
  if (typeof body.negative_prompt === "string" && body.negative_prompt.length > 255) throw new Error("The negative prompt must be at most 255 characters.");
  if (action === "image-to-model" && !trimmed(body.input)) throw new Error("An input image is required.");
  if (action === "multiview-to-model" && (!Array.isArray(body.inputs) || body.inputs.length === 0)) throw new Error("Multiview inputs are required.");
  if ((action === "texture" || action === "rig" || action === "image-to-splat" || action === "image-to-depth" || action === "import") && !trimmed(body.input)) {
    throw new Error("An input is required.");
  }
  return action;
}

function authorizationHeader(ctx) {
  const header = trimmed(ctx.authHeader);
  if (header) return header;
  const key = trimmed(ctx.apiKey);
  if (!key) throw new Error("A Tripo API key is required.");
  return "Bearer " + key;
}

function upstreamURL(ctx, suffix, taskId) {
  const base = String(ctx.baseUrl || "").replace(/\/+$/, "");
  let path = ctx.upstream && ctx.upstream.kind === "new_api" ? "/tripo/v3" + suffix : suffix;
  if (taskId) path += "/" + encodeURIComponent(taskId);
  return base + path;
}

function withUpstreamTaskIds(body, originTasks) {
  const next = utils.json.clone(body);
  const upstreamByPublicId = {};
  for (const task of originTasks || []) {
    const publicId = trimmed(task && task.taskId);
    const upstreamId = trimmed(task && task.upstreamTaskId);
    if (publicId && upstreamId) upstreamByPublicId[publicId] = upstreamId;
  }
  if (isTaskReference(next.input) && upstreamByPublicId[trimmed(next.input)]) next.input = upstreamByPublicId[trimmed(next.input)];
  if (trimmed(next.task_id) && upstreamByPublicId[trimmed(next.task_id)]) next.task_id = upstreamByPublicId[trimmed(next.task_id)];
  if (Array.isArray(next.inputs)) {
    for (const item of next.inputs) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const publicId = trimmed(item.task_id);
      if (publicId && upstreamByPublicId[publicId]) item.task_id = upstreamByPublicId[publicId];
    }
  }
  return next;
}

function textureEnabled(body, action) {
  if (TEXTURED_ACTIONS.indexOf(action) < 0) return false;
  const record = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  if (record.pbr !== false) return true;
  return record.texture !== false;
}

function usageFacts(amount) {
  return { official_amount: amount };
}

function objectRecord(body) {
  return body && typeof body === "object" && !Array.isArray(body) ? body : {};
}

function isPModel(model) {
  const name = model.toUpperCase();
  return name.indexOf("P1") === 0 || name.indexOf("P2") === 0;
}

function imageTier(size) {
  const text = trimmed(size).toLowerCase();
  if (!text || text === "auto") return "2k";
  if (text === "0.5k" || text === "1k") return "1k";
  if (text === "2k" || text === "3k") return "2k";
  if (text === "4k") return "4k";
  const match = text.match(/^(\d+)x(\d+)$/);
  if (!match) return "2k";
  const longEdge = Math.max(Number(match[1]), Number(match[2]));
  if (longEdge <= 1024) return "1k";
  if (longEdge <= 2048) return "2k";
  return "4k";
}

function imageCredits(body) {
  const record = objectRecord(body);
  const model = trimmed(record.model) || "seedream_v4";
  const tier = imageTier(record.size);
  const quality = trimmed(record.quality) || "low";
  if (model === "seedream_v4" || model === "seedream_v5" || model === "banana") return 5;
  if (model === "banana2") return tier === "4k" ? 15 : 10;
  if (model === "banana_pro") return tier === "4k" ? 20 : 15;
  if (model === "chat_image_1") return 5;
  if (model === "chat_image_1.5") return 10;
  const chat = model === "chat_image_2" || model === "chat_image_2.5_flare" || model === "chat_image_2.5_sunburst";
  if (!chat) return 5;
  const flare = model !== "chat_image_2";
  if (quality === "high") return tier === "1k" ? 20 : tier === "4k" ? 40 : 25;
  if (flare && quality === "xhigh") return tier === "1k" ? 25 : tier === "4k" ? 45 : 30;
  if (flare && quality === "max") return tier === "1k" ? 30 : 50;
  return tier === "4k" ? 15 : 10;
}

function generationCredits(body, action) {
  const record = objectRecord(body);
  const model = trimmed(record.model) || "v3.1-20260211";
  const quality = trimmed(record.texture_quality) || "standard";
  if (isPModel(model)) {
    let credits = 100;
    if (textureEnabled(record, action)) {
      if (quality === "detailed") credits = 120;
      else if (quality === "extreme") credits = 130;
      else credits = 110;
    }
    if (model.toUpperCase().indexOf("P2") === 0 && record.quad === true) credits += 5;
    return credits;
  }
  const addons = model !== "v2.5-20250123";
  const parts = addons && record.generate_parts === true && record.smart_low_poly !== true;
  const textured = parts ? false : textureEnabled(record, action);
  let credits = action === "text-to-model" ? (textured ? 20 : 10) : (textured ? 30 : 20);
  if (!addons) return credits;
  if (textured && quality === "detailed") credits += 10;
  if (textured && quality === "extreme") credits += 20;
  if (trimmed(record.geometry_quality) === "detailed") credits += 20;
  if (record.quad === true) credits += 5;
  if (record.smart_low_poly === true) credits += 10;
  else if (parts) credits += 20;
  return credits;
}

function textureCredits(body) {
  const quality = trimmed(objectRecord(body).texture_quality) || "standard";
  if (quality === "detailed") return 20;
  if (quality === "extreme") return 30;
  return 10;
}

function convertCredits(body) {
  const record = objectRecord(body);
  const format = trimmed(record.texture_format).toUpperCase();
  const advanced = record.quad === true ||
    (record.face_limit !== undefined && record.face_limit !== null) ||
    record.flatten_bottom === true ||
    (record.flatten_bottom_threshold !== undefined && record.flatten_bottom_threshold !== null && Number(record.flatten_bottom_threshold) !== 0.01) ||
    (record.texture_size !== undefined && record.texture_size !== null && Number(record.texture_size) !== 4096) ||
    (!!format && format !== "JPEG") ||
    record.pivot_to_center_bottom === true ||
    (record.scale_factor !== undefined && record.scale_factor !== null && Number(record.scale_factor) !== 1);
  return advanced ? 10 : 5;
}

function decimateCredits(body) {
  const record = objectRecord(body);
  const model = trimmed(record.model) || "v2.0";
  if (model.indexOf("v3") === 0) return record.quad === true ? 40 : 35;
  if (model.indexOf("v1") === 0) return 10;
  return 30;
}

function boundedCount(value, limit) {
  if (!Array.isArray(value)) return 0;
  return Math.max(0, Math.min(value.length, limit));
}

function officialCredits(body, action) {
  if (action === "text-to-model" || action === "image-to-model" || action === "multiview-to-model") return generationCredits(body, action);
  if (action === "text-to-image" || action === "image-to-image") return imageCredits(body);
  if (action === "image-to-multiview") return 10;
  if (action === "edit-multiview") return boundedCount(objectRecord(body).prompts, 4) * 5;
  if (action === "image-to-splat") return 30;
  if (action === "texture") return textureCredits(body);
  if (action === "convert") return convertCredits(body);
  if (action === "segment") return 40;
  if (action === "smartsegment") return trimmed(objectRecord(body).seg_type) === "model" ? 55 : 85;
  if (action === "complete") return trimmed(objectRecord(body).completion_mode) === "quick_cap" ? 30 : 50;
  if (action === "decimate") return decimateCredits(body);
  if (action === "uv") return 20;
  if (action === "rig") return 25;
  if (action === "retarget") {
    const record = objectRecord(body);
    if (Array.isArray(record.animations)) return boundedCount(record.animations, 5) * 10;
    return trimmed(record.animation) ? 10 : 0;
  }
  return 0;
}

function officialAmount(body, action) {
  return officialCredits(body, action) * 7 / 100;
}

function taskEnvelope(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { code: null, data: {}, message: "" };
  const data = body.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : {};
  return { code: body.code, data: data, message: trimmed(body.message || body.suggestion) };
}

function outputOf(data) {
  const output = taskEnvelope(data).data.output;
  return output && typeof output === "object" && !Array.isArray(output) ? output : {};
}

function outputURL(output, key, field) {
  return isHTTPURL(output[field]) ? trimmed(output[field]) : isHTTPURL(output[key]) ? trimmed(output[key]) : "";
}

function failureReason(envelope) {
  return trimmed(envelope.message || envelope.data.error_message || envelope.data.message);
}

export const native = {
  decodeSubmit: function (ctx) {
    if (!ctx.body || ctx.body.kind !== "json") throw new Error("A JSON body is required.");
    const action = actionFromPath(ctx.path);
    validateSubmitBody(ctx.body.value, action);
    return {
      kind: "submit",
      model: "tripo",
      action: action,
      requestBody: ctx.body.value,
      originTaskIds: originTaskIds(ctx.body.value),
    };
  },
  taskCreated: function (ctx, task) {
    const result = task.data && typeof task.data === "object" && !Array.isArray(task.data) ? task.data : {};
    const data = result.data && typeof result.data === "object" && !Array.isArray(result.data) ? result.data : {};
    return Object.assign({}, result, { code: result.code === undefined ? 0 : result.code, data: Object.assign({}, data, { task_id: task.task_id }) });
  },
  taskStatus: function (ctx, task) {
    const envelope = taskEnvelope(task.data);
    const data = Object.assign({}, envelope.data, { task_id: task.task_id });
    if (task.fail_reason && !data.error_message) data.error_message = task.fail_reason;
    return { code: envelope.code === undefined || envelope.code === null ? 0 : envelope.code, data: data };
  },
  error: function (ctx, error) {
    return { code: error && error.code ? error.code : "error", message: error && error.message ? error.message : "The request failed." };
  },
};

export function buildSubmitRequest(ctx) {
  const action = trimmed(ctx.action) || actionFromPath(ctx.action);
  validateSubmitBody(ctx.requestBody, action);
  return {
    url: upstreamURL(ctx, ENDPOINT_SUFFIX[action]),
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authorizationHeader(ctx) },
    body: withUpstreamTaskIds(ctx.requestBody, ctx.originTasks),
    action: action,
  };
}

export function parseSubmitResponse(ctx, response) {
  const envelope = taskEnvelope(response && response.body);
  if (envelope.code !== 0) throw new Error(failureReason(envelope) || "Tripo rejected the task.");
  const taskId = trimmed(envelope.data.task_id);
  if (!taskId) throw new Error("Tripo did not return a task id.");
  const action = trimmed(ctx && ctx.action);
  return { taskId: taskId, taskData: response.body, state: { official_amount: officialAmount(ctx && ctx.requestBody, action) } };
}

export function extractUsage(ctx) {
  if (ctx.usagePurpose === "billing_ratios") return null;
  const taskType = trimmed(ctx.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  return usageFacts(officialAmount(ctx.requestBody, taskType));
}

export function buildQueryRequest(ctx) {
  return {
    url: upstreamURL(ctx, "/tasks", ctx.taskId),
    method: "GET",
    headers: { Accept: "application/json", Authorization: authorizationHeader(ctx) },
  };
}

export function parseTaskResult(ctx, body) {
  const envelope = taskEnvelope(body);
  if (envelope.code !== 0 && envelope.code !== null && envelope.code !== undefined) {
    return { status: "FAILURE", reason: failureReason(envelope) || "Tripo rejected the task query." };
  }
  const statuses = { queued: "QUEUED", running: "IN_PROGRESS", success: "SUCCESS", failed: "FAILURE", cancelled: "FAILURE" };
  const status = statuses[trimmed(envelope.data.status)];
  if (!status) return { status: "UNKNOWN", reason: "Tripo returned an unrecognized task status." };
  const result = { taskId: trimmed(envelope.data.task_id), status: status, reason: trimmed(envelope.data.error_message) };
  const progress = Number(envelope.data.progress);
  if (Number.isFinite(progress)) result.progress = String(Math.max(0, Math.min(100, Math.round(progress)))) + "%";
  if (status === "SUCCESS") {
    const output = outputOf(body);
    const modelURL = outputURL(output, "model", "model_url") || outputURL(output, "pbr_model", "pbr_model_url") || outputURL(output, "base_model", "base_model_url") || outputURL(output, "rendered_image", "rendered_image_url");
    if (modelURL) result.url = modelURL;
  }
  return result;
}

export function extractUsageOnComplete(task, result) {
  if (!result || result.status !== "SUCCESS") return null;
  const taskType = trimmed(task && task.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  const state = task && task.state;
  const saved = state && typeof state === "object" && !Array.isArray(state) ? Number(state.official_amount) : NaN;
  if (!Number.isFinite(saved) || saved < 0) return null;
  return usageFacts(saved);
}

export function listArtifacts(task) {
  if (!task || task.status !== "SUCCESS") return [];
  const output = outputOf(task.data);
  const artifacts = [];
  for (const pair of OUTPUT_FILES) {
    if (outputURL(output, pair[0], pair[1])) artifacts.push({ key: pair[0], type: "file" });
  }
  if (outputURL(output, "rendered_image", "rendered_image_url")) artifacts.push({ key: "rendered_image", type: "image" });
  return artifacts;
}

export function buildContentRequest(ctx) {
  const output = outputOf(ctx.data);
  let url = "";
  for (const pair of OUTPUT_FILES) {
    if (ctx.artifactKey === pair[0]) url = outputURL(output, pair[0], pair[1]);
  }
  if (ctx.artifactKey === "rendered_image") url = outputURL(output, "rendered_image", "rendered_image_url");
  if (!url) throw new Error("The requested artifact is not available.");
  return { url: url, method: ctx.clientRequest.method, credentialless: true };
}
