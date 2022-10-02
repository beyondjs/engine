const {fs} = global.utils;

module.exports = async function (specs, target, events) {
    const {core} = specs.legacy;
    const source = core.path;
    if (!source || !await fs.exists(source)) return;

    target = require('path').join(target, 'core');
    await fs.copy(source, target, {'recursive': true});

    events.emit('message', '. core build is completed');
}
