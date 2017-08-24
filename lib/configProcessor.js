var _ = require('./util.js');
var config = _.getConfig();

/**
 * 根据配置文件初始化项目构建规则
 */
module.exports.init = function() {
    _setEvnCommonConfig();
    _setEnvPrivateConfig();
};


/**
 * 设置环境通用配置
 */
function _setEvnCommonConfig() {
    _setBaseCommon();
    _preCompile();
    _processFileByCssProfixer();
    _processFileByCompress();
    _processCssSprite();
}


/**
 * 设置环境私有配置
 */
function _setEnvPrivateConfig() {
    _setDevEvnConfig();
    _setRemoteEnvConfig(fis.media('uat'), config.release.uatDomain);
    _setRemoteEnvConfig(fis.media('pre'), config.release.preDomain);
    _setRemoteEnvConfig(fis.media('prd'), config.release.prdDomain);
}


/**
 * 设置基础配置
 */
function _setBaseCommon() {
    fis.set('project.ignore', [
      '.git/**',
      '.svn/**'
    ]);
    
    //关闭编译缓存
    fis.match('*', {
        useCache: false
    });

    //排除不发布的文件
    config.release.excludesFiles.forEach(function(glob) {
        fis.match('/' + glob, {
            release: false
        }, true);
    });
    
    config.release.onlyCopyFiles.forEach(function(glob) {
        fis.match('/' + glob, {
            release: '$0'
        }, true);
    });

    //gfe-config.json正常输出
    fis.match('/gfe-config.json', {
        release: '$0'
    }, true);

    //不发布build目录
    fis.match('/' + _.getReleaseRootFolder() + '/**', {
        release: false
    });
}


/**
 * 异构语言预编译处理
 */
function _preCompile() {
    if (config.release.sass) {
        //sass文件预编译
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.scss', {
                parser: fis.plugin('node-sass'),
                rExt: '.css'
            });
        });

        //内嵌sass代码预编译
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}:scss', {
                parser: fis.plugin('node-sass')
            });
        });
    }

    if (config.release.less) {
        //less文件预编译
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.less', {
                parser: fis.plugin('less-2.x'),
                rExt: '.css'
            });
        });
        

        //内嵌less代码预编译
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}:less', {
                parser: fis.plugin('less-2.x')
            });
        });
    }

    if (config.release.handlebars) {
        //handlebars文件预编译
        fis.match('/tpl/**.html', {
            parser: fis.plugin('handlebars-3.x'),
            rExt: '.js',
            release: false // handlebars 源文件不需要编译
        });
    }

    if (config.release.artTemplate) {
        //art-template文件预编译
        fis.match('/tpl/**.html', {
            parser: fis.plugin('artc'),
            rExt: '.js',
            release: false // art-template 源文件不需要编译
        });
    }

    //require.js模块化
    if (config.release.requirejs) {
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                isMod: true
            });
        });
        fis.hook('gfe-amd');
        fis.match('::package', {
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
    }

    //sea.js模块化
    if (config.release.seajs) {
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                isMod: true
            });
        });
        fis.hook('gfe-cmd');
        fis.match('::package', {
            postpackager: fis.plugin('loader', {
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
    }
}


/**
 * 处理CSS前缀自动补全
 */
function _processFileByCssProfixer() {
    if (config.release.cssAutoPrefixer) {
        //css文件前缀自动补齐
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                postprocessor: fis.plugin("autoprefixer", {
                    "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                    "flexboxfixer": true,
                    "gradientfixer": true
                })
            });
        });

        //内嵌的css代码前缀自动补齐
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}:css', {
                postprocessor: fis.plugin("autoprefixer", {
                    "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                    "flexboxfixer": true,
                    "gradientfixer": true
                })
            });
        });

        if (config.release.sass) {
            //sass文件前缀自动补齐
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    postprocessor: fis.plugin("autoprefixer", {
                        "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                        "flexboxfixer": true,
                        "gradientfixer": true
                    })
                });
            });

            //内嵌的sass代码前缀自动补齐
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl,tpl}:scss', {
                    postprocessor: fis.plugin("autoprefixer", {
                        "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                        "flexboxfixer": true,
                        "gradientfixer": true
                    })
                });
            });
        }

        if (config.release.less) {
            //less文件前缀自动补齐
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.less', {
                    postprocessor: fis.plugin("autoprefixer", {
                        "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                        "flexboxfixer": true,
                        "gradientfixer": true
                    })
                });
            });

            //内嵌的less代码前缀自动补齐
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl,tpl}:less', {
                    postprocessor: fis.plugin("autoprefixer", {
                        "browsers": ['Firefox >= 20', 'Safari >= 6', 'Explorer >= 9', 'Chrome >= 12', "ChromeAndroid >= 4.0"],
                        "flexboxfixer": true,
                        "gradientfixer": true
                    })  
                });
            });
        }
    }
}

