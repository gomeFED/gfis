//运行命令：fis3 release
fis.match('**/*.less', {
    rExt: '.css', // from .less to .css
    parser: fis.plugin('less-2.x', {
        // fis-parser-less-2.x option
    })
});

//less 里面的规范，一般_打头的文件都不 release.
fis.match('/css/{**/_*.less,_*.less}', {
    release: false
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