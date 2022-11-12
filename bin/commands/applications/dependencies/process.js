const {Config} = require('beyond/utils/config');
const packages = require('beyond/packages');
const Applications = require('beyond/applications');

module.exports = {
    command: 'application <dependencies>',
    description: 'Process the dependencies tree of an application',
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

        const applications = new Applications();
        await applications.ready;
        const promises = [...applications.values()].map(application => application.ready);
        await Promise.all(promises);

        const application = [...applications.values()].find(({name}) => name === argv.name);
        await application.dependencies.fill();
        applications.destroy();
        config.destroy();
        packages.destroy();

        console.log(`Dependencies tree of application "${argv.name}" is up-to-date`);
    }
}
