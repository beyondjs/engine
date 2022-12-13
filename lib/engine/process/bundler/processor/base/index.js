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
        return "processor";
    }

    get id() {
        return `${this.#specs.bundle.id}//${this.#name}//${this.distribution.key}//${this.language}`;
    }

    #meta;
    get meta() {
        return this.#meta;
    }

    get application() {
        return this.#specs.application;
    }

    get distribution() {
        return this.#specs.distribution;
    }

    get language() {
        return this.#specs.language;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    get files() {
        return this.#sources.files;
    }

    get overwrites() {
        return this.#sources.overwrites;
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

    #multilanguage;
    get multilanguage() {
        return this.#multilanguage;
    }

    set multilanguage(value) {
        if (this.#multilanguage === value) return;
        this.#multilanguage = value;
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
     * @param specs {{bundle: object, distribution: object, application: object, watcher: object}}
     */
    constructor(name, specs) {
        if (
            !specs ||
            !specs.bundle?.type ||
            !specs.bundle.container ||
            !specs.bundle.path ||
            !specs.application ||
            !specs.watcher
        ) {
            const id = specs && specs.bundle && specs.bundle.id ? `of bundle "${specs.bundle.id}" ` : "";
            console.log(`Parameter specs ${id}is invalid:`, specs);
            throw new Error('Invalid "specs" parameter');
        }

        const meta = (this.#meta = global.processors.get(name));
        if (!meta?.sources) {
            throw new Error(`Processor "${name}", sources specification is invalid`);
        }
        if (meta.packager && !meta.packager.Js && !meta.packager.Css) {
            throw new Error(`Processor "${name}" error, js or css packager specification must be specified`);
        }
        if (meta.extender && !meta.extender.Preprocessor) {
            throw new Error(`Processor "${name}" error, extender specification is invalid. Preprocessor is required`);
        }

        const Sources = meta.sources.Sources ? meta.sources.Sources : require("./sources");
        const Hashes = meta.Hashes ? meta.Hashes : require("./hashes");

        this.#name = name;
        this.#specs = specs;
        this.#sources = new Sources(this);

        const { Analyzer } = meta;
        this.#analyzer = Analyzer ? new Analyzer(this) : void 0;

        const { Dependencies } = meta;
        this.#dependencies = Dependencies ? new Dependencies(this) : void 0;

        this.#hashes = new Hashes(this);

        let Packager = meta.packager?.Packager;
        Packager = meta.packager && !Packager ? require("../packager") : Packager;
        this.#packager = Packager && new Packager(this);

        let Extender = meta.extender?.Extender;
        Extender = meta.extender && !Extender && require("../extender");
        Extender && (this.#extender = new Extender(this));

        this.#packager?.setup();
    }

    configure(config, multilanguage) {
        const { path, errors, warnings, sources, code } = require("./config")(config, this.#meta);
        this.#path = require("path").join(this.#specs.bundle.path, path ? path : "");
        this.#errors = errors;
        this.#warnings = warnings;

        if (errors.length) {
            this.#sources.configure();
            return;
        }

        this.#sources.configure(this.#path, sources);

        multilanguage = !!multilanguage;
        this.#packager?.configure({ multilanguage, code });
    }

    destroy() {
        this.#hashes.destroy();
        this.#sources.destroy();
        this.#analyzer?.destroy();
        this.#dependencies?.destroy();
    }
};
