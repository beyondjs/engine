const mformat = require('beyond/mformat');

module.exports = class extends global.ProcessorSinglyCode {
    get dp() {
        return 'ts.code.js';
    }

    _buildSource(compiled) {
        let {code, map, exports, url, hash} = compiled;

        // Remove the line breaks at the end of the content
        code = code.replace(/\n$/g, '');

        // Remove the sourcemap reference to the source file left by typescript
        code = code.replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');

        // Transform to CJS
        const cjs = mformat({code, map, mode: 'cjs'});
        if (cjs.errors?.length) return {errors: [{message: cjs.errors, kind: 'html'}]};

        const id = this.createImID(compiled.relative.file);
        const im = {id, url, hash, code: cjs.code, map: cjs.map, exports};
        return {im};
    }
}
