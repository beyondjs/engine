module.exports = class {
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

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    #language;
    get language() {
        return this.#language;
    }

    constructor(specifier) {
        const split = specifier.split('/');

        const scope = split[0].startsWith('@') ? split.shift() : void 0;
        if (!split.length) return;

        const [name, version] = split.shift().split('@');

        this.#pkg = scope ? `${scope}/${name}` : name;
        this.#version = version;
        this.#subpath = split.length ? split.join('/') : '.';
    }
}
