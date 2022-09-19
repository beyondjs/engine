// module.exports = bundles => Error.prepareStackTrace = function (err, frames) {
//     if (!frames?.length) {
//         return err instanceof Error ? err.stack : void 0;
//     }
//
//     let stack = `${err.message}`;
//     for (const frame of frames) {
//         const original = {};
//
//         original.is = frame.isNative() ? 'native' : 'node';
//         original.fnc = frame.getFunctionName();
//         original.method = frame.getMethodName();
//         original.top = frame.isToplevel();
//         original.constructor = frame.isConstructor();
//         original.async = frame.isAsync();
//         original.file = frame.getFileName();
//         original.line = frame.getLineNumber();
//         original.column = frame.getColumnNumber();
//
//         const push = ({is, found, fnc, method, top, constructor, async, file, line, column}) => {
//             // Actually unused properties
//             void (found);
//             void (top);
//             void (constructor);
//
//             async = async ? 'async ' : '';
//             const name = (fnc ? `${fnc} ` : '') + (!fnc && method ? `${method} ` : '');
//             const location = (file ? `${file}` : '') + (line && column ? `:${line}:${column}` : '');
//             stack += `\n    at [${is}] ${name}(${location ? location : '<anonymous>'})`;
//         }
//
//         const uri = (() => {
//             if (!original.file) return;
//
//             const done = file => {
//                 file = sep === '/' ? file : file.replace(/\//g, sep);
//
//                 // remove the extension
//                 return file.slice(0, file.length - 3);
//             }
//
//             const {sep} = require('path');
//             let file = original.file.split(`${sep}node_modules${sep}`);
//             if (file.length > 1) return done(file.pop()); // When the file is inside node_modules
//             file = file[0];
//
//             if (file.startsWith(`${bundles.project.path}${sep}`)) {
//                 const pkg = bundles.project.package;
//                 return done(`${pkg}/${file.slice(bundles.project.path.length + 1)}`);
//             }
//         })();
//
//         if (uri && bundles.has(uri)) {
//             const bundle = bundles.get(uri);
//             const {map} = bundle;
//
//             const entry = map.findEntry(original.line, original.column);
//             const file = entry.originalSource;
//             const line = entry.originalLine;
//             const column = entry.originalColumn;
//
//             if (file && line) {
//                 const found = true, is = 'beyond';
//                 push(Object.assign(original, {found, is, entry, file, line, column}));
//             }
//             else {
//                 push(Object.assign(original, {found: false}));
//             }
//         }
//         else {
//             push(Object.assign(original, {found: false}));
//         }
//     }
//
//     return stack;
// }
