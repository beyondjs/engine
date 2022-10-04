module.exports = class {
    #resource;
    get resource() {
        return this.#resource;
    }

    constructor(resource) {
        this.#resource = resource;
    }

    /**
     * The bundle is treated with its full id information (package name included), as the application
     * has a list of bundles in this way
     *
     * Ex: package_name/module_name/sass/bundle/file
     * The module name must not contain the string '/sass'
     */
    #bundle;
    get bundle() {
        if (this.#bundle !== void 0) return this.#bundle;

        const resource = this.#resource;
        if (!resource.includes('/sass/')) return {};

        const i = resource.indexOf('/sass/');
        const module = resource.slice(0, i);
        const split = resource.slice(i + 6 /* '/sass/'.length */).split('/');
        const bundle = split.shift();
        const dependency = `${module}/${bundle}`;

        const file = split.join('/');
        return this.#bundle = {dependency, file};
    }

    /**
     * Parse the resource as it would be an external resource (ex: bootstrap)
     */
    #external;
    get external() {
        if (this.#external !== void 0) return this.#external;

        const split = this.#resource.split('/');
        if (split[0].startsWith('@') && split.length < 2) return {};
        const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

        const file = !split.length ? void 0 : `${split.join('/')}.scss`;
        return this.#external = {pkg, file};
    }
}
