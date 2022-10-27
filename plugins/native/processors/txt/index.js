module.exports = {
    name: 'txt',
    sources: {extname: '.json'},
    packager: {
        compiler: () => require('./packager/compiler'),
        declaration: () => require('./packager/declaration'),
        Js: require('./packager/js')
    }
};
