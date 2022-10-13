/**
 * Represents the Beyond Server (beyond.json file)
 *
 * @type {module.FileManager|{}}
 */
module.exports = class BeyondServer extends require('../file-manager') {
    _monitor;
    _fileName = 'beyond.json';

    #projects;
    get projects() {
        return this.#projects;
    }

    _libraries = [];
    get libraries() {
        return this._libraries;
    }

    #defaultTPL = {applications: 'projects.json', bundles: {}};

    constructor(path) {
        super(path, 'beyond.json');
        const exists = this.validate();
        if (exists) this.load();
        else {
            this.file.content = this.#defaultTPL;
            this.#projects = new (require('./projects'))(this.file.dirname, this.file.json.applications);
        }

    }

    async load() {
        await this._load(this.file.file);
        this.#projects = new (require('./projects'))(this.file.dirname, this.file.json.applications);
    }

    async save() {
        if (this.#projects.isFile) await this.#projects.save();
        const specs = {applications: this.#projects.value, libraries: this._libraries};
        return this.file.writeJSON({...this.file.json, ...specs});
    }

    addProject = app => {
        this.projects.add(app);
        if (!this.projects.isFile) return this.save();
        return this.projects.save();
    }

}
