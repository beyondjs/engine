module.exports = class extends global.BundlePackager {
    constructor(...params) {
        super(...params);
        this.dependencies.add('@beyond-js/widgets/render');
    }
}
