const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc, equal, crc32} = global.utils;

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application';
    }

    #id;
    get id() {
        return this.#id;
    }

    get path() {
        return this.children.get('config').child.path;
    }

    get is() {
        return 'application';
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

    get specifier() {
        return this.#values.package;
    }

    get vspecifier() {
        return `${this.#values.package}@${this.#values.version}`;
    }

    get version() {
        return this.#values.version;
    }

    get title() {
        return this.#values.title;
    }

    get description() {
        return this.#values.description;
    }

    get author() {
        return this.#values.author;
    }

    get license() {
        return this.#values.license;
    }

    get languages() {
        return this.#values.languages;
    }

    get params() {
        return this.#values.params;
    }

    get routing() {
        return this.#values.routing;
    }

    get layout() {
        return this.#values.layout;
    }

    get connect() {
        return this.#values.connect;
    }

    get cordova() {
        return this.#values.cordova;
    }

    get hosts() {
        return this.#values.hosts;
    }

    get engine() {
        return this.#values.engine;
    }

    _notify = () => {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'applications',
            id: this.#id
        });
    }

    constructor(config) {
        super();
        super.setup(new Map([['config', {child: config}]]));

        this.#id = crc32(this.path);
    }

    _process(config) {
        const {scope, name, version, title, description, author, license, layout, hosts, params} = config;
        const connect = typeof config.backend === 'object';
        const engine = config.engine ? config.engine : 'v1';

        let {languages} = config;
        languages = typeof languages === 'string' ? [languages] : languages;
        languages = languages instanceof Array ? {supported: languages} : languages;
        languages = typeof languages === 'object' ? languages : {};
        languages.supported = languages.supported instanceof Array ? languages.supported : [];
        languages.default = languages.default && typeof languages.default === 'string' ? languages.default : 'en';

        let {routing} = config;
        routing = typeof routing === 'object' ? {mode: routing.mode, ssr: routing.ssr} : {};
        routing.mode = routing.mode !== 'hash' ? 'pathname' : 'hash';
        routing.ssr = routing.ssr !== void 0 ? !!routing.ssr : false;

        const values = {
            scope, name, author, license,
            package: (config.scope ? `@${config.scope}/` : '') + config.name,
            version, title, description, languages, routing, layout, hosts, connect, engine, params,
            cordova: config.cordova
        };

        if (equal(values, this.#values)) return false;
        this.#values = values;
    }
}
