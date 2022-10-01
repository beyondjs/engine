const {fs} = global.utils;

/**
 * Build styles.css file
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
    'use strict';

    const build = async (styles, is) => {
        if (!styles) return;

        const filename = `${is}.css`;
        const target = require('path').join(path, filename);
        builder.emit('message', `Building ${filename} resource`);
        await styles.ready;
        if (!styles.valid) {
            builder.emit('error', `  . Resource "${filename}" is not valid`);
            return;
        }
        if (!styles.value) return;

        const {code} = (() => {
            const code = styles.value;
            return typeof code === 'string' ? {code} : code;
        })();

        if (distribution.compress) {
            const {errors, css} = uglifier.uglify(filename, code);
            errors ? builder.emit('error', 'Error uglifying application styles') : await fs.save(target, css);
        }
        else await fs.save(target, code);
    }
    const {application} = builder;
    const styles = await application.styles.application.get(distribution);
    const global = await application.styles.global.get(distribution);
    await build(styles, 'styles');
    await build(global, 'global');
}
