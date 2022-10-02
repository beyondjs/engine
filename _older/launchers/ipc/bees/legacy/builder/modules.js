const {fs} = global.utils;

module.exports = async function (specs, target, events) {
    const {path} = specs.legacy.modules
    const finder = new global.utils.Finder(path, {'filename': 'module.json', 'excludes': []});
    await finder.ready;
    const {files} = finder;

    for (const file of files) {
        let config;
        try {
            config = require(file.file);
        }
        catch (exc) {
            events.emit('error', `. module configuration file "${file.relative.dirname}" is invalid`);
            continue;
        }

        if (!config.server) continue;

        const source = require('path').join(file.dirname, config.server);
        if (!source || !await fs.exists(source)) return;

        const targets = {
            folder: require('path').join(target, 'modules', file.relative.dirname),
            config: require('path').join(target, 'modules', file.relative.dirname, 'module.json')
        };

        await fs.copy(source, targets.folder, {'recursive': true});
        await fs.save(targets.config, JSON.stringify({name: config.name, server: './'}));

        let dirname = file.relative.dirname;
        dirname = dirname ? dirname : 'main';
        events.emit('message', `. module "${dirname}" is built`);
    }
}
