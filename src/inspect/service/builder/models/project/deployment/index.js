const Distribution = require('../distributions/distribution');
module.exports = class Deployment extends require('../../file-manager') {
    _distributions;

    skeleton = ["distributions"];

    #distributions = new Map();
    #path;
    #default = {
        name: 'web',
        platform: 'web',
        environment: 'development',
        port: 8080,
        default: true
    }

    get distributions() {
        return this.#distributions;
    }

    get structure() {
        return {
            distributions: Array.from(this.#distributions.values()).map(d => d.getProperties())
        }
    }

    constructor(path, specs) {
        super(path);
        this.#path = path;
        specs && this.set(specs);
    }

    getProperties() {
        const json = {distributions: []};
        this.#distributions.forEach(d => {
            json.distributions.push(d.getProperties())
        });

        return json;
    }

    getDefault = (specs) => {
        return ({...this.#default, ...specs});
    }

    setDistribution = (distribution, edit) => {

        if (!distribution.ports || !distribution.platform) {
            return {error: 'INVALID_CONFIG', code: 1};
        }

        const key = `${distribution.name}`;

        let compute = {...distribution};
        delete compute.port;
        const names = [...this.distributions.values()].map(i => i.name);

        let toEdit = this.distributions.get(key);
        if (!this.distributions.has(key)) {
            toEdit = new Distribution(this.path, names);
            toEdit.edit(distribution);
        }

        const dists = [...this.#distributions.values()];
        const exists = dists.find(distribution => {
            if (distribution.name === toEdit.name) {
                return false;
            }
            return distribution.hasPorts(toEdit.ports)
        });

        toEdit.edit(distribution);

        if (exists) {
            this.#distributions.delete(key)
            return {error: 'PORT_ALREADY_INUSE'};
        }

        const list = Array.from(this.#distributions.values());
        // const same = list.find(dist => {
        //     console.log('comparing', dist.name, toEdit.name);
        //     return dist.compute === toEdit.compute
        // });
        // if (same) {
        //     if (edit) console.log(502, same.name);
        //     return {error: 'ALREADY_EXISTS'};
        // }

        this.#distributions.set(key, toEdit)
        return true;
    }

    set(data) {
        if (data.distributions) {
            data.distributions.forEach(this.setDistribution);
            delete data.distributions;
        }
        Object.keys(data).forEach(property => this[property] = data[property]);
    }

}
