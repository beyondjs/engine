module.exports = class {
	constructor(specs) {
		console.log('Dummy Bundler constructor');
	}

	configure(config) {
		console.log('configure:', config);
	}
};
