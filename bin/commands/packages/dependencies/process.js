const {Config} = require('beyond/utils/config');
const packages = require('beyond/packages');
require('colors');

module.exports = {
    command: 'package <dependencies>',
    description: 'Process the dependencies tree of a package',
    options: [{
        name: 'name',
        required: true,
        type: 'string'
    }],
    handler: async (argv) => {
        /**
         * Initialise the packages
         */
        const config = new Config(process.cwd(), {'/packages': 'array'});
        config.data = 'beyond.json';
        packages.setup(config.get('packages'), {watchers: false});
        await packages.ready;

        const pkg = packages.find({vname: argv.name});
        if (!pkg) {
            console.log(`Package name "${argv.name}" is invalid, or package not found`);
            return;
        }

        await pkg.ready;
        await pkg.dependencies.fill();

        config.destroy();
        packages.destroy();

        console.log(`Dependencies tree of package "${argv.name}" is up-to-date`);
        console.log('List of required dependencies:')
        console.log([...pkg.dependencies.list.keys()]);
    }
}
