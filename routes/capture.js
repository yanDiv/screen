var code = require('../status'),
	crypto = require('crypto'),
	wind = require('wind'),
	md5 = crypto.createHash('md5'),
	fs = require('fs'),
	max = 5,
	pipe,
	inst,
	phantom = require('../page');

//capture screen
exports.capture = function( req,res,nxt ){
	var query = req.query,
		callback,
		width,
		path,
		ret,
		url,
		cfg;

	cfg = handleCfg({
		quality: (query.quality - 0) || undefined,
		format: query.format,
		delay: (query.delay - 0) * 1000 || undefined,
		src: '/capture/',
		width: (query.width - 0) || 1280,
		height: (query.height - 0) || undefined,
		timeout: (query.timeout - 0) || 15000,
		scroll: !query.delay ||  query.delay == '0' ? false : query.scroll ? true : false
	});

	path = process.cwd() + '\\capture';
	url = query.url;
	callback = query.callback;

	if( !url ){
		ret = code.status( 1,'url is necessary' );
		typeof callback == 'string' ?
			res.send( callback + '( ' +  JSON.stringify( ret ) + ' )') : 
			res.send( ret );
	}
	else{
		fileExist(path,url.split(','),cfg,function(ret,resu,retu,key){
			phantom.buildInstance(max,function(){
				capture( ret,key,cfg,function( ret,fail ){
					var c = cfg,
						p = c.src
						r = [];

					//ret = ret.concat( resu );
					/*ret.forEach(function( val,key ){
						ret[ key ] = p + val
					});*/

					fail.forEach(function( val,key ){
						var name = val.hash;

						retu.forEach(function(v,k){
							if( !(v.name == name) ){
								r.push( v );
							}
						});
					});

					retu = {
						succ: resu.concat( retu ),
						fail: fail
					};	

					typeof callback == 'string' ?
						res.send( callback + '(' + JSON.stringify( code.status(0, retu) ) +')' ) : 
						res.send( code.status(0, retu));
				});
			});
		});
	}
}

function handleCfg( cfg ){
	var _default = {
		width: 1280,
		format: 'png',
		delay: 0,
		src: '/images/',
		quality: 100  
	}

	return extend( _default,cfg );
}  

function buildHash( url ){
	if( url ){
		return crypto.createHash('md5').update( url ).digest('hex')
	}
}

function fileExist( path,url,cfg,callback){
	var len = url.length,
		ret = [],
		res = [],
		resu = [],
		key = {},
		retu = [],
		file,
		c,
		fileSys = fs,
		name;

	if(!fileSys.existsSync(path)){
		fileSys.mkdirSync(path);
	}

	file = fs.readdirSync( path );

	file.forEach(function( item ){
		var p = path + '/' + item;
			state = fileSys.statSync( p );

			if(!state.isDirectory()){
				res.push( item );
			}
	});  


	c = '' + cfg.quality + ( cfg.width ) + ( cfg.height || '' ) + cfg.format + cfg.delay + ( cfg.scroll ? 'scroll' : '' ); 

	while( len-- ){
		name = buildHash( url[len] + c) + '.png';

		if( res.indexOf( name ) == -1 ){
			ret.push( name );
			retu.push( {hash:name,url:url[len]} );
			key[ name ] = url[ len ];
		}
		else{
			resu.push( { hash:name,url:url[ len ] } );
			//keys[ name ] = { hash: name,url:url[len] };
		}
	}

	callback( ret,resu,retu,key );
}

function extend( dest,sour ){
	var hasOwn = Object.prototype.hasOwnProperty;

	dest = dest || {};
	for( var i in sour ){
		if( hasOwn.call( sour,i ) ){
			if( sour[ i ] ){
				dest[ i ] = sour[ i ];
			}
		}
	}

	return dest;
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

function capture( ret,key,cfg,callback ){
	var count,
		ph = phantom.get(),
		delay,
		c = {
			format: cfg.format,
			quality: cfg.quality
		},
		src = '.' + cfg.src,
		width = cfg.width,
		height = cfg.height,
		scroll = cfg.scroll,
		size,
		fail = [];

	delay =  cfg.delay,
	timeout = cfg.timeout,
	size = height ? {
			width: width,
			height: height
		} : {
			width: width
	};

	count = counter( ret.length,function(){
		callback( ret,fail );
	});

	if( !count ){
		return;
	}

	pipe.set( ret )
		.end(function( ret ){
			this.list = [];
			this.idx = 0;
		})
		.get(function( idx,page,nxt ){
			var timer,
				isTimeout = false;

			timer = setTimeout( function(){
				isTimeout = true;
				fail.push( { hash:ret[idx],url:key[ ret[idx] ] });
				page.open('');
				count();
			},timeout);

			size.width ? page.viewportSize = size: false ;

			page.open( key[ ret[ idx ] ],function( status ){
				if( status == 'success' ){
					if( delay ){
						setTimeout( function(){
							if( isTimeout ){
								return;
							}
							clearTimeout( timer );
							page.render( src + ret[ idx ],c);
							ph.push( page );
							count();
						},delay);

						scroll ?
							page.evaluate(function(){
								var timer,
									max = 30000,
									top = 200;

								timer = setInterval( function(){
									top += 200;
									window.scrollTo(0,top);

									if( top >= 20000 ){
										clearInterval( timer );
									}
								},30);
							}) : false;
						size.width ? 
						page.evaluate(function( s ){ console.log(s);document.body.style.height= s.height+ 'px';document.body.style.width=s.width + 'px'; },function(){},size) : false;
						page.onConsoleMessage = function( msg, lineNum,sourceId){ console.log( msg ) }
					}
					else{
						if( isTimeout ){
							return;
						}
						clearTimeout( timer );
						page.render( src + ret[ idx ],c);
						ph.push( page );
						count();
					}

				}
				else{
					if( isTimeout ){
						return;
					}
					fail.push( { hash:ret[idx],url:key[ ret[idx] ] });
					count();
				}
			});

			nxt();
		});
}

pipe = {
	set: function( ret ){
		if( Object.prototype.toString.call( ret ) == '[object Array]' ){
			if( ret.length > 0 ){
				this.list = ret;
			}
		}

		this.idx = 0;
		this.endIdx = this.list.length - 1;

		return this;
	},
	end: function( callback ){
		if( typeof callback == 'function' ){
			this.endHandle = callback;
		}
		
		return this;
	},
	get: function(callback){
		var ph = phantom.get(),
			self = this,
			timer,
			li = this.list;

		if( ph.length > 0 ){
			clearInterval( timer );

			callback( this.idx,ph.pop(),function(){
				self.idx++;
				self.idx > self.endIdx ?
					self.endHandle( self.list ) : self.get( callback );
			});
		}
		else{
			timer = setTimeout(function(){
				pipe.get.call( pipe,callback );
			})
		}
	}
}

