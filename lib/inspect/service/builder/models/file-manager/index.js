const {Validator} = require("../validator");

class Index {
    _id;
    _fileName;
    _exists;
    _filePath;
    _fs = global.utils.fs;
    skeleton = [];
    _reserved = [];
    /**
     * @see FileManager/File
     */
    #file;
    #templates;

    get file() {
        return this.#file;
    }

    get exists() {
        return this._exists;
    }

    #path;
    /**
     * @deprecated
     */
    get path() {
        return this.#path;
    }

    #loaded = false;
    get loaded() {
        return this.#loaded;
    }

    set path(value) {
        this.#path = value;
    }

    set encoding(encoding) {
        this._enconding = encoding;
    }

    /**
     *
     * @param dirname
     * @param basename
     */
    constructor(dirname, basename) {
        if (dirname) this.#path = dirname;
        this.loadFile(dirname, basename);
        this.validator = new Validator();
        this.#templates = (require('../templates')).get();
    }

    loadFile(dirname, basename) {
        this.#file = new (require('./file'))(dirname, basename);
    }

    ipc() {
        return require('../../../ipc-manager');
    }

    /**
     * Returns the path of the beyond template files
     * @returns {Promise<*>}
     */
    async templatesPath() {
        return this.#templates.path;

    }

    /**
     * Load the content of the file
     *
     * This method is used in the constructor, It checks if in the path
     * exists a file for the object instanced and get his content.
     * @private
     */
    async _load(update = false) {
        try {
            if (!this.validate() || (this.#loaded && !update)) return;

            const content = await this.#file.readJSON();
            this.#loaded = true;
            this._checkProperties(content);
        }
        catch (e) {
            return {error: e.message, exc: e};
        }

    }

    /**
     * check if file exist
     */
    validate(file = undefined) {
        if (!file) file = this._fileName;
        const {existsSync} = require('fs');
        this._exists = existsSync(this.#file.getPath(file));
        return this._exists;
    }

    /**
     * Set a property of the object
     * @param property
     * @param value
     * @TODO: Julio Check if is required
     */
    set(property, value) {
        if (!this.hasOwnProperty(property)) return;
        this[property] = value;
    }

    /**
     * update a json file
     *
     * @param {object} values Values to update, if the value is not passed the
     * method will writes the values in the object
     */
    async save(values) {
        if (typeof values === 'object') this._checkProperties(values);
        this.#file.writeJSON(this.getProperties(), this.#file.file);
    }

    /**
     * checks if the object passed has properties of the object and assigns the values.
     *
     * @param specs
     * @private
     */
    _checkProperties(specs) {
        if (!specs) return;

        const checkObjects = value => {
            if (typeof value === 'object') return value;
            return {};
        };
        const types = {
            boolean: value => !!value,
            string: value => (value === undefined ? undefined : String(value)),
            object: checkObjects,
            eoc: checkObjects,
            array: value => {
                if (Array.isArray(value)) return value;
                return [];
            },
            number: value => Number(value)
        }


        Object.keys(specs).forEach(property => {
            if (this?._reserved?.includes(property)) return;
            property = this.skeleton.find(item => item === property || item?.name === property);

            if (!property) return;

            if (typeof property === 'object') {

                const {name, type} = property;
                if (Array.isArray(type)) {
                    this[name] = types.array(specs[name]);
                }
                else {
                    this[name] = type ? types[type](specs[name]) : specs[name];
                }

                return;
            }

            try{
                this[property] = specs[property];
            }catch (e){
                console.error(e);
            }

        });
    }

    /**
     * Return a json with the skeleton values of the object
     * @returns object
     */
    getProperties(skeleton = undefined) {
        const json = {};
        skeleton = skeleton ? skeleton : this.skeleton;
        // skeleton.forEach()

        skeleton.forEach(property => {
            if (!this.validator.check(property, this)) return;

            if (typeof property === 'object') {
                if (property.type === 'eoc') {
                    json[property.name] = this[property.name].structure;
                    return;
                }
                const obj = this[property.name];

                if (typeof obj === 'object' && !Object.keys(obj).length) return;
                json[property.name] = obj;

            }
            json[property] = this[property];
        });

        return json;
    }
}

module.exports = Index;
