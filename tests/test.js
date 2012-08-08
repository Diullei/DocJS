function verifyThrow(msssage){ return function(err) { return err.message === msssage; } };
                               
test('identify function', function(){
    function fn(){};
    ok($doc.util.isFn(fn), 'is function ok');
    ok(!$doc.util.isFn({}), 'is not a function ok');
});

test('identify object', function(){
    function fn(){};
    ok($doc.util.isObj({}), 'is object ok');
    ok(!$doc.util.isObj(fn), 'is not an object ok');
});

test('create proxy', function(){
    var proxy = $doc.proxy({});
    ok(proxy != null, 'proxy is not null');
    ok(proxy.set, 'proxy must have set function');
    ok(proxy.get, 'proxy must have get function');

    ok(proxy._isProxy, 'when created proxy must have _isProxy property set as true');
    
    proxy.set('prop1', 'val1');
    equal(proxy.prop1, 'val1', 'proxy must set property value');
    equal(proxy.get('prop1'), 'val1', 'proxy get function must get property value');
});

test('bind', function(){
    
    var obj = {};
    $doc.bind(obj);
    ok(obj._isProxy, 'when binded as subject obj must be a proxy');
    ok(obj._wasBound, 'when binded as subject obj must have _wasBound property set as true');
    raises(function() { $doc.bind(''); }, 
        verifyThrow("first argument must be object"),
        "first argument must be object");
    
    var obj1 = {};
    var val = false;
    $doc.bind(obj1, function(){ val = true; });
    obj1.set('prop1', 1);
    ok(val, 'when bind a function and set any value the function must be trigged');
    
    var obj2 = {};
    var val2 = false;
    $doc.bind(obj2, 'prop1', function(){ val2 = true; });
    obj2.set('prop2', 1);
    ok(!val2, 'when bind a function to a property and set any value in other property the function cant be trigged');
    obj2.set('prop1', 1);
    ok(val2, 'when bind a function to a property and set any value the function must be trigged');

    var obj3 = {cont: 1};
    $doc.bind(obj3, obj3, function(){ this.cont++; });
    obj3.set('prop1', 1);
    equal(obj3.cont, 2, 'context object');

    var obj4 = {cont: 1};
    $doc.bind(obj4, 'prop1', obj4, function(){ this.cont++; });
    obj4.set('prop1', 1);
    equal(obj4.cont, 2, 'context object 2');
});