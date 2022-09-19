const {crc32} = global.utils;
module.exports = class {
    _id;
    get id() {
        return this._id.join('//');
    }

    #error;
    get error() {
        return this.#error;
    }

    _done = error => {
        this.#error = error;
        error && console.error(error);
        this.#ready.resolve();
    };

    #ready = Promise.pending();
    get ready() {
        return this.#ready.value;
    }

    async _initialise() {
        throw new Error('This method should be overridden');
    }

    constructor(id) {
        this._id = id instanceof Array ? id : id.split('//');
        this._initialise().catch(exc => console.error('Model Base', exc.stack));
    }

    formatErrors(errors, type = 'diagnostics') {
        if (!errors?.length) {
            return [];
        }

        if (type !== 'diagnostics') {
            return errors.map(error => ({id: crc32(error), message: error, type: type}));
        }

        const output = [];
        const diagnostics = new Map(errors);
        diagnostics.forEach((entry, key) => {
            const files = [];
            entry.forEach(item => {
                files.push({
                    id: crc32(item.message, item.line, item.character),
                    type: type,
                    message: item.message,
                    line: item.line,
                    file: item.file,
                    character: item.character
                });
            })
            output.push([key, files]);
        });

        return output;
    }
}
