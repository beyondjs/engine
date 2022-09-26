const fs = require('fs');
const archiver = require('archiver');

module.exports = (builder, source, destination) => new Promise((resolve, reject) => {
    'use strict';

    const output = fs.createWriteStream(destination);
    const archive = archiver('zip', {
        'store': true // Sets the compression method to STORE
    });

    output.on('close', function () {
        const {application} = builder;
        builder.emit('message', `Application "${application.name}" has been archived, ` +
            `${archive.pointer()} bytes processed`);
        resolve();
    });

    archive.on('error', function (err) {
        builder.emit('error', err);
        reject(err);
    });

    archive.pipe(output);
    archive.directory(source, false);
    archive.finalize();
});
