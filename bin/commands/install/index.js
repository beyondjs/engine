const Installer = require('@beyond-js/uimport/installer');

module.exports = {
    command: 'install',
    description: 'Installs the dependencies of the package',
    options: [{
        name: 'name',
        required: true,
        type: 'string'
    }],
    handler: async () => {
        const installer = new Installer();
        await installer.process();
    }
}
