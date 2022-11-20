module.exports = class {
    #line;
    get line() {
        return this.#line;
    }

    #column;
    get column() {
        return this.#column;
    }

    constructor(line, column) {
        line && this.#set({line, column});
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
