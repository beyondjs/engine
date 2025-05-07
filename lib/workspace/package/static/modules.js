const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class extends DynamicProcessor {
	#modules;

	constructor(modules) {
		super();

		this.#modules = modules;
		super.setup(new Map([['modules', { child: modules.resolvers.entries }]]));
	}

	_process() {
		// Process the list of modules entries
	}
};
