const {Config} = require('@beyond-js/config');
const Installer = require('@beyond-js/uimport/installer');
const SpecifierParser = require('@beyond-js/specifier-parser');

module.exports = {
    command: 'install [package_name]',
    description: 'Installs the dependencies of the package',
    options: [{
        name: 'name',
        required: true,
        type: 'string'
    }],
    handler: async (argv) => {
        const {name} = argv;
        if (!name) {
            console.log('Please specify the dependency name to be installed'.yellow);
            return;
        }
        const specifier = new SpecifierParser(name);
        if (!specifier.valid) {
            console.log(`Invalid package name: ${specifier.error}`);
            return;
        }
        if (!specifier.version) {
            console.log(`Package version must be specified`.yellow);
            return;
        }

        const {internals} = await (async () => {
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
                const vname = `${name}@${version}`;

                internals.set(vname, {version, dependencies, devDependencies, peerDependencies});
            });

            config.destroy();

            return {internals};
        })();

        if (!internals.has(specifier.value)) {
            console.log(`Package "${specifier.value}" not found`);
            return;
        }

        const {pkg, version} = specifier;
        console.log(`Installing package "${pkg}" version "${version}"`);

        const installer = new Installer({pkg, version, internals});
        await installer.process();
    }
}
