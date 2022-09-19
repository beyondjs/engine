/**
 * Just for legacy support
 *
 * @param processor
 * @return {string}
 */
module.exports = function (processor) {
    const {name} = processor;
    let content = `<h2>Processor "${name}"</h2>`;

    if (name === 'jsx') {
        const {compiler} = processor;
        if (compiler.valid) {
            content += 'No errors reported.';
        }
        else {
            const {errors} = compiler;
            content += `<h3>${errors.length} errors found</h3>`;
            content += '<ul>';
            errors.forEach(error => (content += `<li>${error}</li>`));
            content += '</ul>';
        }
    }

    // @deprecated: Just for backward compatibility
    if (name === 'js') {
        content += 'Processor "js" does not support diagnostics.';
    }

    return content;
}
