module.exports = class {
    #error;
    get error() {
        return this.#error;
    }

    #id;
    get id() {
        return this.#id;
    }

    #name;
    get name() {
        return this.#name;
    }

    #pkg;

    get package() {
        return this.#pkg;
    }

    #resource;
    get resource() {
        return this.#resource;
    }

    constructor(application, url) {
        let [module, resource] = url.pathname.split('/static/');
        this.#resource = resource;
        if (!resource) {
            this.#error = new global.Resource({'404': `Invalid url`});
            return;
        }

        const split = module.substr(1).split('/');
        if (!split.length) {
            this.#error = new global.Resource({'404': `Invalid url`});
            return;
        }

        // If the pathname do not starts with '/packages', then it is a module contained in the application package
        if (split[0] !== 'packages') {
            this.#name = split.join('/');
            this.#id = `${application.package}/${this.#name}`;
            this.#pkg = application.package;
            return;
        }

        split.shift(); // // Remove the 'packages' entry
        this.#id = split.join('/');

        if (!split.length) {
            this.#error = new global.Resource({'404': `Invalid url`});
            return;
        }

        const pkg = this.#pkg = {};
        if (split[0].startsWith('@')) {
            if (split.length < 2) {
                this.#error = new global.Resource({'404': `Invalid url`});
                return;
            }

            pkg.scope = split.shift();
            pkg.name = split.shift();
        }
        else {
            pkg.name = split.shift();
        }

        pkg.id = (pkg.scope ? `${pkg.scope}/` : '') + pkg.name;
        this.#name = this.#id.substr(pkg.id.length + 1);
    }
}
