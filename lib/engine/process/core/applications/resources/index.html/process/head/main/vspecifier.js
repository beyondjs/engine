module.exports = async function (application, distribution) {
    'use strict';

    const {seekers} = application.modules;
    const process = async specifier => {
        const seeker = seekers.create(specifier, distribution);
        await seeker.ready;

        const {valid, external} = seeker;
        seeker.destroy();
        if (!valid) return;

        await external?.ready;
        return external.resource(distribution);
    }

    const vspecifier = await process('@beyond-js/kernel/core');
    const split = vspecifier.split('/');
    split.pop();

    return split.join('/');
}