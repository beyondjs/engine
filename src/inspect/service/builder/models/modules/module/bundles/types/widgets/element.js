module.exports = class extends require('../../../../../file-manager') {
    skeleton = ['name']
    #name;

    get name() {
        return this.#name;
    }

    set name(value) {
        const exp = /[a-z]+-[a-z]+/g;
        if (!value.match(exp)) {
            throw new Error('ELEMENT_NAME_INVALID');
        }
        this.#name = value;

    }

    set(values) {
        this._checkProperties(values);
    }
}
