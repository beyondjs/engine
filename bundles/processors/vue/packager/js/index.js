const mformat = require('beyond/mformat');

module.exports = class extends global.ProcessorSinglyCode {
    get dp() {
        return 'vue.code.js';
    }

    _sourceIMsIds(compiled) {
        let id = this.createImID(compiled.relative.file);
        id = id.slice(0, id.length - '.vue'.length);

        const imId = `${id}.vue`;
        const renderId = `${id}.render`;
        const scriptId = `${id}.script`;
        return [imId, renderId, scriptId];
    }

    _buildSource(compiled) {
        let {code, map, template, url, templateMap, hash} = compiled;

        const ims = new Map();

        // Set template IM
        // Transform template script to CJS
        const cjsTemplate = mformat({code: template, map: templateMap, mode: 'cjs'});
        if (cjsTemplate.errors?.length) return {errors: [{message: cjsTemplate.errors, kind: 'html'}]};

        let id = this.createImID(compiled.relative.file);
        id = id.slice(0, id.length - '.vue'.length);

        const renderId = `${id}.render`;
        const renderIM = {id: renderId, url, hash, code: cjsTemplate.code, map: cjsTemplate.map};
        ims.set(renderId, renderIM);

        // Set script IM
        // Transform script to CJS
        const scriptCjs = mformat({code, map, mode: 'cjs'});
        if (scriptCjs.errors?.length) return {errors: [{message: scriptCjs.errors, kind: 'html'}]};

        const scriptId = `${id}.script`;
        const scriptIM = {id: scriptId, url, hash, code: scriptCjs.code, map: scriptCjs.map};
        ims.set(scriptId, scriptIM);

        // Set facade script IM
        // https://github.com/vuejs/core/tree/main/packages/compiler-sfc ('Where the facade module looks like')
        const imId = `${id}.vue`;
        let facadeCode = '';
        facadeCode += `const script = require('${scriptId}').default;\n`;
        facadeCode += `const {render} = require('${renderId}');\n`;
        facadeCode += 'script.render = render;\n';
        facadeCode += `script.__file = '${compiled.relative.file}';\n`;
        facadeCode += `script.__scopeId = '${compiled.scopeId}';\n`;
        facadeCode += `exports.default = script;\n`;
        const facadeIM = {id: imId, url, hash, code: facadeCode};
        ims.set(imId, facadeIM);

        return {ims};
    }
}
