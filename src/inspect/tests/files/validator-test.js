module.exports = {
    skeleton: [
        "name",
        "environment",
        {
            name: "ssr", type: 'string',
            pipe: ({data: {ssr}}) => this.checkRelationship('ssr', ssr)
        },
        {
            name: "backend", type: 'string',
            pipe: ({data: {backend}}) => this.checkRelationship('ssr', backend)
        },
        {
            name: "platform",
            type: 'string',
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
                    required: false
                },
                {
                    name: "bundles",
                    type: 'number',
                    required: false
                },
                {
                    name: "inspect",
                    type: 'number',
                    required: false
                },
            ]
        },
        {name: "ts", type: 'boolean'},

        {
            name: "minify",
            type: 'object',
            properties: [
                {name: "css", type: "boolean", required: false},
                {name: "js", type: 'boolean', required: false},
                {name: "html", type: "boolean", required: false}
            ]
        },
        {name: "gzip", type: 'boolean'},
        {name: "maps", type: 'string', values: ["inline", "externals"]},
        {
            name: "bundles", type: 'object',
            properties: [
                {name: "mode", type: 'string', values: ["sjs", "amd", "cjs", "esm"]}
            ]
        },
        {
            name: "imports",
            type: "object",

        }

    ],
    dist: {
        "name": "web",
        "platform": "web",
        "environment": "development",
        "ports": {
            "http": 3500,
            "bundles": 3500,
        },

        "default": true,
        "backend": "backend",
        "imports": {
            "@beyond/ui": "web",
            "@beyond-js/kernel": "web",
            "@beyond-js/backend": "web",
            "@beyond-js/widgets": "web",
            "@beyond-js/react-widgets": "web",
            "@beyond-js/svelte-widgets": "web",
            "@beyond-js/vue-widgets": "web"
        }
    },
}
