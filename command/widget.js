'use strict';

var svnUltimate = require('node-svn-ultimate');
var $ = require('../lib/util.js');
var fs = require('fs');
exports.name = 'widget install';
exports.desc = 'install public widget,eg: gfis widget install';

/**
 * @register
 * 安装公共widget到本地项目
 */
exports.register = function(commander) {
    commander.action(function() {
        var processArgv = process.argv;
        var command = processArgv.splice(3, processArgv.length);

        if (command[0] == 'install') {
            var widgetUrl = $.getWidgetSvnUrl();
            var widgetCachePath = fis.project.getTempPath() + '/widget-cache';
            var widgets = $.getConfig().widgets; //读取项目配置文件的widget
            var widgetKey = Object.keys(widgets);
            var widgetExist = fis.util.isDir(widgetCachePath);
            if (widgetExist) { //删除widget缓存文件夹
                fis.util.del(widgetCachePath);
            }
            fs.readdir(process.cwd() + '/widget/', function(err, files) { //删除公共widget
                files.forEach(function(item, i) {
                    if (/.*?@\d+\.\d+\.\d+$/.test(item)) {
                        fis.util.del(process.cwd() + '/widget/' + item);
                    }
                });
            });
            widgetKey.forEach(function(item, index) {
                var widgetItem = '/' + item + '/' + widgets[item]; //带版本号路径
                var projectWidgetItemPath = process.cwd() + '/widget/' + item + '@' + widgets[item]; //不带版本号路径
                svnUltimate.commands.checkout(widgetUrl + widgetItem, widgetCachePath + widgetItem, function(err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    fis.util.del(widgetCachePath + widgetItem + '/.svn'); //删除.svn文件夹
                    fis.util.copy(widgetCachePath + widgetItem, projectWidgetItemPath);
                });
            });
        }
    });
};