/**
 * 处理文件压缩
 */
function _processFileByCompress() {
    if (config.release.jsCompress) {
        //js文件压缩
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                optimizer: fis.plugin('uglify-js')
            });
        });

        //内嵌的js代码压缩
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}:js', {
                optimizer: fis.plugin('uglify-js')
            });
        });
    }

    if (config.release.cssCompress) {
        //css文件压缩
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                optimizer: fis.plugin('clean-css')
            });
        });

        //内嵌的css代码压缩
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}:css', {
                optimizer: fis.plugin('clean-css')
            });
        });

        if (config.release.sass) {
            //sass文件压缩
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    optimizer: fis.plugin('clean-css')
                });
            });

            //内嵌的sass代码压缩
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl,tpl}:scss', {
                    optimizer: fis.plugin('clean-css')
                });
            });
        }

        if (config.release.less) {
            //less文件压缩
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.less', {
                    optimizer: fis.plugin('clean-css')
                });
            });

            //内嵌的less代码压缩
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl,tpl}:less', {
                    optimizer: fis.plugin('clean-css')
                });
            });
        }
    }

    //png图片压缩
    if (config.release.pngCompress) {
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.png', {
                optimizer: fis.plugin('png-compressor', {
                })
            });
        });
    }

    //html压缩
    if (config.release.htmlCompress) {
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl,tpl}', {
                optimizer: fis.plugin('html-minifier')
            });
        });
    }
}


/**
 * 处理雪碧图
 */
function _processCssSprite() {
    if (config.release.cssSprite) {
        fis.match('::package', {
            spriter: fis.plugin('csssprites')
        });

        //css雪碧图
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                useSprite: true
            });
        });

        //sass雪碧图
        if (config.release.sass) {
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    useSprite: true
                });
            });
        }

        //less雪碧图
        if (config.release.sass) {
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.less', {
                    useSprite: true
                });
            });
        }
    }
}

/**
 * 设置开发环境配置
 */
function _setDevEvnConfig() {
    var processedDirs = config.styleWorkDirs.concat(config.scriptWorkDirs, config.viewWorkDirs);
    var parserPlugins = [];
    var widgetInlinePlugin = fis.plugin('gfe-widget-inline', {
        widgets: config.widgets
    });
    var freemarkerParsePlugin = fis.plugin('gfe-freemarker');
    var smartyParsePlugin = fis.plugin('gfe-smarty');
    var delmodConfigParsePlugin = fis.plugin('gfe-delmod-config');
    var ssiParsePlugin = fis.plugin('gfe-ssi', {
        ssiDomain: 'http://www.gome.com.cn'
    });
    //是否挂载widget-inline解析插件
    if (config.release.widgetInline) {
        parserPlugins.push(widgetInlinePlugin);
    }
    //是否挂载freemaker解析插件
    if (config.release.freemarker) {
        parserPlugins.push(freemarkerParsePlugin);
    }
    //是否挂载smarty解析插件
    if (config.release.smarty) {
        parserPlugins.push(smartyParsePlugin);
    }
    //删除require和seajs的用户config配置
    if(config.release.requirejs || config.release.seajs) {
        parserPlugins.push(delmodConfigParsePlugin);
    }


    //是否挂载ssi解析插件
    if (config.release.ssi) {
        parserPlugins.push(ssiParsePlugin);
    }
    
    config.viewWorkDirs.forEach(function(dirName) {
        //为了方便server预览，开发环境将.ftl改为.html
        fis.match('/' + dirName + '/**.{ftl,tpl,html}', {
            rExt: '.html'
        });
        //设置widget内嵌、freemarker解析、ssi解析
        fis.match('/' + dirName + '/**.{ftl,tpl,html}', {
            parser: parserPlugins
        });
    });

    fis.match('::package', {
        prepackager: function(ret, conf, settings, opt) {
            var ssiCacheDirPath = fis.project.getTempPath() + '/ssi-cache';
            fis.util.del(ssiCacheDirPath);
        }
    });

    //设置发布阶段插件
    /*fis.match('*', {
        deploy: fis.plugin('local-deliver')
    });*/
    //设置被处理文件的发布阶段插件
    //processedDirs.forEach(function(dirName) {
    fis.match('*', {
        deploy: [
            fis.plugin('gfe-script-inbottom'),
            // fis.plugin('gfe-script-place'),
            fis.plugin('gfe-replace', {
                patterns: [{
                    match: '__JS_DOMAIN__',
                    replacement: config.release.uatDomain.js
                }, {
                    match: '__CSS_DOMAIN__',
                    replacement: config.release.uatDomain.css
                }, {
                    match: '__PROJECT_PATH__',
                    replacement: config.release.projectPath
                }]
            }),
            fis.plugin('gfe-local-deliver')
        ]
    });
    //});
}


