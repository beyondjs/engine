const {EventEmitter} = require('events');
const {fs} = global.utils;

module.exports = class extends EventEmitter {
    #bee;

    constructor(bee) {
        super();
        this.#bee = bee;
    }

    async build() {
        await this.#bee.ready;
        this.emit('message', `Building legacy bee "${this.#bee.id}"`);

        const paths = {};
        const p = require('path');
        paths.base = p.join(process.cwd(), '.beyond/builds/server');
        paths.build = p.join(paths.base, 'code');
        paths.archive = p.join(paths.base, 'build.zip');

        if (await fs.exists(paths.build)) {
            this.emit('message', `A previous build of the bee was found on "${paths.build}"`);
            this.emit('message', 'Removing all content from the previous build of the bee');
            await fs.promises.rmdir(paths.build, {recursive: true});
            this.emit('message', 'Previous build removed');
        }
        else {
            this.emit('message', `Bee build is being processed on "${paths.build}"`);
        }

        await this.#bee.ready;

        const specs = Object.assign({}, this.#bee.specs);
        require('./specs')(specs);

        await require('./core')(specs, paths.build, this);
        await require('./sessions')(specs, paths.build, this);
        await require('./modules')(specs, paths.build, this);
    }
}
