const {relative} = require('path');
const cwd = process.cwd();

/**
 * Look for a module contained in a list of modules of the application or one of its imported libraries
 *
 * @param url {object} The url being requested
 * @param modules {Map<string, object>} The collection of modules where the key is the relative path of the module
 * @param path {string} The path where the modules are located
 * @return {{}|{resource: {path: string, filename: string}, module}}
 */
module.exports = (url, modules, path) => {
    'use strict';

    const split = url.pathname.substr(1).split('/');

    let rpath = relative(cwd, path);
    rpath = rpath.replace(/\\/g, '/');
    let levels = (rpath.match(/\//g) || []).length + 1;

    const spliced = split.splice(0, levels).join('/');
    if (spliced !== rpath) return {};

    const {found, module, resource} = (() => {
        let module, found = false;
        const filename = split.pop();
        const resource = {path: '', filename};

        // Iterate looking for the module path
        while (split.length) {
            const path = split.join('/');
            if (modules.has(path)) {
                found = true;
                module = modules.get(path);
                break;
            }
            resource.path = split.pop() + (resource.path ? `/${resource.path}` : '');
        }
        if (found) return {found, module, resource};

        // If no module were found, check if the module is in the root of the project,
        // so relative found is an empty string
        if (modules.has('')) {
            const module = modules.get('');
            return {found: true, module, resource};
        }
        return {};
    })();

    return found ? {module, resource} : {};
}
