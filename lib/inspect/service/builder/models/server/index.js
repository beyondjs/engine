/**
 * Represents the Beyond Server (beyond.json file)
 *
 * @type {module.FileManager|{}}
 */
module.exports = class BeyondServer extends require("../file-manager") {
    _monitor;
    _fileName = "beyond.json";

    #packages;
    get packages() {
        return this.#packages;
    }

    #defaultTPL = {packages: 'packages.json', bundles: {}};

    constructor(path) {
        super(path, "beyond.json");
        const exists = this.validate();

        if (exists) this.load();
        else {
            this.file.content = this.#defaultTPL;
            this.#packages = new (require("./packages"))(this.file.dirname, this.file.json.packages);
        }
    }

    load = async () => {
        await this._load(this.file.file);
        this.#packages = new (require("./packages"))(this.file.dirname, this.file.json.packages);
    };

    save = () => {
        // if (this.#packages.isFile) await this.#packages.save();
        const specs = {packages: this.#packages.value};
        return this.file.writeJSON({...this.file.json, ...specs});
    };

    addProject = app => {
        this.packages.add(app);
        if (!this.packages.isFile) return this.save();
        return this.packages.save();
    };
};
