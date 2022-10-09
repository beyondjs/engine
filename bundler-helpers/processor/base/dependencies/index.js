const DynamicProcessor = require('beyond/utils/dynamic-processor');
const ipc = require('beyond/utils/ipc');

/**
 * Abstract class used by SourcesDependencies and AnalyzerDependencies
 */
module.exports = class extends DynamicProcessor(Map) {
    get dp() {
        return 'bundler.processor.dependencies';
    }

    #processor;
    get processor() {
        return this.#processor;
    }

    get id() {
        return this.#processor.id;
    }

    #Dependency;

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    get synchronized() {
        return this.#hashes.synchronized;
    }

    get updated() {
        return this.#hashes.updated;
    }

    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return this.processed && !this.errors.length;
    }

    _create(specifier) {
        if (this.has(specifier)) throw new Error(`Dependency "${specifier}" already created`);
        return new this.#Dependency(specifier, this.#processor);
    }

    _notify() {
        //TODO @felix quitamos //dashboard//{idioma} del id del procesador... Revisar
        let id = this.id.split('//');
        id = id.slice(0, id.length - 2).join('//');
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'processors-dependencies',
            filter: {processor: id}
        });
    }

    constructor(processor, Dependency) {
        super();
        this.#processor = processor;
        this.#Dependency = Dependency ? Dependency : require('../../../dependencies/dependency');
        this.#hashes = new (require('./hashes'))(this);
    }

    _update() {
        throw new Error('This method must be overridden');
    }

    _process() {
        this.forEach(dependency => dependency.clear());
        const {errors, updated} = this._update();

        this.#errors = errors;

        // Destroy unused processors
        this.forEach((dependency, specifier) => !updated?.has(specifier) && dependency.destroy());

        super.clear(); // Do not use this.clear() as it would destroy still used processors
        updated?.forEach((value, key) => this.set(key, value));

        // Update the hashes
        this.#hashes.update();
    }

    clear() {
        this.forEach(dependency => dependency.destroy());
    }

    destroy() {
        super.destroy();
        this.clear();
    }
}
