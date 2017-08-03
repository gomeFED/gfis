var _ = require('./util.js');
var config = _.getConfig();

/**
 * ���������ļ���ʼ����Ŀ��������
 */
module.exports.init = function() {
    _setEvnCommonConfig();
    _setEnvPrivateConfig();
};


/**
 * ���û���ͨ������
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
 * ���û���˽������
 */
function _setEnvPrivateConfig() {
    _setDevEvnConfig();
    _setRemoteEnvConfig(fis.media('uat'), config.release.uatDomain);
    _setRemoteEnvConfig(fis.media('pre'), config.release.preDomain);
    _setRemoteEnvConfig(fis.media('prd'), config.release.prdDomain);
}


/**
 * ���û�������
 */
function _setBaseCommon() {
    fis.set('project.ignore', [
      '.git/**',
      '.svn/**'
    ]);
    
    //�رձ��뻺��
    fis.match('*', {
        useCache: false
    });

    //�ų����������ļ�
    config.release.excludesFiles.forEach(function(glob) {
        fis.match('/' + glob, {
            release: false
        }, true);
    });

    //gfe-config.json�������
    fis.match('/gfe-config.json', {
        release: '$0'
    }, true);

    //������buildĿ¼
    fis.match('/' + _.getReleaseRootFolder() + '/**', {
        release: false
    });
}


/**
 * �칹����Ԥ���봦��
 */
function _preCompile() {
    if (config.release.sass) {
        //sass�ļ�Ԥ����
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.scss', {
                parser: fis.plugin('node-sass'),
                rExt: '.css'
            });
        });

        //��Ƕsass����Ԥ����
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                parser: fis.plugin('node-sass')
            });
        });
    }

    if (config.release.less) {
        //less�ļ�Ԥ����
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.less', {
                parser: fis.plugin('less-2.x'),
                rExt: '.css'
            });
        });
        

        //��Ƕless����Ԥ����
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}:less', {
                parser: fis.plugin('less-2.x')
            });
        });
    }
}


/**
 * ����CSSǰ׺�Զ���ȫ
 */
function _processFileByCssProfixer() {
    if (config.release.cssAutoPrefixer) {
        //css�ļ�ǰ׺�Զ�����
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                postprocessor: fis.plugin("autoprefixer")
            });
        });

        //��Ƕ��css����ǰ׺�Զ�����
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}:css', {
                postprocessor: fis.plugin("autoprefixer")
            });
        });

        if (config.release.sass) {
            //sass�ļ�ǰ׺�Զ�����
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    postprocessor: fis.plugin("autoprefixer")
                });
            });

            //��Ƕ��sass����ǰ׺�Զ�����
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                    postprocessor: fis.plugin("autoprefixer")
                });
            });
        }
    }
}


/**
 * �����ļ�MD5
 */
function _processFileByMd5() {
    if (config.release.cssMd5) {
        //css�ļ�md5
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                useHash: true
            });
        });

        if (config.release.sass) {
            //sass�ļ�md5
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    useHash: true
                });
            });
        }
    }

    //js�ļ�md5
    if (config.release.jsMd5) {
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                useHash: true
            });
        });
    }

    //ͼƬ�ļ�md5
    if (config.release.imageMd5) {
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur}', {
                useHash: true
            });
        });
    }
}


/**
 * �����ļ�ѹ��
 */
function _processFileByCompress() {
    if (config.release.jsCompress) {
        //js�ļ�ѹ��
        config.scriptWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.js', {
                optimizer: fis.plugin('uglify-js')
            });
        });

        //��Ƕ��js����ѹ��
        // config.viewWorkDirs.forEach(function(dirName) {
        //     fis.match('/' + dirName + '/**.{html,ftl}:js', {
        //         optimizer: fis.plugin('uglify-js')
        //     });
        // });
    }

    if (config.release.cssCompress) {
        //css�ļ�ѹ��
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                optimizer: fis.plugin('clean-css')
            });
        });

        //��Ƕ��css����ѹ��
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}:css', {
                optimizer: fis.plugin('clean-css')
            });
        });

        if (config.release.sass) {
            //sass�ļ�ѹ��
            config.styleWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.scss', {
                    optimizer: fis.plugin('clean-css')
                });
            });

            //��Ƕ��sass����ѹ��
            config.viewWorkDirs.forEach(function(dirName) {
                fis.match('/' + dirName + '/**.{html,ftl}:scss', {
                    optimizer: fis.plugin('clean-css')
                });
            });
        }
    }

    //pngͼƬѹ��
    if (config.release.pngCompress) {
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.png', {
                optimizer: fis.plugin('png-compressor', {
                })
            });
        });
    }

    //htmlѹ��
    if (config.release.htmlCompress) {
        config.viewWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.{html,ftl}', {
                optimizer: fis.plugin('html-minifier')
            });
        });
    }
}


