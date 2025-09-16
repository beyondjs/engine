module.exports = {
	name: 'tailwind',
	extname: ['.css'],
	bundle: {
		Bundle: require('./bundle'),
		processors: ['tailwind'],
	},
};
