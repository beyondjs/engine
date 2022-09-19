module.exports = function (application) {
    'use strict';

    // The index.html resource
    this.index = new (require('./index.html'))(application);
    this.cordova = require('./cordova')(application);

    // Icons and splash screens
    const icons = new (require('./pictures.js'))(application, 'icons');
    const screens = new (require('./pictures.js'))(application, 'screens');
    Object.defineProperty(this, 'icons', {'get': () => icons});
    Object.defineProperty(this, 'screens', {'get': () => screens});
}
