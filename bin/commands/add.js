module.exports = {
    command: 'add [option]',
    description: 'Add package or module in beyondJS',
    handler: ({option}) => {
        if (option === 'module' || option === 'package') {
            require(`./${option}`)();
            return;
        }

        console.log('Command:\n  beyond add [option]    Add package or module in beyondJS');
        console.log('  option: package | module');
    }
}
