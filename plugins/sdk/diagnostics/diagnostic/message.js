module.exports = class {
    #code;
    get code() {
        return this.#code;
    }

    #category;
    get category() {
        return this.#category;
    }

    #text;
    get text() {
        return this.#text;
    }

    constructor(values) {
        values && this.#set(values);
    }

    #set({code, category, text}) {
        this.#code = code;
        this.#category = category;
        this.#text = text;
    }

    hydrate(cached) {
        this.#set(cached);
    }

    toJSON() {
        const {code, category, text} = this;
        return {code, category, text};
    }
}
