const {installed: externals} = require('beyond/externals');

module.exports = {
    command: 'dependencies <list>',
    description: 'List the installed dependencies',
    handler: async () => {
        await externals.ready;
        console.log([...externals.keys()]);
    }
}
