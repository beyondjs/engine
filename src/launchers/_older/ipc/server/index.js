module.exports = function (instances) {
    'use strict';

    const bees = instances.get('main');

    this.config = () => ({
        'errors': bees.errors,
        'warnings': bees.warnings
    });
}
