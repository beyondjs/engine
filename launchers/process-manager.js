const ipc = require('beyond/utils/ipc');
const {fork} = require('child_process');
const readline = require('readline');
const PendingPromise = require('beyond/utils/pending-promise');

/**
 * Launcher process manager
 */
module.exports = class {
    #key;
    get key() {
        return this.#key;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    #id;
    get id() {
        return this.#id;
    }

    #error;
    get error() {
        return this.#error;
    }

    #process;
    get process() {
        return this.#process;
    }

    get pid() {
        return this.#process?.pid;
    }

    #status = 'stopped';
    get status() {
        return this.#status;
    }

    update(key, specs) {
        if (this.#key === key) return;
        this.#key = key;

        this.#specs = specs;
        this.#process && ipc.unregister(this.#id, this.#process);
        this.#process?.exit();
        this.#process = void 0;

        this.#id = `${specs.project.id}/${specs.distribution.name}`;
        this.#error = void 0;
    }

    #change() {
        ipc.events.emit('data-notification', {
            type: 'record/field/update',
            table: 'distributions-launcher',
            field: 'status',
            value: this.#status,
            id: this.#specs.id,
            time: Date.now()
        });
    }

    #onmessage = (message) => {
        if (typeof message !== 'object') return;

        switch (message.type) {
            case 'ready':
                this.#status = 'running';
                this.#promises.ready?.resolve();
                this.#promises.ready = void 0;
                this.#change();
                break;
        }
    }

    #promises = {ready: void 0, stopped: void 0, restarted: void 0};

    #onexit = () => {
        this.#status = 'stopped';
        this.#process && ipc.unregister(this.#id, this.#process);
        this.#process = void 0;

        this.#promises.stopped?.resolve();
        this.#promises.stopped = void 0;
        this.#change();
    }

    get ready() {
        return this.#promises.ready;
    }

    get stopped() {
        return this.#promises.stopped;
    }

    get restarted() {
        return this.#promises.restarted;
    }

    #stdout(line) {
        void (this);
        console.log(line);
    }

    #stderr(line) {
        void (this);
        console.error(line);
    }

    start() {
        if (this.#error) {
            const error = {code: 1, message: `BEE configuration is invalid`};
            return {error};
        }
        if (this.#status !== 'stopped') {
            const error = {code: 2, message: `Process is not stopped. Process status is actually "${this.#status}"`};
            return {error};
        }

        this.#status = 'initialising';
        this.#promises.ready = new PendingPromise();
        this.#change();

        // The folder where the bee code resides, actually only node environment is supported
        const dir = require('path').join(__dirname, `./node`);

        // The project working directory
        const cwd = this.#specs.project.path;

        const execArgv = ['--enable-source-maps', '--trace-warnings', '--trace-uncaught'];
        const {ports} = this.#specs;
        ports.inspect && execArgv.push(`--inspect=${ports.inspect}`);
        const options = {cwd, execArgv, encoding: 'string', stdio: 'pipe'};

        const args = [JSON.stringify(this.#specs)];

        /**
         * Fork the bee process
         * @type {ChildProcess}
         */
        this.#process = fork(dir, args, options);
        this.#process.on('message', this.#onmessage);
        this.#process.on('exit', this.#onexit);
        ipc.register(this.#id, this.#process);

        const {stdout, stderr} = this.#process;
        const terminal = false;
        readline.createInterface({input: stdout, terminal}).on('line', this.#stdout);
        readline.createInterface({input: stderr, terminal}).on('line', this.#stderr);
        return {};
    }

    stop() {
        if (!['running', 'initialising'].includes(this.#status)) {
            const error = {
                code: 1, message: `Process has not been stopped. Process status is actually "${this.#status}"`
            };
            return {error};
        }

        this.#status = 'stopping';
        this.#change();

        this.#promises.stopping = new PendingPromise()
        this.#process.kill();
        return {};
    }

    restart() {
        this.#promises.restarted = new PendingPromise();

        const start = () => {
            this.start();
            this.#promises.restarted.resolve();
            this.#promises.restarted = void 0;
        }

        ['running', 'initialising'].includes(this.#status) && this.stop();
        this.#status !== 'stopping' ? start() : this.stopped.then(start);

        return {};
    }

    destroy() {
        this.stop();
    }
}