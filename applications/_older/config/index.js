const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {Config} = require('beyond/utils/config');
const ApplicationSpecs = require('./specs');

module.exports = class extends DynamicProcessor(Set) {
    get dp() {
        return 'launchers.config';
    }

    #launchers;

    /**
     * ApplicationSpecs config constructor
     *
     * @param path {string} The path where the beyond.json is located
     */
    constructor(path) {
        super();

        const config = new Config(path, {'/applications': 'array'});
        config.data = 'beyond.json';

        const applications = new (require('./applications'))(config.properties.get('applications'));
        super.setup(new Map([['applications', {child: applications}]]));
    }

    _process() {
        this.clear();

        // Add the applications required by the distributions specified in each project
        const applications = this.children.get('applications').child;
        applications.forEach(item => this.add(new ApplicationSpecs(item)));
    }
}
