module.exports = instances => async function (instance) {
    'use strict';

    instance = instance ? instance : 'main';
    if (!['main', 'dashboard'].includes(instance)) throw new Error(`Instance "${instance}" is invalid`);
    const bees = instances.get(instance);
    await bees.ready;

    const bee = bees.local;
    await bee.ready;
    return await bee.start();
}
