const {pathToFileURL} = require('url');
const packages = require('uimport/packages');
const p = require('path');

module.exports = function (parsed, application) {
    const {pkg} = (() => {
        return {pkg: packages.get(parsed.pkg, {cwd: application.path})};
    })();

    if (!pkg || pkg.error) return;

    const relative = !parsed.subpath ? pkg.json.sass : parsed.subpath;
    if (!relative) throw new Error(`File "${relative}" not found on package "${parsed.pkg}"`);

    const path = p.join(pkg.path, relative);
    return pathToFileURL(path);
}