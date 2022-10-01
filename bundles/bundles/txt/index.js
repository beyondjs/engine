module.exports = {
    name: 'txt',
    extname: ['.js'],
    multilanguage: true,
    bundle: {
        Bundle: global.TxtBundle,
        processors: ['txt'],
        template: true
    },
};
