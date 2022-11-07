/**
 * Build a bundle of a module
 *
 * @param extname {string} Can be '.js' or '.css'
 * @param specs {object} {path, module, bundle, distribution, language, uglifier, builder, exports, externals}
 * @specs path {string} The build target path
 * @specs module {object} The module
 * @specs bundle {object} The bundle being exported
 * @specs distribution {object} The distribution specification
 * @specs language {string} The language
 * @specs uglifier {object}
 * @specs builder {object} The builder object
 * @specs exports {Set<string>} The resources being exported
 * @specs externals {Set<string>} The externals resources
 * @specs specs {build: boolean, compile: boolean} Process specs
 * @return {Promise<void>}
 */
module.exports = async function (extname, specs) {
    const {bundle, language, distribution, builder, processSpecs} = specs;

    const packager = await bundle.packagers.get(distribution, language);
    const code = packager[extname === '.js' ? 'js' : 'css'];
    if (!code) return;

    await code.ready;
    if (!code.valid) {
        const error = `  . Bundle "${bundle.name}" is not valid.`;
        builder.emit('error', error, {module: bundle.container.id});
        code.errors?.forEach((message) => builder.emit('error', `    -> ${message}`));
        return;
    }
    if (!code.processorsCount || !code.code()) return;

    const {build, declarations} = processSpecs;
    build && await require('./save')(packager, code, extname, specs);
    declarations && await require('./declarations')(packager, distribution, builder);
}