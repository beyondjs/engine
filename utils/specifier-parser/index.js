module.exports = class {
    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    #version;
    get version() {
        return this.#version;
    }

    #subpath;
    get subpath() {
        return this.#subpath;
    }

    #language;
    get language() {
        return this.#language;
    }

    #valid;
    get valid() {
        return this.#valid;
    }

    constructor(specifier) {
        this.#specifier = specifier;
        if (!specifier.length) throw new Error('Specifier parameter is not defined');

        const split = specifier.split('/');
        const scope = split[0].startsWith('@') ? split.shift() : void 0;
        if (!split.length) {
            // The specifier cannot be only the scope, it is an incomplete package name
            this.#valid = false;
            return;
        }

        const [name, version] = split.shift().split('@');

        this.#pkg = scope ? `${scope}/${name}` : name;
        this.#version = version;
        this.#subpath = split.length ? `./${split.join('/')}` : '.';
    }
}