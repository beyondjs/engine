module.exports = function (helpers) {
    this.sources = new (require('./sources'))(helpers);
    this.data = async params => helpers.data(params, 'templates/global/get');
}