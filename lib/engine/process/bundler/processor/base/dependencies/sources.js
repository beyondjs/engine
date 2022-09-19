/**
 * Dependencies used by processors like vue or svelte, whose dependencies do not depend on an analyzer.
 */
module.exports = class extends require('./') {
    get dp() {
        return 'bundler.processor.dependencies.sources';
    }

    constructor(processor, Dependency, Propagator) {
        super(processor, Dependency, Propagator);

        const {hashes} = processor.sources;
        super.setup(new Map([['hashes', {child: hashes}]]));
    }

    _update() {
        throw new Error('This method must be overridden');
    }
}
