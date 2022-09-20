module.exports = async function (launchers, id) {
    'use strict';

    await launchers.ready;
    const launcher = (() => {
        // Check if the id is `${key}/${distribution}` or `${pkg/distribution}`
        const split = id.split('/');
        if (!/[a-zA-Z]+/.test(split[0])) return launchers.get(id);

        return [...launchers.values()].find(launcher => {
            return `${launcher.specs.project.pkg}/${launcher.specs.distribution.name}` === id;
        });
    })();

    await launcher?.ready;
    return launcher;
}
