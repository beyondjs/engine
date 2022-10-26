module.exports = (extension, subpath) => {
    /*
     * jsonS: json source entry
     * jsonE: json exports entry
     */
    if (extension === 'cjs.js') {
        return {
            jsonS: {node: {require: `./${subpath}.${extension}`}},
            jsonE: {node: {require: `./${subpath}/${subpath}.${extension}`}}
        };
    }
    if (extension === 'mjs') {
        return {
            jsonS: {node: {import: `./${subpath}.${extension}`}},
            jsonE: {node: {import: `./${subpath}/${subpath}.${extension}`}}
        };
    }

    let type;
    extension === 'd.ts' && (type = 'types');
    extension === 'sjs.js' && (type = 'sjs');
    extension === 'amd.js' && (type = 'amd');
    extension === 'browser.mjs' && (type = 'browser');

    const jsonS = {}, jsonE = {};
    jsonS[type] = `./${subpath}.${extension}`;
    jsonE[type] = `./${subpath}/${subpath}.${extension}`;

    return {jsonS, jsonE};
}