module.exports = class Params extends require('../../file-manager') {

    skeleton = [];

    #excludes = ['_fs', 'skeleton', '_reserved', '_id', '_fileName', 'exists'];
    set = (property, value) => this[property] = value;

    getProperties(skeleton = undefined) {
        const properties = super.getProperties(skeleton);
        const names = Object.getOwnPropertyNames(this)

        names.forEach(prop => {
            if (this.#excludes.includes(prop)) return;
            properties[prop] = this[prop];
        });

        return properties;
    }

    get structure() {
        return this.getProperties();
    }
}
