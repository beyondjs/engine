module.exports = instances => async function (projects, instance) {
    'use strict';

    instance = instance ? instance : 'main';
    if (!['main', 'dashboard'].includes(instance)) throw new Error(`Instance "${instance}" is invalid`);
    const bees = instances.get(instance);
    await bees.ready;

    const promises = [];
    bees.forEach(bee => promises.push(bee.ready));
    await Promise.all(promises);

    const output = {};
    for (const project of projects) {
        output[project] = [];
        for (const bee of bees.values()) {
            if (bee.specs.project.id !== project) continue;

            output[project].push({
                id: bee.id,
                status: bee.status,
                pid: bee.pid,
                path: bee.specs.path,
                error: bee.error,
                ports: bee.specs.ports
            });
        }
    }

    return output;
}