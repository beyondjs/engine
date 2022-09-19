module.exports = class {
    #Template;

    constructor(model) {
        this.#Template = model.Template;
    }

    async get(id) {
        const template = new this.#Template(`application//${id}`);
        await template.ready;
        if (template.error) return;

        const processors = [];
        for (const processor of template.processors.keys()) {
            processors.push(`${id}//${processor}`);
        }

        return {
            id: template.id,
            application: template.id,
            path: template.path,
            processors: processors,
            errors: template.errors,
            warnings: template.warnings
        };
    }
}