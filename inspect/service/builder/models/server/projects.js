module.exports = class BeyondProjects {
    #items = new Set;
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
        if (typeof applications === 'string') {
            const Manager = require('../file-manager');
            this.#isFile = true;
            this.#manager = new Manager(path, applications);
        }

        this.load();
    }

    async load() {
        let data = [];
        if (this.#manager.file.validate()) {
            this.#manager.file.read();
            data = this.manager.file.json;
        }

        data?.forEach(application => this.#items.add(application));
    }

    add = application => this.#items.add(application);
    remove = application => this.#items.delete(application);

    async save() {
        try {
            await this.load();
            if (!this.isFile) return;
            return this.manager.file.writeJSON(Array.from(this.items));
        }
        catch (exc) {
            console.error(exc);
        }
    }
}