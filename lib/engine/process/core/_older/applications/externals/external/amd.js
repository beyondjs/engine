const toHtml = new (require('ansi-to-html'));

// Convert from ES6 module to an AMD module
module.exports = function (content) {
    'use strict';

    let output;
    try {
        output = require('@babel/core').transform(content, {
            cwd: __dirname,
            compact: false,
            plugins: [['@babel/plugin-transform-modules-amd', {importInterop: 'none'}]]
        });
    }
    catch (exc) {
        let message = toHtml.toHtml(exc.message);
        message = message.replace(/\n/g, '<br/>');
        message = `<div style="background: #333; color: white;">${message}</div>`;
        message = `Error transforming to AMD module: <br/><br/>${message}`;
        return {errors: [message]};
    }

    return {content: output.code};
}
