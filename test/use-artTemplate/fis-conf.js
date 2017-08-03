//npm install -g fis-parser-artc

fis.match('tpl/*.html', {
    rExt: '.js', 
    parser: fis.plugin('artc', {
    }),
    release: false // art-template 源文件不需要编译
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