module.exports = class extends Error {
    constructor(error) {
        super(typeof error === 'string' ? error : error.message);
        typeof error === 'object' && error.stack ? this.stack = error.stack : null;
    }
};
