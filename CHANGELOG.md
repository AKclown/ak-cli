# [1.0.0](https://github.com/AKclown/ak-cli/compare/v1.0.2...v1.0.0) (2022-06-07)

### Bug Fixes

- 修复 git package 的 bugs ([9ed58c7](https://github.com/AKclown/ak-cli/commit/9ed58c736cff75e7ea576ca2d625b1758e5ffa3a))
- 修复 publish Git 包引用问题，以及修改生成 token 的参考文献 ([ee4c3c9](https://github.com/AKclown/ak-cli/commit/ee4c3c987d7374256d7787bd405f982d43c5d306))
- 修复 publish 命令下的 Git、以及新增 cloudBuild package ([07dc3c9](https://github.com/AKclown/ak-cli/commit/07dc3c9f3238a62831325c8807ede2b6b4d909a7))

### Features

- .ignore 文件的检查和创建 ([2cd1ee3](https://github.com/AKclown/ak-cli/commit/2cd1ee3bcb966399a8a5aab4f21ad6513dcb2824))
- 创建 GitServe 基类 ([3a2fbfe](https://github.com/AKclown/ak-cli/commit/3a2fbfe95a063719c6229a6a4e8de4287ccbafe2))
- 发布模块架构图、完善 git 提交规范 ([8ff4043](https://github.com/AKclown/ak-cli/commit/8ff40432f3334d2f47fd7d7997df99a8abbffd80))
- 封装 GiteeRequest 类、定义 gitee 获取用户和组织方法 ([5592acb](https://github.com/AKclown/ak-cli/commit/5592acb8f44c42524be048c316c2b867002b4e09))
- 更新初始化 io 的参数 ([346581c](https://github.com/AKclown/ak-cli/commit/346581c515992081f262014ff639b097588b716a))
- 获取线上 release 版本号列表，拿到最新版本 ([d99485f](https://github.com/AKclown/ak-cli/commit/d99485f2ae7641f7f78da74be6cc6995ce8f4863))
- 检查 stash 区域 ([c035a9e](https://github.com/AKclown/ak-cli/commit/c035a9e640cf22655239d11412556ea991c96f73))
- 接入 github api ([339b051](https://github.com/AKclown/ak-cli/commit/339b0510846663376e9a9f0f878dd912544481c6))
- 生成远程仓库 token ([fb96297](https://github.com/AKclown/ak-cli/commit/fb9629725ff7b5fab57a82913fb7deb89b717103))
- 添加 FAILED_CODE 错误码数据 ([c730ed2](https://github.com/AKclown/ak-cli/commit/c730ed27caf4b9f275402a695f44bdd463520ebc))
- 添加 publish 模块 ([1a9dcf9](https://github.com/AKclown/ak-cli/commit/1a9dcf9f4f492e01b6c67e17d82aab61e0521b50))
- 项目初始化 git 和 add remote 关联远程仓库 ([8b68fd8](https://github.com/AKclown/ak-cli/commit/8b68fd8a036c182cc51d919ea1e5ea2a165ea6ce))
- 项目发布前的检查流程 ([a890ece](https://github.com/AKclown/ak-cli/commit/a890ece362f53fe9d3a01c383de93168e6f01d1d))
- 新增 Git package\检查缓存主目录 ([59b72a3](https://github.com/AKclown/ak-cli/commit/59b72a312f0ee7accaa0e7a8831fa2ca9a08ddac))
- 选择远程 Git 仓库逻辑 ([32656d8](https://github.com/AKclown/ak-cli/commit/32656d890ab16da68cc737f9a7bb956b17ae240e))
- 远程仓库类型选择 ([b7215b8](https://github.com/AKclown/ak-cli/commit/b7215b81ffd41a1cfd106f704f6a889a0c509f53))
- 云构建 build 逻辑、完善构建日志输出 ([d353587](https://github.com/AKclown/ak-cli/commit/d353587506ec78d7dc375708808d6ab324810154))
- 自动切换分支、合并远程分支代码、推送代码 ([df5e665](https://github.com/AKclown/ak-cli/commit/df5e665ec1bf915caaa4001decb673878362f0e5))
- 自动升级分支版本号，完成 git flow version 的逻辑步骤 ([47078ef](https://github.com/AKclown/ak-cli/commit/47078ef033e09a580303b3f000662e7a407b74f9))
- **cloudbuild:** 链接 websocket 服务 ([1792a18](https://github.com/AKclown/ak-cli/commit/1792a18215e3be49a035c4e11c106ac7cd9e8f18))
- git flow version 分支 drawio 图绘制 ([85fc57d](https://github.com/AKclown/ak-cli/commit/85fc57dc71ccf72b7b00ae504cae9efe570b6cc9))
- git 自动化提交功能 ([7340c71](https://github.com/AKclown/ak-cli/commit/7340c716b69d2852f28617861c46c4ba2dbc1acd))
- gitee 获取远程仓库以及创建远程仓库 ([c52e7cf](https://github.com/AKclown/ak-cli/commit/c52e7cfdbd657e2fa659ffc6ac8140f1e3548443))
- github 获取远程仓库信息和创建远程仓库(个人/组织) ([1dd3f98](https://github.com/AKclown/ak-cli/commit/1dd3f98ddaa4bc4a5de54bffa683a1a4f24f5b43))
- **package.json:** 新增 commit 提交规范 ([e6c0227](https://github.com/AKclown/ak-cli/commit/e6c0227ec67b1e5f80b0da28707e3f340e3d9c7f))
- readme 追加 init 模板下载架构图 ([3a9d898](https://github.com/AKclown/ak-cli/commit/3a9d898ae8bd494da42b0a9894402a5a0db7f7d8))

## [1.0.2](https://github.com/AKclown/ak-cli/compare/v1.0.1...v1.0.2) (2022-01-13)

## 1.0.1 (2022-01-13)
