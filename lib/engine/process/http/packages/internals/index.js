const modules = require('./modules');

module.exports = async function (core, route, res) {
    if (route.vdir === 'modules') {
        return await modules(core, route, res);
    }
}
