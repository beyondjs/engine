const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class extends DynamicProcessor {
	#is;

	#errors = [];
	get errors() {
		return this.#errors;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	get valid() {
		return !this.#errors.length;
	}

	#config;
	constructor(is, config) {
		super();
		//TODO: Review the use of setMaxListeners
		this.setMaxListeners(1000);
		if (!['bundles', 'processors'].includes(is)) throw new Error('Invalid parameters');
		this.#config = config;
		super.setup(new Map([['config', {}]]));
	}

	_process() {
		for (const path of this.#config) {
			try {
				const item = require(path);

				if (typeof item.name !== 'string' || !item.name) {
					this.#warnings.push(`Item name is invalid on path "${path}"`);
					continue;
				}
				if (this.has(item.name)) {
					this.#warnings.push(`Item "${item.name}" is already registered`);
					continue;
				}
				this.set(item.name, item);
			} catch (exc) {
				this.#errors.push(`Error registering items of path "${path}": ${exc.message}`);
			}
		}
	}
};
