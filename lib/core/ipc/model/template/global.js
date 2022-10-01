let model;
module.exports = m => (model = m) && TemplateGlobal;

class TemplateGlobal extends require('../base') {
    #global;
    #template;

    get item() {
        return this.#global;
    }

    get template() {
        return this.#template;
    }

    get id() {
        return this.#template.id;
    }

    async _initialise() {
        if (this._id.length !== 2) return this._done(`TemplateGlobal id "${this.id}" is invalid`);

        const template = new model.Template(this._id);
        await template.ready;
        if (template.error) return this._done(`Template not valid, ${template.error}`);


        await template.global.ready;
        this.#global = template.global;
        this.#template = application.template;

        this._done();
    };
}