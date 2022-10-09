const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {TransversalPackager} = require('beyond/bundler-helpers');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.dependencies.code';
    }

    get id() {
        return this.#container.id;
    }

    // Can be a bundle packager or a transversal packager
    #container;

    #errors;
    get errors() {
        this.#process();
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return this.processed && !this.errors.length;
    }

    #code;
    get code() {
        this.#process();
        return this.#code;
    }

    #count;
    get count() {
        this.#process();
        return this.#count;
    }

    constructor(dependencies, container) {
        super();
        this.#container = container;
        super.setup(new Map([['dependencies', {child: dependencies}]]));
    }

    #process() {
        if (!this.processed) throw new Error('Dynamic processor is not ready');
        if (this.#code !== undefined || this.#errors !== undefined) return this.#code;

        const dependencies = this.children.get('dependencies').child;
        if (!dependencies.valid) {
            this.#errors = dependencies.errors;
            return;
        }

        this.#errors = [];
        let count = 0;
        let code = '';

        // Avoid to import the same specifier more than once (can happen on transversals)
        const resources = new Set();

        this.clear();
        dependencies.forEach((dependency, specifier) => {
            if (!dependency) throw new Error(`Dependency "${specifier}" is not defined`);
            const {valid, is, kind, bundle} = dependency;

            if (!valid) {
                this.#errors.push(`Dependency "${specifier}" is invalid`);
                return;
            }
            if (!is.has('import')) return;

            if (this.#container instanceof TransversalPackager && kind === 'transversal') {
                // Exclude the imports that refers to bundles that are part of the actual transversal
                if (this.#container.transversal.name === bundle.type) return;
            }

            const name = `dependency_${count}`;
            this.set(specifier, name);

            // If the start transversal is loaded at the beginning of the application, uncomment the following line,
            // as AMD would brings drawbacks (timeout error)
            // if (kind === 'transversal' && pathname === 'start') return;

            // Process the url of the import
            code += (() => {
                const {application} = this.#container;

                const resource = kind === 'transversal' ? `${application.package}/${bundle.type}` : specifier;
                if (resources.has(resource)) return '';
                resources.add(resource);
                count++;

                return `import * as ${name} from '${resource}';\n`;
            })();
        });

        this.#count = count;
        this.#code = code;
    }

    _prepared(require) {
        const dependencies = this.children.get('dependencies').child;
        dependencies.forEach(dependency => {
            if (!require(dependency, dependency.id)) return false;
            dependency.kind === 'external' && require(dependency.external);
            dependency.kind === 'bundle' && require(dependency.bundle);
        });
    }

    _process() {
        this.#count = this.#code = this.#errors = void 0;
    }
}
