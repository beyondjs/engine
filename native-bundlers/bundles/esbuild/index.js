module.exports = {
    name: 'esbuild',
    extname: ['.js'],
    bundle: {
        Bundle: require('./bundle'),
        Packager: require('./bundle/packager')
    }
};
