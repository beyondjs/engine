module.exports = async function (instances) {
    'use strict';

    const bees = instances.get('main');
    await bees.ready;

    const bee = bees.compiledDashboard;
    await bee.ready;
    return bee;
}
