const { Config } = require('@beyond-js/config');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Set);
const BEESpecs = require('./specs');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'launchers.config';
	}

	/**
	 * BEEs config constructor
	 *
	 * @param path {string} The path where the beyond.json is located
	 */
	constructor(path) {
		super();

		const config = new Config(path, {
			'/packages': 'array',
			'/packages/children/deployment': 'object'
		});
		config.data = 'beyond.json';

		const applications = new (require('./applications'))(config.properties.get('packages'));
		super.setup(new Map([['applications', { child: applications }]]));
	}

	_process() {
		this.clear();

		// Add the bees required by the distributions specified in each project
		const applications = this.children.get('applications').child;
		applications.forEach(item => this.add(new BEESpecs(item)));
	}
};
