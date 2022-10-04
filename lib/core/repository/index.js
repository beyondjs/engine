module.exports = class {
    #connections;
    #server;

    constructor(packages, {port}) {
        console.log('Local repository port is:', port);
        console.log(`http://localhost:${port}`);

        const error = error => console.log('Repository server error caught:', error.stack);

        const listener = require('./listener')(packages);
        this.#server = require('http').createServer(listener);
        this.#connections = new (require('./connections'))(this.#server);
        this.#server.on('error', error).listen(port);
    }
}
