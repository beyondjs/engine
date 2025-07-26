module.exports = class {
    #server;
    #connections = new Set();

    #onConnection = conn => this.#connections.add(conn);
    #onDisconnect = conn => this.#connections.delete(conn);

    constructor(server) {
        this.#server = server;
        this.#server.on('connection', this.#onConnection);
        this.#server.on('disconnect', this.#onDisconnect);
    }

    destroy() {
        this.#server.off('connection', this.#onConnection);
        this.#server.off('disconnect', this.#onDisconnect);
        this.#connections.forEach(connection => connection.destroy());
    }
}
