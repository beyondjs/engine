const {ipc} = global.utils;

// To register the message dispatchers only once
const dispatchers = new Set;
let messageId = 0;

module.exports = async function (application, distribution, specs) {
    'use strict';

    const {id} = application;
    if (application.builder.processing) throw new Error(`Application "${id}" already being built`);

    // Dispatch of events
    if (!dispatchers.has(id)) {
        dispatchers.add(id);

        const notify = (text, error, processed) =>
            ipc.notify(`project-process`, {
                id: ++messageId,
                text: text,
                type: 'process',
                error: !!error,
                moduleId: error?.module,
                processed: !!processed,
                application: application.item.id
            });
        application.builder.on('message', notify);
        application.builder.on('error', (message, error = true) => notify(message, error));
        application.builder.on('processed', message => notify(message, false, true));
    }

    await application.builder.build(distribution, specs);
}
