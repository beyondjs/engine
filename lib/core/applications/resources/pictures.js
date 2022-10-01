/**
 @deprecated validar generacion de imagenes en diversas plataformas de deploy
 **/
module.exports = function (application, type) {
    'use strict';

    if (!['icons', 'screens'].includes(type)) throw new Error('Invalid "type" parameter');

    const fs = global.utils.fs;
    const Resource = global.Resource;

    const write = (image, target) => new Promise(resolve => image.write(target, resolve));

    this.get = async function (width, height, rebuild) {
        height = type === 'icons' ? width : height;

        if (!width || !height) throw new Error('Invalid paramters');

        const source = require('path').join(
            application.path,
            'resources',
            type === 'icons' ? 'icon.png' : 'splash.png'
        );

        if (!await fs.exists(source)) return;

        const target = require('path').join(
            application.path,
            'builds/temp',
            type,
            type === 'icons' ? `${width}.png` : `${width}x${height}.png`
        );

        if (!rebuild && await fs.exists(target))
            return new Resource({type: 'file', file: target, extname: '.png'});

        const jimp = require('jimp');
        const image = await jimp.read(source);

        await image.cover(width, height);
        await write(image, target);

        return new Resource({type: 'file', file: target, extname: '.png'});
    }
}
