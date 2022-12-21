module.exports = process.send ? new (require('./child')) : new (require('./main'));
