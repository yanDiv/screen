var Class = require('./class').Class,
	arr = [],
	push = arr.push,
	slice = arr.slice,
	splice = arr.splice,
	concat = arr.concat,
	toStr = ({}).toString,
	Promise,
	Deffered,
	Counter;

Promise = (function(){
	var pormise,
		proto,
		point,
		method = ['succ','done','fail'],
		push = method.push;

	proto = {
		init: function( deff ){
			this._ref = deff._cache;
		},
		getRef: function( key ){
			var c,
				ref;

			if( typeof key == 'string' ){
				ref = this._ref;
				c = ref[ key ] || ( ref[ key ] = [] );
			}

			return c;
		}
	};

	for( var i = 0,len = method.length;i < len;i++ ){
		point = method[i];
		proto[ point ] = eval( '(0,function(callback){var c;if( typeof callback == "function" ){c = this.getRef("'+ point +'");push.call(c,callback);}return this;})' );
	}
	promise = Class.factory('promise',proto );
	return promise;
})();

Deffered = (function(undefined){
	var deffered;

	deffered = Class.factory('deffered',{
		init: function(){
			this._cache = {};
		},
		reject: function(){
			var args = slice.call( arguments );

			args.push( 'fail' );
			this.emit.apply( this,args );
			return this;
		},
		accept: function(){
			var args = slice.call( arguments );

			args.push( 'succ' );
			this.emit.apply( this,args );
			return this;
		},
		emit: function( key ){
			var c,
				len,
				args = slice.call( arguments,1 );
			if( typeof key == 'string' ){
				c = this._cache[ key ];
				if( c && c.length > 0){
					len = c.length;
					while( len-- ){
						c[ len ].apply( this,args);
					}
				}
			}
		}
	});

	return deffered;
})();

Relate = (function(undefined){
	var relate;

	relate = Class.factory('relate',{
		init: function( inject ){
			
			if( !(toStr.call( inject ) == '[object Array]') ){
				inject = [];
			}

			instance.inject = inject;
		}
	});

	relate.complie = function( handle ){
		var injt = this.inject;

		return function( args ){
			var self = this, //
				deff = deffered.factory(),
				prom = promise.factory( deff ),
				fail,
				succ,
				max,
				count;

			max = args.length;
			count = Counter.factory( max,function(state){
				state == 'fail' ?
					fail: succ;
			},function(){


			});
		}
	}

	return relate;

})();

Counter = (function( undefined ){
	var counter;

	function buildState( state ){
		return '(0,function(){if(this.exec){return;}this["_'+ state +'"]++;this.prog.apply(this,splice.call(arguments,0,0,"'+ state +'"));return this})';
	}

	counter = Class.factory('counter',{
		init: function( max,pro,end ){

			if( end === undefined ){
				end = pro;
				pro = undefined;
			}

			this._succ = 0;
			this._fail = 0;
			this._max = max;
			
			this.total = max;
			this.exec = false;
			this.proHandle = pro;
			this.endHandle = end;

			if( max == 0 ){
				this.exec = true;
				end.call( this );
				return this;
			}

		},
		prog: function(){
			this._max--;
			this._max > 1 ?
				this.proHandle && this.proHandle() : ( this.exec = true,this.endHandle() );
		},
		reset: function(){
			this._max = this.total;
			this.exec = false;
			this._succ = 0;
			this._fail = 0;

			return this;
		},
		succ: eval( buildState( 'succ' ) ),
		fail: eval( buildState( 'fail' ) )
	});

	return counter;
})();

exports.async = {
	Promise: Promise,
	Deffered: Deffered,
	Counter: Counter
}
