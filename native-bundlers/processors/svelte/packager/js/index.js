const mformat = require('beyond/mformat');
const {ProcessorSinglyCode} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorSinglyCode {
    get dp() {
        return 'svelte.code.js';
    }

    _buildSource(compiled) {
        let {code, map, url, hash} = compiled;

        // Transform to CJS
        const cjs = mformat({code, map, format: 'cjs'});
        if (cjs.errors?.length) return {errors: [{message: cjs.errors, kind: 'html'}]};

        let id = this.createImID(compiled.relative.file);
        const im = {id, url, hash, code: cjs.code, map: cjs.map};
        return {im};
    }
}
