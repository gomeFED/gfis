'use strict';
var fis = require('fis3');
var path = require('path');
var defaults = require('../config/defaults.js');

/**
 * gfis工具类集合
 */
var _ = module.exports;

/**
 * 获取配置文件的名称
 * @return {String} 配置文件的名称
 */
_.getConfigFilename = function() {
    return 'gfe-config.json';
};

/**
 * 获取发布的文件夹名称
 * @return {String} 发布文件夹名称
 */
_.getReleaseRootFolder = function() {
    return 'build';
};

/**
 * 获取配置文件参数
 */
_.getConfig = function() {
    var config = defaults;
    var gfeConfigPath = path.join(process.cwd(), _.getConfigFilename());
    if (fis.util.exists(gfeConfigPath)) {
        var gfeConfig = fis.util.readJSON(gfeConfigPath);
        config = fis.util.merge(config, gfeConfig);
    } else {
        fis.util.write(gfeConfigPath, JSON.stringify(config, null, 4), 'utf-8');
    }

    return config;
};

/**
 * 项目svn目录
 */
_.getSvnUrl = function(){
    var svnPath = {
        "trunk":"https://code.ds.gome.com.cn/svn/atg_poc/30_Coding/NewDevMode/trunk/gome-gfe",
        "branch":"https://code.ds.gome.com.cn/svn/atg_poc/30_Coding/NewDevMode/branches/gome-gfe",
        "tag":"https://code.ds.gome.com.cn/svn/atg_poc/30_Coding/NewDevMode/tags/gome-gfe"
    };
    return svnPath;
};

/**
 * 获取widget的svn地址
 */

_.getWidgetUrl = function(){
    return _.getConfig().widgetsUrl;
};