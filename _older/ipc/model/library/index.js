let model;
module.exports = m => (model = m) && Library;

class Library extends require('../base') {
    #library;

    get item() {
        return this.#library;
    }

    get modules() {
        return this.#library?.modules;
    }

    get static() {
        return this.#library?.static;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Library id "${this.id}" is invalid`);

        const id = parseInt(this._id[1]);
        const {libraries} = model.core;
        await libraries.ready;

        const promises = [];
        [...libraries.values()].forEach(l => promises.push(l.ready));
        await Promise.all(promises);

        //TODO @ftovar se tiene un proyecto importado como libreria en otro proyecto, no aparece en las libreria
        // [...libraries.values()].forEach(i => console.log(6, i.id, i.name, '-', id))
        const library = [...libraries.values()].find(item => item.id === id);
        if (!library) return this._done(`Library id "${this.id}" not found`);

        await library.ready;
        this.#library = library;

        this._done();
    };

    toJSON() {
        const {item} = this;
        return {
            id: item.id,
            path: item.path,
            name: item.name,
            title: item.title,
            description: item.description,
            developer: item.developer,
            version: item.version,
            connect: item.connect,
            hosts: item.hosts,
            port: item.port,
            graph: item.graph,
            errors: item.errors,
            warnings: item.warnings ?? []
        };
    }
}
