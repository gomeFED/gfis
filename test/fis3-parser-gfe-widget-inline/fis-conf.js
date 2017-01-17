//运行命令：fis3 release

fis.match('/html/**.ftl', {
    parser: fis.plugin('gfe-widget-inline', {
        widgets: { "global_head": "1.0.0", "cheap_web_header": "1.0.2" }
    })
});

fis.match('*', {
    useCache: false,
    deploy: fis.plugin('local-deliver', {
        to: './build'
    })
});

fis.match('/build/**', {
    release: false
});
