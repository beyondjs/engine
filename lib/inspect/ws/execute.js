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
    else if (typeof rq.params !== void 0 && typeof rq.params !== 'object') {
        throw new Error('Invalid parameters')
    }

    // Find the method in the actions object
    const method = (() => {
        const action = (rq.action.startsWith('/') ? rq.action.substr(1) : rq.action).split('/');
console.log('action to be executed', rq.action)
        let method = actions;
        for (const property of action) {
            if (typeof method !== 'object' || !method[property]) {
                method = void 0;
                break;
            }
            method = method[property];
            console.log('property:', property, method, method.name);
        }

        return method;
    });

    if (typeof method !== 'function') {
        throw new global.errors.StandardError(`Action "${rq.action.join('/')}" not found`);
    }

    // Execute the action
    const params = typeof rq.params === 'object' ? rq.params : {};

    console.log(1, rq.action, method, method.name);
    const response = await method(params);
    console.log(2, rq.action, response);
    return response;
}
