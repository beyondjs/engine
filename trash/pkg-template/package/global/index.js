const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.template.global';
    }

    #application;
    get application() {
        return this.#application;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    get valid() {
        return !this.#errors.length;
    }

    #path;
    get path() {
        return this.#path;
    }

    #value;
    get value() {
        return this.#value;
    }

    #files;
    get files() {
        return this.#files;
    }

    constructor(application, config) {
        super();
        this.#application = application;
        super.setup(new Map([['config', {child: config}]]));

        this.#processors = new (require('./processors'))(this);
    }

    _process() {
        const config = this.children.get('config').child;

        const done = result => {
            result = result ? result : {};
            this.#errors = result.errors ? result.errors : [];
            this.#warnings = result.warnings ? result.warnings : [];
            this.#path = result.path;
            this.#value = result.value;
        };

        if (!config.valid || !config.value) {
            const {errors, warnings} = config;
            return done({errors, warnings});
        }

        const {processor} = config.value;
        if (!processor) return done();

        if (processor && !['sass', 'scss', 'less'].includes(processor)) {
            return done({errors: [`Processor "${processor}" is invalid`]});
        }

        let {path, value} = config;
        this.#files = value.files;
        return done({path, value});
    }
}
