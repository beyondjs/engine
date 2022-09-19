const {ipc, fs} = global.utils;
const rPath = require('path');

/**
 * Call the declarations. Update method of the Application object to generate all declarations.
 * The changes of the declarations state will be notified to the client through the notify method of the application object.
 * @param {object} core Core of the client process
 */
module.exports = class {
    #model;
    #declarations = new Map();

    constructor(model) {
        this.#model = model;
    };

    packagers = require('./packagers');

    async #updateAll(application) {
        const packagers = await this.packagers(application, this.#model);

        const total = packagers.size;
        ipc.notify(`declarations-save`, {total: total, applicationId: application.item.id});

        const beyondContext = rPath.join(application.modules.self.path, '/node_modules/beyond_context');
        if (!await fs.exists(beyondContext)) await fs.mkdir(beyondContext, {recursive: true});
        const path = require('path').join(__dirname, 'beyond_context');
        await fs.copy(path, beyondContext);

        const processDeclaration = async declaration => {
            if (this.#declarations.has(declaration.id)) return;

            const {dependencies} = declaration.packager;
            await dependencies.ready;

            const promises = [];
            dependencies.forEach(dependency => promises.push(dependency.ready));
            await Promise.all(promises);

            for (const dependency of dependencies.values()) {
                if (!dependency.valid) continue;
                if (dependency.kind !== 'bundle') continue;
                const {bundle} = dependency;
                const {application, platforms} = bundle.container;
                const distribution = await this.#model.distribution(application.id, bundle, platforms);
                if (!distribution) continue;
                const {declaration} = bundle.packagers.get(distribution);
                await processDeclaration(declaration);
            }

            await declaration.ready;
            const {id, valid, errors} = declaration;
            const notify = error => ipc.notify(`declarations-save`, {
                total: total, applicationId: application.item.id, item: {id: id, valid: valid && !error}
            });
            if (!valid || errors.length) return notify();

            try {
                await declaration.save();
                notify();
                this.#declarations.set(id, declaration);
            }
            catch (exc) {
                notify({error: exc.message});
            }
        }

        const promises = [];
        packagers.forEach(packager => promises.push(processDeclaration(packager.declaration)));
        await Promise.all(promises);
    };

    async updateAll(params) {
        const {applicationId} = params;
        const application = new this.#model.Application(`application//${applicationId}`);
        await application.ready;

        if (application.error) {
            console.error(`Application "${applicationId}" not found`);
            return;
        }

        this.#updateAll(application).catch(exc => console.error(exc.stack));
    }

    async update(params) {
        const {id, applicationId} = params;

        const application = new this.#model.Application(`application//${applicationId}`);
        await application.ready;

        if (application.error) {
            console.error(`Application "${applicationId}" not found`);
            return;
        }

        if (this.#declarations.has(id)) {
            const declaration = this.#declarations.get(id);
            await declaration.ready;
            await declaration.save();
            this.#declarations.set(declaration.id, declaration);

            return;
        }

        const packagers = await this.packagers(application, this.#model);
        const packager = packagers.get(id);
        await packager.declaration.ready;

        if (!packager.declaration.valid) {
            return {error: `Error creating module declaration: ${packager.declaration.id}`};
        }

        await packager.declaration.save();
        this.#declarations.set(packager.declaration.id, packager.declaration);
    }
}