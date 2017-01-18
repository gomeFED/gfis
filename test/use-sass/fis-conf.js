//运行命令：fis3 release
fis.match('/css/(**.scss)', {
    rExt: '.css',
    parser: fis.plugin('node-sass', {
        //fis-parser-node-sass option
    })
});

// sass 里面的规范，一般_打头的文件都不 release.
fis.match('/css/{**/_*.scss,_*.scss}', {
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
