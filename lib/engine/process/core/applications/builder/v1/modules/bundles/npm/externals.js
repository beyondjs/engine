module.exports = async function (packagers, distribution, externals) {
    const promises = [];
    packagers.forEach(packager => {
        if (!packager.js) return;
        if (!packager.js.valid || !packager.js.code() || !packager.js.processorsCount) return;

        promises.push(require('../externals')(packager, distribution, externals));
    });
    await Promise.all(promises);
}