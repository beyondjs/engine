const DynamicProcessor = require('beyond/utils/dynamic-processor');
const fs = require('beyond/utils/fs');
const {join} = require('path');
const Downloader = require('./downloader');
const VPackage = require('./vpackage');

module.exports = new class extends DynamicProcessor(Map) {
    get dp() {
        return 'externals';
    }

    #path;

    #warnings = [];
    get warnings() {
        return this.#warnings;
    }

    constructor() {
        super();
        this.#path = join(process.cwd(), '.beyond/externals');
    }

    async _begin() {
        const warnings = this.#warnings = [];
        await fs.mkdir(this.#path, {recursive: true});

        const process = async vspecifier => {
            const pkgjson = join(this.#path, vspecifier, 'package.json');
            if (!(await fs.exists(pkgjson))) return;

            const vpackage = new VPackage(pkgjson, vspecifier);
            await vpackage.process();
            vpackage.error ?
                `Package "${vspecifier}" couldn't be processed: ${vpackage.error}` :
                this.set(vspecifier, vpackage);
        }

        const promises = [];
        const entries = await fs.readdir(this.#path, {withFileTypes: true});
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            if (!entry.name.startsWith('@')) {
                await process(entry.name);
                continue;
            }

            const scope = entry.name;
            const entries = await fs.readdir(join(this.#path, scope), {withFileTypes: true});
            for (const entry of entries) {
                entry.isDirectory() && await process(`${scope}/${entry.name}`);
            }
        }

        await Promise.all(promises);
    }

    async install(pkg, version) {
        const downloader = new Downloader(pkg, version, this.#path);
        await downloader.process();
    }
}
