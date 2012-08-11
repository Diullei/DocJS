(function(exports){
	// base namespace
	var $doc = {};

	// save previous $doc object to restore when noConflict is used
	var previous = exports.$doc;

	// Template
	// based on John Resig - Simple JavaScript Templating - http://ejohn.org/
	//-----------------------------------------------------------------------
	var tmplCache = {};
	$doc.tmplate = function(str, data){
		var fn = !/\W/.test(str) ? tmplCache[str] = tmplCache[str] || $doc.tmplate(str) :
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
		},
		isArray: function(arr){
			try{
				return arr instanceof Array;
			}
			catch(err){
				return false;
			}
		},
		isEl: function(o){
			return (
				typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
				o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
			);
		}
	};
		
	// Subject proxy
	//--------------
	$doc.proxy = function(obj){
		if($doc.util.isEl(obj)){
			obj = {el: obj};
		}
		
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

		if(obj.el){
			var update = function(){
				obj.set('text', obj.el.value || obj.el.innerHTML);
				//var t = obj.el.value || obj.el.innerHTML;
			};
			
			update();
		
			obj.el.addEventListener("keyup", update);
			obj.el.addEventListener("keydown", update);
			obj.el.addEventListener("keypress", update);
		}
		
		return obj;
	}
	
	// Bind
	//-----
	$doc.bind = (function(){
		var overloads = {};

		var _bind = function(subject, property, func, observer){		
			if(!subject._wasBound) {
				subject = this.proxy(subject);
				subject._wasBound = true;
			}
			
			if(property){
				var list = property.split(',');
				for(var i=0;i<list.length;i++) {
					var prop = list[i];
					if(!subject.observers[prop])
						subject.observers[prop] = [];
					subject.observers[prop].push(function() { 
						return function(obj, value, property) { 
							func.call(observer, obj, value, property);
						}
					});
				}
			}else{
				if(!$doc.util.isArray(subject)) {
					subject.observers.all.push(function() { 
						return function(obj, val, prop) { 
							func.call(observer, obj, val, prop);
						}
					});
				} else {
					for(var i=0; i<subject.length;i++){
						subject[i].observers.all.push(function() { 
							return function(obj, val, prop) { 
								func.call(observer, obj, val, prop);
							}
						});
					}
				}
			}
		}

		overloads['object_string_function_object'] = function(subject, property, func, observer){
			_bind.call(this, subject, property, func, observer)
		}
		
		overloads['object_string_object'] = function(subject, property, observer){
			_bind.call(this, subject, property, function(){}, observer)
		}

		overloads['object_string_function'] = function(subject, property, func){
			_bind.call(this, subject, property, func, {})
		}

		overloads['object_function_object'] = function(subject, func, observer){
			_bind.call(this, subject, '', func, observer)
		}

		overloads['object_function'] = function(subject, func){
			_bind.call(this, subject, '', func, {})
		}
		
		return function(){
			var sign = '';
			for(var i=0; i<arguments.length; i++) { sign += (sign == ''? '' : '_') + typeof arguments[i]; }
			return overloads[sign] ? overloads[sign].apply(this, arguments) : null;
		}
	})();
		
	// Querying
	//---------
	$doc.id = function(id){
		var el = document.getElementById(id);
			
		return {
			el: el,
			bind: function(target, template){
				target = target.el || target;
				
				if($doc.util.isEl(target)){
					var elTarget = {};
					$doc.bind(elTarget, function(obj, val){ 
						el.innerHTML = val; 
					});
				
					var update = function(){
						var content = target.value;
						if(template != null) {
							content = template;
							if(template.indexOf('{{') != -1)
								content = template.trim() != '' ? $doc.tmplate(template, target) : target.value;
						}
						elTarget.set('text', content);
					};
					
					update();
				
					target.addEventListener("keyup", update);
					target.addEventListener("keydown", update);
					target.addEventListener("keypress", update);
				} else {
					$doc.bind(target, function(obj, val){ 
						var content = val;
						if(template != null) {
							content = template;
							if(template.indexOf('{{') != -1)
								content = template.trim() != '' ? $doc.tmplate(template, target) : val;
						}
						el.innerHTML = content;
						el.value = content;
					});
				}
				
				return this;
			},
			
			bindTmpl: function(target){
				if(!$doc.util.isEl(target.el || target)){
					throw new Error('Invalid target argument');
				}
				var template = el.value ? el.value : el.innerHTML;
				el.value = el.innerHTML = '';
				
				this.bind.call(this, target, template);
				
				return this;
			}
		}
	}
	
	exports.$doc = $doc;
})(window);