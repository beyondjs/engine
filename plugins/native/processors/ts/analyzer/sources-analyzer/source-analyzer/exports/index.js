const ts = require('typescript');
const tsKind = ts.SyntaxKind;
const Export = require('./export');

module.exports = class extends Array {
    #source;

    #visit = (node) => {
        const source = this.#source;

        // Check if node export is at bundle level
        const check = node => {
            const text = source.text.substr(node.getStart(source), 40);
            return /\/\*(\s*)bundle(\s*)\*\//.test(text);
        };

        // Cases as:
        // export default 'hello'
        if (node.kind === tsKind.ExportAssignment) {
            const name = 'default';
            check(node) && this.push(new Export(name, source, node));
            return;
        }

        // Check if the current node has the 'export' modifier
        if (!node.modifiers || !node.modifiers.find(modifier => modifier.kind === tsKind.ExportKeyword)) return;

        if (node.name?.escapedText) {
            const name = node.name.escapedText;
            check(node) && this.push(new Export(name, source, node));
        }
        else if (node.declarationList && node.declarationList.declarations) {
            const {declarations} = node.declarationList;
            for (const declaration of declarations) {
                if (!declaration.name) continue;

                const name = declaration.name.escapedText;
                if (!name) continue;
                check(node) && this.push(new Export(name, source, declaration));
            }
        }
    }

    constructor(source) {
        super();
        this.#source = source;
        ts.forEachChild(source, this.#visit);
    }
}
