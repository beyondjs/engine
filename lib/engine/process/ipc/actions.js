const applications = [
    'applications/get',
    'applications/list',
    'applications/ready',
    'applications/process',
    'applications/static/get',
    'applications/static/list',
    'applications/declarations/update',
    'applications/declarations/updateAll',
    'applications/deployments/list',
    'applications/deployments/get',
    'applications/distributions/list',
    'applications/distributions/get',
    'applications/modules/get',
    'applications/modules/list',
    'applications/modules/count'
];

const modules = [
    'modules/get',
    'modules/static/get',
    'modules/static/list',
    'modules/declarations/update'
];
const bundles = [
    'bundles/get',
    'bundles/consumers/get',
    'bundles/consumers/list',
    'bundles/packagers/get',
    'bundles/packagers/list',
    'bundles/packagers/compilers/get'
];
const processors = [
    'processors/get',
    'processors/sources/list',
    'processors/sources/get',
    'processors/compilers/get',
    'processors/overwrites/list',
    'processors/overwrites/get',
    'processors/dependencies/list',
    'processors/dependencies/get'
];
const templates = [
    'templates/get',
    'templates/applications/get',
    'templates/applications/sources/get',
    'templates/applications/sources/list',
    'templates/global/get',
    'templates/global/sources/get',
    'templates/global/sources/list',
    'templates/processors/get',
    'templates/processors/sources/get',
    'templates/processors/sources/list',
    'templates/overwrites/get',
    'templates/overwrites/list',
    'templates/overwrites/path'
];
const other = [
    'server/wd',
    'server/config',
    'declarations/get',
    'global-bundles/get',
    'global-bundles/list',
];

module.exports = applications.concat(modules, bundles, processors, templates, other);
