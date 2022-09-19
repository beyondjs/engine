module.exports = {
    name: 'code',
    extname: ['.js', '.css'],
    bundle: {
        processors: ['ts', 'sass', 'js', 'jsx', 'less', 'scss', 'svelte', 'vue'],
        template: true
    }
};
