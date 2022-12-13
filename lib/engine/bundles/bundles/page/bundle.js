module.exports = class extends global.Bundle {
    #route;
    get route() {
        return this.#route;
    }

    // "is" is reserved by the global.Bundle class
    #pageIs;
    get pageIs() {
        return this.#pageIs;
    }

    #vdir;
    get vdir() {
        return this.#vdir;
    }

    #layout;
    get layout() {
        return this.#layout;
    }

    processConfig(config) {
        if (!["object", "string"].includes(typeof config)) {
            return { errors: ["Invalid configuration"] };
        }
        const value = Object.assign({}, config);

        this.#route = value.route;
        this.#pageIs = value.pageIs;
        this.#vdir = value.vdir;
        this.#layout = value.layout;

        if (value.is && !["error", "loading"].includes(value.is)) {
            return { errors: ['"is" configuration is invalid'] };
        }

        delete value.route;
        delete value.is;
        delete value.vdir;
        delete value.layout;

        return { value };
    }
};
