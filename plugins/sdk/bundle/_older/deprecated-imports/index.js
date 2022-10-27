const DynamicProcessor = require('beyond/utils/dynamic-processor');
const babel = require('@babel/core');

/**
 * @deprecated
 *
 * The imports of the bundle (configured in the property .imports in the module.json).
 * Only for backward compatibility required by the dashboard.
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundle.deprecated-imports';
    }

    #bundle;

    #sources;
    get sources() {
        return this.#sources;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    /**
     * Generate the code to be included in the bundle
     *
     * @param dependencies {*} The code dependencies map
     * @return {string}
     */
    code(dependencies) {
        let code = '';
        this.forEach((imports, specifier) => {
            const variable = dependencies.get(specifier);
            if (!variable) throw new Error(`Dependency "${specifier}" not found`);
            if (!imports.get('specifiers')?.length && !imports.has('default')) return;

            if (imports.get('specifiers')?.length) {
                code += 'const ';
                code += '{';
                imports.get('specifiers').forEach((expression, index) => {
                    code += index !== 0 ? ', ' : '';
                    code += expression;
                });
                code += `} = ${variable};\n`;
            }

            imports.has('default') && (code += `const ${imports.get('default')} = ${variable}.default;\n`);
        });

        return code;
    }

    async _begin() {
        await this.#bundle.ready;
    }

    constructor(bundle) {
        super();
        this.#bundle = bundle;

        const {watcher} = bundle.module.pkg;
        const sources = this.#sources = new (require('./sources'))(watcher);
        super.setup(new Map([['sources', {child: sources}]]));

        this.#hash = new (require('./hash'))(this);
    }

    configure(path, config) {
        this.#sources.configure(path, config);
    }

    _prepared(require) {
        this.#sources.forEach(source => require(source));
    }

    _process() {
        this.clear();

        const add = (specifier, imports) => {
            const values = this.has(specifier) ? this.get(specifier) : new Map();
            this.set(specifier, values);

            imports?.forEach(({type, imported, local}) => {
                if (type === 'ImportSpecifier') {
                    const specifiers = values.has('specifiers') ? values.get('specifiers') : [];
                    values.set('specifiers', specifiers);
                    specifiers.push(imported?.name === local.name ? local.name : `${imported.name} as ${loca.name}`);
                }
                else if (type === 'ImportDefaultSpecifier') {
                    values.set('default', local.name);
                }
            });
        }

        this.#sources.forEach(source => {
            babel.transform(source.content, {
                plugins: [{
                    visitor: {
                        ImportDeclaration: path => {
                            const specifier = path.node.source.value;
                            add(specifier, path.node.specifiers);
                        }
                    }
                }]
            });
        });
    }
}
