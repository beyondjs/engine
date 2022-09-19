module.exports = function (code) {
    if (!code) return code;

    // add an extra tab in all lines
    code = code.replace(/\n/g, '\n    ');
    code = `    ${code}\n`;
    return '(() => {\n\n' + code + '})();';
}
