module.exports = function (error) {
    const {message, stack} = error;
    console.log(message);
    stack?.forEach(frame => {
        const {is, file, line, column} = frame;
        if (is === 'native') return;
        console.log(`\t[${line}, ${column}]: ${file}`);
    });
}
