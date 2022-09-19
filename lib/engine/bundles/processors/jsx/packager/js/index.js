module.exports = class extends global.ProcessorCode {
    _build() {
        const {sourcemap} = this.compiler;
        return {code: sourcemap};
    }
}
