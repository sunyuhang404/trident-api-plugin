# trident-api-plugin

new-api 任务插件市场源。当前包含：

- **Tripo**：三维生成
- **BytePlus ModelArk**：火山海外版（Dreamina Seedance 视频、Seedream / Dola 图片）

管理后台把本仓库的 `index.json` 配成市场源后，浏览器会按索引去拉对应的 `plugin.js`。

## 目录

- `plugins/tasks/tripo/1.0.0/plugin.js`：Tripo 插件
- `plugins/tasks/byteplus/1.0.0/plugin.js`：BytePlus ModelArk 插件
- `index.json`：市场索引
- `tests/`：插件自检

## Tripo

上游 Base URL：`https://openapi.tripo3d.com/v3`。

安装并绑定渠道后，客户端调用网关，路径比上游多一个 `/tripo` 前缀：

- `POST /tripo/v3/generation/text-to-model`
- `POST /tripo/v3/generation/image-to-model`
- `POST /tripo/v3/generation/multiview-to-model`
- `POST /tripo/v3/generation/image-to-splat`
- `GET /tripo/v3/tasks/:task_id`

文本、图片和多视图生成 3D 共用五个官方渠道模型：`v3.1-20260211`、`v3.0-20250812`、`v2.5-20250123`、`P1-20260311`、`P2-20260801`。

## BytePlus ModelArk（火山海外版）

上游 Base URL：`https://ark.ap-southeast.bytepluses.com`。

这是类型 61「任务插件」渠道，不占用国内豆包的渠道类型 45 / 54。控制台安装 `byteplus` 后：

1. 新建渠道，类型选 **Task Plugin**
2. 绑定插件 `byteplus`
3. Base URL 可留空（会带上默认海外地址），Key 填 BytePlus API Key
4. 模型列表勾选需要的海外模型名，再到「模型定价」里按可视化表填美元价

网关原生路径（也会挂在 `/byteplus` 下）：

- `POST /api/v3/contents/generations/tasks`
- `GET /api/v3/contents/generations/tasks/:task_id`
- `POST /api/v3/images/generations`

并支持宿主协议 `openai_video` / `openai_image` / `openai_responses`。

### 视频模型（Seedance 2.0 / 2.5）

| 模型 | 分辨率 | 最长时长 | 参考视频 |
| --- | --- | --- | --- |
| `dreamina-seedance-2-5-flash-261115` | 480p / 720p | 30s | 是 |
| `dreamina-seedance-2-5-260628` | 480p / 720p / 1080p / 4k | 30s | 是 |
| `dreamina-seedance-2-0-260128` | 480p / 720p / 1080p / 4k | 15s | 是 |
| `dreamina-seedance-2-0-fast-260128` | 480p / 720p | 15s | 是 |
| `dreamina-seedance-2-0-mini-260615` | 480p / 720p | 15s | 是 |

定价按上游计费 token（美元 / 百万 token），可视化编辑器会按分辨率 × 是否有参考视频拆行。刊例以 [BytePlus ModelArk Pricing](https://docs.byteplus.com/en/docs/modelark/model-pricing) 为准。不包含 Seedance 1.0。

### 图片模型（Seedream / Dola 5.0 / 5.5）

| 模型 | 说明 |
| --- | --- |
| `dola-seedream-5-5-261028` | 交互编辑 + 图层拆分 |
| `dola-seedream-5-0-pro-260628` | 交互编辑 + 图层拆分 |
| `dola-seedream-5-0-flash-260915` | 交互编辑 + 图层拆分 |
| `seedream-5-0-260128` | 单图 / 组图，可联网搜索 |
| `seedream-5-0-lite-260128` | 同上 lite |

不包含 Seedream 4.x。

### 聊天模型（Seed，不在本插件）

Seed 走 Chat / Responses，不是视频图片任务插件。海外用火山方舟渠道（类型 45），Base URL 填 `https://ark.ap-southeast.bytepluses.com`：

| 模型 |
| --- |
| `dola-seed-2-1-turbo-260628` |
| `seed-2-0-pro-260328` |
| `seed-2-0-lite-260428` |
| `seed-2-0-mini-260428` |
| `seed-2-0-code-preview-260328` |

插件不内置价格。价格保存在网关模型定价里。变更记录见 `plugins/tasks/byteplus/1.0.0/CHANGELOG.md`。

## 自检

```bash
node --test tests/tripo-text-to-model.test.mjs
node --test tests/byteplus-models.test.mjs
```
