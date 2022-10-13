const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor(Map) {
    /**
     * Normalized exports
     *
     * @type {Map<string, Map<string, string>>}
     */
    #entries = new Map();

    /**
     * Normalize the different alternatives to specify the exports in the package.json into
     * a Map of exports/conditions
     *
     * @param json
     * @return {*}
     */
    #normalize(json) {
        const entries = typeof json.exports === 'object' ? Object.entries(json.exports) : void 0;
        const exports = new Map(entries);

        if (!exports.has('.')) {
            const conditional = {};
            const sanitize = path => !path.startsWith('./') ? `./${path}` : path;
            json.module && (conditional.module = conditional.browser = sanitize(json.module));
            json.main && (conditional.default = sanitize(json.main));

            exports.set('.', conditional);
        }

        // Convert the conditional exports of each subpath in a map instead of an object
        exports.forEach((conditions, subpath) => {
            conditions = typeof conditions === 'string' ? {default: conditions} : conditions;
            exports.set(subpath, new Map(Object.entries(conditions)));
        });
        return exports;
    }

    constructor(json) {
        super();
        this.#entries = this.#normalize(json);
    }

    solve(subpath, {platform, kind}) {
        subpath = subpath ? subpath : '.';
        if (!this.#entries.has(subpath)) return;

        const order = (() => {
            const formatted = ['require-call', 'require-resolve'].includes(kind) ? 'require' : 'import';
            if (platform === 'web') return ['browser', 'module', formatted, 'default'];
            if (platform === 'node') return ['node', 'module', formatted, 'default'];
            if (platform === 'deno') return ['deno', 'module', formatted, 'default'];
        })();

        const conditions = this.#entries.get(subpath);
        const found = order.find(condition => conditions.has(condition) && conditions.get(condition));
        return found ? conditions.get(found) : void 0;
    }
}
