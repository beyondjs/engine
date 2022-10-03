module.exports = class extends require('./attributes') {
    #pkg;

    get package() {
        return this.#pkg;
    }

    #module;
    get module() {
        return this.#module;
    }

    get is() {
        return 'package.module';
    }

    get container() {
        return this.#module.container;
    }

    get version() {
        return this.#module.version;
    }

    get watcher() {
        return this.#module.watcher;
    }

    get path() {
        return this.#module.path;
    }

    #rpath;
    get rpath() {
        return this.#rpath;
    }

    #id;
    get id() {
        return this.#id;
    }

    get errors() {
        return this.module.errors;
    }

    get warnings() {
        return this.module.warnings;
    }

    get backend() {
        return this.module.backend;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #_static;
    get static() {
        return this.#_static;
    }

    constructor(pkg, module) {
        super(pkg, module);
        this.#pkg = pkg;
        this.#module = module;

        this.#id = (() => {
            const {container} = module;
            if (container.is === 'library') return `package//${pkg.id}//${module.id}`;
            return container.id === pkg.id ? module.id : `package//${pkg.id}//${module.id}`;
        })();

        this.#rpath = module.rpath.replace(/\\/g, '/');
        this.#bundles = new global.Bundles(this);
        this.#_static = new (require('./static'))(pkg, module);
    }

    destroy() {
        this.#bundles.destroy();
        this.#_static.destroy();
    }
}
