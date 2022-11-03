const {ProcessorCode} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return this.processor.hash;
    }

    async _build(request) {
        const compiler = this.processor.compilers.get('default');
        await compiler.outputs.ready;
        if (this.cancelled(request)) return;

        return {script: `console.log('The "ts" processor!');`}
    }
}
