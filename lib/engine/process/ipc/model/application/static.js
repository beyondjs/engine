let model;
module.exports = m => (model = m) && ApplicationStatic;

class ApplicationStatic extends require('../base') {
    #item;
    get item() {
        return this.#item;
    }

    #application;
    get application() {
        return this.#application;
    }

    async _initialise() {
        if (this._id.length < 2) return this._done(`Application id "${this.id}" is invalid`);

        const application = new model.Application(this._id.slice(0, 2));
        await application.ready;
        if (application.error) return this._done(`ApplicationStatic not valid, ${application.error}`);

        await application.static.ready;
        const item = [...application.static.values()].find(item => this.id.includes(item.filename));

        if (!item) return;
        this.#item = item;
        this.#application = application;

        this._done();
    };

    toJSON() {
        const {item} = this;
        let pathname = `/${item.relative?.file}`;
        pathname = pathname.replace(/\\/g, `/`);
        return {
            id: this.id,
            file: item.file,
            filename: item.filename,
            dirname: item.dirname,
            basename: item.basename,
            extname: item.extname,
            pathname: pathname,
            relative: {file: item.relative?.file, dirname: item.relative?.dirname}
        };
    }
}
