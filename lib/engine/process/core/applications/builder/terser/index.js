import { minify } from 'terser';

/**
 * Minify JS code with maximum compatibility and safe handling for APIs like FormData/fetch.
 *
 * @param {string} code - Source code to minify
 * @param {string} [filename] - Logical file name for the sourcemap
 * @param {object} [distribution] - Compilation configuration
 * @returns {Promise<{ code: string, map?: string }>} Minified code and map (if applicable)
 */
export async function terser(code, filename, distribution) {
	const { mangle, compress } = distribution.minify.js;
	const { maps } = distribution;

	const sourceMapConfig =
		maps === 'inline'
			? { filename, url: 'inline' }
			: maps === 'external'
			? { filename, url: `${filename}.map` }
			: false;

	const compressConfig = {
		ecma: 5,
		passes: 1, // Safe level of compression
		arrows: false, // Avoids converting functions to arrow functions
		booleans: true, // Simplifies boolean expressions
		comparisons: false, // Prevents reordering expressions that could alter logic
		typeofs: false, // Keeps typeof checks unchanged
		keep_fargs: true, // Keeps unused function arguments (useful for APIs)
		keep_infinity: true, // Prevents Infinity from being replaced incorrectly
		unsafe: false,
		reduce_funcs: false,
		side_effects: false,
		unused: false // 🔒 evita eliminar llamadas "sin uso"
	};

	const result = await minify(code, {
		ecma: 5,
		safari10: true, // Fixes known Safari 10 bugs
		compress: compress ? compressConfig : false,
		mangle: mangle ? { safari10: true, toplevel: false } : false,
		sourceMap: sourceMapConfig || undefined,
		output: { comments: false, ascii_only: true }
	});

	return { code: result.code || '', map: maps === 'external' ? result.map : undefined };
}
