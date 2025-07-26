const {Server} = require('socket.io');
const Connection = require('./connection');

module.exports = class {
    #actions;
    #connections = new Map();
    #destroyed;

    #server;
    get server() {
        return this.#server;
    }

    constructor(httpServer, actions) {
        this.#actions = actions;

        // Create ws server
        const options = {serveClient: false, maxHttpBufferSize: 100000};
        this.#server = new Server(httpServer, options);
        this.#server.on('connection', this.#onConnection);
    }

    #onConnection = async (socket) => {
        const connection = new Connection(socket, this.#actions);
        const connections = this.#connections;
        connections.set(socket.id, connection);

        const disconnect = async () => {
            connections.delete(socket.id);
            connection.disconnect();
            socket.off('disconnect', _disconnect);
        };
        const _disconnect = () => disconnect().catch(exc => console.error(exc.stack));

        socket.on('disconnect', _disconnect);
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#server?.off('connection', this.#onConnection);
    }
}
