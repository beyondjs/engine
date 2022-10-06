module.exports = function (compiler) {
    let output = '';

    compiler.files.forEach(compiled => compiled.exports.forEach(exported => {
        const module = compiled.relative.file;

        let {name, from} = exported;
        const namespace = require('../modules/namespaces/name')(compiler, module);

        output += name !== 'default' ?
            `export import ${name} = ${namespace}.${from};\n` :
            `export default ${namespace}._default;\n`;
    }));
    return output;
}
