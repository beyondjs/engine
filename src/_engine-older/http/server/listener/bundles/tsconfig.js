module.exports = async function (processors) {
    'use strict';

    await processors.ready;
    const processor = processors.get('ts');
    if (!processor)
        return new global.Resource({'404': `The requested module does not have a "ts" processor`});

    await processor.options.ready;
    const {content, errors} = processor.options;

    if (errors.length)
        return new global.Resource({'404': `Could not generate tsconfig file:\n${errors.join(`\n`)}`});

    if (!content)
        return new global.Resource({'404': `The tsconfig file has not been obtained, check if the file exists or if it is in the bundle folder`});

    return new global.Resource({content: content, extname: '.json'});
}