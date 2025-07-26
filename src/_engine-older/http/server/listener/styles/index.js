module.exports = async function (application, distribution, url) {
    const pathnames = ['/styles.css', '/styles.css.map', '/global.css', '/global.css.map'];
    let {pathname} = url;
    if (!pathnames.includes(pathname)) return;

    const requiring = pathname.endsWith('.map') ? 'map' : 'css';
    pathname = requiring === 'map' ? pathname.slice(0, pathname.length - 4) : pathname;

    const is = pathname.startsWith('/styles.css') ? 'application' : 'global';

    const styles = application.styles[is].get(distribution);
    await styles.ready;

    const {code, map} = (() => {
        if (!styles.valid || !styles.value) return {};
        const code = styles.value;
        return typeof code === 'string' ? {code} : code;
    })();

    const info = url.searchParams.has('info');
    if (info) {
        return await require('./info')(styles);
    }
    else if (requiring === 'map') {
        const content = typeof map === 'object' ? JSON.stringify(map) : map;
        return new global.Resource({content, extname: '.map'});
    }
    else {
        const mode = distribution.maps;
        const content = code ? require('./sourcemap')(is, code, map, mode) : '';

        return styles.valid ?
            new global.Resource({content, extname: '.css'}) :
            new global.Resource({'500': 'Application styles compiled with errors'});
    }
}
