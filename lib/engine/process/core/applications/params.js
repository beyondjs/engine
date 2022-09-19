module.exports = function () {
    'use strict';

    const events = new (require('events').EventEmitter);
    this.on = function (event) {
        if (event !== 'change') throw new Error('Invalid parameters');
        events.on.call(events, ...arguments);
    };
    this.removeListener = (event, listener) => events.removeListener(event, listener);

    let tu = Date.now(), config, errors = [], warnings = [];
    Object.defineProperty(this, 'tu', {'get': () => tu});
    Object.defineProperty(this, 'config', {'get': () => config});
    Object.defineProperty(this, 'errors', {'get': () => errors});
    Object.defineProperty(this, 'warnings', {'get': () => warnings});

    let value;
    Object.defineProperty(this, 'value', {'get': () => value ? value : {}});

    const update = () => {

        if (!config.valid) {
            errors = config.errors.slice();
            this.destroy().catch(exc => console.error(exc.stack));
            events.emit('change');
            value = undefined;
            return;
        }

        value = config.value;
        events.emit('change');

    };

    this.configure = function (value) {

        if (config === value) return;
        config ? config.removeListener('change', update) : null;

        config = value;
        config ? config.on('change', update) : null;

        update();

    };

    this.destroy = () => config ? config.removeListener('change', update) : null;

};
