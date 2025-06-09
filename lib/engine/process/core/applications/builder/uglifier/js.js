const { minify } = require('uglify-js');

module.exports = function (file, content) {
	/*
	 * Code previously minified by the bundler
	 * engine\lib\engine\process\bundler\bundle\packager\code\js\package\index.js
	 */
	if (file !== 'config.js') return { code: content };

	const { code, error } = minify(content, { mangle: false });
	return error ? { errors: [error] } : { code };
};
