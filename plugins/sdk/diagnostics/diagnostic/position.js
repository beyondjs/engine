module.exports = class {
    #line;
    get line() {
        return this.#line;
    }

    #column;
    get column() {
        return this.#column;
    }

    constructor(values) {
        values && this.#set(values);
    }

    #set({line, column}) {
        this.#line = line;
        this.#column = column;
    }

    hydrate(cached) {
        return this.#set(cached);
    }

    toJSON() {
        const {line, column} = this;
        return {line, column};
    }
}
