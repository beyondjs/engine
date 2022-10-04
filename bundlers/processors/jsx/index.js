module.exports = {
    name: 'jsx',
    sources: {
        extname: '.jsx'
    },
    Dependencies: require('./processor/dependencies'),
    packager: {
        compiler: () => require('./packager/compiler'),
        Js: require('./packager/js')
    }
};
