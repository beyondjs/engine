const {NamespaceTypes} = require('beyond/plugins/sdk');
const {sep} = require('path');

module.exports = class extends Map {
    constructor(processor, emitted) {
        super();

        const path = (() => {
            const {path} = processor;
            return sep === '/' ? path : path.replace(/\\/g, '/');
        })();

        const ims = new Map();
        emitted.forEach((content, file) => {
            if (!file.startsWith(path)) return;
            const relative = file.slice(path.length + 1);
            if (relative === 'tsconfig.tsbuildinfo') return;

            const ext = (() => {
                if (relative.endsWith('.d.ts.map')) return '.d.ts.map';
                if (relative.endsWith('.d.ts')) return '.d.ts';
            })();
            if (!ext) return;

            const specifier = './' + relative.slice(0, relative.length - ext.length);
            const im = (() => {
                if (ims.has(specifier)) return ims.get(specifier);
                return {};
            })();

            const is = ext === '.d.ts.map' ? 'map' : 'code';
            im[is] = (() => {
                if (is === 'map') return content;

                // Remove the sourcemap reference to the source file left by typescript
                return content.replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');
            })();
            ims.set(specifier, im);
        });

        ims.forEach(({code, map}, specifier) => {
            const namespace = new NamespaceTypes({specifier, code, map});
            ims.set(specifier, namespace)
        });
    }
}
