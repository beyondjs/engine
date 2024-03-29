const path = require('path').join(__dirname, "../../templates");
const tpl = require('path').join(path, "template.json");
module.exports = function () {
    const {Template} = (require('./models'));

    this.delete = async params => {
        const template = new Template(tpl, path);
        await template.delete(params);
    };

    this.update = async params => {
        const template = new Template(tpl, path);
        await template.save(params);
    };
}
