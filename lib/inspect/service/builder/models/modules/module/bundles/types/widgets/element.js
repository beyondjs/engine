module.exports = class extends require('../../../../../file-manager') {
    skeleton = ['name']
    #name;

    constructor(d,p, specs) {
        super(d,p);
        console.log(200, d,p, specs)
    }
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
        console.log(201, values)
        this._checkProperties(values);
    }
}
