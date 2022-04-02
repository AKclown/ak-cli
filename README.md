# ak-cli
ak-cli工具

### init命令
```
ak-cli init --targetPath /Users/ak/Desktop/project/ak-cli/commands/init --force --debug test-project
```

### 提交规范
1. commitizen
2. cz-conventional-changelog (Commitizen适配器)
6. conventional-changelog-cli (自动生成CHANGELOG 文件)

- 一般通过git cz提交符合规范的commit信息，但是有些开发者不是通过命令行的方式来提交commit的。如果我们需要强制校验vscode/webstorm 等其他工具的方式提交 commit，可以使用commitlint+husky的方式来配合使用。

3. @commitlint/cli (校验提交说明是否符合规范)
4. @commitlint/config-conventional  (安装符合Angular风格的校验规则)
5. husky (git钩子工具)

[commit参考文献](https://godbasin.github.io/2019/11/10/change-log/)