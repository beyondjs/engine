module.exports = {
    name: 'js',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        processors: ['js']
    }
};
