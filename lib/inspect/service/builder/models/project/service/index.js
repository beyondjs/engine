module.exports = class Service extends require('../../file-manager') {
    _shared;
    _has = false;
    _core = './backend';
    _sessions = './sessions';
    skeleton = [
        "core", "sessions", "engine"
    ];

    constructor(path, application) {
        super(path);
        this._application = application;
    }

    async create() {
        const fs = global.utils.fs;
        const tplPath = await this.templatesPath();
        const current = this.joinPath(tplPath, 'backend', 'application');
        const dest = this.path;

        const existsCore = await fs.exists(this.joinPath(dest, 'core'));
        const existsSession = await fs.exists(this.joinPath(dest, 'sessions'));

        if (existsCore) {
            console.error("the backend already exists".red);
            return;
        }
        if (existsSession) {
            console.error("the session already exists".red);
            return;
        }

        await fs.copy(current, dest);
        this._application.save({backend: this.getProperties()});
    }
}
