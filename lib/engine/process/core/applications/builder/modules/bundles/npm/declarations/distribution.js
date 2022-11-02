projects = new Map();
bundleDistributions = new Map();
const bundlePlatform = (bundle, platforms, distributions) => {
    let type = Array.from(distributions)[0];
    if (distributions.size > 1) {
        distributions.has('web') && distributions.has('backend') && (type = 'web-backend')
    }

    if (type !== 'web-backend') return type;
    if (bundle.type === 'bridge') return 'backend';
    if (!platforms.has('web')) return Array.from(platforms)[0];
    return 'web';
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

    const platform = bundlePlatform(bundle, platforms, dist);
    const distribution = {key: `build-${project.id}`, platform: platform, ts: {compiler: 'tsc'}};
    bundleDistributions.set(bundle.id, distribution);

    return distribution;
}