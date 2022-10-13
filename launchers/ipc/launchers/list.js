module.exports = launchers => async function (projects) {
    'use strict';

    await launchers.ready;

    const promises = [];
    launchers.forEach(launcher => promises.push(launcher.ready));
    await Promise.all(promises);

    const output = {};
    for (const project of projects) {
        output[project] = [];
        for (const launcher of launchers.values()) {
            if (launcher.specs.project.id !== project) continue;

            output[project].push({
                id: launcher.id,
                status: launcher.status,
                pid: launcher.pid,
                path: launcher.specs.path,
                error: launcher.error,
                ports: launcher.specs.ports
            });
        }
    }

    return output;
}