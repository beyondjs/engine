const {Config} = require('@beyond-js/config');
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
        const config = new Config(process.cwd(), {'/applications': 'array'});
        config.data = 'beyond.json';
        await config.ready;

        console.log(config);
        // const installer = new Installer();
        // await installer.process();
    }
}
