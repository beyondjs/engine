/*
 * jsonS: json source entry... module as a folder
 * jsonE: json exports entry
 */
module.exports = (extension, subpath) => {
	const [m, b, l] = subpath.split('.');
	const entry = !b ? `${m}` : !l ? `${m}/${b}` : `${m}/${b}/${l}`;
	if (extension === 'cjs.js') {
		return {
			jsonS: {
				main: `./${subpath}.${extension}`,
				node: { require: `./${subpath}.${extension}` },
			},
			jsonE: { node: { require: `./${entry}/${subpath}.${extension}` } },
		};
	}
	if (extension === 'mjs') {
		return {
			jsonS: { node: { import: `./${subpath}.${extension}` } },
			jsonE: { node: { import: `./${entry}/${subpath}.${extension}` } },
		};
	}

	let type;
	extension === 'css' && (type = 'css');
	extension === 'd.ts' && (type = 'types');
	extension === 'sjs.js' && (type = 'sjs');
	extension === 'amd.js' && (type = 'amd');
	extension === 'browser.mjs' && (type = 'browser');

	const jsonS = {};
	jsonS[type] = `./${subpath}.${extension}`;

	const jsonE = {};
	jsonE[type] = `./${entry}/${subpath}.${extension}`;

	if (extension === 'browser.mjs') {
		jsonS.module = `./${subpath}.${extension}`;
		jsonE.module = `./${entry}/${subpath}.${extension}`;
	}

	return { jsonS, jsonE };
};
