const DynamicProcessor = require('@beyond-js/dynamic-processor');
const { ConfigCollection } = require('@beyond-js/config');
const { Config } = require('@beyond-js/config');
const finder = require('@beyond-js/finder');
const ports = require('@beyond-js/ports');
const equal = require('@beyond-js/equal');
const crc32 = require('@beyond-js/crc32');
const code = require('@beyond-js/code');
const log = require('@beyond-js/log');
const ipc = require('@beyond-js/ipc');
const md5 = require('@beyond-js/md5');

require('./pending-promise');
const fs = require('./fs');
const watchers = require('./watchers');
const environments = require('./environments');

module.exports = new (function () {
	'use strict';

	Object.defineProperty(this, 'ports', { get: () => ports });
	Object.defineProperty(this, 'log', { get: () => log });
	Object.defineProperty(this, 'Finder', { get: () => finder.Finder });
	Object.defineProperty(this, 'ConfigurableFinder', { get: () => finder.ConfigurableFinder });
	Object.defineProperty(this, 'FinderCollection', { get: () => finder.FinderCollection });
	Object.defineProperty(this, 'FinderFiles', { get: () => finder.Files });
	Object.defineProperty(this, 'FinderFile', { get: () => finder.File });
	Object.defineProperty(this, 'DynamicProcessor', { get: () => DynamicProcessor });
	Object.defineProperty(this, 'Config', { get: () => Config });
	Object.defineProperty(this, 'ConfigCollection', { get: () => ConfigCollection });
	Object.defineProperty(this, 'fs', { get: () => fs });
	Object.defineProperty(this, 'code', { get: () => code });
	Object.defineProperty(this, 'ipc', { get: () => ipc });
	Object.defineProperty(this, 'watchers', { get: () => watchers });
	Object.defineProperty(this, 'equal', { get: () => equal });
	Object.defineProperty(this, 'md5', { get: () => md5 });
	Object.defineProperty(this, 'crc32', { get: () => crc32 });
	Object.defineProperty(this, 'environments', { get: () => environments.slice() });
})();
