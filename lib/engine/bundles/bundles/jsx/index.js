module.exports = {
    name: 'jsx',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        processors: ['jsx']
    }
};
