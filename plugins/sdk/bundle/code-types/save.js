const {join, dirname} = require('path');
const cwd = process.cwd();
const fs = require('fs').promises;

module.exports = async function (targetedExport, code, map, diagnostics) {
    const {pkg, subpath} = targetedExport;
    const path = join(cwd, '.beyond/types', pkg.vname);
    const paths = {
        code: join(path, `${subpath}.d.ts`),
        map: join(path, `${subpath}.d.ts.map`)
    };

    try {
        map = JSON.stringify(map);
        await fs.mkdir(dirname(paths.code), {recursive: true});

        const promises = [];
        promises.push(fs.writeFile(paths.code, code, 'utf8'));
        promises.push(fs.writeFile(paths.map, map, 'utf8'));
        await Promise.all(promises);
    }
    catch (exc) {
        console.log(`Unable to write typescript declaration on "${path}": ${exc.message}`);
    }
}
