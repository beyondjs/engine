const Module = require('module');

module.exports = class {
    #bundle;
    #brequire;
    #module;

    #compiled;
    get compiled() {
        return !!this.#compiled;
    }

    #exc;
    get exc() {
        return this.#exc;
    }

    get exports() {
        return this.#exc ? void 0 : this.#module.exports;
    }

    constructor(bundle, brequire) {
        this.#bundle = bundle;
        this.#brequire = brequire;
    }

    compile() {
        if (this.#module) throw new Error('Bundle already compiled');

        const file = (() => {
            const {is, uri} = this.#bundle;

            const done = uri => require('path').join(process.cwd(), `${uri}.js`);

            // Check if resource is a transversal,
            // in which case, the pathname is just the name of the traversal
            if (is === 'transversal') return done(uri);

            // Check if it is a project package,
            // where the pathname does not include the /packages folder
            const pkg = this.#bundle.package;
            const path = uri.startsWith(`${pkg}/`) ? uri.substr(pkg.length) : `node_modules/${uri}`;
            return done(path);
        })();

        const module = this.#module = new Module(this.#bundle.uri);
        module.require = this.#brequire.require;
        try {
            module._compile(this.#bundle.code, file);
        }
        catch (exc) {
            this.#exc = exc;
            require('../log')(this.#bundle.project, {
                type: 'compiler.error',
                bundle: this.#bundle.uri,
                exc: exc instanceof Error ? exc.stack : void 0
            });
        }
        finally {
            this.#compiled = true;
        }
    }
}
