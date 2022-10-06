const ipc = require('beyond/utils/ipc');

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

        const notify = (message, error, processed) => ipc.notify(`builder-notification`, {
            id: ++messageId,
            type: 'build/application/message',
            text: message,
            error: !!error,
            processed: !!processed,
            application: id
        });
        application.builder.on('message', notify);
        application.builder.on('error', message => notify(message, true));
        application.builder.on('processed', message => notify(message, false, true));
    }

    await application.builder.build(distribution);
}