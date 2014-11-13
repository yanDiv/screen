var phantom = require('phantom'),
	instance = [];

exports.buildInstance = function( max,callback ){
	var count,
		self = this,
		i; 

	if( this.isExt ){
		return callback.call(this, instance );
	}

	count = counter( max,function(){
		self.isExt = true;
		callback.call(self, instance );
	});

	phantom.create(function( ph ){
		var m = max;

		while( m-- ){
			ph.createPage(function( page ){
				instance.push( page );
				count();
			});
		}

		this.phantom = ph;
	});
}

exports.destroy = function(){
	this.phantom.exit(1);
	return this;
}

exports.instance = instance;

exports.get = function(){
	return this.instance;
}


function counter( max,callback,context,args ){
	var index = 0,
		isExec = false;

	if( max == index ){
		if( isExec ){
			return;
		}
		isExec = true;
		return callback.call( context || null) && false;
	}

	return function(){
		if( isExec ){
			return;
		}
		index++;
		if( index >= max ){
			isExec = true;
			callback.call( context || null);
		}
	}
}


