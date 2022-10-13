require('colors');
const {join} = require('path');
const TYPES = require('./types');
module.exports = class Processor extends require('../../../../file-manager') {
    files = ["*"];
    path = '';
    bundle;
    #type;
    #skeleton;

    get type() {
        return this.#type;
    }

    #name;
    get name() {
        return this.#name;
    }

    constructor(bundle, processor, specs) {
        super(bundle.file.file, processor);
        this.bundle = bundle;
        this.path = specs.path ? specs.path : processor;

        this.#name = processor;
        this.#type = processor;
        //if the bundle property comes in the specs it overwrites the model that was previously set
        if (specs.bundle) {
            delete specs.bundle;
        }

        this.skeleton = specs.skeleton;
        this.#skeleton = specs.skeleton;
        if (specs) this._checkProperties(specs);
    }

    getPath = () => this.path ? `/${this.bundle.file.basename}/${this.path}` : this.bundle.file.basename;

    /***
     * Returns all writable processor properties
     * @returns {{}}
     */
    getProperties() {
        const json = {};
        this.#skeleton.forEach(property => json[property] = this[property]);

        json.path = this.getPath();
        return json;
    }

    async create() {
        const tplPath = await this.templatesPath();
        const finalPath = join(tplPath, 'bundles', this.bundle.type, this.#name)

        /**
         * if the folders exists the process is ignored.
         */
        const path = this.path === false ? this.file.dirname : this.file.file;
        if (!await this._fs.exists(path)) {
            this._fs.copy(finalPath, path);
        }
    }

    async createFile({name, dirname}) {
        const dest = join(this.file.file, name);
        const content = await this._fs.readFile(dirname, 'utf8');
        this.file.write(content, dest);
    }

    async build() {
        await this.create();
        if (!this.#name) console.error("error".red, this);
    }
}
