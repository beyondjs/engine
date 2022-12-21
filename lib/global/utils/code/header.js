module.exports = function (text) {

    let header = '';
    header += '/';
    header += (new Array(text.length).join('*'));
    header += `\n${text}\n`;
    header += (new Array(text.length).join('*'));
    header += '/\n';

    return header;

};
