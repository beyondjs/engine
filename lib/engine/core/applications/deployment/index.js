const ipc = require('@beyond-js/ipc/main');
const DynamicProcessor = require('@beyond-js/dynamic-processor')();

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'application.deployment';
	}

	#application;

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.#errors.length;
	}

	#distributions;
	get distributions() {
		return this.#distributions;
	}

	#build;
	get build() {
		return this.#build;
	}

	constructor(application, config) {
		super();
		this.#application = application;
		this.#distributions = new (require('./distributions'))(application);
		super.setup(new Map([['config', { child: config }]]));
	}

	_process() {
		const config = this.children.get('config').child;
		if (!config.valid) {
			this.#errors = config.errors.slice();
			this.#distributions.configure();
			return;
		}

		const value = config.value ? config.value : {};
		this.#distributions.configure(value.distributions);
		this.#build = value.build;
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'record/update',
			table: 'applications-deployments',
			id: this.#application.id
		});
	}
};
