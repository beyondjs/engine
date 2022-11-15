module.exports = class extends Map {
    #incrementer = 0;

    constructor(processors) {
        super();

        processors.forEach(({js}) => {
            js?.dependencies && this.#register([...js.dependencies.values()]
                .filter(dependency => dependency.is.has('import'))
                .map(({specifier}) => specifier));
        });

        // The bundle '@beyond-js/local/bundle' is always required
        this.#register(['@beyond-js/local/bundle']);
    }

    get code() {
        let output = '';
        this.forEach(({code}) => (output += `${code}\n`));
        return output;
    }

    #register(specifiers) {
        specifiers.forEach(specifier => {
            if (this.has(specifier)) return;

            const variable = `__dependency_${this.#incrementer}`;
            const code = `import * as ${variable} from '${specifier}';`;
            this.set(specifier, {specifier, variable, code});

            this.#incrementer++;
        });
    }
}
