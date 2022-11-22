module.exports = async function (targetedExport) {
    let count = 0;
    targetedExport.processors.forEach(({types}) => types?.code !== void 0 && count++);
    if (!count) return;

    let code = '';
    const compiler = this.compiler;
    code += require('./modules')(compiler);
    code += require('./exports')(compiler);
    return code;
}
