const local = require('./local');
const esbuild = require('./esbuild');
const builders = {local, esbuild};

module.exports = async function (conditional, local) {
    const {pexport} = conditional;
    const specifier = pexport.specifier.value;

    const esbuild = !local || specifier === '@beyond-js/kernel/bundle';

    if (esbuild) return await builders.esbuild(conditional)
    else return await builders.local(conditional, local);
}
