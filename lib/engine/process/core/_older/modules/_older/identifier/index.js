module.exports = class {
    #resource;
    get resource() {
        return this.#resource;
    }

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #identifier;
    #external;
    get external() {
        return this.#external;
    }

    get is() {
        return this.#external ? 'external' : this.#identifier.is;
    }

    get developer() {
        return this.#identifier?.developer;
    }

    get library() {
        return this.#identifier?.library;
    }

    get module() {
        return this.#identifier?.module;
    }

    get bundle() {
        return this.#identifier?.bundle;
    }

    constructor(resource) {
        this.#resource = resource;
        const split = resource.split('/');

        this.#external = !['beyond_modules', 'beyond_libraries'].includes(split[0]);
        if (this.#external) return;

        const type = split.shift();
        if (type === 'beyond_modules') {
            // Case beyond_modules/developer/moduleName/bundleName
            // As beyond_modules was shifted, then split should actually be: developer/moduleName/bundleName
            if (split.length !== 3) {
                this.#errors.push('Invalid dependency value. ' +
                    'It should have the following format beyond_modules/developer/moduleName/bundleName');
                return;
            }
            this.#identifier = new (require('./application'))(...split);
        }
        else if (type === 'beyond_libraries') {
            // Case beyond_libraries/libraryName/moduleName/bundleName
            // As beyond_libraries was shifted, then split should actually be: libraryName/moduleName/bundleName
            if (split.length !== 3) {
                this.#errors.push('Invalid dependency value. ' +
                    'It should have the following format beyond_libraries/libraryName/moduleName/bundleName');
                return;
            }
            this.#identifier = new (require('./library'))(...split);
        }
    }
}
