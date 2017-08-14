
// npm install [-g] fis3-hook-amd

fis.match('/js/**/*.js', {
    isMod: true
});


/*fis.hook('amd', {
  baseUrl: './',

  paths: {
    "jquery": "static/jquery.js",
    "$": "static/jquery.js",
  }
});*/
// fis.hook('relative');
/*var config = {};
console.log(777)*/
/*var gfisBaseConfigUrl = fis.project.getProjectPath() + '/mod-config.txt';
if(gfisBaseConfigUrl && fis.util.read(gfisBaseConfigUrl)) {
    var config = JSON.parse(fis.util.read(gfisBaseConfigUrl));
}*/
/*var config = {
    "baseUrl": './static/',
    "paths": {
        "jquery": "jquery"
    }
}*/
fis.match('/js/**.js', {
    domain: '//js.atguat.com.cn'
});

fis.match('/css/**.css', {
    domain: '//css.atguat.com.cn'
});
fis.hook('amd');
fis.match('::package', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'amd',
        obtainScript: false,
        obtainStyle: false,
        processor: {
            '.html': 'html',
            '.tpl': 'html',
            '.ftl': 'html'
        },
        useInlineMap: true // 资源映射表内嵌
    })
})

fis.match('/html/**.{html,ftl,tpl}', {
    parser: function(content, file, settings) {
        //的require Config 正则表达式
        var comboRequireConfigExp = /require\.config\((\{[\s\S]*?\})\);?/img;
        //combo的sea Config 正则表达式
        var comboSeaConfigExp = /seajs\.config\((\{[\s\S]*?\})\);?/img;
        var isEntryFile = (~content.indexOf('/html') || ~content.indexOf('/HTML')) && (~content.indexOf('/head') || ~content.indexOf('/HEAD')) && (~content.indexOf('/body') || ~content.indexOf('/BODY'))
        if(isEntryFile) {
            var temRegExp = comboRequireConfigExp;

            //sea的处理
            if(comboSeaConfigExp.test(content)) {
                temRegExp = comboSeaConfigExp;
            }
            content = content.replace(temRegExp, '');
        }
        return content;
    }
});

fis.match('*', {
    useCache: false,
    deploy: [
        fis.plugin('gfe-combo-url'),
        fis.plugin('local-deliver', {
            to: './build'
        })
    ]
});

fis.match('/build/**', {
    release: false
});
