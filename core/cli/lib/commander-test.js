#! /usr/bin/env node

const commander = require('commander');
const pkg = require('../package.json');

// $ 获取commander的单例
// const { program } = commander;
// $ 手动实例化一个Command示例
const program = new commander.Command();

program
  .name(Object.keys(pkg.bin)[1])
  .usage('<command> [options]')
  .option('-d, --debug', '是否开启调式模式', false)
  .option('-e, --envName <envName>', '获取环境变量名称')
  .version(pkg.version);

const clone = program.command('clone <source> [destination]');
clone.description('clone a repository').action((source, destination) => {
  console.log('do clone', source, destination);
});

const service = new commander.Command('service');
service
  .command('start [port]')
  .description('start service at some port')
  .action(port => {
    console.log('do service start', port);
  });

program.addCommand(service);

// program
//     .arguments('<cmd> [options]')
//     .description('test commander', {
//         cmd: 'command to run',
//         options: 'options for command'
//     })
//     .action((cmd, options) => {
//         console.log('cmd, options: ', cmd, options);
//     })

// 实现脚手架串行，A脚手架执行B脚手架
program
  .command('install [name]', 'install package', {
    // executableFile: 'imooc-cli',
    // isDefault:true,
    // hidden:true
  })
  .alias('i');

// $ 高级定制1 自定help信息
// program.outputHelp();
// console.log(program.helpInformation());
program.helpInformation = function () {
  return 'your help information';
};
// program.on('--help', function () {
//     // console.log('your help information');
// })

// $ 高级定制2 实现debug模式
program.on('option:debug', function () {
  const options = program.opts();
  if (options.debug) {
    process.env.LOG_LEVEL = 'verbose';
  }
  console.log(process.env.LOG_LEVEL);
});

// $ 高级定制3 对于未知命令监听
program.on('command:*', function (obj) {
  console.error(`未知命令${obj[0]}`);
  const availableCommands = program.commands.map(cmd => cmd.name());
  console.log(availableCommands);
  console.log(`可用命令: ${availableCommands.join(',')}`);
});

// $ 此语句必选在最后
program.parse(process.argv);
