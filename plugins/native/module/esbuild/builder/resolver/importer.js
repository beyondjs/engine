module.exports = class {
    #namespace;
    get namespace() {
        return this.#namespace;
    }

    #vspecifier;
    get vspecifier() {
        return this.#vspecifier;
    }

    #path;
    get path() {
        return this.#path;
    }

    /**
     * The args received from the esbuild plugin in the onResolve function
     * @param args
     */
    constructor(args) {
        const {namespace} = args;
        this.#namespace = namespace;
        this.#vspecifier = namespace?.slice('beyond:'.length);
        this.#path = args.importer;
    }
}
