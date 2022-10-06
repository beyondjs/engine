module.exports = {
    name: 'bridge',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        Packager: require('./packager'),
        Js: require('./code'),
        processors: ['ts']
    }
};
