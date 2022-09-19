const DynamicProcessor = global.utils.DynamicProcessor(Set);
const BEESpecs = require('./specs');

module.exports = class extends DynamicProcessor {
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

        const config = new global.utils.Config(path, {
            '/applications': 'array',
            '/applications/children/deployment': 'object'
        });
        config.data = 'beyond.json';

        const applications = new (require('./applications'))(config.properties.get('applications'));
        super.setup(new Map([['applications', {child: applications}]]));
    }

    _process() {
        this.clear();

        // Add the bees required by the distributions specified in each project
        const applications = this.children.get('applications').child;
        applications.forEach(item => this.add(new BEESpecs(item)));
    }
}
