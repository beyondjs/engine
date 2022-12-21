const ports = (require('@beyond-js/ports'));
const {Finder, ConfigurableFinder, FinderCollection, Files, File} = require('@beyond-js/finder');
const DynamicProcessor = require('@beyond-js/dynamic-processor');
const {Config, ConfigCollection} = require('@beyond-js/config');
const fs = require('@beyond-js/fs');
const ipc = require('@beyond-js/ipc');
const equal = require('@beyond-js/equal');
const md5 = require('@beyond-js/md5');
const crc32 = require('@beyond-js/crc32');
const BackgroundWatcher = require('@beyond-js/watchers/client');

const code = (require('./code'));
const environments = (require('./environments'));

require('./pending-promise');

module.exports = new class {
    get ports() {
        return ports;
    }

    get Finder() {
        return Finder;
    }

    get ConfigurableFinder() {
        return ConfigurableFinder;
    }

    get FinderCollection() {
        return FinderCollection;
    }

    get FinderFiles() {
        return Files;
    }

    get FinderFile() {
        return File;
    }

    get DynamicProcessor() {
        return DynamicProcessor;
    }

    get Config() {
        return Config;
    }

    get ConfigCollection() {
        return ConfigCollection;
    }

    get fs() {
        return fs;
    }

    get code() {
        return code;
    }

    get ipc() {
        return ipc;
    }

    get equal() {
        return equal;
    }

    get md5() {
        return md5;
    }

    get crc32() {
        return crc32;
    }

    get environments() {
        return environments;
    }

    get watchers() {
        return {BackgroundWatcher};
    }
}
