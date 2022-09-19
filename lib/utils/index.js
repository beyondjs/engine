module.exports = new function () {
    'use strict';

    const log = (require('./log'));
    Object.defineProperty(this, 'log', {get: () => log});

    const finder = (require('./finder'));
    Object.defineProperty(this, 'Finder', {get: () => finder.Finder});
    Object.defineProperty(this, 'ConfigurableFinder', {get: () => finder.ConfigurableFinder});
    Object.defineProperty(this, 'FinderCollection', {get: () => finder.FinderCollection});
    Object.defineProperty(this, 'FinderFiles', {get: () => finder.Files});
    Object.defineProperty(this, 'FinderFile', {get: () => finder.File});

    const DynamicProcessor = (require('./dynamic-processor'));
    Object.defineProperty(this, 'DynamicProcessor', {get: () => DynamicProcessor});

    const Config = (require('./config/object'));
    Object.defineProperty(this, 'Config', {get: () => Config});

    Object.defineProperty(this, 'ConfigCollection', {get: () => require('./config/elements/collection')});

    const fs = (require('./fs'));
    Object.defineProperty(this, 'fs', {get: () => fs});

    const code = (require('./code'));
    Object.defineProperty(this, 'code', {get: () => code});

    const ipc = (require('./ipc'));
    Object.defineProperty(this, 'ipc', {get: () => ipc});

    const watchers = (require('./watchers'));
    Object.defineProperty(this, 'watchers', {get: () => watchers});

    require('./pending-promise');

    const equal = (require('./equal'));
    Object.defineProperty(this, 'equal', {get: () => equal});

    const md5 = (require('./md5'));
    Object.defineProperty(this, 'md5', {get: () => md5});

    const crc32 = (require('./crc32'));
    Object.defineProperty(this, 'crc32', {get: () => crc32});

    const environments = (require('./environments'));
    Object.defineProperty(this, 'environments', {get: () => environments.slice()});
}
