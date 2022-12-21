const PendingPromise = function () {
    'use strict';

    let resolve, reject;
    let promise = new Promise((x, y) => {
        resolve = x;
        reject = y;
    });

    let output = {};
    output.resolve = value => resolve(value);
    output.reject = value => reject(value);

    Object.defineProperty(output, 'value', {'get': () => promise});

    return output;

};

Promise.pending = PendingPromise;
