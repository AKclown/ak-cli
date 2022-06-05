# ak-cli

ak-cli 工具

### init 命令

```
ak-cli init --targetPath /Users/ak/Desktop/project/ak-cli/commands/init --force --debug test-project
```

### publish 命令

```
ak-cli publish  --targetPath E:/project/project/ak-cli/commands/publish
```

### 提交规范

1. commitizen
2. cz-conventional-changelog (Commitizen 适配器)
3. conventional-changelog-cli (自动生成 CHANGELOG 文件)

- 一般通过 git cz 提交符合规范的 commit 信息，但是有些开发者不是通过命令行的方式来提交 commit 的。如果我们需要强制校验 vscode/webstorm 等其他工具的方式提交 commit，可以使用 commitlint+husky 的方式来配合使用。

3. @commitlint/cli (校验提交说明是否符合规范)
4. @commitlint/config-conventional (安装符合 Angular 风格的校验规则)
5. husky/lint-staged(git 钩子工具)

[git 命令](https://cloud.tencent.com/developer/section/1138701)

[commit 参考文献](https://godbasin.github.io/2019/11/10/change-log/)

### 演示

![演示图](./doc/illustrate.png)

### 脚手架整体架构设计

![架构设计](./doc/diagram//overall-architecture-design.png)

### 初始化模板下载的架构设计图

![init模板下载架构图](./doc/diagram/init-model-design.png)

### 发布的整体架构图

![脚手架发布整体架构设计](./doc/diagram/publish-architecture-design.png)

### 注意

1. 使用 npm 无法在 script 命令后面加一些参数， 但是 yarn 可以，所以 husky 中的命令使用 yarn 运行

### TODO

1. 后续使用 yarn dlx only-allow yarn 强制 yarn 包管理
