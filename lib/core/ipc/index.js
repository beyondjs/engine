const ipc = require('beyond/utils/ipc');

/**
 * Interprocess communication exposed actions
 *
 * @param core {object} The client core
 * @param http {object} The http manager
 */
module.exports = function (core, http) {
    'use strict';

    const model = require('./model');
    model.initialise(core, http);

    const procedures = new Map;
    require('./actions.js').forEach(action => ipc.handle(action, async (...params) => {
        const split = action.split('/');
        const method = split.pop();
        const path = `./${split.join('/')}`;

        let procedure;
        if (procedures.has(path)) {
            procedure = procedures.get(path);
        }
        else {
            const p = new (require(path))(model);
            procedures.set(path, p);
            procedure = p;
        }

        return await procedure[method](...params);
    }));
};
