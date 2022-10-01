const {fork} = require('child_process');
const ipc = require('beyond/utils/ipc');

module.exports = class {
    #process;

    constructor(name) {
        this.#process = fork('fork.js', [], {'cwd': __dirname});
        ipc.register(name, this.#process);
    }
}
