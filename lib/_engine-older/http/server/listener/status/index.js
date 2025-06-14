const { Resource } = global;
const info = require('../info/html');

function render(title, items) {
	if (!items.length) return '';
	let output = `<h2>${title}</h2>`;
	output += '<ul>';
	items.forEach(info => (output += `<li>${info}</li>`));
	output += '</ul>';
	return output;
}
module.exports = async function (application) {
	let content = '<div style="white-space: pre-wrap; font-family: monospace;">';
	content += render('Application errors', application.errors);
	content += render('Application warnings', application.warnings);
	content += render('Bundlers errors', application.bundlers.errors);
	content += render('Bundlers warnings', application.bundlers.warnings);
	content += `</div>`;
	return info(content, '200');
};
