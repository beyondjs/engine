const mformat = require('beyond/mformat');

module.exports = class extends global.ProcessorSinglyCode {
    get dp() {
        return 'svelte.code.js';
    }

    _buildSource(compiled) {
        let {code, map, url, hash} = compiled;

        // Transform to CJS
        const cjs = mformat({code, map, mode: 'cjs'});
        if (cjs.errors?.length) return {errors: [{message: cjs.errors, kind: 'html'}]};

        let id = this.createImID(compiled.relative.file);
        const im = {id, url, hash, code: cjs.code, map: cjs.map};
        return {im};
    }
}
