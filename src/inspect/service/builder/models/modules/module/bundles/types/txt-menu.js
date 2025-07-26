/**
 * Represent the txt bundle
 *
 * The text bundle is treat as a processor for this reason extends from
 * bundle object.
 *
 * @type {module.Bundle|{}}
 */
module.exports = class TextMenu extends require('./txt') {
    _identifier = 'txt-menu';
    multilanguage = true;

    _defaultName = 'texts.json';
    skeleton = [
        'hmr', 'multilanguage', 'files'
    ];
    _name = 'txt';

    constructor(module, specs = {}) {
        super(module, 'txt-menu', specs);
    }
}