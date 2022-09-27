const DynamicProcessor = global.utils.DynamicProcessor();
const {equal, ipc, crc32} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'library';
    }

    get is() {
        return 'library';
    }

    #id;
    get id() {
        return this.#id;
    }

    get path() {
        return this.children.get('config').child.path;
    }

    #values = {};

    get scope() {
        return this.#values.scope;
    }

    get name() {
        return this.#values.name;
    }

    get package() {
        return this.#values.package;
    }

    get version() {
        return this.#values.version;
    }

    get specifier() {
        return this.#values.package;
    }

    get vspecifier() {
        return `${this.#values.package}@${this.#values.version}`;
    }

    get pathname() {
        return this.#values.pathname;
    }

    get description() {
        return this.#values.description;
    }

    get connect() {
        return this.#values.connect;
    }

    get hosts() {
        return this.#values.hosts;
    }

    get legacyBackend() {
        return this.#values.legacyBackend;
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'libraries',
            id: this.#id
        });
    }

    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));

        this.#id = crc32(this.path);
    }

    _process(config) {
        const pkg = (config.scope ? `@${config.scope}/` : '') + config.name;
        const values = {
            scope: config.scope,
            name: config.name,
            package: pkg,
            pathname: `packages/${pkg}`,
            description: config.description,
            version: config.version,
            connect: config.connect,
            hosts: config.hosts,
            legacyBackend: config.legacyBackend
        }

        if (equal(values, this.#values)) return false;
        this.#values = values;
    }
}
