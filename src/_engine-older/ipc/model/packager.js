let model;
module.exports = m => (model = m) && Packager;

class Packager extends (require('./base')) {
    #packager

    get item() {
        return this.#packager;
    }

    get processors() {
        return this.#packager?.processors;
    }

    #bundle
    get bundle() {
        return this.#bundle;
    }

    #distribution
    get distribution() {
        return this.#distribution;
    }

    async _initialise() {
        const [bundleId, distributionId] = this.id.split('///');
        if (bundleId < 4) return this._done(`Packager bundle id "${this.id}" is invalid`);
        if (distributionId < 2) return this._done(`Packager distribution id "${this.id}" is invalid`);

        const bundle = new model.Bundle(bundleId);
        await bundle.ready;
        if (bundle.error) return this._done(`Packager bundle not valid, ${bundle.error}`);

        const distribution = new model.Distribution(distributionId);
        await distribution.ready;

        const packager = bundle.packagers.get(distribution.toJSON());
        await packager.ready;
        await packager.processors.ready;

        this.#packager = packager;
        this.#bundle = bundle;
        this.#distribution = distribution;

        this._done();
    };

    toJSON() {
        const ids = [...this.#packager.processors.keys()].map(processor => {
            const [bundleId, distributionId] = this.id.split('///');
            return `${bundleId}//${processor}///${distributionId}`;
        });
        return {
            id: this.id,
            distribution: this.#distribution.id,
            processors: [...this.#packager.processors.keys()],
            pkg_processor_ids: ids
        };
    }
}
