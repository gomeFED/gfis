'use strict';

var exec = require('child_process').exec;
var path = require('path');
var $ = require('../lib/util.js');

exports.name = 'svn tag [tag name]';
exports.desc = 'project automatically svn tag,eg: gfis svn tag 1.0.0';
/**
 * register
 * @打tag
 */
exports.register = function(commander) {
    commander.action(function() {
    	var config = $.getConfig();
    	var msg = " -m 113099:gfe-auto-tag:image";
	    var projectName = config.projectName;
	    var svnTrunk =  $.getSvnUrl()['trunk'];
	    var svnTag =  $.getSvnUrl()['tag'];
	    var version = process.argv[4];
	    var commandMkdirP = "svn mkdir "+svnTag+"/"+projectName+msg;
	    var commandMkdirV = "svn mkdir "+svnTag+"/"+projectName+"/"+version+msg;
	    var commandCopy = "svn copy "+svnTrunk+"/"+projectName+" "+svnTag+"/"+projectName+ "/"+version+msg;
	    var commandDelete = "svn delete "+svnTag+"/"+projectName+"/"+version+msg;
	    var svnMsg = 'gfis svn tag success!';

	    exec(commandMkdirP,function(err){
	        if(!err){
	            exec(commandCopy,function(err){
	                if(err){
	                    console.log(err);
	                }else{
	                    console.log(svnMsg);
	                };
	            });
	        }else{
	            exec(commandDelete,function(err){
	                if(!err){
	                    exec(commandCopy,function(err){
	                        if(err){
	                            console.log(err);
	                        }else{
	                            console.log(svnMsg);
	                        };
	                    });
	                }else{
	                    exec(commandCopy,function(err){
	                        if(err){
	                            console.log(err);
	                        }else{
	                            console.log(svnMsg);
	                        };
	                    });
	                };
	            });
	        };
	    });
    });
};
