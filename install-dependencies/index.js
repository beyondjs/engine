const {Config} = require('@beyond-js/config');
const uimport = require('@beyond-js/uimport');

const specs = {pkg: '@beyond-playground/counter-rendering@1.0.0'};

(async () => {
    uimport.initialise();
    const Installer = require('@beyond-js/uimport/installer');

    const {json, internals} = await (async () => {
        const config = new Config(process.cwd(), {'/applications': 'array'});
        config.data = 'beyond.json';

        const applications = config.properties.get('applications');
        await applications.ready;

        const promises = [];
        applications.items.forEach(application => promises.push(application.ready));
        await Promise.all(promises);

        let json;
        const internals = new Map();
        applications.items.forEach(application => {
            if (!application.valid) return;

            const config = application.value;
            if (!config.name || !config.version) return;

            const {dependencies, devDependencies, peerDependencies, version} = config;
            const name = config.scope ? `@${config.scope}/${config.name}` : config.name;
            const vname = `${name}@${version}`;

            vname === specs.pkg && (json = Object.assign({name}, config));
            internals.set(vname, {version, dependencies, devDependencies, peerDependencies});
        });

        config.destroy();

        return {json, internals};
    })();

    if (!json) {
        console.log(`Package "${specs.pkg}" not found`);
        return;
    }

    const installer = new Installer({json, internals});
    await installer.process();
})().catch(exc => console.log(exc.stack));
