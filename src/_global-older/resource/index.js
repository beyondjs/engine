module.exports = function (specs) {
    'use strict';

    if (typeof specs !== 'object') {
        throw new Error('invalid arguments on resource constructor');
    }

    // Used by the builder to know where is the relative path of the static file
    Object.defineProperty(this, 'relative', {'get': () => specs.relative});

    let type, file, content, contentType;
    Object.defineProperty(this, 'type', {'get': () => type});
    Object.defineProperty(this, 'file', {'get': () => file});
    Object.defineProperty(this, 'content', {'get': () => content});
    Object.defineProperty(this, 'contentType', {'get': () => contentType});

    const contentTypes = (require('./content-types.js'));
    if (specs.extname && !contentTypes.hasOwnProperty(specs.extname)) {
        throw new Error(`Content type for extension "${specs.extname}" not found`);
    }

    if (specs.file) {
        let extname = require('path').extname(specs.file);
        contentType = contentTypes[extname];
        contentType = contentType ? contentType : 'text/plain';

        type = 'file';
        file = specs.file;
    }
    else if (specs['404']) {
        type = '404';
        content = specs['404'];
        contentType = specs.extname ? contentTypes[specs.extname] : 'text/plain';
    }
    else if (specs['500']) {
        type = '500';
        content = specs['500'];
        contentType = specs.extname ? contentTypes[specs.extname] : 'text/plain';
    }
    else if (typeof specs.content === 'string') {
        if (!specs.extname) throw new Error('Property extname must be specified');
        type = 'content';
        content = specs.content;
        contentType = contentTypes[specs.extname];
    }
    else {
        console.error('Invalid specification:', Object.keys(specs), 'specs.content type:', typeof specs.content);
        throw new Error('Invalid resource specification');
    }
}
