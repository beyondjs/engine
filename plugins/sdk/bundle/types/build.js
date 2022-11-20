module.exports = async function (targetedExport, local) {
    let code = '';

    const compiler = this.compiler;
    code += require('./modules')(compiler);
    code += require('./exports')(compiler);

    return code;
}
