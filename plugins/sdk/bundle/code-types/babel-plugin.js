module.exports = () => ({
    visitor: {
        ExportDeclaration: function (path) {
            console.log('export declaration', path.node.declaration.declarations[0].id.name);
            path.node.declaration.declarations[0].id.name = 'message_transformed';
        }
    }
});
