const {ipc, equal} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.deployment.distribution';
    }

    #application;

    get id() {
        return `${this.#application.id}//${this.#key}`;
    }

    #name;
    get name() {
        return this.#name;
    }

    #key;
    get key() {
        return this.#key;
    }

    #local;
    get local() {
        return this.#local;
    }

    #development;
    get development() {
        return this.#development;
    }

    #ssr;
    get ssr() {
        return this.#ssr;
    }

    #backend;
    get backend() {
        return this.#backend;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #imports;
    get imports() {
        return this.#imports;
    }

    #baseDir;
    get baseDir() {
        return this.#baseDir;
    }

    #host;
    get host() {
        return this.#host;
    }

    #environment;
    get environment() {
        return this.#environment;
    }

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #ts;
    get ts() {
        return this.#ts;
    }

    #minify;
    get minify() {
        return this.#minify;
    }

    #maps;
    get maps() {
        return this.#maps;
    }

    #port;
    get port() {
        return this.#port;
    }

    #ports;
    get ports() {
        return this.#ports;
    }

    #gzip;
    get gzip() {
        return this.#gzip;
    }

    #default;
    get default() {
        return this.#default;
    }

    #npm;
    get npm() {
        return this.#npm;
    }

    #errors;
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings;
    get warnings() {
        return this.#warnings;
    }

    constructor(application, config, local, key) {
        super();
        this.#errors = [];
        const warnings = this.#warnings = [];

        this.#key = key ? key : require('./key')(config);
        this.#name = config.name;
        this.#local = !!local;
        this.#npm = config.npm;
        this.#application = application;

        const {platforms} = global;
        config.platform = config.platform ? config.platform : 'web';
        this.#platform = platforms.all.includes(config.platform) ? config.platform : 'web';

        this.#imports = typeof config.imports === 'object' ? new Map(Object.entries(config.imports)) : new Map();

        this.#baseDir = config.baseDir ? config.baseDir : '';
        this.#host = config.host;

        this.#gzip = typeof config.gzip === 'boolean' ? config.gzip : false;

        const development = typeof config.development === 'object' ? config.development : {};
        development.tools = development.tools === void 0 ? true : development.tools;
        development.tools = !local ? false : development.tools;
        this.#development = development;

        this.#minify = (() => {
            let {minify} = config;
            if (minify && typeof minify !== 'object') {
                warnings.push('Property minify should be an object');
                minify = {};
            }
            minify = minify ? minify : {};

            minify.js = minify.js === void 0 ? false : !!minify.js;
            minify.css = minify.css === void 0 ? false : !!minify.css;
            minify.html = minify.html === void 0 ? false : !!minify.html;
            return minify;
        })();

        this.#maps = (() => {
            const def = local ? 'inline' : 'external';

            if (!config.maps) return def;
            if (config.maps && typeof config.maps !== 'string') {
                warnings.push('Property maps should be a string');
                return def;
            }
            if (!['inline', 'external', 'none'].includes(config.maps)) {
                warnings.push(`Property maps "${config.maps}" is invalid`);
                return def;
            }
            return config.maps;
        })();

        // The name of the distribution of the ssr server
        this.#ssr = config.ssr;
        // The name of the distribution of the backend server
        this.#backend = config.backend;

        this.#environment = config.environment ? config.environment : 'development';
        this.#ts = config.ts;
        this.#default = !!config.default;

        // Set the bundles {mode} configuration
        this.#bundles = (() => {
            const bundles = typeof config.bundles === 'object' ? config.bundles : {};

            const def = platforms.node.includes(this.#platform) ? 'cjs' :
                (platforms.webAndMobile.includes(this.#platform) ? 'sjs' : 'esm');
            bundles.mode = ['esm', 'amd', 'cjs', 'sjs'].includes(bundles.mode) ? bundles.mode : def;
            return bundles;
        })();
    }

    #configured = false;

    _prepared() {
        return this.#configured;
    }

    configure(ports, port) {
        this.#configured = true;
        if (equal(this.#ports, ports) && this.#port === port) return;

        this.#ports = ports;
        this.#port = port;
        this._invalidate();
    }

    toJSON() {
        return {
            key: this.#key,
            name: this.#name,
            platform: this.#platform,
            imports: this.#imports,
            baseDir: this.#baseDir,
            host: this.#host,
            ssr: this.#ssr,
            backend: this.#backend,
            environment: this.#environment,
            ts: this.#ts,
            minify: this.#minify,
            bundles: this.#bundles,
            ports: this.#ports,
            port: this.#port,
            default: this.#default
        };
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'record/update',
            table: 'applications-distributions',
            id: this.id
        });
    }
}