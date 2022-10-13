const {fork} = require('child_process');
const ipc = require('beyond/utils/ipc');

module.exports = class {
    #process;
    get process() {
        return this.#process;
    }

    constructor(specs) {
        const {cwd, repository} = specs;

        this.#process = fork(
            require('path').join(__dirname, 'fork.js'),
            [JSON.stringify({repository})],
            {cwd: cwd ? cwd : process.cwd()});

        ipc.register('engine', this.#process);
    }
}
