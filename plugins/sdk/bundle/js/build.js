const local = require('./local');
const esbuild = require('./esbuild');
const builders = {local, esbuild};

module.exports = async function (conditional, local) {
    if (local) return await builders.local(conditional, local);
    else return await builders.esbuild(conditional);
}
