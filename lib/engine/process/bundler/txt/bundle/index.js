module.exports = class extends require('../../bundle') {
    processConfig(config) {
        if (!['object', 'string'].includes(typeof config)) {
            return {errors: ['Invalid configuration']};
        }

        config = typeof config === 'string' ? {txt: {files: config}} : {txt: config};

        // The path is processed as the bundle path, not the processor's path
        delete config.txt.path;

        if (typeof config.txt === 'object') {
            const {multilanguage} = config.txt;
            config.multilanguage = multilanguage === undefined ? true : !!multilanguage;
            delete config.txt.multilanguage;
        }

        return {value: config};
    }
}
