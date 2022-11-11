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
        const applications = new Applications();
        await applications.ready;
        const promises = [...applications.values()].map(application => application.ready);
        await Promise.all(promises);

        const application = [...applications.values()].find(({name}) => name === argv.name);
        await application.dependencies.fill();
        applications.destroy();
    }
}
