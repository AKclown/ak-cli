const fs = require('fs');
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function spinnerStart(msg, spinnerString = '|/-\\') {
  const Spinner = require('cli-spinner').Spinner;
  const spinner = new Spinner(msg + '%s');
  spinner.setSpinnerString(spinnerString);
  spinner.start();
  return spinner;
}

function sleep(timeout = 1000) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

function exec(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return require('child_process').spawn(cmd, cmdArgs, options || {});
}

function execAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    const p = exec(command, args, options);
    p.on('error', e => {
      reject(e);
    });

    p.on('exit', c => {
      resolve(c);
    });
  });
}

// 文件内容读取
function readFile(path, option = {}) {
  if (fs.existsSync(path)) {
    const buffer = fs.readFileSync(path);
    if (buffer) {
      if (option.toJson) {
        return buffer.toJSON();
      } else {
        return buffer.toString();
      }
    }
    return null;
  }
  return null;
}

// 写入文件内容
function writeFile(path, data, { rewrite = true } = {}) {
  if (fs.existsSync(path)) {
    if (rewrite) {
      fs.writeFileSync(path, data);
      return true;
    }
    return false;
  } else {
    fs.writeFileSync(path, data);
    return true;
  }
}

module.exports = {
  isObject,
  spinnerStart,
  sleep,
  exec,
  execAsync,
  readFile,
  writeFile,
};
