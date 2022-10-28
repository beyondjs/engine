module.exports = class extends global.TransversalPackager {
    constructor(...params) {
        super(...params);
        this.dependencies.add('@beyond-js/kernel/core');
    }
}
