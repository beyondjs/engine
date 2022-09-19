/**
 * Show diagnostics of the dependencies of the application
 *
 * @param dependencies {object}
 * @return {Promise<*>}
 */
module.exports = async function (dependencies) {
    let content = `<h1>Application dependencies report</h1>`;
    content += `<h2>Diagnostics report</h2>`;

    const {diagnostics} = dependencies;
    if (!diagnostics.size) {
        content += 'No errors reported.';
    }
    else {
        diagnostics.forEach(({errors, warnings}, specifier) => {
            // Process the errors
            (() => {
                if (!errors?.length) return;
                content += `<h3>Bundle "${specifier}" processed with ${errors.length} errors:</h3>`;
                content += '<ul>';
                errors.forEach(error => content += `<li>${error}</li>`);
                content += '</ul>';
            })();

            // Process the warnings
            (() => {
                if (!warnings?.length) return;
                content += `<h3>Bundle "${specifier}" processed with ${warnings.length} warnings:</h3>`;
                content += '<ul>';
                warnings.forEach(warning => content += `<li>${warning}</li>`);
                content += '</ul>';
            })();
        });
    }

    return await require('../info/html')(content, !diagnostics.size ? '200' : '500');
}
