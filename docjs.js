(function(exports){
	// base namespace
	var $doc = {};

	// save previous $doc object to restore when noConflict is used
	var previous = exports.$doc;

	// Template
	// based on John Resig - Simple JavaScript Templating - http://ejohn.org/
	//-----------------------------------------------------------------------
	var tmplCache = {};
	exports.tmplate = function tmpl(str, data){
		var fn = !/\W/.test(str) ? tmplCache[str] = tmplCache[str] || tmpl(str) :
			new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" +
				str.replace(/[\r\t\n]/g, " ")
					.split("{{").join("\t")
					.replace(/((^|}})[^\t]*)'/g, "$1\r")
					.replace(/\t=(.*?)}}/g, "',$1,'")
					.split("\t").join("');")
					.split("}}").join("p.push('")
					.split("\r").join("\\'")
				+ "');}return p.join('');");
		return data ? fn( data ) : fn;
	}
	
	// Util
	//-----
    $doc.util = {
        isFn: function(f){
            return typeof f === 'function';
        },
        isObj: function(o){
            return typeof o === 'object';
        },
        isStr: function(str){
            return typeof str === 'string';
        }
    };
		
	// Subject proxy
	//--------------
    $doc.proxy = function(obj){
        obj.get = function(prop){
            return obj[prop];
        }
        obj.set = function(prop, val){
            obj[prop] = val;
            for(var i = 0; i< obj.observers.all.length; i++){
                this.observers.all[i]()(obj, obj[prop], prop);
            }
            if(obj.observers[prop]) {
                for(var i = 0; i< obj.observers[prop].length; i++){
                    this.observers[prop][i]()(obj, obj[prop], prop);
                }
            }
        }
        obj.observers = {all: []};
        obj._isProxy = true;
    
        return obj;
    }
	
	// Bind
	//-----
	$doc.bind = (function(){
		var overloads = {};

		var _bind = function(subject, property, observer, func){
			subject = this.proxy(subject);
			subject._wasBound = true;
			
			if(property){
				if(!subject.observers[property])
					subject.observers[property] = [];
				subject.observers[property].push(function() { 
					return function(obj, value, property) { 
						func.call(observer, obj, value, property);
					}
				});
			}else{
				subject.observers.all.push(function() { 
					return function(obj, val, prop) { 
						func.call(observer, obj, val, prop);
					}
				});
			}
		}

		overloads['object_string_object_function'] = function(subject, property, observer, func){
			_bind.call(this, subject, property, observer, func)
		}
		
		overloads['object_string_object'] = function(subject, property, observer){
			_bind.call(this, subject, property, observer, function(){})
		}

		overloads['object_string_function'] = function(subject, property, func){
			_bind.call(this, subject, property, {}, func)
		}

		overloads['object_object_function'] = function(subject, observer, func){
			_bind.call(this, subject, '', observer, func)
		}

		overloads['object_function'] = function(subject, func){
			_bind.call(this, subject, '', {}, func)
		}
		
        return function(){
			var sign = '';
			for(var i=0; i<arguments.length; i++) { sign += (sign == ''? '' : '_') + typeof arguments[i]; }
			console.log(sign);
            return overloads[sign] ? overloads[sign].apply(this, arguments) : null;
        }
	})();
		
	// Querying
	//---------
    $doc.id = function(id){
        var el = document.getElementById(id);
        	
        return {
            el: el,
            bind: function(target, tmpl){
				target = target.el || target;
				var subject = {};
				$doc.bind(subject, function(obj, val){ 
					el.innerHTML = val; 
				});
			
				var update = function(){
					subject.set('text', tmpl != null ? tmplate(tmpl, target) : target.value);
				};
				
				update();
				
				target.addEventListener("keyup", update);
				target.addEventListener("keydown", update);
				target.addEventListener("keypress", update);
				
				return this;
			},
			
			bindTmpl: function(target){
				var tmpl = el.value ? el.value : el.innerHTML;
				el.value = el.innerHTML = '';
				
				this.bind.call(this, target, tmpl);
				
				return this;
			}
        }
    }
	
    exports.$doc = $doc;	
})(window);