const {crc32} = global.utils;

module.exports = class extends global.ProcessorCode {
    get dp() {
        return 'txt.code.js';
    }

    _build() {
        const {processor, compiler} = this.packager;
        const {specs} = processor;
        const {application} = specs;
        const language = specs.language === '.' ? application.languages.default : specs.language;

        // Merge the texts of the different json files into one object
        const merged = {};
        compiler.files.forEach(source => require('./merge')(merged, source.compiled.code));
        compiler.overwrites.forEach(source => require('./merge')(merged, source.compiled.code));

        let json = this.multilanguage ? merged[language] : merged;
        json = typeof json === 'object' ? json : {};

        const stringified = JSON.stringify(json);
        const code = `exports.txt = ${stringified};`;
        const hash = crc32(stringified);

        const id = this.createImID('txt');
        const exports = [{from: 'txt', name: 'txt'}];
        const ims = new Map([[id, {id, hash, code, exports}]]);

        return {ims};
    }
}
