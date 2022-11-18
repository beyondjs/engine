module.exports = class {
    #source;
    get source() {
        return this.#source;
    }

    #message;
    get message() {
        return this.#message;
    }

    #line;
    get line() {
        return this.#line;
    }

    #character;
    get character() {
        return this.#character;
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
        this.#line = line;
        this.#character = character;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
