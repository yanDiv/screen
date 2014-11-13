var Class;

Class = (function( undefined ){
	'use strict';
	var Class = {};

	Class.factory = function( name,parent,factory ){
		var cls,
			hasOwn,
			proxy,
			proto;

		hasOwn = ({}).hasOwnProperty;

		cls = {
			className: name = name.replace(/\w/,function($1){;return $1.toUpperCase() }),
			prototype: ( proto = {})
		};

		cls.factory = function(){
			return Class.inhert( name,this.prototype );
		}
		cls.factory.toString = function(){
			return 'function(){ ['+ name +' Class] }';
		}

		parent ? cls.parent = parent : true;

		if( !factory ){
			factory = parent;
			parent = undefined;
		}

		proxy = factory( proto,parent );

		proxy == proto ? true : Class.extend( proto,proxy );
		proto.constructor = cls.factory;

		return cls;
	}

	Class.inhert = function( name,parent ){
		var fn = Function('return function '+ ( name ? name : '' ) +'(){};')();

		fn.prototype = parent.prototype || parent;
		return new fn;
	};

	Class.extend = function( dest,src){
		var key;

		for( key in src ){
			if( hasOwn.call( src,key ) ){
				dest[ key ] = src[ key ];
			}
		}
		return dest;
	}

	return Class;
})();

exports.Class = Class;
