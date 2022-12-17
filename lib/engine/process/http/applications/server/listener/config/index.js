const {Resource} = global;
const qs = require('querystring');

module.exports = async function (application, distribution, url) {
    const split = url.pathname.slice(1).split('/');
    const file = split.pop();

    if (!['config.js', 'config.json'].includes(file)) return;

    const {project, resource} = await (async () => {
        if (!split.length) return {project: application};
        if (split.shift() !== 'packages') return {};

        const {pkg, version, error} = (() => {
            const scope = split[0].startsWith('@') ? split.shift() : void 0;
            const [name, version] = split.shift().split('@');

            const node = platforms.node.includes(distribution.platform);
            if (!node && !version) {
                return {error: 'Package version must be specified'};
            }

            const pkg = scope ? `${scope}/${name}` : name;
            return {pkg, version};
        })();
        if (error) return {resource: new Resource({'500': error})};

        const {libraries} = application;
        await libraries.ready;
        if (!libraries.has(pkg)) {
            // It is not a config bundle from an imported project, but it still can be an external bundle
            return {};
        }

        const al = libraries.get(pkg);
        await al.ready;

        if (version && al.version !== version) {
            const error = `Version "${version}" differs from the registered version of the dependency "${al.version}"`;
            return {resource: new Resource({'500': error})};
        }

        return {project: al.library};
    })();
    if (resource) return resource;
    if (!project) return;

    const config = project.config.get(distribution, true);
    await config.ready;

    const info = qs.parse(url.search.slice(1)).info !== void 0;
    if (info) return await require('./info')(config);
    if (!config.valid) return new Resource({'500': `Project configuration is invalid`});

    const extname = require('path').extname(url.pathname);
    if (extname === '.js') {
        return new Resource({content: config.code, extname});
    }
    else if (extname === '.json') {
        const content = JSON.stringify({script: config.code});
        return new Resource({content, extname});
    }
}
