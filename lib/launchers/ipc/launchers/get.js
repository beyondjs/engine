module.exports = async function (instances, instance, id) {
    'use strict';

    instance = instance ? instance : 'main';
    if (!['main', 'dashboard'].includes(instance)) throw new Error(`Instance "${instance}" is invalid`);
    const bees = instances.get(instance);
    await bees.ready;

    const bee = (() => {
        if (id === '@beyond-js/local/legacy') return bees.local;

        // Check if the id is `${key}/${distribution}` or `${pkg/distribution}`
        const split = id.split('/');
        if (!/[a-zA-Z]+/.test(split[0])) return bees.get(id);

        return [...bees.values()].find(bee => {
            return `${bee.specs.project.pkg}/${bee.specs.distribution.name}` === id;
        });
    })();
    await bee?.ready;
    return bee;
}
