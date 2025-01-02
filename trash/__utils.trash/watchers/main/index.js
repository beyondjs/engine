const { fork } = require('child_process');

const process = fork('fork.js', [], { cwd: __dirname });

const ipc = require('@beyond-js/ipc/main');
ipc.register('watchers', process);
