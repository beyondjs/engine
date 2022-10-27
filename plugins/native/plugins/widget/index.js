module.exports = {
    name: 'widget',
    extname: ['.js', '.css'],
    bundle: {
        Bundle: require('./bundle'),
        Js: require('./bundle/code'),
        processors: ['ts', 'sass', 'html-vue', 'svelte', 'vue', 'less', 'scss']
    },
    start: {
        Start: require('./start')
    },
    template: true
};
