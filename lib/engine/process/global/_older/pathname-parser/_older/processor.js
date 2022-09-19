/**
 * Parse the bundle filename to extract the processor name
 *
 * @param filename {string} The filename of the resource. ex: 'code[ts]' or 'txt[txt].en'
 */
module.exports = async function (filename) {
    const parsed = /(.*)\[(.*)\]/.exec(filename);
    if (!parsed || parsed.length !== 3) return {bundle: filename};

    const bundle = parsed[1];
    const processor = parsed[2];

    await global.processors.ready;
    if (!global.processors.has(processor)) {
        const error = `Processor "${processor}" is not registered`;
        return {error};
    }

    return {bundle, processor};
}