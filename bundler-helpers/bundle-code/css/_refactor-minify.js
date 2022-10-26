module.exports = async function() {
    let errors, warnings;
    ({sourcemap, errors, warnings} = (() => {
        if (!cspecs.minify) return {sourcemap};

        const {code, map} = sourcemap;
        const cleaned = new (require('clean-css'))({sourceMap: true, target: '/'}).minify(code, map);
        const {errors, warnings} = cleaned;

        if (errors.length) return {errors, warnings};
        let {styles, sourceMap} = cleaned;

        sourcemap = {code: styles, map: JSON.parse(sourceMap.toString())};
        return {sourcemap, warnings};
    })());
}