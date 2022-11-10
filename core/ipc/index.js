const ipc = require('beyond/utils/ipc');
const registry = require('./registry');
const Actions = require('./actions');

/**
 * Actions exposed for interprocess communication
 */
module.exports = function () {
    'use strict';

    const actions = new Actions();

    const procedures = new Map;
    registry.forEach(action => ipc.handle(action, async (...params) => {
        const split = action.split('/');
        const method = split.pop();
        const path = `./${split.join('/')}`;

        let procedure;
        if (procedures.has(path)) {
            procedure = procedures.get(path);
        }
        else {
            const p = new (require(path))(actions);
            procedures.set(path, p);
            procedure = p;
        }

        return await procedure[method](...params);
    }));
};
