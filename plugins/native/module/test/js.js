const {Code} = require('beyond/plugins/sdk');

module.exports = class extends Code {
    process() {
        return {code: 'console.log("hello world");'};
    }
}
