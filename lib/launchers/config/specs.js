const DynamicProcessor = global.utils.DynamicProcessor();
const {crc32, ipc, equal} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'bees.instances.config.item';
    }

    #key;
    get key() {
        return this.#key;
    }

    #id;
    get id() {
        return this.#id;
    }

    #config;
    #value;
    get value() {
        return this.#value;
    }

    async _begin() {
        const {engine, path, pkg, distribution, legacy} = this.#config;
        const project = {path, pkg, id: crc32(this.#config.path)}
        const id = this.#id = `${project.id}/${distribution.name}`;

        let ports = typeof this.#config.ports === 'object' ? this.#config.ports : {};
        ports = {bundles: ports.bundles, http: ports.http, inspect: ports.inspect};

        const {platform} = this.#config.distribution;
        if (['backend', 'ssr', 'legacy'].includes(platform)) {
            ports.http = ports.http || await ipc.exec('main', 'ports.reserve', `bee:${id}`);
        }

        this.#value = Object.assign({id, engine, project, distribution, legacy, ports});
    }

    constructor(config) {
        super();
        this.#config = config;
        this.#key = crc32(equal.generate(config));
    }
}
