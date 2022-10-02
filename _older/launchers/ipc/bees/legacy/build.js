const {ipc} = global.utils;

let messageId = 0;

// To register the message dispatchers only once
const dispatchers = new Set;

module.exports = instances => async function (id, instance) {
    'use strict';

    const bee = await require('../get')(instances, instance, id);
    if (!bee) {
        throw new Error(`BEE "${id}" not found`);
    }

    const builder = new (require('./builder'))(bee);

    // Dispatch of events
    if (!dispatchers.has(id)) {
        dispatchers.add(id);
        builder.on('message', message => ipc.events.emit('legacy-builder-notification', {
            bee: id,
            id: ++messageId,
            text: message
        }));
    }

    return builder.build();
}
