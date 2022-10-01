module.exports = new (function () {
    'use strict';

    const fs = require('fs');
    const {promisify} = require('util');

    const exists = promisify(fs.exists);
    Object.defineProperty(this, 'exists', {get: () => exists});

    const stat = promisify(fs.stat);
    Object.defineProperty(this, 'stat', {get: () => stat});

    const readdir = promisify(fs.readdir);
    Object.defineProperty(this, 'readdir', {get: () => readdir});

    const readFile = promisify(fs.readFile);
    Object.defineProperty(this, 'readFile', {get: () => readFile});

    const rename = promisify(fs.rename);
    Object.defineProperty(this, 'rename', {get: () => rename});

    const unlink = promisify(fs.unlink);
    Object.defineProperty(this, 'unlink', {get: () => unlink});

    const open = promisify(fs.open);
    Object.defineProperty(this, 'open', {get: () => open});

    const close = promisify(fs.close);
    Object.defineProperty(this, 'close', {get: () => close});

    const appendFile = promisify(fs.appendFile);
    Object.defineProperty(this, 'appendFile', {get: () => appendFile});

    const copyFile = promisify(fs.copyFile);
    Object.defineProperty(this, 'copyFile', {get: () => copyFile});

    const rmdir = promisify(fs.rmdir);
    Object.defineProperty(this, 'rmdir', {get: () => rmdir});

    Object.defineProperty(this, 'constants', {get: () => fs.constants});
    Object.defineProperty(this, 'createReadStream', {get: fs.createReadStream});
    Object.defineProperty(this, 'createWriteStream', {get: fs.createWriteStream});

    Object.defineProperty(this, 'promises', {get: () => fs.promises});

    const mkdir = require('./mkdir');
    Object.defineProperty(this, 'mkdir', {get: () => mkdir});

    const copy = require('./copy')(this);
    Object.defineProperty(this, 'copy', {get: () => copy});

    const save = require('./save')(this);
    Object.defineProperty(this, 'save', {get: () => save});

    const Reader = require('./reader');
    Object.defineProperty(this, 'Reader', {get: () => Reader});

    const pSave = require('./promises')(this);
    Object.defineProperty(this, 'savePromises', {get: () => pSave});
})();
