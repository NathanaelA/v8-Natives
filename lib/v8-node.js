/*
 --------------------------------------
 (c)2014-2019, Nathanael Anderson.
 Repository: https://github.com/Nathanaela/v8-Natives
 --------------------------------------
 v8-Natives is under The MIT License (MIT)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 */

 // Notes:
 // The reason we are calling the functions twice before running optimizeFunctionOnNextCall, is
 // because 2 calls are needed to go from uninitialized -> pre-monomorphic -> monomorphic

// The global/global.android/global.java check is for NativeScript, it doesn't have a process.execArgv like Node.

var v8;
if ((global && global.android && global.java) || (process && process.execArgv && process.execArgv.indexOf('--allow-natives-syntax') >= 0)) {
    v8 = require('./v8-native-calls.js').v8;

	// NativeScript does not have this function, so we need to polyfil it.
	if (global && global.android && global.java) {
		if (!global.process) { global.process = {}; }
		if (!global.process.hrtime) {
			global.process.hrtime = function(startTime) {
				var now = java.lang.System.nanoTime() / 1000000;
				if (Array.isArray(startTime)) {
					return [0, now-startTime[1]];
				}
				return [0, now];
			};
		}
	}

    // This code just allows me to make sure the shim javascript has the same functions as the real thing, but it doesn't need to be active in production
    /*
    v8Dummy = require('./v8-native-dummy.js');

    var v8Keys = Object.keys(v8);
    var v8DummyKeys = Object.keys(v8Dummy);
    for (var i=0;i<v8Keys.length;i++) {
        if (v8DummyKeys.indexOf(v8Keys[i]) < 0) {
            console.log("v8Dummy is Missing", v8Keys[i]);
        }
    }
    for (var i=0;i<v8DummyKeys.length;i++) {
        if (v8Keys.indexOf(v8DummyKeys[i]) < 0) {
            console.log("v8Dummy has extra", v8DummyKeys[i]);
        }
    }
    */


} else {
    v8 = require('./v8-native-dummy').v8;
}

function checkBitmap(value, bit) {
	return ((value & bit) === bit);
}

var printStatus = function(fn, fName) {
    if (v8.isNative() === false) return -1;
    var optStatus = v8.getOptimizationStatus(fn);
    if (fName == null || fName === '') {
        fName = v8.getFunctionName(fn);
    }
    if (optStatus === -1) {
		console.log("Function", fName, 'status is unknown as Native functions are disabled.');
		return (optStatus);
	}
	var optStat = [];
    if (checkBitmap(optStatus,1)) {
    	optStat.push("is Function");
	}
	if (checkBitmap(optStatus,2)) {
		optStat.push("Never Optimized");
	}
	if (checkBitmap(optStatus,4)) {
    	optStat.push("Always Optimized");
	}
	if (checkBitmap(optStatus,8)) {
		optStat.push("Maybe Deopted");
	}
	if (checkBitmap(optStatus,16)) {
		optStat.push("Optimized");
	}
	if (checkBitmap(optStatus,32)) {
		optStat.push("TurboFanned");
	}
	if (checkBitmap(optStatus,64)) {
		optStat.push("Interpreted");
	}
	if (checkBitmap(optStatus,128)) {
		optStat.push("Marked for Optimization");
	}
	if (checkBitmap(optStatus,256)) {
		optStat.push("Marked for Concurrent Optimization");
	}
	if (checkBitmap(optStatus,512)) {
		optStat.push("Concurrently Optimizing");
	}
	if (checkBitmap(optStatus,1024)) {
		optStat.push("Is Executing");
	}
	if (checkBitmap(optStatus,2048)) {
		optStat.push("Topmost frame is Turbo Fanned");
	}
	if (checkBitmap(optStatus, 4096)) {
	    optStat.push("Lite Mode")
    }
	if (checkBitmap(optStatus, 8192)) {
	    optStat.push("Marked for de-optimization")
    }
	console.log("",fName, optStat.join(", "));

    return (optStatus);
};

var testOptimization = function(f, fname) {
    var i, j, keys;
    if (v8.isNative() === false) return -1;
    if (Array.isArray(f)) {
        for (i = 0; i < f.length; i++) {
            v8.optimizeFunctionOnNextCall(f[i]);
            v8.CompileOptimized(f[i], true);

            // Check for Class Functions
            keys = Object.keys(f[i]);
            for (j=0;j<keys.length;j++) {
                v8.optimizeFunctionOnNextCall(f[i][keys[j]]);
                v8.CompileOptimized(f[i][keys[j]], true);
            }
        }
        f[0]();
        for (i = 0; i < f.length; i++) {
            printStatus(f[i], fname[i]);

            keys = Object.keys(f[i]);
            for (j=0;j<keys.length;j++) {
                printStatus(f[i][keys[j]], keys[j]);
            }
        }
    } else {
        v8.optimizeFunctionOnNextCall(f);
        v8.CompileOptimized(f, true);
        f();
        printStatus(f, fname);
    }
};

var benchmark = function(count, f, params) {
    if (v8.isNative() === false || f === null || count < 1) return -1;
    var cnt = parseInt(count, 10);
    if (typeof params === 'undefined') {
        // Prime both Functions for Optimization
        benchmarkNoParams(1, f);
		benchmarkNoParams(1, f);  // Have to Run this Twice now in v8 (See notes above)
        // Have the V8 engine tag them for optimization
        v8.optimizeFunctionOnNextCall(f);
        v8.optimizeFunctionOnNextCall(benchmarkNoParams);
        // Have the V8 Engine actually do the optimization
        benchmarkNoParams(1, f);

        // Prime the Engine so that it can do the benchmark as fast as possible
        benchmarkNoParams(cnt, f);

        // Run the benchmark and return the time
        return benchmarkNoParams(cnt, f);
    } else {
        // Prime both Functions for Optimization
        benchmarkParams(1, f, params);
		benchmarkParams(1, f, params); // Have to Run this Twice now in v8 (See notes above)
        // Have the V8 engine tag them for optimization
        v8.optimizeFunctionOnNextCall(f);
        v8.optimizeFunctionOnNextCall(benchmarkParams);
        // Have the V8 Engine actually do the optimization
        benchmarkParams(1, f, params);

        // Prime the Engine so that it can do the benchmark as fast as possible
        benchmarkParams(cnt, f, params);

        // Run the benchmark and return the time
        return benchmarkParams(cnt, f, params);
    }
};

function benchmarkParams(itter, f, params) {
    var startTime, i= 0, endTime;
    v8.collectGarbage();
    startTime = process.hrtime();
    for (; i < itter; ++i) f(params);
    endTime = process.hrtime(startTime);
    return (endTime[0] * 1e9 + endTime[1]);
}

function benchmarkNoParams(itter, f) {
    var startTime, i= 0, endTime;
    v8.collectGarbage();
    startTime = process.hrtime();
    for (; i < itter; ++i) f();
    endTime = process.hrtime(startTime);
    return (endTime[0] * 1e9 + endTime[1]);
}

v8.helpers = {printStatus: printStatus, testOptimization: testOptimization, benchmark: benchmark};
module.exports = v8;



