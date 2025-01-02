module.exports = async function (application, distribution) {
    'use strict';

    const {seekers} = application.modules;
    const process = async specifier => {
        const seeker = seekers.create(specifier, distribution);
        await seeker.ready;

        const {valid, bundle, external} = seeker;
        seeker.destroy();
        if (!valid) return;

        await bundle?.ready;
        await external?.ready;
        return bundle ? bundle.resource(distribution) : external?.resource(distribution);
    }

    const vspecifier = await process('@beyond-js/kernel/core');
    if (!vspecifier) {
        console.error(`Dependency "@beyond-js/kernel" not installed`);
        return
    }

    const split = vspecifier.split('/');
    split.pop();

    return split.join('/');
}