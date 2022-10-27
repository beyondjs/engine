module.exports = {
    name: 'start-backend',
    processors: ['ts'],
    Transversal: global.Transversal,
    TransversalPackager: require('./packager'),
    TransversalCodePackager: require('./code'),
    Bundle: global.Bundle
};