/**
 * 设置远程环境配置
 * @param {Object} evnMedia 远程环境media对象，例如：fis.media('uat')
 * @param {Object} envDomain   远程环境域名对象
 */
function _setRemoteEnvConfig(evnMedia, envDomain) {
    var processedDirs = config.styleWorkDirs.concat(config.scriptWorkDirs, config.viewWorkDirs);

    //是否开启debug输出
    if (config.release.debug) {
        evnMedia
            .match('::package', {
                prepackager: fis.plugin('gfe-debug-output', {
                    cssDomain: envDomain.css,
                    jsDomain: envDomain.js,
                    debugDomain: config.release.debugDomain
                }, 'append')
            });
    }

    //js文件添加域名、项目前缀
    config.scriptWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.js', {
            url: '/' + config.projectPath+'$0',
            domain: envDomain.js
        });
    });

    //css文件添加域名、项目前缀
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.css', {
            url: '/' + config.projectPath+'$0',
            domain: envDomain.js
        });
        //sass文件添加域名、项目前缀
        if (config.release.sass) {
            evnMedia.match('/' + dirName + '/**.scss', {
                url: '/' + config.projectPath+'$0',
                domain: envDomain.js
            });
        }
    });

    //图片文件添加项目前缀
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur}', {
            url: '/' + config.projectPath+'$0'
        });
    });

    var parserPlugins = [];
    var widgetInlinePlugin = fis.plugin('gfe-widget-inline', {
        widgets: config.widgets
    });
    parserPlugins.push(widgetInlinePlugin);
    var delmodConfigParsePlugin = fis.plugin('gfe-delmod-config');
    if(config.release.requirejs || config.release.seajs) {
        parserPlugins.push(delmodConfigParsePlugin);
    }

    //覆盖默认配置，(1)parser阶段插件设置为widget内嵌(2)ftl后缀的文件重置为ftl
    config.viewWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{html,ftl}', {
            parser: parserPlugins
        });
        evnMedia.match('/' + dirName + '/**.ftl', {
            rExt: '.ftl'
        });
    });
    //设置被处理文件的发布阶段插件
    evnMedia.match('/{' + processedDirs.join(',') + '}/**', {
        deploy: [
            fis.plugin('gfe-combo-url', {
                useCombo: config.release.urlCombo
            }),
            fis.plugin('gfe-script-inbottom'),
            fis.plugin('gfe-script-place',{
                 needGfisGlobalVar: config.release.gfisGlobalVar,
                 gfisGlobalVarStr: '<script type="text/javascript">var gfeJsCdn='+envDomain.js+',gfeCssCdn='+envDomain.css+',gfeProjectPath='+config.projectPath+';</script>'
            }),
            fis.plugin('gfe-replace', {
                patterns: [{
                    match: '__JS_DOMAIN__',
                    replacement: envDomain.js
                }, {
                    match: '__CSS_DOMAIN__',
                    replacement: envDomain.css
                }, {
                    match: '__PROJECT_PATH__',
                    replacement: config.projectPath
                }]
            }),
            fis.plugin('local-deliver', {
                to: './' + _.getReleaseRootFolder()
            })
        ]
    });
    
    config.release.onlyCopyFiles.forEach(function(item){
        evnMedia.match('/'+item,{
            deploy: [
                fis.plugin('local-deliver', {
                    to: './' + _.getReleaseRootFolder()
                })
            ]
        })
    })
}