exports.status = function( code,msg ){
	switch( code ){
		case 0: 
			return {
				error: 0,
				message: 'success',
				data: msg || []
			};
			break;
		case 1:
			return {
				error: 1,
				message: 'args error: ' + msg
			}
	}
}