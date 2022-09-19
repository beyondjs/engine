module.exports = class extends require('../registry') {
    get dp() {
        return 'processors-registry';
    }

    constructor(config) {
        super('processors', config);
    }
}
