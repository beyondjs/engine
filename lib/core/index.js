const {fork} = require('child_process');
const ipc = require('beyond/utils/ipc');

module.exports = class {
    #process;
    get process() {
        return this.#process;
    }

    constructor(dirname, specs) {
        const {inspect, registry} = specs;

        this.#process = fork(
            require('path').join(__dirname, 'fork.js'),
            [JSON.stringify({dirname, inspect, registry})],
            {cwd: process.cwd()});

        ipc.register('engine', this.#process);
    }
}
