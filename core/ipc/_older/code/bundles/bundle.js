/**
 * Return the bundle code, map and dependencies
 *
 * @param is {string} Can be 'bundle' or 'transversal'
 * @param bundle {any} The bundle being requested
 * @param distribution {any} The distribution specification
 * @param resource {any} The parsed resource
 * @return {Promise<{code: *, is, map: *, dependencies: (undefined|{resource: string, kind: *}|{resource: *, kind: *})[]}|{errors}>}
 */
module.exports = async function (is, bundle, distribution, resource) {
    // Getting the packager
    const {hmr, language} = resource;
    const packager = bundle.packagers.get(distribution, language);

    await packager.dependencies.ready;

    const promises = [];
    packager.dependencies.forEach(dependency => promises.push(dependency.ready));
    await Promise.all(promises);

    const dependencies = [...packager.dependencies]
        .filter(([, {is, kind, bundle: b}]) => {
            if (!is.has('import')) return false;

            // Exclude the imports that refers to bundles that are part of the actual transversal
            return kind !== 'transversal' || bundle.name !== b?.name;
        })
        .map(([resource, {kind, bundle: b}]) => {
            if (kind === 'transversal') {
                const split = resource.split('/');
                const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
                return {resource: `${pkg}/${b.name}`, kind};
            }
            return {resource, kind};
        });

    const {js} = packager;
    await js.ready;

    const {valid, errors} = js;
    const code = valid ? js.code(hmr) : void 0;
    const map = valid ? js.map(hmr) : void 0;
    return valid ? {is, code, map, dependencies} : {errors};
}
