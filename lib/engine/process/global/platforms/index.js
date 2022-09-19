const platforms = {
    ssr: ['ssr'],
    web: ['web'],
    mobile: ['android', 'ios'],
    nodeExceptSSR: ['backend', 'node']
};
platforms.node = [].concat(platforms.nodeExceptSSR).concat(platforms.ssr);
platforms.webAndMobile = [].concat(platforms.web).concat(platforms.mobile);
platforms.webAndMobileAndSSR = [].concat(platforms.webAndMobile).concat(platforms.ssr);
platforms.all = [].concat(platforms.webAndMobile).concat(platforms.node);

module.exports = platforms;
