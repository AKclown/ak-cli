const { spawn } = require('child_process');
const { cp } = require('fs');
const path = require('path');

cp.exec(path.resolve(__dirname, 'test.shell'), {
  cwd: path.resolve('..')
}, function (err, stout, stderr) {
  console.log(err);
  console.log(stout);
  console.log(stderr);
})

