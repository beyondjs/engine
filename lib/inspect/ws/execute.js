/**
 * Execute an action
 *
 * @param rq {*} The request to be executed
 * @param actions {*} The actions object
 * @returns {function(*): (*|void)}
 */
module.exports = async function (rq, actions) {
    'use strict';

    if (!rq.id) {
        throw 'Action id not set';
    }
    else if (typeof rq.module !== 'string') {
        throw 'Module id is invalid or not set';
    }
    else if (typeof rq.action !== 'string' || !rq.action) {
        throw 'Action is invalid or not set';
    }
    else if (rq.params && !(rq.params instanceof Array)) {
        throw new Error('Invalid parameters');
    }

    // Find the method in the actions object
    const method = (() => {
        const action = (rq.action.startsWith('/') ? rq.action.substr(1) : rq.action).split('/');

        let method = actions;
        for (const property of action) {
            if (typeof method !== 'object' || !method[property]) {
                method = void 0;
                break;
            }
            method = method[property];
        }
        return method;
    })();

    if (typeof method !== 'function') {
        throw new global.errors.StandardError(`Action "${rq.action.join('/')}" not found`);
    }

    // Execute the action
    const params = rq.params ? rq.params : [];
    return await method(...params);
}
