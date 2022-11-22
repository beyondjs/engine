const Message = require('./message');
const Position = require('./position');

module.exports = class {
    #kind;
    /**
     * Can be 'error' or 'warning'
     */
    get kind() {
        return this.#kind;
    }

    #file;
    get file() {
        return this.#file;
    }

    #code;
    get code() {
        return this.#code;
    }

    #category;
    get category() {
        return this.#category;
    }

    #message;
    get message() {
        return this.#message;
    }

    #position;
    get position() {
        return this.#position;
    }

    #start;
    get start() {
        return this.#start;
    }

    #end;
    get end() {
        return this.#end;
    }

    #relatedInformation;
    get relatedInformation() {
        return this.#relatedInformation;
    }

    constructor(values) {
        values && this.#set(values);
    }

    toJSON() {
        const {kind, file, code, category, relatedInformation} = this;
        const position = this.#position?.toJSON();
        const start = this.#start?.toJSON();
        const end = this.#end?.toJSON();
        const message = this.#message?.toJSON();
        return {kind, file, code, category, message, position, start, end, relatedInformation};
    }

    #set({kind, file, code, category, message, position, start, end, relatedInformation}) {
        this.#kind = kind;
        this.#file = file;
        this.#code = code;
        this.#category = category;
        this.#position = position ? new Position(position) : void 0;
        this.#start = start ? new Position(start) : void 0;
        this.#end = end ? new Position(end) : void 0;
        this.#message = message ? new Message(message) : void 0;
        this.#relatedInformation = relatedInformation;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
