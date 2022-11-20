module.exports = class {
    #source;
    /**
     * The source object when the diagnostic is about a file
     * @return {*}
     */
    get source() {
        return this.#source;
    }

    #specifier;
    /**
     * The specifier of the dependency when the diagnostic of about a dependency
     * @return {string}
     */
    get specifier() {
        return this.#specifier;
    }

    #code;
    get code() {
        return this.#code;
    }

    #category;
    get category() {
        return this.#category;
    }

    #message;
    get message() {
        return this.#message;
    }

    #start;
    get start() {
        return this.#start;
    }

    #end;
    get end() {
        return this.#end;
    }

    #relatedInformation;
    get relatedInformation() {
        return this.#relatedInformation;
    }

    constructor(source, message, line, character) {
        source && this.#set({source, message, line, character});
    }

    toJSON() {
        const {file, message, line, character} = this;
        return {file, message, line, character};
    }

    #set({source, message, line, character}) {
        this.#source = source;
        this.#message = message;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
