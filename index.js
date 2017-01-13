module.exports = require('fis3');
var argv = require('minimist')(process.argv.slice(2));
var commandProcessor = require('./lib/commandProcessor.js');
var configProcessor = require('./lib/configProcessor.js');

//初始化被覆盖命令
commandProcessor.init();

//当执行gfis release/inspect命令时，初始化参数信息
if (~['release', 'inspect'].indexOf(argv._[0])) {
    configProcessor.init();
}
