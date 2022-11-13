module.exports = {
    name: 'esbuild',
    extname: ['.js'],
    bundle: {
        Packager: require('./packager')
    }
};
