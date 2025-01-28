const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'module.exports';
	}

	#module;

	constructor(module) {
		super();
		this.#module = module;

		super.setup(new Map([['module', { child: module }]]));
	}

	_prepared(require) {
		// We must be sure that the bundler exports is set as a child of the module exports
		if (this.#module.bundler && !this.children.has('bundler.exports')) {
			this.children.register(new Map([['bundler.exports', { child: this.#module.bundler.exports }]]));
			require(this.#module.bundler.exports);
		}
		if (!this.#module.bundler && this.children.has('bundler.exports')) {
			this.children.unregister('bundler.exports');
		}
	}

	_process() {
		if (!this.children.has('bundler.exports')) return;
		const { exports } = this.#module.bundler;

		this.clear();
		exports.forEach((exp, condition) => this.set(condition, exp));
	}
};
