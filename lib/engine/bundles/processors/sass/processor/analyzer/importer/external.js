const {pathToFileURL} = require('url');
const packages = require('uimport/packages');
const p = require('path');

module.exports = async function (parsed, application) {
    const {pkg} = await (async () => {
        const pkg = packages.get(parsed.pkg, {cwd: application.path});
        await pkg.process();
        return {pkg};
    })();

    if (!pkg || pkg.error) return;

    const file = !parsed.file ? pkg.json.sass : parsed.file;
    if (!file) throw new Error(`File "${file}" not found on package "${parsed.pkg}"`);

    const path = p.join(pkg.path, file);
    return pathToFileURL(path);
}
