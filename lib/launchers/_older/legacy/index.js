module.exports = class extends require('./attributes') {
    #builder = new (require('./builder'))(this);
    get builder() {
        return this.#builder;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    #process;
    get process() {
        return this.#process;
    }

    _process() {
        const changed = super._process();
        if (changed === false) return false;

        this.#process?.destroy();

        if (!this.configured) return;

        const specs = {
            id: this.container.id,
            is: this.container.is,
            dashboard: this.container.dashboard,
            path: this.container.path,
            package: this.container.package,
            port: this.port,
            core: this.core,
            sessions: this.sessions,
            modules: this.modules
        };
        this.#specs = specs;
        this.#process = new (require('./process'))(specs);
    }

    async start() {
        return await this.#process?.start();
    }

    async stop() {
        return await this.#process?.stop();
    }

    destroy() {
        this.stop().catch(exc => console.log(exc.stack));
        super.destroy();
    }
}
