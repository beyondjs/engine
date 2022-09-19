const p = require('path');
const {fs} = global.utils;
/*
 Read dependencies package.json and generate static resources
 */
module.exports = async function (externals, application, paths) {
    for (const external of [...externals.keys()]) {
        const split = external.split('/');
        const id = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();

        if (!await fs.exists(p.join(application.path, 'node_modules', id, 'package.json'))) continue;

        const file = await fs.readFile(p.join(application.path, 'node_modules', id, 'package.json'), 'utf8');
        const json = JSON.parse(file);
        if (!json.static) continue;

        for (const file of Object.values(json.static)) {
            const source = p.join(application.path, 'node_modules', id, file);
            const target = p.join(paths.www, 'packages', id, file);

            await fs.mkdir(p.join(target, '..'), {'recursive': true});
            await fs.copyFile(source, target);
        }
    }
}