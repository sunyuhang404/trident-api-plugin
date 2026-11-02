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

// Billing rows. Prices stay in the console; these names only select a row.
const BILLING_TYPES = [
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
  "smartsegment-image",
  "smartsegment-model",
  "complete",
  "complete-quick",
  "decimate-v1",
  "decimate-v2",
  "decimate-v3",
  "uv",
  "rig-check",
  "rig",
  "retarget",
];

const BILLING_LABELS = {
  "text-to-model": { en: "Text to 3D model", zh: "文生三维" },
  "image-to-model": { en: "Image to 3D model", zh: "图生三维" },
  "multiview-to-model": { en: "Multiview to 3D model", zh: "多视图生三维" },
  "text-to-image": { en: "Text to image", zh: "文生图片" },
  "image-to-image": { en: "Image to image", zh: "图生图片" },
  "image-to-multiview": { en: "Image to multiview", zh: "图生多视图" },
  "edit-multiview": { en: "Edit multiview", zh: "编辑多视图" },
  "image-to-splat": { en: "Image to Gaussian splat", zh: "图生高斯泼溅" },
  "image-to-depth": { en: "Image to depth", zh: "图生深度图" },
  "texture": { en: "Texture model", zh: "生成贴图" },
  "convert": { en: "Convert model", zh: "转换模型" },
  "import": { en: "Import model", zh: "导入模型" },
  "segment": { en: "Segment mesh", zh: "网格分割" },
  "smartsegment-image": { en: "Smart segment image", zh: "智能分割图片" },
  "smartsegment-model": { en: "Smart segment model", zh: "智能分割模型" },
  "complete": { en: "Complete mesh", zh: "网格补全" },
  "complete-quick": { en: "Quick cap", zh: "快速封口" },
  "decimate-v1": { en: "Retopology v1", zh: "重拓扑 v1" },
  "decimate-v2": { en: "Retopology v2", zh: "重拓扑 v2" },
  "decimate-v3": { en: "Retopology v3", zh: "重拓扑 v3" },
  "uv": { en: "Unwrap UV", zh: "智能 UV" },
  "rig-check": { en: "Rig check", zh: "绑骨检查" },
  "rig": { en: "Rig model", zh: "绑定骨骼" },
  "retarget": { en: "Retarget animation", zh: "重定向动画" },
};

