const {ipc, fs} = global.utils;
const rPath = require('path');

let messageId = 0;
const declarations = new Map();

module.exports = async function (application, distribution) {
    'use strict';

    const packagers = await require('./packagers')(application, distribution);

    const total = packagers.size;
    const notify = (text, error, processed) => ipc.notify(`application-process-notification`, {
        id: ++messageId,
        type: 'declarations',
        text: text, total: total,
        application: application.id,
        error: error, processed: processed
    });
    notify('Initializing process');

    const beyondContext = rPath.join(application.modules.self.path, '/node_modules/beyond_context');
    if (!await fs.exists(beyondContext)) await fs.mkdir(beyondContext, {recursive: true});
    const path = require('path').join(__dirname, 'beyond_context');
    await fs.copy(path, beyondContext);

    const process = async declaration => {
        if (declarations.has(declaration.id)) return;

        const {dependencies} = declaration.packager;
        await dependencies.ready;
        const promises = [];
        dependencies.forEach(dependency => promises.push(dependency.ready));
        await Promise.all(promises);

        for (const dependency of dependencies.values()) {
            if (!dependency.valid) continue;
            if (dependency.kind !== 'bundle') continue;
            const {declaration} = dependency.bundle.packagers.get(distribution);
            await process(declaration);
        }

        await declaration.ready;
        const {id, valid, errors, packager: {bundle}} = declaration;
        if (!valid || errors.length) {
            return notify(`Declaration ${bundle.container.name} not processed`, true);
        }

        try {
            await declaration.save();
            notify(`Declaration ${bundle.container.name} processed`);
            declarations.set(id, declaration);
        }
        catch (exc) {
            notify(exc.message, true);
        }
    }

    const promises = [];
    packagers.forEach(packager => promises.push(process(packager.declaration)));
    await Promise.all(promises);

    notify('Process finished', false, true);
}