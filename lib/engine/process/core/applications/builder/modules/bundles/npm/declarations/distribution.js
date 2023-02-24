projects = new Map();
bundleDistributions = new Map();
const bundlePlatform = (platforms, distributions) => {

    if (platforms.has('web') && distributions.has('web')) return 'web';
    if (platforms.has('node') && distributions.has('node')) return 'node';
    if (platforms.has('backend') && distributions.has('backend')) return 'backend';
    if (platforms.has('ssr') && distributions.has('ssr')) return 'ssr';
};

module.exports = async function (project, bundle, platforms) {
    if (bundleDistributions.has(bundle.id)) {
        return bundleDistributions.get(bundle.id);
    }

    const {distributions} = project.deployment;
    if (!distributions) return [];

    const dist = new Set();
    distributions.forEach(d => !d.npm && dist.add(d.platform));
    if (!dist.size) return;

    const platform = bundlePlatform(platforms, dist);
    const distribution = {key: `build-${project.id}`, platform: platform, ts: {compiler: 'tsc'}};
    bundleDistributions.set(bundle.id, distribution);

    return distribution;
}