const USAGE_SCHEMA = {
  task_type: {
    enum: BILLING_TYPES,
    enumLabels: BILLING_LABELS,
    description: { en: "Generation task type", zh: "生成任务类型" },
  },
  a_task: {
    type: "number",
    unit: "count",
    unitLabel: { en: "task", zh: "次" },
    description: { en: "Task unit price", zh: "任务单价" },
  },
  b_texture: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Standard texture unit price", zh: "标准贴图单价" },
  },
  c_texture_hd: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "HD texture unit price", zh: "高清贴图单价" },
  },
  d_texture_8k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "8K texture unit price", zh: "8K贴图单价" },
  },
  e_p_series: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "P series unit price", zh: "P系列单价" },
  },
  f_geometry: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Ultra geometry unit price", zh: "超清几何单价" },
  },
  g_quad: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Quad mesh unit price", zh: "四边面单价" },
  },
  h_low_poly: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Smart low poly unit price", zh: "智能低模单价" },
  },
  i_parts: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Part generation unit price", zh: "分部件单价" },
  },
  j_convert: {
    type: "number",
    unit: "count",
    unitLabel: { en: "option", zh: "项" },
    description: { en: "Advanced conversion unit price", zh: "高级转换单价" },
  },
  k_animation: {
    type: "number",
    unit: "count",
    unitLabel: { en: "animation", zh: "个" },
    description: { en: "Animation unit price", zh: "动画单价" },
  },
  l_edit: {
    type: "number",
    unit: "count",
    unitLabel: { en: "view", zh: "张" },
    description: { en: "Edited view unit price", zh: "编辑视图单价" },
  },
  m_img_01_seedream: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Seedream image unit price", zh: "Seedream图像单价" },
  },
  m_img_02_banana: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Banana image unit price", zh: "Banana图像单价" },
  },
  m_img_03_banana2: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Banana2 image unit price", zh: "Banana2图像单价" },
  },
  m_img_04_banana2_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Banana2 4K image unit price", zh: "Banana2 4K图像单价" },
  },
  m_img_05_pro: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Banana Pro image unit price", zh: "Banana Pro图像单价" },
  },
  m_img_06_pro_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Banana Pro 4K image unit price", zh: "Banana Pro 4K图像单价" },
  },
  m_img_07_chat1: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 1 unit price", zh: "Chat Image 1单价" },
  },
  m_img_08_chat15: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 1.5 unit price", zh: "Chat Image 1.5单价" },
  },
  m_img_09_chat2: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2 unit price", zh: "Chat Image 2单价" },
  },
  m_img_10_chat2_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2 4K unit price", zh: "Chat Image 2 4K单价" },
  },
  m_img_11_chat2_high_1k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2 high 1K unit price", zh: "Chat Image 2高画质1K单价" },
  },
  m_img_12_chat2_high_2k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2 high 2K unit price", zh: "Chat Image 2高画质2K单价" },
  },
  m_img_13_chat2_high_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2 high 4K unit price", zh: "Chat Image 2高画质4K单价" },
  },
  m_img_14_chat25: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 unit price", zh: "Chat Image 2.5单价" },
  },
  m_img_15_chat25_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 4K unit price", zh: "Chat Image 2.5 4K单价" },
  },
  m_img_16_chat25_high_1k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 high 1K unit price", zh: "Chat Image 2.5高画质1K单价" },
  },
  m_img_17_chat25_high_2k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 high 2K unit price", zh: "Chat Image 2.5高画质2K单价" },
  },
  m_img_18_chat25_high_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 high 4K unit price", zh: "Chat Image 2.5高画质4K单价" },
  },
  m_img_19_chat25_xhigh_1k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 xhigh 1K unit price", zh: "Chat Image 2.5超高画质1K单价" },
  },
  m_img_20_chat25_xhigh_2k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 xhigh 2K unit price", zh: "Chat Image 2.5超高画质2K单价" },
  },
  m_img_21_chat25_xhigh_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 xhigh 4K unit price", zh: "Chat Image 2.5超高画质4K单价" },
  },
  m_img_22_chat25_max_1k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 max 1K unit price", zh: "Chat Image 2.5最高画质1K单价" },
  },
  m_img_23_chat25_max_2k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 max 2K unit price", zh: "Chat Image 2.5最高画质2K单价" },
  },
  m_img_24_chat25_max_4k: {
    type: "number",
    unit: "count",
    unitLabel: { en: "image", zh: "张" },
    description: { en: "Chat Image 2.5 max 4K unit price", zh: "Chat Image 2.5最高画质4K单价" },
  },
};

