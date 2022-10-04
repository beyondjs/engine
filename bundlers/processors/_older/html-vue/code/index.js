const {header} = global.utils.code;

module.exports = class extends global.ProcessorCode {
    _build() {
        let code = header('VUE render functions');

        code += 'const __vue_render_fncs = new Map([';

        this.compiler.files.forEach(source => {
            let {render, staticRenderFns} = source.compiled;
            let srf = '[';
            staticRenderFns?.forEach(fns => srf += '');
            srf += ']';

            code += `['${source.relative.file}', {render: function() {${render}}, staticRenderFns: ${srf}}],`;
        });
        code += ']);\n';
        return {code};
    }
}
