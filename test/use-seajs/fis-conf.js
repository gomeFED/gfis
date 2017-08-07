
fis.match('/js/**/*.js', {
    isMod: true
});
fis.hook('cmd');
/*fis.hook('cmd', {
  baseUrl: './static/',

  paths: {
    "jquery": "jquery.js",
    "$": "jquery.js"
  }
});*/

fis.match('::packager', {
  postpackager: fis.plugin('loader',{
    useInlineMap: true // 资源映射表内嵌
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

