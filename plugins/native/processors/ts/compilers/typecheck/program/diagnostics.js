const {Diagnostics} = require('beyond/plugins/sdk');

module.exports = class extends Diagnostics {
    constructor(diagnostics) {
        super();
        console.log('complete diagnostics', diagnostics);
        diagnostics.forEach(diagnostic => {
        });
    }
}
