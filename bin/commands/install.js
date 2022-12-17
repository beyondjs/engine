const Installer = require('@beyond-js/uimport/installer');

module.exports = {
    command: 'install',
    description: 'Installs the dependencies of the package',
    handler: async () => {
        const installer = new Installer();
        await installer.process();
    }
}
