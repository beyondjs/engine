module.exports = {
    name: 'txt',
    sources: {
        overwrites: true,
        extname: '.json'
    },
    packager: {
        compiler: () => require('./packager/compiler'),
        declaration: () => require('./packager/declaration'),
        Js: require('./packager/js')
    }
};
