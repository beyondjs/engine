module.exports = class TsConfig extends require('../../file-manager') {
    target = 'es2018';
    module = 'es2020';
    experimentalDecorators = true;
    allowSyntheticDefaultImports = true;
    moduleResolution = 'Node';
    jsx = 'react';

    _baseUrl = './';

    skeleton = [
        'module', 'target',
        'experimentalDecorators',
        'allowSyntheticDefaultImports',
        'moduleResolution', 'jsx'
    ];

    constructor(dirname) {
        super(dirname, 'tsconfig.json');

    }

    create() {
        const json = {};
        const properties = {};
        this.skeleton.forEach(property => {
            if (!this[property]) return;
            properties[property] = this[property];
        });
        json.compilerOptions = properties;
        this.file.writeJSON(json);
    }
}
