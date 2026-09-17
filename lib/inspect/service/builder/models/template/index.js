const Global = require('./global');
const Application = require('./application');
const Overwrites = require('./overwrite/manager');
const Processors = require('./processors/manager');
module.exports = class Template extends require('../file-manager') {
    _application;
    get application() {
        return this._application;
    }

    _processors;
    get processors() {
        return this._processors;
    }

    _global;
    get global() {
        return this._global;
    }

    _overwrites;
    get overwrites() {
        return this._overwrites;
    }

    _route;
    get route() {
        return this._route;
    }

    skeleton = [
        'application', 'global', 'processors', 'overwrites'
    ];

    constructor(path, route) {
        super(path);

        this._path = path;
        this._route = route;
        this._load();
    }

    async _load() {
        if (!this.validate()) return;

        const content = this.readJSON();

        this._checkProperties(content);
        this._originalContent = content;

        this._global = new Global(content.global);
        this._application = new Application(content.application);
        this._processors = new Processors(content.processors);
        this._overwrites = new Overwrites(`${this._route}\\${content.overwrites}`, this);
        this._loaded = true;
    }

    /**
     *  Currently, the method expects the application and processors properties
     *  to be objects configured in template.json
     *
     * TODO: Check whether each property is an independent object,
     *  so that each one writes its JSON independently
     *
     * @param params
     * @returns void
     */
    async save(params) {
        const json = {};
        for (const property of this.skeleton) {
            if (!params.hasOwnProperty(property)) {
                continue;
            }

            this[property].setValues(params[property]);
            if (property === 'overwrites') continue;

            Object.assign(json, await this[property].getContent());
        }

        let content = this.readJSON();
        content = Object.assign(content, json);
        await this._writeJSON(this._getFilePath(), content);

        if (params.hasOwnProperty('overwrites')) {
            await this.overwrites.save();
        }
    }

    async delete(params) {
        if (!params.overwrites) return;

        for (const overwrite of params.overwrites) {
            if (!overwrite.module) {
                console.error('Invalid params for overwrite entry', overwrite);
                continue;
            }

            const {module, bundle} = overwrite;
            if (!this.overwrites.items.has(module)) {
                console.error(`Entry "${module}" not exists on overwrite.json`)
                continue;
            }

            if (!bundle) {
                this.overwrites.items.delete(module);
                continue;
            }

            const item = this.overwrites.items.get(module);
            item.deleteBundle(bundle);

            !item.bundles.size ? this.overwrites.items.delete(module) : null;
        }

        this.overwrites.save();
    }
}