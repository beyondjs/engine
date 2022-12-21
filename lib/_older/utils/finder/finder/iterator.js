/**
 * Iterator of files
 *
 * @param includes {array}
 * @param inclusions {Map}
 * @returns {function}
 */
module.exports = (includes, inclusions) => function* () {
    if (!inclusions) return;

    const keys = new Set();
    for (const include of includes) {
        const inclusion = inclusions.get(include);
        for (const file of inclusion) {
            const key = file.relative.file;
            if (keys.has(key)) continue;
            keys.add(key);

            yield file;
        }
    }
}
