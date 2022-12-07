module.exports = class extends global.ProcessorCode {
    get dp() {
        return 'txt.code.js';
    }

    _build() {
        const {compiler} = this.packager;

        // Merge the texts of the different json files into one object
        const ims = {};
        compiler.files.forEach(({hash, relative: {file}, compiled: {code, map}}) => {
            const id = this.createImID(file);
            ims[id] = {id, hash, code, map};
        });
        return {ims};
    }
}
