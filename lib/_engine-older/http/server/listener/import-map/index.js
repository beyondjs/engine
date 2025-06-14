module.exports = async function (application, distribution, url) {
    let {pathname} = url;
    if (pathname !== '/import_map.json') return;

    const dependencies = application.dependencies.get(distribution);
    await dependencies.ready;
    const {importMap} = dependencies;

    const info = url.searchParams.has('info');
    if (info) {
        return await require('./info')(dependencies);
    }
    else {
        const content = JSON.stringify(importMap);
        return new global.Resource({content, extname: '.json'});
    }
}
