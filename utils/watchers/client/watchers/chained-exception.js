module.exports = class extends Error {
    constructor(exc, chained) {
        super();

        const message = `Chained exception: ${exc.message} | ${chained.message}`;
        this.message = message;
        this.stack = `${message}\n${chained.stack}\n${exc.stack}`;
    }
}
