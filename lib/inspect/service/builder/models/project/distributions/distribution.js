const {crc32, equal} = global.utils;
module.exports = class Distribution extends require('../../file-manager') {

    #existing;
    skeleton = [
        "name",
        "environment",
        {
            name: "ssr", type: 'string',
            pipe: ({data: {ssr}}) => {
                return this.checkRelationship('ssr', ssr)
            }
        },
        {
            name: "backend", type: 'string',
            pipe: ({data: {backend}}) => this.checkRelationship('backend', backend)
        },
        {
            name: "platform",
            type: 'string',
            required: true,
            values: [
                "web", "android", "ios", "deno", "npm", "node", "backend", "ssr"
            ]
        },
        {
            name: "ports",
            type: 'object',
            pipe: ({data}) => {
                const {ports: {http, inspect, bundles}} = data;
                const isEqual = (port, elements) => {
                    if (port !== undefined && elements.includes(port)) {
                        throw new Error('The ports configured need to be different')
                    }
                }
                isEqual(http, [inspect, bundles]);
                isEqual(inspect, [http, bundles]);
                isEqual(bundles, [inspect, http]);
                return true;
            },
            properties: [
                {
                    name: "http",
                    type: 'number',
                },
                {
                    name: "bundles",
                    type: 'number',
                },
                {
                    name: "inspect",
                    type: 'number',
                },
            ]
        },
        {
            name: "ts", type: 'object', required: false,
            properties: [
                {name: 'compiler', type: 'string', values: ['tsc', 'transpiler']}
            ]
        },

        {
            name: "minify",
            type: 'object',
            properties: [
                {name: "css", type: "boolean"},
                {name: "js", type: 'boolean'},
                {name: "html", type: "boolean"}
            ]
        },
        {name: "maps", type: 'string', values: ["inline", "externals"]},
        {
            name: "bundles", type: 'object',
            properties: [
                {name: "mode", type: 'string', values: ["sjs", "amd", "cjs", "esm"]}
            ]
        },
        {name: "imports", type: "object"}
    ];

    constructor(path, existing = []) {
        super(path);
        this.#existing = existing

    }

    edit(specs) {
        this._checkProperties(specs);
    }

    checkRelationship = (name, value) => {
        if ([undefined, 'undefined', ''].includes(value)) return true;
        if (!this.#existing.includes(value)) {
            // throw new Error(`The value of the ${name} property  must be an existing distribution, got: ${value}`)
        }
        return true;
    }

    get compute() {

        return crc32(equal.generate({
            platform: this.platform,
            ssr: !!this.ssr,
            server: !!this.server,
            environment: this.environment,
            compress: this.compress,
            bundles: this.bundles,
            ports: this.ports,
            minify: this.minify,
            ts: this.ts
        }));
    }

    get generate() {
        return equal.generate({
            name: this.name,
            platform: this.platform,
            ssr: this.ssr,
            server: this.server,
            environment: this.environment,
            bundles: this.bundles,
            minify: this.minify,
            ports: JSON.stringify(this.ports),
            ts: this.ts
        });
    }

    get state() {
        return {
            platform: this.platform,
            ssr: !!this.ssr,
            server: !!this.server,
            environment: this.environment,
            compress: this.compress,
            bundles: this.bundles,
            ts: this.ts
        }
    }

    hasPorts(toCheck) {
        const {ports: {http, inspect, bundles}} = this;
        const ports = [...new Set([http, inspect, bundles])].filter(item => item !== undefined)
        const answer = Object.keys(toCheck).find(item => ([http, inspect, bundles].includes(toCheck[item])));
        return answer;
    }
}
