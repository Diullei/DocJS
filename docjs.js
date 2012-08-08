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
    $doc.bind = function(){
        var subject = arguments[0];
        var observer = {};
        var prop = null;
        var func = function(){};

		// discover overload function
		
		// bind(Subject, Property...
        if(this.util.isStr(arguments[1])){
            prop = arguments[1];
			
			// bind(Subject, Property, Observer)
            if(this.util.isObj(arguments[2])){
                observer = arguments[2];
                func = arguments[3];
				
			// bind(Subject, Property, Function)
            } else {
                func = arguments[2];
            }
			
		// bind(Subject, Function)
        } else if(this.util.isFn(arguments[1])){
            func = arguments[1];
			
		// bind(Subject, Observer, Function)
        } else if(this.util.isObj(arguments[1])){
            observer = arguments[1];
            func = arguments[2];
        }

        if(!this.util.isObj(subject)){
            throw new Error("first argument must be object");
        }
			
        subject = this.proxy(subject);
		
		// used to verify if Subject 
        subject._wasBound = true;

		// notify observers bound to properties
        if(prop != null){
            if(!subject.observers[prop])
                subject.observers[prop] = [];
            subject.observers[prop].push(function() { 
                return function(obj, val, prop) { 
                    func.call(observer, obj, val, prop);
                }
            });
		
		// notify observers bound to object
        } else {
            subject.observers.all.push(function() { 
                return function(obj, val, prop) { 
                    func.call(observer, obj, val, prop);
                }
            });
		}
    }
	
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