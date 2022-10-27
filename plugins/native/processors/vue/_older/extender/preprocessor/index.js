const vue = require('vue/compiler-sfc');
const Source = require('./source');

module.exports = class extends global.ProcessorsExtenderPreprocessor {
    _preprocess(updated) {
        const ts = updated.get('ts');
        const sass = updated.get('sass');

        for (const source of this.files.values()) {
            const {file} = source.relative;
            if (this.has(file) && this.get(file).original.hash === source.hash) {
                ts.set(file, this.get(file));
                continue;
            }

            const {errors, descriptor} = vue.parse(source.content, {});
            if (errors?.length) {
                // @TODO: report source errors
                return;
            }

            let {script, styles} = descriptor;
            script?.content && ts.set(file, new Source('source', source, script.content, script.map));

            styles = styles?.[0];
            styles?.content && sass.set(file, new Source('source', source, styles.content, styles.map));
        }
    }
}
