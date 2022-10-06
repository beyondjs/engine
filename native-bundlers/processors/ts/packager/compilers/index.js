module.exports = new class {
    get(packager) {
        const {distribution} = packager.processor.specs;

        const compilers = ['tsc', 'transpiler'];
        let name = distribution.ts && compilers.includes(distribution.ts.compiler) && distribution.ts.compiler;
        name = distribution.dashboard ? 'tsc' : name;
        name = name ? name : 'transpiler';

        return name === 'transpiler' ? require('./transpiler') : require(`./tsc`);
    }
}
