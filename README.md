# trident-api-plugin

Tripo 任务插件，给 new-api 的任务插件市场使用。对接的是 [Tripo OpenAPI v3](https://developers.tripo3d.com/zh/docs/introduction)。

上游 Base URL 是 `https://openapi.tripo3d.com/v3`。

## 目录

- `plugins/tasks/tripo/1.0.0/plugin.js`：插件源码
- `index.json`：市场索引。管理后台的浏览器会按这个文件去拉 `plugin.js`

## 网关上的接口

安装并绑定渠道后，客户端调用网关，而不是直接调用 Tripo。路径比上游多一个 `/tripo` 前缀：

- `POST /tripo/v3/generation/text-to-model`
- `POST /tripo/v3/generation/image-to-model`
- `POST /tripo/v3/generation/multiview-to-model`
- `POST /tripo/v3/generation/image-to-splat`
- `GET /tripo/v3/tasks/:task_id`

文生 3D 的渠道模型使用官方名称：`v3.1-20260211`、`v3.0-20250812`、`v2.5-20250123`、`P1-20260311`、`P2-20260801`。请求体的 `model` 选择同名模型，不传时使用 `v3.1-20260211`。在模型定价中为每个模型分别配置无贴图、标准贴图及适用的附加项单价；高清与 8K 是标准贴图基础上的附加费，二者不会同时计费。插件不内置价格，也不会覆盖已保存的价格。

图像生成、图片/多视图转 3D、模型后处理、网格和动画接口仍使用渠道模型 `tripo`，路径按文档挂在 `/tripo/v3/` 下面。

后续任务的 `input` 或 `task_id` 填网关返回的任务 ID。图片和模型文件也可以直接传 `https://` 地址，或 `file_` 开头的上传凭证。

这个版本没有转发 `POST /v3/files` 上传接口。
