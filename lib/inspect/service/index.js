const {ipc} = global.utils;

module.exports = class {
    #builder;

    get builder() {
        return this.#builder;
    }

    #dashboard;
    get dashboard() {
        return this.#dashboard;
    }

    #sources;
    get sources() {
        return this.#sources;
    }

    constructor() {
        const ipc = require('./ipc-manager');
        this.#builder = new (require('./builder'))(ipc);
        this.#dashboard = new (require('./dashboard'))(ipc);
        this.#sources = new (require('./sources'))();
    }

    setup(io) {
        ipc.events.on('engine', 'data-notification', message => {
            const {type} = message;
            if (!['record/update', 'list/update', 'record/field/update'].includes(type)) {
                console.error(`Invalid client data-notification type "${type}"`);
                return;
            }
            io.emit(`client:plm/${type}`, message);
        });

        ipc.events.on('engine', 'declarations-save', message =>
            io.emit(`declaration-save:${message.applicationId}`, message)
        );

        ipc.events.on('engine', 'application-styles', message => io.emit('application-styles', message));

        ipc.events.on('engine', 'global-styles', message => io.emit('global-styles', message));

        ipc.events.on('engine', 'bundles', message => {
            switch (message.type) {
                case 'change':
                    const {specifier, vspecifier, extname, distribution, language} = message;
                    io.emit(`bundle/change`, {specifier, vspecifier, extname, distribution, language});
                    break;
            }
        });

        ipc.events.on('engine', 'project-process', message => {
            const {type} = message;
            if (!['process'].includes(type)) {
                console.error(`Invalid application-process type "${type}"`);
                return;
            }
            io.emit(`project-process:${message.application}`, message);
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
