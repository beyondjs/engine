const prettier = require("prettier");
module.exports = function (parent) {
    parent.format = async function ({filename, content}) {
        try {
            const formattedText = prettier.format(content, {
                parser: 'babel',
                filepath: filename,
                singleQuote: true,
            });

            return {status: true, text: formattedText};
        }
        catch (e) {
            console.error(e);
            return {error: e};
        }
    };
}
