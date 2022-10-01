const regex = /^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
const check = name => regex.test(name);

// https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
const reserved = new Set([
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-src',
    'font-face-uri',
    'font-face-format',
    'font-face-name',
    'missing-glyph'
]);

function processError(name) {
    if (!name) return 'Missing element name.';
    if (/[A-Z]/.test(name)) return 'Custom element names must not contain uppercase ASCII characters.';
    if (!name.includes('-')) return 'Custom element names must contain a hyphen. Example: unicorn-cake';
    if (/^\d/i.test(name)) return 'Custom element names must not start with a digit.';
    if (/^-/i.test(name)) return 'Custom element names must not start with a hyphen.';
    if (!check(name)) return 'Invalid element name.';
    if (reserved.has(name)) return 'The supplied element name is reserved and can\'t be used.\n' +
        'See: https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name';
}

function processWarning(name) {
    if (/^polymer-/i.test(name)) return 'Custom element names should not start with `polymer-`.\n' +
        'See: http://webcomponents.github.io/articles/how-should-i-name-my-element';
    if (/^x-/i.test(name)) return 'Custom element names should not start with `x-`.\n' +
        'See: http://webcomponents.github.io/articles/how-should-i-name-my-element/';
    if (/^ng-/i.test(name)) return 'Custom element names should not start with `ng-`.\n' +
        'See: http://docs.angularjs.org/guide/directive#creating-directives';
    if (/^xml/i.test(name)) return 'Custom element names should not start with `xml`.';
    if (/^[^a-z]/i.test(name)) return 'This element name is only valid in XHTML, not in HTML. First character should be in the range a-z.';
    if (name.endsWith('-')) return 'Custom element names should not end with a hyphen.';
    if (/\./.test(name)) return 'Custom element names should not contain a dot character as it would need to be escaped in a CSS selector.';
    if (/[^\u0020-\u007E]/.test(name)) return 'Custom element names should not contain non-ASCII characters.';
    if (/--/.test(name)) return 'Custom element names should not contain consecutive hyphens.';
    if (/[^a-z\d]{2}/i.test(name)) return 'Custom element names should not contain consecutive non-alpha characters.';
}

module.exports = function (name) {
    const error = processError(name);
    const warning = error ? undefined : processWarning(name);
    return {error, warning};
}
