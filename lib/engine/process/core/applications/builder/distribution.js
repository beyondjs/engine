module.exports = async function (application, key) {
    if (key === 'npm') {
        return {
            key: 'npm',
            name: 'npm',
            npm: true,
            maps: 'external',
            environment: 'production',
            bundles: {mode: 'sjs'},
            ts: {compiler: 'tsc'}
        }
    }

    await application.ready;
    await application.deployment.ready;
    await application.deployment.distributions.ready;

    const id = key.split('//')[1];
    const {distributions} = application.deployment;

    return distributions.get(parseInt(id));
}
