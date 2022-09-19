const ts = require('typescript');

/**
 * Determines the dts file of the external
 *
 * @param pkg {string} The package name
 * @param path {string} The path of the package
 * @param typings {string} The typings resolved from 'typings' entry in the package.json
 * @param application {object} The application object
 * @return {{errors: [string]}|{dts}}
 */
module.exports = function (pkg, path, typings, application) {
    if (typings) {
        const dts = require('path').resolve(path, typings);
        return {dts};
    }
    else {
        const host = {fileExists: ts.sys.fileExists};
        path = require('path').join(application.path, 'any-directory');

        const {resolvedModule} = ts.resolveModuleName(pkg, path, {}, host);
        if (!resolvedModule) {
            return {errors: [`Typings not found`]};
        }

        return {dts: resolvedModule.resolvedFileName};
    }
}
