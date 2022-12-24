const {Config} = require('@beyond-js/config');
const uimport = require('@beyond-js/uimport');

(async () => {
    uimport.initialise();
    const Installer = require('@beyond-js/uimport/installer');

    const internals = await (async () => {
        const config = new Config(process.cwd(), {'/applications': 'array'});
        config.data = 'beyond.json';

        const applications = config.properties.get('applications');
        await applications.ready;

        const promises = [];
        applications.items.forEach(application => promises.push(application.ready));
        await Promise.all(promises);

        const internals = new Map();
        applications.items.forEach(application => {
            if (!application.valid) return;

            const config = application.value;
            if (!config.name || !config.version) return;

            const {dependencies, devDependencies, peerDependencies, version} = config;
            const name = config.scope ? `@${config.scope}/${config.name}` : config.name;

            internals.set(name, {version, dependencies, devDependencies, peerDependencies});
        });
        return internals;
    })();

    const installer = new Installer({internals});
    await installer.process();
})().catch(exc => console.log(exc.stack));
