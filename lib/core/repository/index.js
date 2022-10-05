module.exports = class {
    #connections;
    #server;

    /**
     * Repository server constructor
     *
     * @param packages {any} The packages collection
     * @param port {number} The server port number
     * @param specs {{gzip?: boolean}} The server specification
     */
    constructor(packages, {port}, specs) {
        console.log('Local repository port is:', port);
        console.log(`http://localhost:${port}`);

        const error = error => console.log('Repository server error caught:', error.stack);

        const listener = require('./listener')(packages, specs);
        this.#server = require('http').createServer(listener);
        this.#connections = new (require('./connections'))(this.#server);
        this.#server.on('error', error).listen(port);
    }
}
