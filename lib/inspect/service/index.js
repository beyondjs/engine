const {ipc} = global.utils;

module.exports = class {
    setup(io) {
        ipc.events.on('engine', 'data-notification', message => {
            const {type} = message;
            if (!['record/update', 'list/update', 'record/field/update'].includes(type)) {
                console.error(`Invalid client data-notification type "${type}"`);
                return;
            }
            io.emit(`client:plm/${type}`, message);
        });

        ipc.events.on('engine', 'builder-notification', message => {
            const {type} = message;
            if (!['build/application/message', 'build/application/error'].includes(type)) {
                console.error(`Invalid application builder-notification type "${type}"`);
                return;
            }
            io.emit(`builder:${message.application}`, message);
        });

        ipc.events.on('engine', 'declarations-save', message =>
            io.emit(`declaration-save:${message.applicationId}`, message)
        );

        ipc.events.on('engine', 'bundles', message => {
            switch (message.type) {
                case 'change':
                    const {bundle, extname, distribution, language} = message;
                    io.emit(`bundle/change`, {bundle, extname, distribution, language});
                    break;
            }
        });

        ipc.events.on('engine', 'application-styles', message => {
            io.emit('application-styles', message);
        });

        ipc.events.on('engine', 'global-styles', message => {
            io.emit('global-styles', message);
        });

        ipc.events.on('main', 'data-notification', message => {
            const {type} = message;
            if (!['record/update', 'list/update', 'record/field/update'].includes(type)) {
                console.error(`Invalid server data-notification type "${type}"`);
                return;
            }
            io.emit(`server:plm/${message.type}`, message);
        });

        ipc.events.on('main', 'bee.log', message => io.emit(`bees.log`, message));
    }
}