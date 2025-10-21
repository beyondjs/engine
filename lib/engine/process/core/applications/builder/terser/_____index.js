import { minify } from 'terser';

/**
 * Minify JS code with maximum compatibility (including Safari 10)
 *
 * @param {string} code - Source code to minify
 * @param {string} [filename] - Logical file name for the sourcemap
 * @param {object} [options] - Compilation options
 * @param {boolean} [options.mangle=true] - Whether to mangle variables
 * @param {boolean} [options.compress=true] - Whether to compress the code
 * @param {'inline'|'external'} [options.maps] - Sourcemap type (inline, external, or no map)
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

	const result = await minify(code, {
		ecma: 5, // salida compatible con ES5
		safari10: true, // corrige bugs Safari 10
		compress: compress
			? {
					ecma: 5,
					passes: 2, // más optimización
					arrows: false,
					unsafe_arrows: false,
					booleans: true,
					comparisons: true,
					typeofs: false
			  }
			: false,
		mangle: mangle ? { safari10: true, toplevel: true } : false,
		sourceMap: sourceMapConfig || undefined,
		output: { comments: false, ascii_only: true }
	});

	return { code: result.code || '', map: maps === 'external' ? result.map : undefined };
}
