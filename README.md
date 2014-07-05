#v8-Natives

###Access v8 Engine Natives easily in Chrome &amp; Node

I was reading a blog/wiki article at https://github.com/petkaantonov/bluebird/wiki/Optimization-killers and it presents some really low level diagnostic commands that I was totally unaware of; and so I found them to be totally awesome in scope for several things I do.   The V8 engine has a large array of commands that you can call that can get and/or set status in the actual v8 engine.  This library is my attempt to make my life a lot easier and eliminate the errors in trying to use the v8 native commands.  These low level commands allow you access to tell the v8 engine to optimize a routine and then find out if a routine can/is optimized.  

Now, you can call the v8 native commands directly (for example ```%GetV8Version()```); however if you forget to use the --allow-natives-syntax then the v8 engine will immediately stop parsing the file as the v8 commands all start with a '%' which is invalid JavaScript...  What this library does is it is a simple wrapper that wraps those calls; so that I can do (v8.getV8Version()).   If you forgot the --allow-natives-syntax it will still run your code fine; it just won't return anything but a N/A as it doesn't know the version.
 
In the examples folder is a browser example; to show you how it works in Chrome/Chromium (```chrome --js-flags="--allow-natives-syntax" browser.html```).  You can run it in a non-v8 browser and it will just use the dummy shim.   
In addition there is a NodeJS example to show you the same support in NodeJS. (```node --allow-natives-syntax node.js```)

 Please note the examples and helper commands can show you how to use a good chunk of the optimization, general and Memory calls in the library.   If someone wants to work up some examples using the variable/opject information commands; they would gladly be accepted!
  
###Installing V8 Natives
```
npm install v8-natives
``` 

###Usage
####Browser:

```js
<script src="v8-browser.js" onload="waitForV8(some_callback)"></script>
<script>function some_callback() { 
  v8.collectGarbage(); 
  /* more v8.commands */}
</script>
```


####Node:
 
```js
var v8 = require('v8-natives');   
v8.collectGarbage(); 
/* more v8 commands */
```




##Commands
 
###Helper Commands
- helpers.testOptimization(func[, funcNames]) - This will automatically call the function once, call the optimizeOnNextCall; call the function again, and then call printStatus on the function.
  You can also do: testOptimization([func1, func2, func3]) this is so that if you have func1 which called func2 & func3 you can see if all three get optimized.  It will automatically call func1, set the optimization flag on all three funcs, and then call func1 and then printStatus on all three funcs.  
- helpers.printStatus(func) - Prints the function optimization results to the console
- helpers.benchmark(count, func) - Runs a func in a loop count times.   This will automatically set the optimization flag; run it count times, run garbageCollection start the time; run func for count times; and then return the total time taken.
- window.waitForV8(callback) - [Browser ONLY]; this will wait until the v8 namespace is loaded properly and then call your callback. 
 
###General Commands
- isNative() - Is the Native Support mode enabled (i.e. true = uses real wrapper; false = use dummy wrapper)
- getV8Version() - Gets the v8 engine version
- functionGetName(func) - Gets the string name of a function

###Memory Commands
- getHeapUsage() - Shows how much heap is used
- collectGarbage() - Force a full Garbage Collection

###Optimization Commands
- optimizeFunctionOnNextCall(func) - Tells v8 to optimizes the function the next time you call it
- deoptimizeFunction(func) - De-optimize a function
- neverOptimizeFunction(func) - Never Optimize a function
- getOptimizationStatus(func) - Get the functions optimization status  [1 = Optimized, 2 = Un-optimized, 3 = Always Optimized, 4 = Never Optimized, 5 = ?, 6 = Maybe Optimized]
  I've only seen 1 & 2 from my tests; but according to the blog/wiki article I read 3, 4 & 6 are valid also) 

###Variable/Object information Commands
- hasFastProperties(obj)
- hasFastSmiElements(obj)
- hasFastObjectElements(obj) 
- hasFastDoubleElements(obj)
- hasDictionaryElements(obj)
- hasFastHoleyElements(obj)
- haveSameMap(obj1, obj2)
- isObserved(obj)
- isValidSmi(obj)
- isSmi(obj)
- isInPrototypeChain(item, obj)
- hasFastSmiOrObjectElements(obj)
- hasSloppyArgumentsElements(obj)

##Notes
```optimizedFunctionOnNextCall(func)``` needs the function ran before it can tag it for optimization.   So the procedure is:
- Run your function
- Tag your function for optimization
- Run your Function
- Verify that the v8 Engine optimized it.   If it did not optimized it; then that means you have code that can't be optimized in it.  