const {transform} = require('@babel/core');
const generate = require('@babel/generator').default;
const visitor = require('./visitor');
const t = require('@babel/types');

const cwd = require.resolve('beyond');

module.exports = class {
    #id;
    get id() {
        return this.#id;
    }

    #filename;
    get filename() {
        return this.#filename;
    }

    #input;

    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    constructor(id, filename, input) {
        this.#id = id;
        this.#filename = filename;
        this.#input = input;
    }

    process(ims, dependencies) {
        const id = this.#id;
        const filename = this.#filename;
        const input = this.#input;

        try {
            const plugin = visitor(this, ims, dependencies);


            const code = input.code
                // Remove the line breaks at the end of the content
                .replace(/\n$/g, '')
                // Remove the sourcemap reference to the source file left by typescript
                .replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');

            const transformed = transform(code, {
                cwd,
                sourceType: 'module',
                inputSourceMap: input.map,
                ast: true,
                code: false,
                sourceMaps: false,
                plugins: [
                    ['@babel/plugin-syntax-typescript', {dts: true}],
                    plugin
                ]
            });

            const namespace = (() => {
                const identifier = t.identifier(id);
                const body = t.TSModuleBlock(transformed.ast.program.body);

                const namespace = t.tsModuleDeclaration(identifier, body);
                namespace.declare = true;

                const sources = {};
                sources[filename] = input.code;
                return generate(namespace, {sourceMaps: true}, sources);
            })();
            this.#code = namespace.code;
            this.#map = namespace.map;
        }
        catch (exc) {
            console.log(exc.stack);
            this.#error = exc.message;
        }
    }
}
