/**
 * Minify css
 *
 * @param source
 */
module.exports = function (source) {
    'use strict';

    const cleaned = new (require('clean-css'))().minify(source);
    const {errors, warnings} = cleaned;

    if (errors.length) return {errors};

    let {styles} = cleaned;
    styles = styles.replace(/'/g, '"'); // Replace ' with "
    return {styles, errors, warnings};
}
