/**
 * Return the bundle (can be a transversal) in a json format to be used by a BEE
 *
 * @param bundle {object} The bundle or transversal bundle
 * @param packager {object} The bundle packager or transversal bundle packager
 * @param code {object} The code bundle packager or the code transversal bundle packager
 * @param resource {object} The parsed uri
 * @return {Promise<*>}
 */
module.exports = async function (bundle, packager, code, resource) {
    'use strict';

    const done = ({errors, warnings, script, dependencies}) => {
        errors = errors ? errors : [];
        warnings = warnings ? warnings : [];
        const {is} = resource;
        const content = JSON.stringify({script, dependencies, is, errors, warnings});
        return new global.Resource({content, extname: '.json'});
    }

    if (resource.is === 'bundle' && !code.processorsCount) {
        return done({errors: [`Bundle does not implement any processor`]});
    }

    const {hmr} = resource;
    const script = require('./code/sourcemap')(
        bundle, resource.is, code.code(hmr), code.map(hmr), '.js', 'inline', 'node'
    );

    const {errors, valid, warnings} = code;
    if (!valid) return done({errors, warnings});

    const promises = [];
    await packager.dependencies.ready;
    packager.dependencies.forEach(dependency => promises.push(dependency.ready));
    await Promise.all(promises);

    const dependencies = [...packager.dependencies]
        .filter(([, {is, kind, bundle: b}]) => {
            if (!is.has('import')) return false;

            // Exclude the imports that refers to bundles that are part of the actual transversal
            return kind !== 'transversal' || resource.name !== b?.name;
        })
        .map(([resource, {kind, bundle: b}]) => {
            if (kind === 'transversal') {
                const split = resource.split('/');
                const pkg = split[0].startsWith('@') ? `${split.shift()}/${split.shift()}` : split.shift();
                resource = `${pkg}/${b.name}`;
                return {resource, kind};
            }

            return {resource, kind};
        });

    return done({script, dependencies, warnings});
}
