const Deployment = require('./deployment');
const TEMPLATES = require('./templates');
const {join} = require('path');

/**
 * Represents a project or package file.
 *
 * To load the file content, the load method must be called explicitly.
 * @type {Project}
 */
module.exports = class Project extends require('../file-manager') {
    _id;
    _version = 1;
    _port;
    _imprimir = true;
    /**
     * @deprecated
     * @type {string}
     * @private
     */
    _fileName = 'package.json';

    _templates = TEMPLATES;

    skeleton = [
        'name', 'version', 'title', 'description',
        'license', 'layout', 'template',
        {name: 'languages', type: 'eoc'},
        {name: 'params', type: 'eoc'},
        {name: 'modules', type: 'eoc'},
        {name: 'deployment', type: 'eoc'},
        'static',
        {name: 'dependencies'},
        {name: 'devDependencies'}
    ];

    async ready() {

    }

    #params;
    get params() {
        return this.#params.structure;
    }

    set params(value) {
        this.#params.set(value);
    }

    get id() {
        return this._id;
    }

    relativePath() {
        return `${this.id}/${this._fileName}`;
    }

    #modules;
    get modules() {
        return this.#modules;
    }

    set modules(data) {
        this.#modules.set(data);
    }

    #languages;
    get languages() {
        return this.#languages;
    }

    set languages(data) {
        this.#languages.set(data);
    }

    #deployment;
    get deployment() {
        return this.#deployment;
    }

    set deployment(data) {
        this.#deployment.set(data);
    }

    /**
     * @returns {string|*}
     */
    get modulesPath() {
        return this.#modules.file.file;
    }

    get path() {
        return this.file?.file;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #devDependencies;
    get devDependencies() {
        return this.#devDependencies;
    }

    #loading;

    constructor(path, specs = undefined) {
        super(path, 'package.json');
        // this.#backend = new Service(path, this);
        this.#languages = new (require('./languages'))();
        this.#deployment = new Deployment(this.file.dirname);
        this.#params = new (require('./params'))();
        this.#modules = new (require('../modules'))(path, 'modules');
        this.#modules.setDefault();
        specs && this._checkProperties(specs);
    }

    async load(update = false) {
        try {
            if (this.#loading || this.loaded && !update) {
                return this.#loading.value;
            }
            this.#loading = Promise.pending();
            await this._load();
            /**
             * support to validate if the project.json does not have a module entry property
             */
            if (!this.file.json?.module) {
                this.#modules.setDefault();
            }
            this.#loading.resolve()
            this.#loading = undefined;
        }
        catch (e) {
            return {error: e.message, exc: e};
        }
    }

    _setId(name) {
        return this._id = name.replace(/ /g, '-').toLowerCase();
    }

    async create(type, specs) {
        try {
            if (!type) throw 'The type of project was not specified';

            const folder = this._setId(specs.name)
            if (!folder) throw Error('The project instance requires a name');

            if (!this._templates.hasOwnProperty(type)) {
                /**
                 * @TODO: @julio check with felix and box
                 */
                throw `Does not exist a ${type} template`;
            }

            const {fs} = global.utils;
            if (await fs.exists(this.file.dirname)) {
                throw `The application is already exists in ${this.path}`;
            }

            const tplPath = this.templatesPath();
            if (!await fs.exists(tplPath)) {
                return {status: false, error: `${this.packagesTemplates()} package not installed.`};
            }
            if (!await fs.exists(join(tplPath, this._templates[type]))) {
                return {status: false, error: `Template nor found check ${this.packagesTemplates()} version.`};
            }

            const current = require('path').resolve(tplPath, this._templates[type]);
            await fs.copy(current, this.file.dirname);

            await this._load();
            // this.#deployment.addPlatforms(specs.platforms);

            /**
             * set dependencies and devDependencies from package.json template
             */
            const content = await this.file.readJSON();
            this.#dependencies = content.dependencies;
            this.#devDependencies = content.devDependencies;

            this.save(specs);
            await this.readFiles(specs);
            specs.npm && await this.install();
        }
        catch (exc) {
            return {status: false, error: exc.message};
        }
    }

    install() {
        return new Promise((resolve, reject) => {
            const {exec} = require('child_process');
            exec('npm install', {
                cwd: this.file.dirname
            }, (error, stdout, stderr) => {
                error && console.error("error", error);
                stderr && console.error("stderr", stderr);
                resolve();
            });
        }).catch(e => console.trace(e));
    }

    async save(values = {}) {
        const json = {deployment: this.#deployment.getProperties()};
        return super.save({...values, ...json});
    }

    /**
     * reads the template files and replaces the contents of [name] with those defined in the parameters
     * @param specs
     * @param dirname
     * @returns {Promise<void>}
     */
    async readFiles(specs, dirname) {
        const {readdir, save, promises} = global.utils.fs;

        dirname = dirname ?? this.file.dirname
        const files = await readdir(dirname);

        let items = [];
        let filenames = [];
        files.forEach(file => {
            if (file === 'package.json') return;

            const filename = require('path').join(dirname, file);
            if (!filename.includes('.')) {
                //is directory
                this.readFiles(specs, filename)
                return;
            }
            filenames.push(filename);
            items.push(promises.readFile(filename, {encoding: 'utf-8'}));
        });

        items.size = 0;
        const contents = await Promise.all(items);
        contents.forEach((content, index) => {
            content = content.replace(/\$\[name]/gm, specs.name);
            items.push(save(filenames[index], content, 'utf-8'))
        });

        await Promise.all(items);
    }
}
