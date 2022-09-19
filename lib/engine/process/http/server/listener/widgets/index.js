module.exports = async function (application, distribution, url) {
    'use strict';

    if (!url.pathname.startsWith('/__sr_widgets__/')) return;

    const {widgets} = application;
    await widgets.ready;

    const split = url.pathname.slice('/__sr_widgets__/'.length).split('/');
    if (split.length !== 1) return new global.Resource({'404': 'Widget static resource url is invalid'});
    const resource = split[0];

    if (resource === 'list') {
        const resources = {};
        const instances = {};
        for (const [key, widget] of widgets) {
            const {resource, properties, uri, attributes: attrs} = widget;

            !resources.hasOwnProperty(resource) && (resources[resource] = {properties});

            const url = await widgets.url(key, distribution);
            instances[key] = {resource, uri, url};

            if (attrs) {
                const attributes = {};
                attrs.forEach(([key, value]) => attributes[key] = value);
                instances[key].attributes = attributes;
            }
        }

        return new global.Resource({content: `${JSON.stringify({resources, instances})}`, extname: '.json'});
    }

    if (!widgets.has(resource)) return new global.Resource({'404': `Widget static resource "${resource}" not found`});

    if (!distribution.ssr) {
        const errors = ['Application must have ssr configured to be able to process static widgets'];
        const content = JSON.stringify({errors});
        return new global.Resource({content, extname: '.json'});
    }

    const processed = await application.widgets.process(resource, distribution);
    const content = JSON.stringify(processed);
    return new global.Resource({content, extname: '.json'});
}
