module.exports = {
    name: 'sass',
    extname: ['.css'],
    bundle: {
        Bundle: require('./bundle'),
        processors: ['sass']
    }
};
