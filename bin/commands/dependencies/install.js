const externals = require('beyond/externals/installs');

module.exports = {
    command: 'dependencies-install',
    description: 'Installs an external package',
    options: [{
        name: 'name',
        type: 'string',
        optional: false,
        describe: 'The dependency to be installed including its version. Example: react@18.2.0'
    }],
    handler: async (argv) => {
        const {name} = argv;
        if (!name) {
            console.log('Please specify the dependency name to be installed'.yellow);
            return;
        }

        await externals.ready;
        externals.install('react', '18.2.0');
    }
}
