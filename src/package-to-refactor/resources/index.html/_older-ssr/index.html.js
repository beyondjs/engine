// if (platform === 'web.ssr') {
//     let {code, errors} = await this.#ssr.content(url.pathname, language);
//     if (errors?.length) return {errors};
//
//     code = `<script>\n${code}\n</script>\n`;
//     code = code.replace(/\n/g, '\n    ');
//
//     html = html.replace(/(<!--(\s*)#beyond\.ssr(\s*)-->)/i, code);
//     return {html};
// }
