module.exports = class extends global.TransversalCodePackager {
    constructor(packager) {
        super(packager);
        const {distribution} = packager;
        const {application} = packager.transversal;

        super.setup(new Map([
            ['config', {child: new (require('../../config'))(application, distribution)}]
        ]));
    }

    _generate() {
        const {sourcemap: input} = super._generate();
        if (input.errors) return input;

        const config = this.children.get('config').child;

        const sourcemap = new (require('./sourcemap'))();
        sourcemap.concat(config.code);
        return {sourcemap};
    }
}
