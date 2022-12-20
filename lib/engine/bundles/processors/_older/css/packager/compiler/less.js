/**
 * Scss compiler
 *
 * @param source {string} The source code to be compiled
 */
module.exports = (source) => new Promise(resolve => {
    'use strict';

    // The sass compiler would return an error if no source code is provided
    if (!source) {
        resolve({code: ''});
        return;
    }

    require('less').render(source, {'compress': false}, (error, processed) => {
        if (!error) {
            resolve({code: processed.css.toString()});
            return;
        }

        const {line, column, message} = error;
        const errors = [{line: line, character: column, text: message}];
        resolve({errors: errors});
    });
});
