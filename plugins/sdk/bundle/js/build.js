const local = require('./local');
const esbuild = require('./esbuild');
const builders = {local, esbuild};

module.exports = async function (targetedExport, local) {
    const {packageExport} = targetedExport;
    const specifier = packageExport.specifier.value;

    local = local ? local : {};
    const esbuild = local.hmr === void 0 || specifier === '@beyond-js/local/bundle';

    if (esbuild) return await builders.esbuild(targetedExport)
    else return await builders.local(targetedExport, local);
}
