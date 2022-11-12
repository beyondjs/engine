const {installed: externals} = require('beyond/externals');
const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {External: ExternalPackage} = require('beyond/package');

module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'packages.externals';
    }

    constructor() {
        super();
        super.setup(new Map([['externals', {child: externals}]]));
    }

    _process() {
        const updated = new Map();
        externals.forEach(vpackage => {
            const {path, vspecifier, json} = vpackage;
            const external = this.has(vspecifier) ? this.get(vspecifier) : new ExternalPackage(path, json);
            updated.set(vspecifier, external);
        });

        // Destroy unused externals
        this.forEach((external, vspecifier) => !this.has(vspecifier) && external.destroy());
        this.clear();
        updated.forEach((value, key) => this.set(key, value));
    }

    destroy() {
        super.destroy();
        this.forEach(pkg => pkg.destroy());
    }
}
