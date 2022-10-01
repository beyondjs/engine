module.exports = (errors, input, functions, diagnostics) => errors.forEach(error => {
    let {line, character, text} = error;
    if (!line) {
        diagnostics.general.push(text);
        return;
    }

    // Find the file where the error belongs to
    let counter = functions && functions.source ? (functions.source.lines - 1) : 0;

    const found = input.sources.find(source => {
        if (line > counter + source.lines) {
            counter += source.lines;
            return;
        }

        line = line - counter;
        return true;
    });

    let e;
    if (found.is === 'source') {
        e = diagnostics.files.has(found.file) ? diagnostics.files.get(found.file) : [];
        diagnostics.files.set(found.relative.file, e);
    }
    else {
        e = diagnostics.overwrites.has(found.file) ? diagnostics.overwrites.get(found.file) : [];
        diagnostics.overwrites.set(found.relative.file, e);
    }
    e.push({line, character, message: text});
});




