const TSConfig = require('./tsconfig');
require('colors');
const {join, sep} = require('path');
module.exports = class Module extends require('../../file-manager') {
    /**
     * @deprecated
     * @type {string}
     * @private
     */
    _fileName = 'module.json';
    _reserved = ['reserved', 'bundles'];
    _platforms = []
    skeleton = [
        'name',
        'description',
        'compilation',
        'transpilation',
        'static'
    ];
    _templates = {
        page: './modules/templates/page',
        server_page: './modules/templates/page',
        mobile_login: './modules/templates/code'
    }

    /**
     * Contains the value of the file in case that it exists.
     * @private _originalContent
     */
    _originalContent;

    _loaded;

    get id() {
        return this._id;
    }

    get properties() {
        const props = {};
        this.skeleton.forEach(property => {

            if (this[property]) props[property] = this[property];
        });
        return props;
    }

    get path() {
        return this.file.file;
    }

    #bundlesManager;

    get bundles() {
        return this.#bundlesManager;
    }

    constructor(path, name) {
        super(path, 'module.json');
        //the name cannot have spaces or special characters.
        if (name) path = join(path, name.replace(/ /g, '-').toLowerCase());

        if (name && name.includes('layouts/')) {
            path = sep === '/' ? path : path.replace(/\\/g, '/');
            path = path.split('/');
            const name = path.pop();
            path = `${path.join('/')}/${name}`;
        }

        this.loadFile(path, 'module.json');
    }

    /**
     * Load the content of the file
     *
     * This method is used in the constructor, checks if in the path
     * exists a file for the object instanced and get his content.
     * @private
     */
    async _load() {
        const content = this.validate() ? await this.file.readJSON(this.file.file) : undefined;
        if (!this.#bundlesManager) {
            /**
             * The bundle Manager represents the container folder, so requires to has the basename empty.
             */
            this.#bundlesManager = new (require('./bundles/manager'))(this.file.dirname, '', content);
        }

        if (!content) return;
        this._checkProperties(content);
        this._originalContent = content;

        try {
            await this.#bundlesManager.load(content);
            this._loaded = true;
        }
        catch (e) {
            console.error('error', e)
        }
    }

    load = this._load;

    /**
     * that method uses the parent process method and additionally
     * checks if the specs has a bundle configuration.
     *
     * @param specs
     * @private
     */
    _process(specs) {
        this._checkProperties(specs);

        for (let bundle of this._BUNDLES) {
            specs.hasOwnProperty(bundle) && this.#bundlesManager.get(bundle, specs[bundle]);
        }
    }

    /**
     * TODO: doc it.
     * @param specs
     * @returns {{}}
     */
    cleanSpecs(specs) {
        const props = {};
        for (const property in specs) {
            if (!this.hasOwnProperty(`_${property}`) || property === 'id') {
                props[`${property}`] = specs[property];
            }
        }
        return props;
    }

    /**
     * Create a new bundle
     *
     * @returns {Promise<void>}
     */
    async create(specs = {}) {
        this._checkProperties(specs);
        this.#bundlesManager.add(specs);

        if (!this.#bundlesManager.items.size) throw Error('The module type cannot be undefined')

        try {
            await this._fs.mkdir(this.file.dirname, {recursive: true});
            const json = Object.assign(this.properties, this.#bundlesManager.properties);

            // add platforms if module have bundle bridge
            if (specs.bundles.includes('bridge')) {
                json.platforms = ['*'];
            }

            await this.#bundlesManager.build(specs);
            await this.file.writeJSON(json);
            /**
             * .tsconfig file is used by IDEs to identify dependencies
             // * @type {module.TsConfig}
             */
            const tsconfig = new TSConfig(this.file.dirname);
            await tsconfig.create();
        }
        catch (exc) {
            console.error(exc);
        }
    }

    getProperties() {
        let properties = super.getProperties();
        if (this.#bundlesManager?.items) {
            this.#bundlesManager?.items.forEach(bundle => {
                properties[bundle.type] = bundle.getProperties()
            });
        }

        return properties;
    }

    /**
     * Updates the module.json file
     *
     * @param params
     * @returns {Promise<void>}
     */
    async save(params = {}) {
        this._checkProperties(params);
        const data = this.getProperties();
        this.#bundlesManager.check(params);
        this.#bundlesManager.items.forEach(bundle => data[bundle.type] = bundle.getProperties());
        return this.file.writeJSON(data);
    }
}
