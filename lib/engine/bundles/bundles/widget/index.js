module.exports = {
	name: 'widget',
	extname: ['.js', '.css'],
	bundle: {
		Bundle: require('./bundle'),
		Packager: require('./bundle/packager'),
		Js: require('./bundle/code'),
		processors: ['ts', 'sass', 'html-vue', 'svelte', 'vue', 'less', 'scss', 'mdx'],
		template: true,
	},
	start: {
		Start: require('./start'),
	},
};
