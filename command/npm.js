'use strict';

var exec = require('child_process').exec;
exports.name = 'npm [npm command]';
exports.desc = 'in the release directory execute npm command,eg: gfis npm run dev';
/**
 * node项目(自动调取node项目中的起动文件)
 */
exports.register = function(commander) {
    commander.action(function() {
        var processArgv = process.argv;
        var command = processArgv.splice(2, processArgv.length);

        exec(command.join(' '), { cwd: process.cwd() }, function(error, stdout, stderr) {
            if (error) {
                console.error('exec error: ' + error);
                return;
            }
            if (stderr) {
                console.log('stderr: ' + stderr);
                return;
            }
            console.log('stdout: ' + stdout);
        });
    });
};
