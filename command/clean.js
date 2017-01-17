'use strict';

exports.name = 'clean [cache type]';
exports.desc = 'clean specify type cache,eg: gfis clean ssi';
/**
 * 清除SSI缓存
 */
exports.register = function(commander) {
    commander.action(function() {
        var processArgv = process.argv;
        var command = processArgv.splice(3, processArgv.length);
        if (command[0] == 'ssi') {
            fis.util.del(fis.project.getTempPath() + '/ssi-cache');
            fis.log.notice('gfis clean ssi success!');
        }
    });
};
