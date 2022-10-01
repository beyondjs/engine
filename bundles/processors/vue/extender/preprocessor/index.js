const vue = require('vue/compiler-sfc');

module.exports = class extends global.ProcessorsExtenderSinglyPreprocessor {
    async _preprocessSource(source) {
        const filename = source.relative.file;
        const scopeId = filename
            .slice(0, filename.length - 4) // remove .vue extension
            .replace(/\//g, '__');

        const extensions = new Map();

        try {
            const {errors, descriptor} = vue.parse(source.content, {});
            if (errors?.length) return {errors};

            let {script, styles} = descriptor;
            script = script?.content && vue.compileScript(descriptor, {id: scopeId});
            script && extensions.set('ts', {code: script.content, map: script.map});

            styles = styles?.[0];
            styles?.content && extensions.set('sass', {code: styles.content, map: styles.map});
        }
        catch (exc) {
            console.log(exc.stack);
            return {errors: [exc.message]};
        }

        return {extensions};
    }
}
