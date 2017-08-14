// @require /static/require.js

define(function (require, exports, module) {
	var $ = require('jquery');
    var cal = require('../cal/cal');
    console.log('work');
    // 1 - 0
    console.log(cal.min(1, 0));

            
    $('#btn').on('click', function() {
        require.async('../2-0/2-0.js',function(test){
        	test.init();
        });
    })
});