const DynamicProcessor = global.utils.DynamicProcessor();

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'application.library.legacy';
    }

    get is() {
        return 'library';
    }

    #application;

    #pkg;
    get pkg() {
        return this.#pkg;
    }

    get id() {
        return `${this.#application.id}//${this.#pkg}`;
    }

    get version() {
        return this.library?.version;
    }

    get specifier() {
        return this.#pkg;
    }

    get vspecifier() {
        return `${this.#pkg}@${this.library?.version}`;
    }

    get path() {
        return this.library?.path;
    }

    get pathname() {
        return this.library?.pathname;
    }

    get description() {
        return this.library?.description;
    }

    get connect() {
        return this.library?.connect;
    }

    get hosts() {
        return this.library?.hosts;
    }

    constructor(application, pkg) {
        super();
        this.#application = application;
        this.#pkg = pkg;
    }
}
