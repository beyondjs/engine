const { minify } = require('uglify-js');

module.exports = function (file, content) {
	/*
	 * Code previously minified by the bundler
	 * engine\lib\engine\process\bundler\bundle\packager\code\js\package\index.js
	 *
	 * old code
	 *
	 * const { code, error } = minify(content, { compress: true, mangle: false });
	 * return error ? { errors: [error] } : { code };
	 */

	return { code: content };
};
