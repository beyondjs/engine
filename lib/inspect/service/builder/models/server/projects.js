module.exports = class BeyondProjects {
    #items = new Set();
    get items() {
        return this.#items;
    }

    #isFile;
    get isFile() {
        return this.#isFile;
    }

    #manager;
    get manager() {
        return this.#manager;
    }

    #value;
    get value() {
        return !this.isFile ? Array.from(this.items) : this.#value;
    }

    constructor(path, applications = []) {
        this.#value = applications;
        let data = applications;
        const Manager = require("../file-manager");
        if (typeof applications === "string") {
            this.#isFile = true;
            this.#manager = new Manager(path, applications);
        } else {
            this.#manager = new Manager(path, "beyond.json");
        }

        this.load();
    }

    async load() {
        let data = [];
        if (this.#manager.file.validate()) {
            await this.#manager.file.read();
            const { json } = this.#manager.file;
            //json couldn't be an array if the applications entry point is defined as inline array.
            data = Array.isArray(json) ? json : json.applications;
        }
        if (!Array.isArray(data)) {
            throw new Error("applications entry in beyond.json is not valid");
        }
        data?.forEach((application) => this.#items.add(application));
    }

    add = (application) => this.#items.add(application);
    remove = (application) => this.#items.delete(application);

    async save() {
        try {
            await this.load();
            if (!this.isFile) return;
            return this.manager.file.writeJSON(Array.from(this.items));
        } catch (exc) {
            console.error(exc);
        }
    }
};
