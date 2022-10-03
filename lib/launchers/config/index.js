const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {Config} = require('beyond/utils/config');
const BEESpecs = require('./specs');

module.exports = class extends DynamicProcessor(Set) {
    get dp() {
        return 'launchers.config';
    }

    /**
     * BEEs config constructor
     *
     * @param path {string} The path where the beyond.json is located
     */
    constructor(path) {
        super();

        const config = new Config(path, {
            '/packages': 'array',
            '/packages/children/deployment': 'object'
        });
        config.data = 'beyond.json';

        const packages = new (require('./packages'))(config.properties.get('packages'));
        super.setup(new Map([['packages', {child: packages}]]));
    }

    _process() {
        this.clear();

        // Add the bees required by the distributions specified in each project
        const packages = this.children.get('packages').child;
        packages.forEach(item => this.add(new BEESpecs(item)));
    }
}
