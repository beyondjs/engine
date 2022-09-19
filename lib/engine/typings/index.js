const ts = require('typescript');
const fs = require('fs').promises;
const host = {fileExists: ts.sys.fileExists, readFile: ts.sys.readFile};

const cached = new Map();

module.exports = async function (path, pkg) {
    if (cached.has(pkg)) return cached.get(pkg);

    const done = response => {
        cached.set(pkg, response);
        return response;
    }

    const containingFile = `${path}/container`;
    const {resolvedModule} = ts.resolveModuleName(pkg, containingFile, {}, host);
    if (!resolvedModule) {
        return done({error: `Typings of package "${pkg}" not found`});
    }

    const file = resolvedModule.resolvedFileName;
    const dts = await fs.readFile(file, 'utf8');

    return done({dts});
}