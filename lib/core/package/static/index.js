const ipc = require('beyond/utils/ipc');
const {ConfigurableFinder} = require('beyond/utils/finder');

module.exports = class extends ConfigurableFinder {
    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    configure(path, config) {
        this.#errors = [];
        config.includes = typeof config.includes === 'string' ? [config.includes] : config.includes;

        if (!(config.includes instanceof Array)) {
            this.#errors.push('Invalid includes configuration');
            super.configure();
            return;
        }
        super.configure(path, config);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'applications-static',
            filter: {application: this.#application.id}
        });
    }
}
