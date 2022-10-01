const DynamicProcessor = global.utils.DynamicProcessor(Map);
const uimport = require('uimport');
const {join} = require('path');

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'dependencies.external.dependencies';
    }

    #external;

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    constructor(external) {
        super();
        this.#external = external;
    }

    #status;
    get status() {
        return this.#status;
    }

    _prepared() {
        if (this.#status === 'processed') return true;
        if (this.#status === 'processing') return false;

        const external = this.#external;
        const {application} = external;
        const specs = {
            cwd: application.path,
            temp: join(application.path, '.beyond/uimport'),
            cache: join(process.cwd(), '.beyond/uimport')
        };

        this.#status = 'processing';

        const done = ({errors, dependencies}) => {
            this.#status = 'processed';
            this.#errors = errors ? errors : [];

            dependencies?.forEach(dependency => {
                const {pkg, version, subpath, errors} = require('../specifier-parser')(dependency.id);
                if (errors) {
                    errors.push(`Dependency "${dependency.id}" of external "${this.#external.name}" is invalid`);
                    return;
                }
                const external = new (require('./'))(pkg, version, subpath, application);
                this.set(dependency.id, external);
            });
            this._invalidate();
        }

        const subpath = external.subpath ? `/${external.subpath}` : '';
        const specifier = `${external.name}@${external.version}` + subpath;

        uimport(specifier, 'esm', specs)
            .then(done)
            .catch(exc => done({errors: [exc.message]}));

        return false;
    }
}
