const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.module';
    }

    #application;
    #module;

    constructor(application, module) {
        super();
        this.#application = application;
        this.#module = module;

        const children = new Map();
        children.set('module', {child: module});
        super.setup(children);
    }

    get is() {
        return 'module';
    }

    get name() {
        return this.#module.name;
    }

    get subpath() {
        return this.#module.subpath;
    }

    get specifier() {
        return this.#module.specifier;
    }

    get vspecifier() {
        return this.#module.vspecifier;
    }

    resource(distribution) {
        return this.#module.resource(distribution);
    }

    pathname(distribution) {
        return this.#module.pathname(distribution);
    }

    get title() {
        return this.#module.title;
    }

    get description() {
        return this.#module.description;
    }

    get hmr() {
        return this.#module.hmr;
    }

    get layoutId() {
        return this.#module.layoutId;
    }

    get route() {
        return this.#module.route;
    }

    get vdir() {
        return this.#module.vdir;
    }

    get engines() {
        return this.#module.engines;
    }

    get platforms() {
        return this.#module.platforms;
    }

    get tu() {
        return this.#module.tu;
    }
}
