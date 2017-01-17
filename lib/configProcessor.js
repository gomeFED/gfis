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
    _processFileByMd5();
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
            fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                parser: fis.plugin('node-sass')
            });
        });
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
                postprocessor: fis.plugin("autoprefixer")
            });
        });

        //内嵌的css代码前缀自动补齐
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}:css', {
                postprocessor: fis.plugin("autoprefixer")
            });
        });

        if (config.release.sass) {
            //sass文件前缀自动补齐
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    postprocessor: fis.plugin("autoprefixer")
                });
            });

            //内嵌的sass代码前缀自动补齐
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                    postprocessor: fis.plugin("autoprefixer")
                });
            });
        }
    }
}


/**
 * 处理文件MD5
 */
function _processFileByMd5() {
    if (config.release.cssMd5) {
        //css文件md5
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                useHash: true
            });
        });

        if (config.release.sass) {
            //sass文件md5
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    useHash: true
                });
            });
        }
    }

    //js文件md5
    if (config.release.jsMd5) {
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                useHash: true
            });
        });
    }

    //图片文件md5
    if (config.release.imageMd5) {
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur}', {
                useHash: true
            });
        });
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
            fis.match('/' + dirName + '/**.{html,ftl}:js', {
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
            fis.match('/' + dirName + '/**.{html,ftl}:css', {
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
                fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                    optimizer: fis.plugin('clean-css')
                });
            });
        }
    }

    //png图片压缩
    if (config.release.pngCompress) {
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.png', {
                optimizer: fis.plugin('png-compressor')
            });
        });
    }

    //html压缩
    if (config.release.htmlCompress) {
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}', {
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
    }
}

/**
 * 设置开发环境配置
 */
function _setDevEvnConfig() {
    var processedDirs = config.styleWorkDirs.concat(config.scriptWorkDirs, config.viewWorkDirs);

    config.viewWorkDirs.forEach(function(dirName) {
        //为了方便server预览，开发环境将.ftl改为.html
        fis.match('/' + dirName + '/**.ftl', {
            rExt: '.html'
        });
        //设置widget内嵌、freemarker解析、ssi解析
        fis.match('/' + dirName + '/**.{ftl,html}', {
            parser: [
                fis.plugin('gfe-widget-inline', {
                    widgets: config.widgets
                }),
                fis.plugin('gfe-freemarker'),
                fis.plugin('gfe-ssi', {
                    ssiDomain: 'http://www.gome.com.cn'
                })
            ]
        });
    });

    //设置发布阶段插件
    fis.match('*', {
        deploy: fis.plugin('local-deliver', {
            to: './' + _.getReleaseRootFolder()
        })
    });

    //设置被处理文件的发布阶段插件
    processedDirs.forEach(function(dirName) {
        fis.match('/' + dirName + '/**', {
            deploy: [
                fis.plugin('gfe-script-inbottom'),
                fis.plugin('gfe-script-place'),
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
                fis.plugin('local-deliver', {
                    to: './' + _.getReleaseRootFolder()
                })
            ]
        });
    });
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
            url: '/' + config.projectPath,
            domain: envDomain.js
        });
    });

    //css文件添加域名、项目前缀
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.css', {
            url: '/' + config.projectPath,
            domain: envDomain.js
        });
        //sass文件添加域名、项目前缀
        if (config.release.sass) {
            evnMedia.match('/' + dirName + '/**.scss', {
                url: '/' + config.projectPath,
                domain: envDomain.js
            });
        }
    });

    //图片文件添加项目前缀
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur}', {
            url: '/' + config.projectPath
        });
    });

    //覆盖默认配置，(1)parser阶段插件设置为widget内嵌(2)ftl后缀的文件重置为ftl
    config.viewWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{html,ftl}', {
            parser: fis.plugin('gfe-widget-inline' {
                widgets: config.widgets
            })
        });
        evnMedia.match('/' + dirName + '/**.ftl', {
            rExt: '.ftl'
        });
    });

    //设置被处理文件的发布阶段插件
    processedDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            deploy: [
                fis.plugin('gfe-combo-url', {
                    useCombo: config.release.urlCombo
                }),
                fis.plugin('gfe-script-inbottom'),
                fis.plugin('gfe-script-place'),
                fis.plugin('gfe-replace', {
                    patterns: [{
                        match: '__JS_DOMAIN__',
                        replacement: envDomain.js
                    }, {
                        match: '__CSS_DOMAIN__',
                        replacement: envDomain.css
                    }, {
                        match: '__PROJECT_PATH__',
                        replacement: config.release.projectPath
                    }]
                }),
                fis.plugin('local-deliver', {
                    to: './' + _.getReleaseRootFolder()
                })
            ]
        });
    });

    //style工作目录下的文件输出到cdn目录下
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getCdnRootFolder() + '$0'
        });
    });

    //script工作目录下的文件输出到cdn目录下
    config.scriptWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getCdnRootFolder() + '$0'
        });
    });

    //view工作目录下的文件输出到project目录下
    config.viewWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getProjectRootFolder() + '$0'
        });
    });

    //仅copy的文件夹输出到project目录下
    config.release.onlyCopyFiles.forEach(function(glob) {
        evnMedia.match('/' + glob, {
            release: _.getProjectRootFolder() + '$0'
        });
    });
}
