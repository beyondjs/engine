module.exports = function () {
    'use strict';

    /**
     * StandardError is not shown in console
     * @type {{new(): StandardError, prototype: StandardError}}
     */
    const StandardError = class extends Error {
    };
    Object.defineProperty(this, 'StandardError', {'get': () => StandardError});

    const ChainedException = class extends Error {
        constructor(exc, chained) {

            super();

            const message = `Chained exception: ${exc.message} | ${chained.message}`;
            this.message = message;
            this.stack = `${message}\n${chained.stack}\n${exc.stack}`;

        }
    };
    Object.defineProperty(this, 'ChainedException', {'get': () => ChainedException});

};
