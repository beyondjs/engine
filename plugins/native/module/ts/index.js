module.exports = {
    name: 'ts',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        processors: ['ts']
    }
};
