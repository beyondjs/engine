module.exports = {
    name: 'vue',
    sources: {
        extname: ['.vue']
    },
    Dependencies: require('./processor/dependencies'),
    extender: {
        Preprocessor: require('./extender/preprocessor'),
        extends: ['ts', 'sass']
    },
    packager: {
        compiler: () => require('./packager/compiler'),
        Js: require('./packager/js'),
        Css: require('./packager/css')
    }
};
