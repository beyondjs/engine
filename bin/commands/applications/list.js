const Applications = require('beyond/applications');

module.exports = {
    command: 'applications <list>',
    description: 'List the configured applications',
    handler: async () => {
        const applications = new Applications();
        await applications.ready;
        const promises = [...applications.values()].map(application => application.ready);
        await Promise.all(promises);

        console.log([...applications.values()].map(({name}) => name));
        applications.destroy();
    }
}
