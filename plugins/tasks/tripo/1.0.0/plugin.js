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
  "file-upload",
  "file-presign",
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
  "file-upload",
  "file-presign",
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
  "file-upload": { en: "Upload file", zh: "上传文件" },
  "file-presign": { en: "Request upload URL", zh: "申请上传地址" },
};

const USAGE_SCHEMA = {
  task_type: {
    enum: BILLING_TYPES,
    enumLabels: BILLING_LABELS,
    description: { en: "Task type", zh: "任务类型" },
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

// 3D generation models use their official identities for channel selection and pricing.
const MODEL_GENERATION_MODELS = [
  "v3.1-20260211", "v3.0-20250812", "v2.5-20250123", "P1-20260311", "P2-20260801",
];
const DEFAULT_MODEL_GENERATION_MODEL = "v3.1-20260211";

// The two base-price columns are exclusive. Texture upgrades and other options
// are additional quantities; currency prices remain in the host configuration.
// Field prefixes follow the official table in the host's alphabetical editor.
const MODEL_GENERATION_BASE_SCHEMA = {
  task_type: {
    enum: TEXTURED_ACTIONS,
    enumLabels: {
      "text-to-model": { en: "Text to 3D", zh: "文本生成3D" },
      "image-to-model": { en: "Image to 3D", zh: "图片生成3D" },
      "multiview-to-model": { en: "Multiview to 3D", zh: "多视图生成3D" },
    },
    description: { en: "3D generation method", zh: "3D生成方式" },
  },
  a_untextured_model_count: {
    type: "number", unit: "count", unitLabel: { en: "model", zh: "个" },
    description: { en: "Untextured 3D generation unit price", zh: "无贴图3D生成单价" },
  },
  b_textured_model_count: {
    type: "number", unit: "count", unitLabel: { en: "model", zh: "个" },
    description: { en: "Standard-textured 3D generation unit price", zh: "标准贴图3D生成单价" },
  },
};
const MODEL_GENERATION_TEXTURE_SCHEMA = Object.assign({}, MODEL_GENERATION_BASE_SCHEMA, {
  c_hd_texture_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "HD texture add-on unit price", zh: "高清贴图附加单价" },
  },
  d_texture_8k_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "8K texture add-on unit price", zh: "8K贴图附加单价" },
  },
});
const MODEL_GENERATION_QUAD_SCHEMA = {
  f_quad_count: {
    type: "number", unit: "count", unitLabel: { en: "option", zh: "项" },
    description: { en: "Quad mesh add-on unit price", zh: "四边面网格附加单价" },
  },
};
const H_MODEL_GENERATION_SCHEMA = Object.assign({}, MODEL_GENERATION_TEXTURE_SCHEMA, MODEL_GENERATION_QUAD_SCHEMA, {
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
const P2_MODEL_GENERATION_SCHEMA = Object.assign({}, MODEL_GENERATION_TEXTURE_SCHEMA, MODEL_GENERATION_QUAD_SCHEMA);
const MODEL_GENERATION_SCHEMAS = {
  "v3.1-20260211": H_MODEL_GENERATION_SCHEMA,
  "v3.0-20250812": H_MODEL_GENERATION_SCHEMA,
  "v2.5-20250123": MODEL_GENERATION_BASE_SCHEMA,
  "P1-20260311": MODEL_GENERATION_TEXTURE_SCHEMA,
  "P2-20260801": P2_MODEL_GENERATION_SCHEMA,
};

// The generic identity prices only model processing, animation and multiview
// tools. Keep the full schema above for legacy facts and fallback identities.
const TRIPO_BILLING_TYPES = [
  "image-to-multiview",
  "edit-multiview",
  "texture",
  "convert",
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
const TRIPO_BILLING_LABELS = {};
for (const type of TRIPO_BILLING_TYPES) TRIPO_BILLING_LABELS[type] = BILLING_LABELS[type];
const TRIPO_USAGE_SCHEMA = {
  task_type: {
    enum: TRIPO_BILLING_TYPES,
    enumLabels: TRIPO_BILLING_LABELS,
    description: USAGE_SCHEMA.task_type.description,
  },
  a_task: USAGE_SCHEMA.a_task,
  c_texture_hd: USAGE_SCHEMA.c_texture_hd,
  d_texture_8k: USAGE_SCHEMA.d_texture_8k,
  g_quad: USAGE_SCHEMA.g_quad,
  j_convert: USAGE_SCHEMA.j_convert,
  k_animation: USAGE_SCHEMA.k_animation,
  l_edit: USAGE_SCHEMA.l_edit,
};
const TRIPO_USAGE_EXAMPLES = [
  { label: "Model texture · HD", facts: usageFacts({ texture_quality: "detailed" }, "texture", "tripo") },
  { label: "Edit multiview · Two views", facts: usageFacts({ prompts: ["front", "left"] }, "edit-multiview", "tripo") },
  { label: "Retarget · Two animations", facts: usageFacts({ animations: ["walk", "run"] }, "retarget", "tripo") },
].map(example => {
  const facts = {};
  for (const key of Object.keys(TRIPO_USAGE_SCHEMA)) facts[key] = example.facts[key];
  return { label: example.label, facts: facts };
});

export const meta = {
  apiVersion: 1,
  key: "tripo",
  name: "Tripo",
  icon: "text:Tr",
  description: {
    en: "Tripo 3D generation through the Tripo OpenAPI v3",
    zh: "通过 Tripo OpenAPI v3 生成三维模型",
  },
  version: "1.0.13",
  author: { name: "sunyuhang404", url: "https://github.com/sunyuhang404/trident-api-plugin" },
  website: "https://github.com/sunyuhang404/trident-api-plugin",
  baseUrl: "https://openapi.tripo3d.com/v3",
  allowedHosts: ["cdn.tripo3d.ai"],
  models: ["tripo", "v3.1-20260211", "v3.0-20250812", "v2.5-20250123", "P1-20260311", "P2-20260801"],
  fetchMode: "per_task",
  auth: "api_key",
  upstreams: ["vendor", "new_api"],
  routes: [
    { method: "POST", path: "/tripo/v3/files", type: "submit", action: "file-upload", decode: "decodeFileUpload", render: "taskCreated" },
    { method: "POST", path: "/tripo/v3/files/presign", type: "submit", action: "file-presign", decode: "decodeFilePresign", render: "taskCreated" },
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
    { models: ["tripo"], schema: TRIPO_USAGE_SCHEMA, examples: TRIPO_USAGE_EXAMPLES },
    {
      models: ["v3.1-20260211", "v3.0-20250812"], schema: H_MODEL_GENERATION_SCHEMA,
      examples: [
        { label: "Text to 3D · No texture", facts: modelGenerationUsage({ texture: false, pbr: false }, "v3.1-20260211", "text-to-model") },
        { label: "Text to 3D · Standard texture", facts: modelGenerationUsage({}, "v3.1-20260211", "text-to-model") },
        { label: "Image to 3D · Standard texture", facts: modelGenerationUsage({}, "v3.1-20260211", "image-to-model") },
        { label: "Multiview to 3D · Standard texture", facts: modelGenerationUsage({}, "v3.1-20260211", "multiview-to-model") },
        { label: "Text to 3D · HD texture", facts: modelGenerationUsage({ texture_quality: "detailed" }, "v3.1-20260211", "text-to-model") },
        { label: "Text to 3D · 8K texture", facts: modelGenerationUsage({ texture_quality: "extreme" }, "v3.1-20260211", "text-to-model") },
      ],
    },
    {
      models: ["v2.5-20250123"], schema: MODEL_GENERATION_BASE_SCHEMA,
      examples: [
        { label: "Text to 3D · No texture", facts: modelGenerationUsage({ texture: false, pbr: false }, "v2.5-20250123", "text-to-model") },
        { label: "Text to 3D · Standard texture", facts: modelGenerationUsage({}, "v2.5-20250123", "text-to-model") },
        { label: "Image to 3D · Standard texture", facts: modelGenerationUsage({}, "v2.5-20250123", "image-to-model") },
        { label: "Multiview to 3D · Standard texture", facts: modelGenerationUsage({}, "v2.5-20250123", "multiview-to-model") },
      ],
    },
    {
      models: ["P1-20260311"], schema: MODEL_GENERATION_TEXTURE_SCHEMA,
      examples: [
        { label: "Text to 3D · No texture", facts: modelGenerationUsage({ texture: false, pbr: false }, "P1-20260311", "text-to-model") },
        { label: "Text to 3D · Standard texture", facts: modelGenerationUsage({}, "P1-20260311", "text-to-model") },
        { label: "Image to 3D · Standard texture", facts: modelGenerationUsage({}, "P1-20260311", "image-to-model") },
        { label: "Multiview to 3D · Standard texture", facts: modelGenerationUsage({}, "P1-20260311", "multiview-to-model") },
      ],
    },
    {
      models: ["P2-20260801"], schema: P2_MODEL_GENERATION_SCHEMA,
      examples: [
        { label: "Text to 3D · No texture", facts: modelGenerationUsage({ texture: false, pbr: false }, "P2-20260801", "text-to-model") },
        { label: "Text to 3D · Standard texture", facts: modelGenerationUsage({}, "P2-20260801", "text-to-model") },
        { label: "Image to 3D · Standard texture", facts: modelGenerationUsage({}, "P2-20260801", "image-to-model") },
        { label: "Multiview to 3D · Standard texture", facts: modelGenerationUsage({}, "P2-20260801", "multiview-to-model") },
      ],
    },
  ],
};

const ENDPOINT_SUFFIX = {
  "file-upload": "/files",
  "file-presign": "/files/presign",
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
  ["seg_model", "seg_model_url"],
];
const OUTPUT_IMAGES = [
  ["rendered_image", "rendered_image_url"],
  ["generated_image", "generated_image_url"],
  ["mask", "mask_url"],
  ["uv_render", "uv_render_url"],
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

// Child references carry only the public parent ID and a fixed output selector.
// The host authorizes and pins the parent before the driver reads its child ID.
function parseChildTaskReference(value) {
  const text = trimmed(value);
  if (text.indexOf("tripo-child:") !== 0) return null;
  const match = text.match(/^tripo-child:([^:]+):(seg_task_id|model_task_id)$/);
  if (!match) throw new Error("The smart segmentation child reference is invalid.");
  let taskId;
  try {
    taskId = decodeURIComponent(match[1]);
  } catch (error) {
    throw new Error("The smart segmentation child reference is invalid.");
  }
  if (!taskId || taskId !== taskId.trim() || taskId.length > 128 || encodeURIComponent(taskId) !== match[1]) {
    throw new Error("The smart segmentation child reference is invalid.");
  }
  return { taskId: taskId, field: match[2] };
}

function pushId(ids, value) {
  const child = parseFileTaskReference(value) || parseChildTaskReference(value);
  const text = child ? child.taskId : trimmed(value);
  if (text && ids.indexOf(text) < 0) ids.push(text);
}

// Upload references use a persisted gateway task to retain ownership and channel.
function parseFileTaskReference(value) {
  const text = trimmed(value);
  if (text.indexOf("tripo-file:") !== 0) return null;
  const encoded = text.slice("tripo-file:".length);
  let taskId;
  try {
    taskId = decodeURIComponent(encoded);
  } catch (error) {
    throw new Error("The uploaded file reference is invalid.");
  }
  if (!taskId || taskId !== taskId.trim() || taskId.length > 128 || encodeURIComponent(taskId) !== encoded) {
    throw new Error("The uploaded file reference is invalid.");
  }
  return { taskId: taskId };
}

// Only file-bearing fields are interpreted; prompts and other text stay opaque.
function visitFileReferences(value, visit, referenceArray) {
  if (!value || typeof value !== "object") return;
  const fields = ["input", "inputs", "ref_image", "image", "images", "style_image", "file_token", "front", "left", "back", "right"];
  for (const key of Object.keys(value)) {
    const item = value[key];
    const reference = Array.isArray(value) ? referenceArray : fields.indexOf(key) >= 0;
    if (reference && typeof item === "string" && trimmed(item).indexOf("tripo-file:") === 0) visit(value, key);
    else if (item && typeof item === "object") visitFileReferences(item, visit, reference);
  }
}

function isUploadedFileToken(value) {
  if (typeof value !== "string") return false;
  return /^file_[^\s]+$/.test(trimmed(value)) || parseFileTaskReference(value) !== null;
}

function uploadFormat(body) {
  const format = body && typeof body.format === "string" ? body.format.toLowerCase() : "";
  if (["jpeg", "jpg", "png", "webp", "bmp", "tiff", "glb", "gltf", "fbx", "obj", "stl", "3mf", "usdz"].indexOf(format) < 0) throw new Error("The upload file format is not supported.");
  return format;
}

function validateUploadFile(file) {
  if (!file || file.field !== "file" || typeof file.ref !== "string" || !file.ref) throw new Error("Exactly one file field is required.");
  const filename = typeof file.filename === "string" ? file.filename : "";
  const match = filename.match(/\.([A-Za-z0-9]+)$/);
  if (!match || /[\x00-\x1f:]/.test(filename)) throw new Error("The upload file format is not supported.");
  const format = match[1].toLowerCase();
  const image = format === "jpeg" || format === "jpg" || format === "png";
  if (!image && ["glb", "gltf", "fbx", "obj", "stl"].indexOf(format) < 0) throw new Error("The upload file format is not supported.");
  const limit = (image ? 20 : 150) * 1024 * 1024;
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > limit) throw new Error(image ? "The image must be between 1 byte and 20 MB." : "The model must be between 1 byte and 150 MB.");
  return "upload." + format;
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
  visitFileReferences(body, function (container, key) { pushId(ids, container[key]); });
  return ids;
}

function validateSubmitBody(body, action) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("A JSON object body is required.");
  if (TASK_TYPES.indexOf(action) < 0) throw new Error("This task path is not supported.");
  if (TEXTURED_ACTIONS.indexOf(action) >= 0) {
    if (action !== "text-to-model" && body.model === undefined) throw new Error("A 3D generation model is required.");
    const model = body.model === undefined ? DEFAULT_MODEL_GENERATION_MODEL : body.model;
    if (MODEL_GENERATION_MODELS.indexOf(model) < 0) throw new Error("This 3D generation model is not supported.");
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
  const value = trimmed(ctx.authHeader) || trimmed(ctx.apiKey);
  const key = value.replace(/^Bearer(?:\s+|$)/i, "").trim();
  if (!key) throw new Error("A Tripo API key is required.");
  if (/\s/.test(key)) throw new Error("The Tripo API key format is invalid.");
  return "Bearer " + key;
}

function upstreamURL(ctx, suffix, taskId) {
  const base = String(ctx.baseUrl || "").replace(/\/+$/, "");
  let path = ctx.upstream && ctx.upstream.kind === "new_api" ? "/tripo/v3" + suffix : suffix;
  if (taskId) path += "/" + encodeURIComponent(taskId);
  return base + path;
}

function resolveTaskReference(value, originTasks) {
  const file = parseFileTaskReference(value);
  const child = file || parseChildTaskReference(value);
  const publicId = child ? child.taskId : trimmed(value);
  const task = (originTasks || []).find(function (item) { return item && trimmed(item.taskId) === publicId; });
  if (!child) return task && trimmed(task.upstreamTaskId) ? trimmed(task.upstreamTaskId) : value;
  if (file) {
    if (!task || task.status !== "SUCCESS" || (task.action !== "file-upload" && task.action !== "file-presign")) throw new Error("The uploaded file is not available.");
    const token = taskEnvelope(task.data).data.file_token;
    if (!isUploadedFileToken(token)) throw new Error("The uploaded file is not available.");
    return trimmed(token);
  }
  if (!task || task.action !== "smartsegment" || task.status !== "SUCCESS") {
    throw new Error("The smart segmentation child task is not available.");
  }
  const upstreamId = outputOf(task.data)[child.field];
  if (typeof upstreamId !== "string" || !isTaskReference(upstreamId)) {
    throw new Error("The smart segmentation child task is not available.");
  }
  // An upstream new-api gateway can return its own child reference here.
  // Forward that reference unchanged so the next gateway authorizes its parent.
  return trimmed(upstreamId);
}

function withUpstreamTaskIds(body, originTasks) {
  const next = utils.json.clone(body);
  if (isTaskReference(next.input)) next.input = resolveTaskReference(next.input, originTasks);
  if (trimmed(next.task_id)) next.task_id = resolveTaskReference(next.task_id, originTasks);
  if (Array.isArray(next.inputs)) {
    for (const item of next.inputs) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      if (trimmed(item.task_id)) item.task_id = resolveTaskReference(item.task_id, originTasks);
    }
  }
  visitFileReferences(next, function (container, key) {
    // The top-level input has already been resolved; an upstream gateway's
    // reference must reach that gateway unchanged rather than resolve twice.
    if (container !== next || key !== "input") container[key] = resolveTaskReference(container[key], originTasks);
  });
  return next;
}

function textureEnabled(body, action) {
  if (TEXTURED_ACTIONS.indexOf(action) < 0) return false;
  const record = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  if (record.pbr !== false) return true;
  return record.texture !== false;
}

function modelGenerationUsage(body, model, action) {
  const record = Object.assign({}, body, { model: model });
  const schema = MODEL_GENERATION_SCHEMAS[model];
  const facts = { task_type: action };
  for (const key of Object.keys(schema)) {
    if (key !== "task_type") facts[key] = 0;
  }
  const textured = textureEnabled(record, action);
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
  if (TEXTURED_ACTIONS.indexOf(action) >= 0 && model !== "tripo") {
    const version = model || (record.model === undefined ? DEFAULT_MODEL_GENERATION_MODEL : record.model);
    validateSubmitBody(Object.assign({}, record, { model: version }), action);
    return modelGenerationUsage(record, version, action);
  }
  let taskType = action;
  if (action === "smartsegment") taskType = trimmed(record.seg_type) === "model" ? "smartsegment-model" : "smartsegment-image";
  if (action === "complete") taskType = trimmed(record.completion_mode) === "quick_cap" ? "complete-quick" : "complete";
  if (action === "decimate") {
    const model = trimmed(record.model) || "v2.0";
    taskType = model.indexOf("v3") === 0 ? "decimate-v3" : model.indexOf("v1") === 0 ? "decimate-v1" : "decimate-v2";
  }
  const facts = emptyFacts(taskType);
  // Uploads report no generation quantities. The saved host expression remains
  // authoritative, including any administrator-configured constant charge.
  if (action === "file-upload" || action === "file-presign") return facts;
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

function publicTaskData(task) {
  const data = Object.assign({}, taskEnvelope(task.data).data, { task_id: task.task_id });
  if (task.status === "SUCCESS" && (data.type === "smartsegment_image" || data.type === "smartsegment_model")) {
    const output = Object.assign({}, outputOf(task.data));
    for (const field of ["seg_task_id", "model_task_id"]) {
      if (typeof output[field] === "string" && isTaskReference(output[field])) {
        output[field] = "tripo-child:" + encodeURIComponent(task.task_id) + ":" + field;
      }
    }
    data.output = output;
  }
  if (task.status === "SUCCESS" && (data.type === "file_upload" || data.type === "file_presign")) {
    data.file_token = "tripo-file:" + encodeURIComponent(task.task_id);
  }
  return data;
}

export const native = {
  decodeFileUpload: function (ctx) {
    if (!ctx.body || ctx.body.kind !== "multipart" || !Array.isArray(ctx.body.files) || ctx.body.files.length !== 1) throw new Error("Exactly one multipart file field is required.");
    const file = ctx.body.files[0];
    return { kind: "submit", model: "tripo", action: "file-upload", requestBody: { fileRef: file.ref, filename: validateUploadFile(file) } };
  },
  decodeFilePresign: function (ctx) {
    if (!ctx.body || ctx.body.kind !== "json") throw new Error("A JSON body is required.");
    const body = ctx.body.value;
    return { kind: "submit", model: "tripo", action: "file-presign", requestBody: { format: uploadFormat(body) } };
  },
  decodeSubmit: function (ctx) {
    if (!ctx.body || ctx.body.kind !== "json") throw new Error("A JSON body is required.");
    const action = actionFromPath(ctx.path);
    validateSubmitBody(ctx.body.value, action);
    const model = TEXTURED_ACTIONS.indexOf(action) >= 0
      ? (ctx.body.value.model === undefined ? DEFAULT_MODEL_GENERATION_MODEL : ctx.body.value.model)
      : "tripo";
    return {
      kind: "submit",
      model: model,
      action: action,
      requestBody: TEXTURED_ACTIONS.indexOf(action) >= 0 ? Object.assign({}, ctx.body.value, { model: model }) : ctx.body.value,
      originTaskIds: originTaskIds(ctx.body.value),
    };
  },
  taskCreated: function (ctx, task) {
    const result = task.data && typeof task.data === "object" && !Array.isArray(task.data) ? task.data : {};
    return Object.assign({}, result, { code: result.code === undefined ? 0 : result.code, data: publicTaskData(task) });
  },
  taskStatus: function (ctx, task) {
    const envelope = taskEnvelope(task.data);
    const data = publicTaskData(task);
    if (task.fail_reason && !data.error_message) data.error_message = task.fail_reason;
    return { code: envelope.code === undefined || envelope.code === null ? 0 : envelope.code, data: data };
  },
  error: function (ctx, error) {
    return { code: error && error.code ? error.code : "error", message: error && error.message ? error.message : "The request failed." };
  },
};

export function buildSubmitRequest(ctx) {
  const action = trimmed(ctx.action) || actionFromPath(ctx.action);
  if (action === "file-upload") {
    const fileRef = ctx.requestBody && ctx.requestBody.fileRef;
    const file = (ctx.files || []).find(function (item) { return item.ref === fileRef; });
    return { url: upstreamURL(ctx, "/files"), method: "POST", headers: { Accept: "application/json", Authorization: authorizationHeader(ctx) },
      bodyType: "multipart", parts: [{ name: "file", fileRef: fileRef, filename: validateUploadFile(file) }], action: action };
  }
  const body = withUpstreamTaskIds(ctx.requestBody, ctx.originTasks);
  if (action === "file-presign") body.format = uploadFormat(body);
  if (TEXTURED_ACTIONS.indexOf(action) >= 0) body.model = ctx.upstreamModel || ctx.model || body.model || DEFAULT_MODEL_GENERATION_MODEL;
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
  if (ctx.action === "file-upload" || ctx.action === "file-presign") {
    const data = envelope.data;
    if (!isUploadedFileToken(data.file_token)) throw new Error("Tripo did not return a file token.");
    if (ctx.action === "file-presign" && (typeof data.presigned_url !== "string" || !/^https:\/\/[^/\s?#@]+(?:[/?][^\s#]*)?$/.test(data.presigned_url) || !Number.isInteger(data.expires_in) || data.expires_in <= 0)) throw new Error("Tripo did not return a valid upload URL.");
    const taskId = trimmed(data.task_id) || trimmed(ctx.publicTaskId) || utils.uuid();
    const taskData = { code: 0, data: Object.assign({}, data, { type: ctx.action === "file-upload" ? "file_upload" : "file_presign", status: "success" }) };
    return { taskId: taskId, taskData: taskData, immediate: { status: "SUCCESS", progress: "100%" }, state: usageFacts(ctx.requestBody, ctx.action, "tripo") };
  }
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
    const modelURL = outputURL(output, "model", "model_url") || outputURL(output, "pbr_model", "pbr_model_url") || outputURL(output, "base_model", "base_model_url") || outputURL(output, "seg_model", "seg_model_url") || outputURL(output, "rendered_image", "rendered_image_url");
    if (modelURL) result.url = modelURL;
  }
  return result;
}

function completionFacts(state, model, action) {
  const schema = MODEL_GENERATION_SCHEMAS[model];
  if (schema) {
    if (!state || typeof state !== "object" || Array.isArray(state)) return null;
    // Version 1.0.5 stored only numeric text-to-3D facts. Its frozen expression
    // remains valid; missing task_type belongs only to those text tasks.
    const taskType = state.task_type === undefined ? "text-to-model" : state.task_type;
    if (taskType !== action || TEXTURED_ACTIONS.indexOf(taskType) < 0) return null;
    const facts = { task_type: taskType };
    for (const key of Object.keys(schema)) {
      if (key === "task_type") continue;
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
  // Tasks outside the current tool profile keep their frozen task_type.
  // Omit it from the completion overlay so historical tasks still validate,
  // retaining every numeric fact required by their saved expressions.
  if (TRIPO_BILLING_TYPES.indexOf(state.task_type) < 0) delete facts.task_type;
  return facts;
}

export function extractUsageOnComplete(task, result) {
  if (!result || result.status !== "SUCCESS") return null;
  const taskType = trimmed(task && task.action);
  if (TASK_TYPES.indexOf(taskType) < 0) return null;
  return completionFacts(task && task.state, TEXTURED_ACTIONS.indexOf(taskType) >= 0 ? (task.upstreamModel || task.model) : "tripo", taskType);
}

export function listArtifacts(task) {
  if (!task || task.status !== "SUCCESS") return [];
  const output = outputOf(task.data);
  const artifacts = [];
  for (const pair of OUTPUT_FILES) {
    if (outputURL(output, pair[0], pair[1])) artifacts.push({ key: pair[0], type: "file" });
  }
  for (const pair of OUTPUT_IMAGES) {
    if (outputURL(output, pair[0], pair[1])) artifacts.push({ key: pair[0], type: "image" });
  }
  return artifacts;
}

export function buildContentRequest(ctx) {
  const output = outputOf(ctx.data);
  let url = "";
  for (const pair of OUTPUT_FILES) {
    if (ctx.artifactKey === pair[0]) url = outputURL(output, pair[0], pair[1]);
  }
  for (const pair of OUTPUT_IMAGES) {
    if (ctx.artifactKey === pair[0]) url = outputURL(output, pair[0], pair[1]);
  }
  if (!url) throw new Error("The requested artifact is not available.");
  return { url: url, method: ctx.clientRequest.method, credentialless: true };
}
