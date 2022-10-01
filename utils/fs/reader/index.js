module.exports = function (root, file) {
    'use strict';

    const fs = global.utils.fs;

    file = require('path').join(root, file);

    Object.defineProperty(this, 'root', {get: () => root});
    Object.defineProperty(this, 'file', {get: () => file});

    let exists, valid, content, error;
    Object.defineProperty(this, 'exists', {get: () => !!exists});
    Object.defineProperty(this, 'valid', {get: () => !!valid});
    Object.defineProperty(this, 'content', {get: () => content});
    Object.defineProperty(this, 'error', {get: () => error});

    let request;

    this.load = async function () {
        const now = Date.now();
        request = now;

        content = error = undefined;
        valid = false;
        exists = await fs.exists(file);
        if (request !== now) return;

        if (exists) {
            try {
                content = require(file);
                valid = true;
            }
            catch (exc) {
                error = `Configuration file "${file}" is invalid: ${exc.message}`;
                valid = false;
                return;
            }

            if (typeof content !== 'object') {
                error = `Configuration file "${file}" is not an object [${typeof error}]`;
                valid = false;
            }
        }
    }
}
