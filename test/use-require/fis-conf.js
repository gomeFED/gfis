
// npm install [-g] fis3-hook-amd
fis.hook('amd');

fis.match('/js/**/*.js', {
    isMod: true
});

fis.match('::package', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'amd',
        useInlineMap: true // 资源映射表内嵌
    })
})

// fis3 release prod 产品发布，进行合并
/*fis.media('prod')
    .match('*.js', {
        packTo: '/static/aio.js'
    });*/
fis.match('*', {
    useCache: false,
    deploy: fis.plugin('local-deliver', {
        to: './build'
    })
});

fis.match('/build/**', {
    release: false
});
