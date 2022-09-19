const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.module.static.overwrites';
    }

    #application;
    #path;
    get path() {
        return this.#path;
    }

    #config;
    get config() {
        return this.#config;
    }

    get #overwrites() {
        return this.children.get('overwrites')?.child;
    }

    constructor(application, module) {
        super();

        this.#application = application;

        // As the id of the module can change, it is required to listen to its changes
        // The id of the module is also undefined until the module is processed,
        // since it, in turn, requires that its container is also processed
        // (in the case that the container is a library, it is necessary to know its name)
        super.setup(new Map([['module', {child: module}]]));
    }

    _prepared() {
        const application = this.#application;
        const module = this.children.get('module').child;
        const overwrites = application.template.overwrites.get(`${module.pathname}/static`);
        if (overwrites === this.#overwrites) return;

        this.#overwrites && this.children.unregister(['overwrites']);
        this.children.register(new Map([['overwrites', {child: overwrites}]]));
    }

    _process() {
        const {path, config} = this.#overwrites;
        this.#path = path;
        this.#config = config;
    }
}
