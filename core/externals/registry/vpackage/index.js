module.exports = class {
    #json;
    get json() {
        return this.#json;
    }

    get scope() {
        return this.#json.scope;
    }

    get name() {
        return this.#json.name;
    }

    get version() {
        return this.#json.version;
    }

    get description() {
        return this.#json.description;
    }

    get dependencies() {
        return this.#json.dependencies;
    }

    get devDependencies() {
        return this.#json.devDependencies;
    }

    get peerDependencies() {
        return this.#json.peerDependencies;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    #routes;
    get routes() {
        return this.#routes;
    }

    #browser;
    get browser() {
        return this.#browser;
    }

    constructor(json) {
        this.#json = json;
        this.#exports = new (require('./exports'))(json);
        this.#routes = new (require('./routes'))(this);

        this.#browser = (() => {
            let {browser} = json;
            browser = typeof browser === 'string' ? {'./': browser} : browser;
            browser = typeof browser === 'object' ? browser : {};
            return new Map(Object.entries(browser));
        })();
    }
}
