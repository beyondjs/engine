module.exports = {
    name: 'esbuild',
    extname: ['.js'],
    bundle: {
        Packager: require('./bundle/packager')
    }
};
