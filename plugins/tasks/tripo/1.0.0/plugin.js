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

export const meta = {
  apiVersion: 1,
  key: "tripo",
  name: "Tripo",
  icon: "text:Tr",
  description: {
    en: "Tripo 3D generation through the Tripo OpenAPI v3",
    zh: "通过 Tripo OpenAPI v3 生成三维模型",
  },
  version: "1.0.0",
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
    // One accepted generation task. The admin price is per task, not Tripo's own credit amount.
    generations: {
      type: "number",
      unit: "count",
      unitLabel: { en: "generation", zh: "次" },
      description: { en: "3D generation unit price", zh: "3D 生成单价" },
    },
    task_type: {
      enum: TASK_TYPES,
      enumLabels: {
        "text-to-model": { en: "Text to 3D model", zh: "文生三维" },
        "image-to-model": { en: "Image to 3D model", zh: "图生三维" },
        "multiview-to-model": { en: "Multiview to 3D model", zh: "多视图生三维" },
        "text-to-image": { en: "Text to image", zh: "文生图片" },
        "image-to-image": { en: "Image to image", zh: "图生图片" },
        "image-to-multiview": { en: "Image to multiview", zh: "图生多视图" },
        "edit-multiview": { en: "Edit multiview", zh: "编辑多视图" },
        "image-to-splat": { en: "Image to Gaussian splat", zh: "图生高斯泼溅" },
        "image-to-depth": { en: "Image to depth", zh: "图生深度图" },
        texture: { en: "Texture model", zh: "生成贴图" },
        convert: { en: "Convert model", zh: "转换模型" },
        "import": { en: "Import model", zh: "导入模型" },
        segment: { en: "Segment mesh", zh: "网格分割" },
        smartsegment: { en: "Smart segment mesh", zh: "智能分割" },
        complete: { en: "Complete mesh", zh: "网格补全" },
        decimate: { en: "Decimate mesh", zh: "重拓扑" },
        uv: { en: "Unwrap UV", zh: "智能 UV" },
        "rig-check": { en: "Rig check", zh: "绑骨检查" },
        rig: { en: "Rig model", zh: "绑定骨骼" },
        retarget: { en: "Retarget animation", zh: "重定向动画" },
      },
      description: { en: "Generation task type", zh: "生成任务类型" },
    },
  },
  usageExamples: [
    { label: "text to model", facts: { generations: 1, task_type: "text-to-model" } },
    { label: "image to model", facts: { generations: 1, task_type: "image-to-model" } },
    { label: "multiview to model", facts: { generations: 1, task_type: "multiview-to-model" } },
    { label: "texture", facts: { generations: 1, task_type: "texture" } },
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

function usageFacts(taskType) {
  return { generations: 1, task_type: taskType };
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
  return { taskId: taskId, taskData: response.body };
}

export function extractUsage(ctx) {
  if (ctx.usagePurpose === "billing_ratios") return null;
  const taskType = trimmed(ctx.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  return usageFacts(taskType);
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
  return usageFacts(taskType);
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