/**
 * ����ѩ��ͼ
 */
function _processCssSprite() {
    if (config.release.cssSprite) {
        fis.match('::package', {
            spriter: fis.plugin('csssprites')
        });

        //cssѩ��ͼ
        config.styleWorkDirs.forEach(function(dirName) {
            fis.match('/' + dirName + '/**.css', {
                useSprite: true
            });
        });

        //sassѩ��ͼ
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
 * ���ÿ�����������
 */
function _setDevEvnConfig() {
    var processedDirs = config.styleWorkDirs.concat(config.scriptWorkDirs, config.viewWorkDirs);
    var parserPlugins = [];
    var widgetInlinePlugin = fis.plugin('gfe-widget-inline', {
        widgets: config.widgets
    });
    var freemarkerParsePlugin = fis.plugin('gfe-freemarker');
    var ssiParsePlugin = fis.plugin('gfe-ssi', {
        ssiDomain: 'http://www.gome.com.cn'
    });
    //�Ƿ����widget-inline�������
    if (config.release.widgetInline) {
        parserPlugins.push(widgetInlinePlugin);
    }
    //�Ƿ����freemaker�������
    if (config.release.freemarker) {
        parserPlugins.push(freemarkerParsePlugin);
    }
    //�Ƿ����ssi�������
    if (config.release.ssi) {
        parserPlugins.push(ssiParsePlugin);
    }
    
    config.viewWorkDirs.forEach(function(dirName) {
        //Ϊ�˷���serverԤ��������������.ftl��Ϊ.html
        fis.match('/' + dirName + '/**.ftl', {
            rExt: '.html'
        });
        //����widget��Ƕ��freemarker������ssi����
        fis.match('/' + dirName + '/**.{ftl,html}', {
            parser: parserPlugins
        });
    });

    //���÷����׶β��
    fis.match('*', {
        deploy: fis.plugin('local-deliver', {
            to: './' + _.getReleaseRootFolder()
        })
    });

    //���ñ������ļ��ķ����׶β��
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
 * ����Զ�̻�������
 * @param {Object} evnMedia Զ�̻���media�������磺fis.media('uat')
 * @param {Object} envDomain   Զ�̻�����������
 */
function _setRemoteEnvConfig(evnMedia, envDomain) {
    var processedDirs = config.styleWorkDirs.concat(config.scriptWorkDirs, config.viewWorkDirs);

    //�Ƿ���debug���
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

    //js�ļ������������Ŀǰ׺
    config.scriptWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.js', {
            url: '/' + config.projectPath,
            domain: envDomain.js
        });
    });

    //css�ļ������������Ŀǰ׺
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.css', {
            url: '/' + config.projectPath,
            domain: envDomain.js
        });
        //sass�ļ������������Ŀǰ׺
        if (config.release.sass) {
            evnMedia.match('/' + dirName + '/**.scss', {
                url: '/' + config.projectPath,
                domain: envDomain.js
            });
        }
    });

    //ͼƬ�ļ������Ŀǰ׺
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{svg,tif,tiff,wbmp,png,bmp,fax,gif,ico,jfif,jpe,jpeg,jpg,woff,cur}', {
            url: '/' + config.projectPath
        });
    });

    //����Ĭ�����ã�(1)parser�׶β������Ϊwidget��Ƕ(2)ftl��׺���ļ�����Ϊftl
    config.viewWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**.{html,ftl}', {
            parser: fis.plugin('gfe-widget-inline', {
                widgets: config.widgets
            })
        });
        evnMedia.match('/' + dirName + '/**.ftl', {
            rExt: '.ftl'
        });
    });

    //���ñ������ļ��ķ����׶β��
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

    //style����Ŀ¼�µ��ļ������cdnĿ¼��
    config.styleWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getCdnRootFolder() + '$0'
        });
    });

    //script����Ŀ¼�µ��ļ������cdnĿ¼��
    config.scriptWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getCdnRootFolder() + '$0'
        });
    });

    //view����Ŀ¼�µ��ļ������projectĿ¼��
    config.viewWorkDirs.forEach(function(dirName) {
        evnMedia.match('/' + dirName + '/**', {
            release: _.getProjectRootFolder() + '$0'
        });
    });

    //��copy���ļ��������projectĿ¼��
    config.release.onlyCopyFiles.forEach(function(glob) {
        evnMedia.match('/' + glob, {
            release: _.getProjectRootFolder() + '$0'
        });
    });
}