module.exports = class extends Map {
    constructor(json) {
        super();

        const process = (dependency, version, kind) => this.set(dependency, {version, kind});
        const {dependencies: main, devDependencies: development, peerDependencies: peer} = json;

        main && Object.entries(main).forEach(entry => process(...entry, 'main'));
        development && Object.entries(development).forEach(entry => process(...entry, 'development'));
        peer && Object.entries(peer).forEach(entry => process(...entry, 'peer'));
    }
}
