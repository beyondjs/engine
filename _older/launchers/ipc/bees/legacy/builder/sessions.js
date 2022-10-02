const {fs} = global.utils;

module.exports = async function (specs, target, events) {
    const {sessions} = specs.legacy;
    const source = sessions.path;
    if (!source || !await fs.exists(source)) return;

    target = require('path').join(target, 'sessions');
    await fs.copy(source, target, {'recursive': true});

    events.emit('message', '. sessions build is completed');
}
