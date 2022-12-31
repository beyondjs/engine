module.exports = contentType => contentTypes[contentType];

const contentTypes = {
    '.js': 'application/javascript',
    '.jsx': 'text/plain',
    '.ts': 'text/prs.typescript',
    '.tsx': 'text/prs.typescript',
    '.d.ts': 'text/prs.typescript',
    '.svelte': 'text/plain',
    '.vue': 'text/plain',
    '.scss': 'text/x-scss',
    '.svg': 'image/svg+xml',
    '.ico': 'image/ico',
    '.ttf': 'application/x-font-truetype',
    '.otf': 'application/x-font-opentype',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.sfnt': 'application/font-sfnt',
    '.css': 'text/css',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.jfif': 'image/jpeg',
    '.gif': 'image/gif',
    '.png': 'image/png',
    '.json': 'application/json',
    '.manifest': 'text/cache-manifest',
    '.webmanifest': 'application/manifest+json',
    '.map': 'application/json',
    '.js.map': 'application/json',
    '.xml': 'text/xml'
};