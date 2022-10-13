module.exports = class extends require('../../file-manager') {

    #default = 'en';
    skeleton = [
        'default',
        {name: 'supported', type: Array}
    ]

    #supported = ['en'];
    get supported() {
        return this.#supported;
    }

    set supported(value) {
        if (!Array.isArray(value)) return;
        this.#supported = value;
    }

    get structure() {

        return {default: this.#default, supported: this.#supported}
    }

    set = data => Object.keys(data).forEach(item => this[item] = data[item]);

    add = language => {
        if (this.#supported.includes(language)) return;
        this.#supported.push(language);
    }

    remove = lang => {
        const index = this.#supported.findIndex(lang)
        if (index > -1) this.#supported.slice(index, 1);
    }

}
