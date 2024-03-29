module.exports = (extension, subpath) => {
    /*
     * jsonS: json source entry... module as a folder
     * jsonE: json exports entry
     */

    if (extension === 'cjs.js') {
        return {
            jsonS: {
                main: `./${subpath}.${extension}`,
                node: {require: `./${subpath}.${extension}`}
            },
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
    extension === 'css' && (type = 'css');
    extension === 'd.ts' && (type = 'types');
    extension === 'sjs.js' && (type = 'sjs');
    extension === 'amd.js' && (type = 'amd');
    extension === 'browser.mjs' && (type = 'browser');

    const jsonS = {}, jsonE = {};
    jsonS[type] = `./${subpath}.${extension}`;
    jsonE[type] = `./${subpath}/${subpath}.${extension}`;

    if (extension === 'browser.mjs') {
        jsonS.module = `./${subpath}.${extension}`;
        jsonE.module = `./${subpath}/${subpath}.${extension}`;
    }

    return {jsonS, jsonE};
}