module.exports = class extends global.TransversalCodePackager {
    /**
     * Start transversal code packager constructor
     *
     * @param tp {object} The transversal packager
     * @param params
     */
    constructor(tp, ...params) {
        super(tp, ...params);
        const {distribution} = tp;
        const {application} = tp.transversal;

        super.setup(new Map([
            ['bundles', {child: new (require('./bundles'))(application, distribution)}]
        ]));
    }

    _generate() {
        const {sourcemap: input} = super._generate();
        if (input.errors) return input;

        const bundles = this.children.get('bundles').child;
        const sourcemap = new (require('./sourcemap'))();

        // The bundles start code
        bundles.code && sourcemap.concat(bundles.code);

        // The code of the bundles of the libraries and modules
        sourcemap.concat(input.code, input.map);

        // Only required by the dashboard
        this.tp.application.engine === 'legacy' &&
        sourcemap.concat('routing.setup(1);');

        return {sourcemap};
    }
}
