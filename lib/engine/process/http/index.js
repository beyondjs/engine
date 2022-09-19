module.exports = function (core) {
    const http = global.dashboard ?
        new (require('./dashboard'))(core) :
        new (require('./main'))(core);

    !global.dashboard && http.initialise().catch(exc => console.error(exc.stack));
    return http;
}
