const applications = [
    'applications/get',
    'applications/list',
    'applications/ready',
    'applications/build',
    'applications/static/get',
    'applications/static/list',
    'applications/libraries/get',
    'applications/libraries/list',
    'applications/libraries/count',
    'applications/declarations/update',
    'applications/declarations/updateAll',
    'applications/deployments/list',
    'applications/deployments/get',
    'applications/distributions/list',
    'applications/distributions/get',
    'applications/modules/get',
    'applications/modules/list',
    'applications/modules/count',
    'applications/modules/bundles/get',
    'applications/modules/bundles/consumers/get',
    'applications/modules/bundles/consumers/list',
    'applications/modules/bundles/packagers/get',
    'applications/modules/bundles/packagers/list',
    'applications/modules/bundles/packagers/compilers/get',
    'applications/modules/processors/get',
    'applications/modules/processors/sources/list',
    'applications/modules/processors/sources/get',
    'applications/modules/processors/overwrites/list',
    'applications/modules/processors/overwrites/get',
    'applications/modules/processors/compilers/get',
    'applications/modules/processors/dependencies/list',
    'applications/modules/processors/dependencies/get'
];
const libraries = [
    'libraries/get',
    'libraries/list',
    'libraries/static/get',
    'libraries/static/list',
    'libraries/modules/data',
    'libraries/modules/list',
    'libraries/modules/count',
];
const modules = [
    'modules/get',
    'modules/static/get',
    'modules/static/list',
    'modules/declarations/update'
];
const templates = [
    'templates/get',
    'templates/overwrites/get',
    'templates/overwrites/list',
    'templates/overwrites/path',
    'templates/processors/get',
    'templates/processors/sources/get',
    'templates/processors/sources/list',
    'templates/applications/get',
    'templates/applications/sources/get',
    'templates/applications/sources/list',
    'templates/global/get',
    'templates/global/sources/get',
    'templates/global/sources/list'
];
const other = [
    'server/wd',
    'server/config',
    'declarations/get',
    'bundles/get',
    'bundles/list',
];

module.exports = applications.concat(libraries, modules, templates, other);
