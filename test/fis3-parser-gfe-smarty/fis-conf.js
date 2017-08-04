//运行命令：fis3 release
fis.match('/html/**.tpl', {
    parser: fis.plugin('gfe-smarty')
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