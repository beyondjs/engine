const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = class extends Map {
    #hash;
    get hash() {
        return this.#hash;
    }

    constructor(json) {
        super();

        const process = (dependency, version, kind) => this.set(dependency, {version, kind});
        const {dependencies: main, devDependencies: development, peerDependencies: peer} = json;

        main && Object.entries(main).forEach(entry => process(...entry, 'main'));
        development && Object.entries(development).forEach(entry => process(...entry, 'development'));
        peer && Object.entries(peer).forEach(entry => process(...entry, 'peer'));

        const compute = {};
        this.forEach(({version, kind}, specifier) => compute[specifier] = {version, kind});
        this.#hash = crc32(equal.generate(compute));
    }
}
