const {ipc} = global.utils;

// To register the message dispatchers only once
const dispatchers = new Set;
let messageId = 0;

module.exports = async function (applications, path, distribution) {
    'use strict';

    await applications.ready;
    if (!applications.has(path)) return;

    const application = applications.get(path);
    const {id} = application;
    if (application.builder.processing) throw new Error(`Application "${id}" already being built`);
    await application.ready;

    // Dispatch of events
    if (!dispatchers.has(id)) {
        dispatchers.add(id);

        const notify = (message, error) => ipc.notify(`builder-notification`, {
            type: 'build/application/message',
            application: id,
            error: error ? true : undefined,
            id: ++messageId,
            text: message
        });

        application.builder.on('message', notify);
        application.builder.on('error', message => notify(message, true));
    }

    await application.builder.build(distribution);
}
