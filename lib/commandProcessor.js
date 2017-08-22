var path = require('path');

/**
 * 命令处理器，覆盖fis3默认命令
 */
module.exports.init = function() {
    // 让gfis打头的先加载，并添加自定义命令
    fis.require.prefixes.unshift('gfe');
    fis.require._cache['command-widget'] = require('../command/widget.js');
    fis.require._cache['command-npm'] = require('../command/npm.js');
    fis.require._cache['command-clean'] = require('../command/clean.js');
    fis.set('modules.commands', ['init', 'release', 'server', 'inspect', 'widget', 'npm', 'clean']);

    //重置命令行信息
    var cli = fis.cli;
    cli.name = 'gfis';
    cli.info = require('../package.json');
    cli.version = function() {
        console.log('v' + cli.info.version);
    };
    cli.options = {
        '-h, --help': 'print this help message',
        '-v, --version': 'print product version and exit',
    };
};
