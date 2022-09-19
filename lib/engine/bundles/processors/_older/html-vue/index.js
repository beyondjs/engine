module.exports = {
    name: 'html-vue',
    sources: {
        extname: '.html'
    },
    packager: {
        compiler: () => require('./compiler'),
        Js: require('./code')
    }
};
