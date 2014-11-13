var phantom = require('../page'),
	max = 5;

exports.performance = function( req,res,nxt ){
	phantom.buildInstance(max,function( inst ){


	});
}	

function get( inst,callback ){
	var timer,
		i;

	if( inst.length > 0 ){
		clearTimeout( timer );
		i = inst.pop();
		return callback.call( i,i );
	}

	setTimeout( function(){
		get.apply( null,arguments );
		
	},10)

}