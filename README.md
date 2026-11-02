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

图像生成、模型后处理、网格和动画接口也按文档路径挂在 `/tripo/v3/` 下面。H 系列和 P 系列共用这些路径，用请求体里的 `model` 选择版本。渠道里要启用的模型名是 `tripo`。

后续任务的 `input` 或 `task_id` 填网关返回的任务 ID。图片和模型文件也可以直接传 `https://` 地址，或 `file_` 开头的上传凭证。

这个版本没有转发 `POST /v3/files` 上传接口。
