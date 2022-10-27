const {processors} = require('beyond/plugins/registry');

/**
 * Processor's base class
 */
module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #path;
    get path() {
        return this.#path;
    }

    #specs;
    get specs() {
        return this.#specs;
    }

    get bundle() {
        return this.#specs.bundle;
    }

    get is() {
        return 'processor';
    }

    get id() {
        return `${this.#specs.bundle.id}//${this.#name}//${this.cspecs.key()}`;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    get pkg() {
        return this.#specs.pkg;
    }

    get cspecs() {
        return this.#specs.cspecs;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    get files() {
        return this.#sources.files;
    }

    get options() {
        return this.#sources.options;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    #analyzer;
    get analyzer() {
        return this.#analyzer;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings ? this.#warnings : [];
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    #extender;
    get extender() {
        return this.#extender;
    }

    /**
     * Processor constructor
     *
     * @param name {string} The processor's name
     * @param specs {{pkg, bundle, cspecs, watcher=}}
     */
    constructor(name, specs) {
        if (!specs?.pkg || !specs.bundle?.type || !specs.bundle.path) {
            const id = specs && specs.bundle?.id ? `of bundle "${specs.bundle.id}" ` : '';
            console.log(`Parameter specs ${id}is invalid:`, specs, specs.bundle.type, specs.bundle.path);
            throw new Error('Invalid "specs" parameter');
        }

        const meta = this.#meta = processors.get(name);
        if (!meta?.sources) {
            throw new Error(`Processor "${name}", sources specification is invalid`);
        }
        if (meta.packager && !meta.packager.Js && !meta.packager.Css) {
            throw new Error(`Processor "${name}" error, js or css packager specification must be specified`);
        }
        if (meta.extender && (!meta.extender.Preprocessor)) {
            throw new Error(`Processor "${name}" error, extender specification is invalid. Preprocessor is required`);
        }

        const Sources = meta.sources.Sources ? meta.sources.Sources : require('./sources');
        const Hashes = meta.Hashes ? meta.Hashes : require('./hashes');

        this.#name = name;
        this.#specs = specs;
        this.#sources = new Sources(this);

        const {Analyzer} = meta;
        this.#analyzer = Analyzer ? new Analyzer(this) : void 0;

        const {Dependencies} = meta;
        this.#dependencies = Dependencies ? new Dependencies(this) : void 0;

        this.#hashes = new Hashes(this);

        let Packager = meta.packager?.Packager;
        Packager = meta.packager && !Packager ? require('../packager') : Packager;
        this.#packager = Packager && new Packager(this);

        let Extender = meta.extender?.Extender;
        Extender = meta.extender && !Extender && require('../extender');
        Extender && (this.#extender = new (Extender)(this));

        this.#packager?.setup();
    }

    configure(config) {
        const {path, errors, warnings, sources, code} = require('./config')(config, this.#meta);
        this.#path = require('path').join(this.#specs.bundle.path, path ? path : '');
        this.#errors = errors;
        this.#warnings = warnings;

        if (errors.length) {
            this.#sources.configure();
            return;
        }

        this.#sources.configure(this.#path, sources);
        this.#packager?.configure(code);
    }

    destroy() {
        this.#hashes.destroy();
        this.#sources.destroy();
        this.#analyzer?.destroy();
        this.#dependencies?.destroy();
    }
}
