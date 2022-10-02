module.exports = async function (application, distribution, language, specs) {
    if (distribution.platform !== 'web') {
        return new global.Resource({
            404: 'Resource not found.\n' +
                `Actual distribution platform is "${distribution.platform}".`
        });
    }

    const {html, errors} = await application.resources.index.content(distribution, language, specs);
    if (errors?.length) {
        let message = `<h1>${errors.length} ${errors.length === 1 ? 'error' : 'errors'} found:<br/></h1>`;
        message += '<ul>';
        errors.forEach(error => message += `<li>${error}</li>`);
        message += '</ul>';
        return new Resource({404: message, extname: '.html'});
    }

    return new Resource({type: 'content', content: html, extname: '.html'});
}
