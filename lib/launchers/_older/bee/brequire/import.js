/**
 * This function is called by the bundles collection, and its objective is to globally expose the bimport function,
 * which is then used by the beyond.import method of beyond/kernel/core.
 */
module.exports = function (bundles) {
    /**
     * Import a module
     *
     * @param uri {string} The uri being imported
     * @param version? {number} The version number to support HMR
     * @return {Promise<*>}
     */
    const bimport = async (uri, version) => {
        if (uri.startsWith('.')) {
            throw new Error('Relative requires should never be called by BeyondJS bundles in a BEE environment');
        }

        // Process the uri as a BeyondJS bundle
        const imported = await bundles.import(uri, version);
        return imported && require('./process')(uri, imported);
    }

    Object.defineProperty(global, 'bimport', {get: () => bimport});
}
