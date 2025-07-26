module.exports = class {
    #model;

    constructor(model) {
        this.#model = model;
    }

    async list(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const applicationIds = ids.map(id => `application//${id}`);
        const applications = new this.#model.Collection(this.#model.Application, applicationIds);
        await applications.ready;

        const promises = [];
        applications.forEach(app => !app.error && promises.push(app.static.ready));
        await Promise.all(promises);

        const output = {};
        for (const id of applicationIds) {
            const application = applications.get(id);
            if (application.error) continue;

            const items = [];
            application.static.forEach(item => {
                let pathname = `/${item.relative?.file}`;
                pathname = pathname.replace(/\\/g, `/`)
                items.push({
                    id: `${id}/${pathname}`,
                    file: item.file,
                    filename: item.filename,
                    dirname: item.dirname,
                    basename: item.basename,
                    extname: item.extname,
                    pathname: pathname,
                    relative: {file: item.relative?.file, dirname: item.relative?.dirname}
                })
            });

            //TODO @ftovar Si el estatico no es una imagen leer el archivo con el utils.FS
            // y enviarlo en una propiedad content, definirla en la tabla
            output[application.item.id] = items;
        }

        return output;
    }

    async get(ids) {
        if (!(ids instanceof Array)) throw new Error('Invalid parameters');
        if (!ids.length) return;

        const applicationStatic = new this.#model.Collection(this.#model.ApplicationStatic, ids);
        await applicationStatic.ready;

        const output = {};
        for (const appStatic of applicationStatic.values()) {
            if (appStatic.error) continue;
            output[appStatic.id] = appStatic.toJSON();
        }

        return output;
    }
}