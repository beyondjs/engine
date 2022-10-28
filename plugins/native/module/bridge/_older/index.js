module.exports = {
    name: 'bridge',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        Js: require('./code'),
        processors: ['ts']
    }
};
