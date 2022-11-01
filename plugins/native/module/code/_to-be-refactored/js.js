const Code = require('../code');

module.exports = class extends Code {
    #processors;

    constructor(bundle) {
        super(bundle, {cache: true});
        this.#processors = bundle.psets.get();
        super.setup(new Map([['processors.hash', {child: this.#processors.hash}]]));
    }

    get resource() {
        return 'js';
    }

    get hash() {
        return this.#processors.hash.value;
    }

    _generate() {
        return {code: 'console.log("hello world");'};
    }
}