const USAGE_EXAMPLES = [
  { label: "text to 3d", facts: { task_type: "text-to-model", a_task: 1, b_texture: 1, c_texture_hd: 0, d_texture_8k: 0, e_p_series: 0, f_geometry: 0, g_quad: 0, h_low_poly: 0, i_parts: 0, j_convert: 0, k_animation: 0, l_edit: 0, m_img_01_seedream: 0, m_img_02_banana: 0, m_img_03_banana2: 0, m_img_04_banana2_4k: 0, m_img_05_pro: 0, m_img_06_pro_4k: 0, m_img_07_chat1: 0, m_img_08_chat15: 0, m_img_09_chat2: 0, m_img_10_chat2_4k: 0, m_img_11_chat2_high_1k: 0, m_img_12_chat2_high_2k: 0, m_img_13_chat2_high_4k: 0, m_img_14_chat25: 0, m_img_15_chat25_4k: 0, m_img_16_chat25_high_1k: 0, m_img_17_chat25_high_2k: 0, m_img_18_chat25_high_4k: 0, m_img_19_chat25_xhigh_1k: 0, m_img_20_chat25_xhigh_2k: 0, m_img_21_chat25_xhigh_4k: 0, m_img_22_chat25_max_1k: 0, m_img_23_chat25_max_2k: 0, m_img_24_chat25_max_4k: 0 } },
  { label: "seedream image", facts: { task_type: "text-to-image", a_task: 0, b_texture: 0, c_texture_hd: 0, d_texture_8k: 0, e_p_series: 0, f_geometry: 0, g_quad: 0, h_low_poly: 0, i_parts: 0, j_convert: 0, k_animation: 0, l_edit: 0, m_img_01_seedream: 1, m_img_02_banana: 0, m_img_03_banana2: 0, m_img_04_banana2_4k: 0, m_img_05_pro: 0, m_img_06_pro_4k: 0, m_img_07_chat1: 0, m_img_08_chat15: 0, m_img_09_chat2: 0, m_img_10_chat2_4k: 0, m_img_11_chat2_high_1k: 0, m_img_12_chat2_high_2k: 0, m_img_13_chat2_high_4k: 0, m_img_14_chat25: 0, m_img_15_chat25_4k: 0, m_img_16_chat25_high_1k: 0, m_img_17_chat25_high_2k: 0, m_img_18_chat25_high_4k: 0, m_img_19_chat25_xhigh_1k: 0, m_img_20_chat25_xhigh_2k: 0, m_img_21_chat25_xhigh_4k: 0, m_img_22_chat25_max_1k: 0, m_img_23_chat25_max_2k: 0, m_img_24_chat25_max_4k: 0 } },
];

// Text-to-3D models use their official identities for channel selection and pricing.
const TEXT_TO_MODEL_MODELS = [
  "v3.1-20260211", "v3.0-20250812", "v2.5-20250123", "P1-20260311", "P2-20260801",
];
const DEFAULT_TEXT_TO_MODEL_MODEL = "v3.1-20260211";

// The two base-price columns are exclusive. Texture upgrades and other options
// are additional quantities; currency prices remain in the host configuration.
// Field prefixes follow the official table in the host's alphabetical editor.
const TEXT_TO_MODEL_BASE_SCHEMA = {
  a_untextured_model_count: {
    type: "number", unit: "count", unitLabel: { en: "model", zh: "个" },
    description: { en: "Untextured text-to-3D unit price", zh: "无贴图文生3D单价" },
  },
  b_textured_model_count: {
    type: "number", unit: "count", unitLabel: { en: "model", zh: "个" },
    description: { en: "Standard-textured text-to-3D unit price", zh: "标准贴图文生3D单价" },
  },
};
const TEXT_TO_MODEL_TEXTURE_SCHEMA = Object.assign({}, TEXT_TO_MODEL_BASE_SCHEMA, {
  c_hd_texture_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "HD texture add-on unit price", zh: "高清贴图附加单价" },
  },
  d_texture_8k_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "8K texture add-on unit price", zh: "8K贴图附加单价" },
  },
});
const TEXT_TO_MODEL_QUAD_SCHEMA = {
  f_quad_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "Quad mesh add-on unit price", zh: "四边面网格附加单价" },
  },
};
const H_TEXT_TO_MODEL_SCHEMA = Object.assign({}, TEXT_TO_MODEL_TEXTURE_SCHEMA, TEXT_TO_MODEL_QUAD_SCHEMA, {
  e_ultra_geometry_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "Ultra geometry add-on unit price", zh: "超清几何精度附加单价" },
  },
  g_low_poly_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "Smart low poly add-on unit price", zh: "智能低模附加单价" },
  },
  h_parts_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "Part generation add-on unit price", zh: "分部件生成附加单价" },
  },
});
const P2_TEXT_TO_MODEL_SCHEMA = Object.assign({}, TEXT_TO_MODEL_TEXTURE_SCHEMA, TEXT_TO_MODEL_QUAD_SCHEMA);
const TEXT_TO_MODEL_SCHEMAS = {
  "v3.1-20260211": H_TEXT_TO_MODEL_SCHEMA,
  "v3.0-20250812": H_TEXT_TO_MODEL_SCHEMA,
  "v2.5-20250123": TEXT_TO_MODEL_BASE_SCHEMA,
  "P1-20260311": TEXT_TO_MODEL_TEXTURE_SCHEMA,
  "P2-20260801": P2_TEXT_TO_MODEL_SCHEMA,
};

