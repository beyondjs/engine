module.exports = class {
    check(port) {
        return new Promise((resolve) => {
            const tester = require('net').createServer()
                .once('error', () => resolve(false))
                .once('listening', () => tester.once('close', () => resolve(true)).close())
                .listen(port);
        });
    }
}
