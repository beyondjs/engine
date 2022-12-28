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

    #file;
    get file() {
        return this.#file;
    }

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

    constructor(id, filename, code, map) {
        this.#id = id;
        this.#file = filename;

        try {
            const output = {};
            const plugin = visitor(output);
            const transformed = transform(code, {
                cwd,
                sourceType: 'module',
                inputSourceMap: map,
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
                sources[filename] = code;
                return generate(namespace, {sourceMaps: true}, sources);
            })();
            this.#code = namespace.code;
            this.#map = namespace.map;
        }
        catch (exc) {
            this.#error = exc.message;
        }
    }
}