export const meta = {
  apiVersion: 1,
  key: "tripo",
  name: "Tripo",
  icon: "text:Tr",
  description: {
    en: "Tripo 3D generation through the Tripo OpenAPI v3",
    zh: "通过 Tripo OpenAPI v3 生成三维模型",
  },
  version: "1.0.5",
  author: { name: "sunyuhang404", url: "https://github.com/sunyuhang404/trident-api-plugin" },
  website: "https://github.com/sunyuhang404/trident-api-plugin",
  baseUrl: "https://openapi.tripo3d.com/v3",
  allowedHosts: ["cdn.tripo3d.ai"],
  models: ["tripo", "v3.1-20260211", "v3.0-20250812", "v2.5-20250123", "P1-20260311", "P2-20260801"],
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
  usageSchema: USAGE_SCHEMA,
  usageExamples: USAGE_EXAMPLES,
  usageProfiles: [
    {
      models: ["v3.1-20260211", "v3.0-20250812"], schema: H_TEXT_TO_MODEL_SCHEMA,
      examples: [
        { label: "No texture", facts: textToModelUsage({ texture: false, pbr: false }, "v3.1-20260211") },
        { label: "Standard texture", facts: textToModelUsage({}, "v3.1-20260211") },
        { label: "HD texture", facts: textToModelUsage({ texture_quality: "detailed" }, "v3.1-20260211") },
        { label: "8K texture", facts: textToModelUsage({ texture_quality: "extreme" }, "v3.1-20260211") },
      ],
    },
    {
      models: ["v2.5-20250123"], schema: TEXT_TO_MODEL_BASE_SCHEMA,
      examples: [
        { label: "No texture", facts: textToModelUsage({ texture: false, pbr: false }, "v2.5-20250123") },
        { label: "Standard texture", facts: textToModelUsage({}, "v2.5-20250123") },
      ],
    },
    {
      models: ["P1-20260311"], schema: TEXT_TO_MODEL_TEXTURE_SCHEMA,
      examples: [
        { label: "No texture", facts: textToModelUsage({ texture: false, pbr: false }, "P1-20260311") },
        { label: "Standard texture", facts: textToModelUsage({}, "P1-20260311") },
      ],
    },
    {
      models: ["P2-20260801"], schema: P2_TEXT_TO_MODEL_SCHEMA,
      examples: [
        { label: "No texture", facts: textToModelUsage({ texture: false, pbr: false }, "P2-20260801") },
        { label: "Standard texture", facts: textToModelUsage({}, "P2-20260801") },
      ],
    },
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
  if (action === "text-to-model") {
    const model = body.model === undefined ? DEFAULT_TEXT_TO_MODEL_MODEL : body.model;
    if (TEXT_TO_MODEL_MODELS.indexOf(model) < 0) throw new Error("This text-to-3D model is not supported.");
    for (const key of ["texture", "pbr", "quad", "smart_low_poly", "generate_parts"]) {
      if (body[key] !== undefined && typeof body[key] !== "boolean") throw new Error(key + " must be a boolean.");
    }
    if (body.texture_quality !== undefined && ["fast", "standard", "detailed", "extreme"].indexOf(body.texture_quality) < 0) {
      throw new Error("This texture quality is not supported.");
    }
    if (body.geometry_quality !== undefined && ["standard", "detailed"].indexOf(body.geometry_quality) < 0) {
      throw new Error("This geometry quality is not supported.");
    }
    if (body.texture_quality === "fast" && body.texture_version !== "v3.5-20260815") {
      throw new Error("Fast texture requires texture_version v3.5-20260815.");
    }
    const hModel = model === "v3.1-20260211" || model === "v3.0-20250812";
    if (hModel && body.generate_parts === true && textureEnabled(body, action)) {
      throw new Error("Part generation requires texture=false and pbr=false.");
    }
  }
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

function textToModelUsage(body, model) {
  const record = Object.assign({}, body, { model: model });
  const schema = TEXT_TO_MODEL_SCHEMAS[model];
  const facts = {};
  for (const key of Object.keys(schema)) facts[key] = 0;
  const textured = textureEnabled(record, "text-to-model");
  facts[textured ? "b_textured_model_count" : "a_untextured_model_count"] = 1;
  if (schema.c_hd_texture_count && textured && record.texture_quality === "detailed") facts.c_hd_texture_count = 1;
  if (schema.d_texture_8k_count && textured && record.texture_quality === "extreme") facts.d_texture_8k_count = 1;
  const lowPoly = !!schema.g_low_poly_count && record.smart_low_poly === true;
  const parts = !!schema.h_parts_count && record.generate_parts === true && !lowPoly;
  if (schema.f_quad_count && record.quad === true && !parts) facts.f_quad_count = 1;
  if (schema.e_ultra_geometry_count && record.geometry_quality === "detailed") facts.e_ultra_geometry_count = 1;
  if (lowPoly) facts.g_low_poly_count = 1;
  if (parts) facts.h_parts_count = 1;
  return facts;
}

function emptyFacts(taskType) {
  const facts = { task_type: taskType };
  facts.a_task = 0;
  facts.b_texture = 0;
  facts.c_texture_hd = 0;
  facts.d_texture_8k = 0;
  facts.e_p_series = 0;
  facts.f_geometry = 0;
  facts.g_quad = 0;
  facts.h_low_poly = 0;
  facts.i_parts = 0;
  facts.j_convert = 0;
  facts.k_animation = 0;
  facts.l_edit = 0;
  facts.m_img_01_seedream = 0;
  facts.m_img_02_banana = 0;
  facts.m_img_03_banana2 = 0;
  facts.m_img_04_banana2_4k = 0;
  facts.m_img_05_pro = 0;
  facts.m_img_06_pro_4k = 0;
  facts.m_img_07_chat1 = 0;
  facts.m_img_08_chat15 = 0;
  facts.m_img_09_chat2 = 0;
  facts.m_img_10_chat2_4k = 0;
  facts.m_img_11_chat2_high_1k = 0;
  facts.m_img_12_chat2_high_2k = 0;
  facts.m_img_13_chat2_high_4k = 0;
  facts.m_img_14_chat25 = 0;
  facts.m_img_15_chat25_4k = 0;
  facts.m_img_16_chat25_high_1k = 0;
  facts.m_img_17_chat25_high_2k = 0;
  facts.m_img_18_chat25_high_4k = 0;
  facts.m_img_19_chat25_xhigh_1k = 0;
  facts.m_img_20_chat25_xhigh_2k = 0;
  facts.m_img_21_chat25_xhigh_4k = 0;
  facts.m_img_22_chat25_max_1k = 0;
  facts.m_img_23_chat25_max_2k = 0;
  facts.m_img_24_chat25_max_4k = 0;
  return facts;
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

function imageFlag(body) {
  const model = trimmed(body.model) || "seedream_v4";
  const tier = imageTier(body.size);
  const quality = trimmed(body.quality) || "low";
  const fourK = tier === "4k";
  const oneK = tier === "1k";
  if (model === "seedream_v4" || model === "seedream_v5") return "m_img_01_seedream";
  if (model === "banana") return "m_img_02_banana";
  if (model === "banana2") return fourK ? "m_img_04_banana2_4k" : "m_img_03_banana2";
  if (model === "banana_pro") return fourK ? "m_img_06_pro_4k" : "m_img_05_pro";
  if (model === "chat_image_1") return "m_img_07_chat1";
  if (model === "chat_image_1.5") return "m_img_08_chat15";
  const chat2 = model === "chat_image_2";
  const chat25 = model === "chat_image_2.5_flare" || model === "chat_image_2.5_sunburst";
  if (!chat2 && !chat25) return "";
  if (quality === "low" || quality === "medium") {
    if (chat2) return fourK ? "m_img_10_chat2_4k" : "m_img_09_chat2";
    return fourK ? "m_img_15_chat25_4k" : "m_img_14_chat25";
  }
  if (chat2 && quality !== "high") return "";
  if (quality !== "high" && quality !== "xhigh" && quality !== "max") return "";
  const size = oneK ? "1k" : fourK ? "4k" : "2k";
  const chat2High = { "1k": "m_img_11_chat2_high_1k", "2k": "m_img_12_chat2_high_2k", "4k": "m_img_13_chat2_high_4k" };
  const chat25Quality = {
    high: { "1k": "m_img_16_chat25_high_1k", "2k": "m_img_17_chat25_high_2k", "4k": "m_img_18_chat25_high_4k" },
    xhigh: { "1k": "m_img_19_chat25_xhigh_1k", "2k": "m_img_20_chat25_xhigh_2k", "4k": "m_img_21_chat25_xhigh_4k" },
    max: { "1k": "m_img_22_chat25_max_1k", "2k": "m_img_23_chat25_max_2k", "4k": "m_img_24_chat25_max_4k" },
  };
  if (chat2) return chat2High[size] || "";
  const sized = chat25Quality[quality];
  return sized ? sized[size] || "" : "";
}

function boundedCount(value, limit) {
  if (!Array.isArray(value)) return 0;
  return Math.max(0, Math.min(value.length, limit));
}

function convertAdvanced(body) {
  const format = trimmed(body.texture_format).toUpperCase();
  return body.quad === true ||
    (body.face_limit !== undefined && body.face_limit !== null) ||
    body.flatten_bottom === true ||
    (body.flatten_bottom_threshold !== undefined && body.flatten_bottom_threshold !== null && Number(body.flatten_bottom_threshold) !== 0.01) ||
    (body.texture_size !== undefined && body.texture_size !== null && Number(body.texture_size) !== 4096) ||
    (!!format && format !== "JPEG") ||
    body.pivot_to_center_bottom === true ||
    (body.scale_factor !== undefined && body.scale_factor !== null && Number(body.scale_factor) !== 1);
}

// Reported facts select a price cell. Amounts stay in the console.
function usageFacts(body, action, model) {
  const record = objectRecord(body);
  if (action === "text-to-model" && model !== "tripo") {
    const version = model || (record.model === undefined ? DEFAULT_TEXT_TO_MODEL_MODEL : record.model);
    validateSubmitBody(Object.assign({}, record, { model: version }), action);
    return textToModelUsage(record, version);
  }
  let taskType = action;
  if (action === "smartsegment") taskType = trimmed(record.seg_type) === "model" ? "smartsegment-model" : "smartsegment-image";
  if (action === "complete") taskType = trimmed(record.completion_mode) === "quick_cap" ? "complete-quick" : "complete";
  if (action === "decimate") {
    const model = trimmed(record.model) || "v2.0";
    taskType = model.indexOf("v3") === 0 ? "decimate-v3" : model.indexOf("v1") === 0 ? "decimate-v1" : "decimate-v2";
  }
  const facts = emptyFacts(taskType);
  if (action === "text-to-image" || action === "image-to-image") {
    const flag = imageFlag(record);
    if (flag) facts[flag] = 1;
    else facts.a_task = 1;
    return facts;
  }
  if (action === "edit-multiview") {
    facts.l_edit = boundedCount(record.prompts, 4);
    return facts;
  }
  if (action === "retarget") {
    facts.k_animation = Array.isArray(record.animations) ? boundedCount(record.animations, 5) : trimmed(record.animation) ? 1 : 0;
    return facts;
  }
  facts.a_task = 1;
  if (TEXTURED_ACTIONS.indexOf(action) >= 0) {
    const model = trimmed(record.model) || "v3.1-20260211";
    const pSeries = isPModel(model);
    const hAddon = !pSeries && model !== "v2.5-20250123";
    const quality = trimmed(record.texture_quality) || "standard";
    const parts = hAddon && record.generate_parts === true && record.smart_low_poly !== true;
    const textured = parts ? false : textureEnabled(record, action);
    if (pSeries) facts.e_p_series = 1;
    if (textured) facts.b_texture = 1;
    if (textured && (pSeries || hAddon) && quality === "detailed") facts.c_texture_hd = 1;
    if (textured && (pSeries || hAddon) && quality === "extreme") facts.d_texture_8k = 1;
    if (hAddon && trimmed(record.geometry_quality) === "detailed") facts.f_geometry = 1;
    if ((hAddon || model.toUpperCase().indexOf("P2") === 0) && record.quad === true) facts.g_quad = 1;
    if (hAddon && record.smart_low_poly === true) facts.h_low_poly = 1;
    if (parts) facts.i_parts = 1;
    return facts;
  }
  if (action === "texture") {
    const quality = trimmed(record.texture_quality) || "standard";
    if (quality === "detailed") facts.c_texture_hd = 1;
    if (quality === "extreme") facts.d_texture_8k = 1;
    return facts;
  }
  if (action === "convert" && convertAdvanced(record)) facts.j_convert = 1;
  if (taskType === "decimate-v3" && record.quad === true) facts.g_quad = 1;
  return facts;
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
    const model = action === "text-to-model"
      ? (ctx.body.value.model === undefined ? DEFAULT_TEXT_TO_MODEL_MODEL : ctx.body.value.model)
      : "tripo";
    return {
      kind: "submit",
      model: model,
      action: action,
      requestBody: action === "text-to-model" ? Object.assign({}, ctx.body.value, { model: model }) : ctx.body.value,
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
  const body = withUpstreamTaskIds(ctx.requestBody, ctx.originTasks);
  if (action === "text-to-model") body.model = ctx.upstreamModel || ctx.model || body.model || DEFAULT_TEXT_TO_MODEL_MODEL;
  validateSubmitBody(body, action);
  return {
    url: upstreamURL(ctx, ENDPOINT_SUFFIX[action]),
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: authorizationHeader(ctx) },
    body: body,
    action: action,
  };
}

export function parseSubmitResponse(ctx, response) {
  const envelope = taskEnvelope(response && response.body);
  if (envelope.code !== 0) throw new Error(failureReason(envelope) || "Tripo rejected the task.");
  const taskId = trimmed(envelope.data.task_id);
  if (!taskId) throw new Error("Tripo did not return a task id.");
  const action = trimmed(ctx && ctx.action);
  return { taskId: taskId, taskData: response.body, state: usageFacts(ctx && ctx.requestBody, action, ctx && (ctx.upstreamModel || ctx.model)) };
}

export function extractUsage(ctx) {
  if (ctx.usagePurpose === "billing_ratios") return null;
  const taskType = trimmed(ctx.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  return usageFacts(ctx.requestBody, taskType, ctx.upstreamModel || ctx.model);
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

function completionFacts(state, model) {
  const schema = TEXT_TO_MODEL_SCHEMAS[model];
  if (schema) {
    if (!state || typeof state !== "object" || Array.isArray(state)) return null;
    const facts = {};
    for (const key of Object.keys(schema)) {
      const value = state[key];
      if (typeof value !== "number" || (value !== 0 && value !== 1)) return null;
      facts[key] = value;
    }
    if (facts.a_untextured_model_count + facts.b_textured_model_count !== 1) return null;
    return facts;
  }
  if (!state || typeof state !== "object" || Array.isArray(state) || BILLING_TYPES.indexOf(state.task_type) < 0) return null;
  const facts = emptyFacts(state.task_type);
  const keys = Object.keys(facts);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (key === "task_type") continue;
    const value = Number(state[key]);
    if (!Number.isFinite(value) || value < 0) return null;
    facts[key] = value;
  }
  return facts;
}

export function extractUsageOnComplete(task, result) {
  if (!result || result.status !== "SUCCESS") return null;
  const taskType = trimmed(task && task.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  return completionFacts(task && task.state, taskType === "text-to-model" ? (task.upstreamModel || task.model) : "tripo");
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
