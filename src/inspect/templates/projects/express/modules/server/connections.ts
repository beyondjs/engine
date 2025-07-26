export class Connections {
    #server: any;
    #connections: Set<any> = new Set();

    #onConnection = (conn: any) => this.#connections.add(conn);
    #onDisconnect = (conn: any) => this.#connections.delete(conn);

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