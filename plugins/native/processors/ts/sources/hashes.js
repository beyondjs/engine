const {SourcesHashes} = require('beyond/plugins/sdk');

module.exports = class extends SourcesHashes {
    #tsconfig;

    constructor(sources) {
        super(sources);

        this.#tsconfig = sources.tsconfig;
        super.setup(new Map([['tsconfig', {child: this.#tsconfig}]]));
    }

    _compute() {
        return this.#tsconfig.hash;
    }

    destroy() {
        super.destroy();
        this.#tsconfig.destroy();
    }
}
