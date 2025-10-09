const { terser } = require('../terser');

module.exports = async function (file, content, distribution) {
	// const { code, error } = await minify(content, { mangle: false });
	const { code, error } = await terser(content, file, distribution);
	return error ? { errors: [error] } : { code };
};
