const {fork} = require('child_process');

const process = fork(
    'fork.js',
    [],
    {'cwd': __dirname});

const {ipc} = global.utils;
ipc.register('watchers', process);
