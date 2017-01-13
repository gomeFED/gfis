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
    _processFileByReleasePattern();
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

    //不发布build文件
    fis.match('/build/**', {
        release: false
    });
}
/**
 * 异构语言预编译处理
 */
function _preCompile() {
    if (config.release.sass) {
        //sass的规范,_打头的文件都不release.
        fis.match('/sass/{**/_*.scss,_*.scss}', {
            release: false
        });

        //发布到css目录下，并且后缀设置为.css
        fis.match('/sass/**.{scss,css}', {
            parser: fis.plugin('node-sass'),
            rExt: '.css',
            release: '/css$0'
        });

        //预编译内嵌的sass
        fis.match('/html/**.{html,ftl}:scss', {
            parser: fis.plugin('node-sass')
        });
    }
}
/**
 * 处理CSS前缀自动补全
 */
function _processFileByCssProfixer() {
    //css浏览器前缀自动补齐
    if (config.release.cssAutoPrefixer) {
        if (config.release.sass) {
            fis.match('/sass/**.{scss,css}', {
                postprocessor: fis.plugin("autoprefixer")
            });
            fis.match('/html/**.{html,ftl}:scss', {
                postprocessor: fis.plugin("autoprefixer")
            });
        }
        fis.match('/css/**.css', {
            postprocessor: fis.plugin("autoprefixer")
        });
    }
}
/**
 * 处理文件MD5
 */
function _processFileByMd5() {
    if (config.release.cssMd5) {
        //css md5
        fis.match('/css/**.css', {
            useHash: true
        });

        //sass md5
        if (config.release.sass) {
            fis.match('/sass/**.{scss,css}', {
                useHash: true
            });
        }
    }

    //js md5
    if (config.release.jsMd5) {
        fis.match('/js/**.js', {
            useHash: true
        });
    }

    //image md5
    if (config.release.imageMd5) {
        fis.match('::image', {
            useHash: true
        });
    }
}
/**
 * 处理文件压缩
 */
function _processFileByCompress() {
    //js压缩
    if (config.release.jsCompress) {
        fis.match('/js/**.js', {
            optimizer: fis.plugin('uglify-js')
        });

        //处理内嵌的js代码
        fis.match('/html/**.{html,ftl}:js', {
            optimizer: fis.plugin('uglify-js')
        });
    }

    //css压缩
    if (config.release.cssCompress) {
        fis.match('/css/**.css', {
            optimizer: fis.plugin('clean-css')
        });

        //处理内嵌的css代码
        fis.match('/html/**.{html,ftl}:css', {
            optimizer: fis.plugin('clean-css')
        });

        //sass压缩
        if (config.release.sass) {
            fis.match('/sass/**.{scss,css}', {
                optimizer: fis.plugin('clean-css')
            });

            //处理内嵌的sass代码
            fis.match('/html/**.{html,ftl}:scss', {
                optimizer: fis.plugin('clean-css')
            });
        }
    }

    //png图片压缩
    if (config.release.pngCompress) {
        fis.match('**.png', {
            optimizer: fis.plugin('png-compressor')
        });
    }

    //html压缩
    if (config.release.htmlCompress) {
        fis.match('/html/**.{html,ftl}', {
            optimizer: fis.plugin('html-minifier')
        });
    }
}
/**
 * 处理雪碧图
 */
function _processCssSprite() {
    if (config.release.cssSprite) {
        fis.match('::packager', {
            spriter: fis.plugin('csssprites')
        });

        //css雪碧图
        fis.match('/css/**.css', {
            useSprite: true
        });

        //sass雪碧图
        if (config.release.sass) {
            fis.match('/sass/**.{scss,css}', {
                useSprite: true
            });
        }
    }
}
/**
 * 处理文件的发布规则
 */
function _processFileByReleasePattern() {
    var ignoreReleaseFiles = config.release.ignoreReleaseFiles;
    if (ignoreReleaseFiles !== null) {
        ignoreReleaseFiles.forEach(function(glob) {
            fis.match(glob, {
                release: false
            });
        });
    }
}
/**
 * 设置开发环境配置
 */
function _setDevEvnConfig() {
    //为了方便server预览，开发环境将.ftl改为.html
    fis.match('/html/**.ftl', {
        rExt: '.html'
    });

    //设置freemarker解析和ssi
    fis.match('/html/**.{ftl,html}', {
            parser: [
                fis.plugin('gfe-freemarker'),
                fis.plugin('gfe-ssi', {
                    ssiDomain: 'http://www.gome.com.cn'
                })
            ]
        })
        .match('*', {
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
                    }]
                }),
                fis.plugin('local-deliver', {
                    to: './build'
                })
            ]
        });
}
/**
 * 设置远程环境配置
 * @param {Object} evnMedia 远程环境media对象，例如：fis.media('uat')
 * @param {Object} envDomain   远程环境域名对象
 */
function _setRemoteEnvConfig(evnMedia, envDomain) {
    //是否开启debug输出
    if (config.release.debug) {
        evnMedia
            .match('::package', {
                //输出debug文件
                prepackager: fis.plugin('gfe-debug-output', {
                    cssDomain: envDomain.css,
                    jsDomain: envDomain.js,
                    debugDomain: config.release.debugDomain
                }, 'append')
            });
    }

    evnMedia
        .match('**.js', { //js添加域名和项目前缀
            url: '/' + config.projectPath,
            domain: envDomain.js
        })
        .match('**.{css,scss}', { //css添加域名和项目前缀
            url: '/' + config.projectPath,
            domain: envDomain.css
        })
        .match('::image', { //图片添加项目前缀
            url: '/' + config.projectPath
        })
        .match('/html/**.{html,ftl}', {
            parser: null
        })
        .match('/html/**.ftl', {
            rExt: '.ftl'
        })
        .match('*', {
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
                    }]
                }),
                fis.plugin('local-deliver', {
                    to: './build'
                })
            ]
        });
}
