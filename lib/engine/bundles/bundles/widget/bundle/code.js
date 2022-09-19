module.exports = class extends global.BundleJsCode {
    constructor(...params) {
        super(...params);
    }

    _precode() {
        const {bundle} = this.packager;
        const {properties} = bundle;
        if (!properties.element) return;

        const specs = {
            name: properties.element.name,
            attrs: properties.element.attrs,
            vspecifier: bundle.vspecifier
        };
        properties.is && (specs.is = properties.is);
        properties.render && (specs.render = properties.render);
        properties.route && (specs.route = properties.route);
        properties.layout && (specs.layout = properties.layout);

        return `brequire('@beyond-js/widgets/render').widgets.register([${JSON.stringify(specs)}]);\n`;
    }
}
