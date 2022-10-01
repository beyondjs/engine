module.exports = class extends global.ProcessorCode {
    get dp() {
        return 'sass.code.js';
    }

    _build() {
        const {bundle} = this.packager.processor.specs;
        const code = `brequire('@beyond-js/kernel/styles').styles.register('${bundle.vspecifier}')`;
        return {code};
    }
}
