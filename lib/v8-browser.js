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

(function (_global) {

    function testIfAllowNativeSyntax() {
        var native = false;
        try {
            eval('%GetHeapUsage();');
            native = true;
        }
        catch (err) {
            native = false;
        }
        return native;
    }

    function loadScript(file, cb) {
        var src = document.currentScript.src, path="";
        var idx = src.lastIndexOf('/');
        if (idx >= 0) path = src.substring(0, idx+1);

        var newScript = document.createElement('script');
        var existingScript = document.getElementsByTagName('script')[0];
        newScript.src = path+file;
        newScript.onload = cb;
        existingScript.parentNode.insertBefore(newScript, existingScript);
    }

	function checkBitmap(value, bit) {
		return ((value & bit) === bit);
	}

	function printStatus(fn, fName) {
        if (v8.isNative() === false) return -1;
        var optStatus = v8.getOptimizationStatus(fn);
        if (fName == null || fName === '') {
            fName = v8.functionGetName(fn);
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
    }

    function testIsDebugging() {
        var _test = function() { return true; };
        _test();
		_test(); // Have to Run this Twice now in v8 (See notes above)
        try {
            v8.optimizeFunctionOnNextCall(_test);
        } catch (e) {
            return true
        }
        _test();
        var res = v8.getOptimizationStatus(_test);
        return !((res & 16) === 16);
    }

    function testOptimization(f, fname) {
        if (v8.isNative() === false) return -1;

        if (testIsDebugging()) {
            if (console && console.warn) console.warn("Debug Console is open, please close Debug Console to run Tests!");
            return -1;
        }

        if (Array.isArray(f)) {
            for (var i = 0; i < f.length; i++) {
                v8.optimizeFunctionOnNextCall(f[i]);
                v8.CompileOptimized(f[i], true);
            }
            try {
                f[0]();
            } catch (e) {}
            for (var j = 0; j < f.length; j++) {
                printStatus(f[j], fname[j]);
            }
        } else {
            v8.optimizeFunctionOnNextCall(f);
            v8.CompileOptimized(f, true);
            try {
                f();
            } catch (e) {}
            printStatus(f, fname);
        }
    }

    function benchmark(count, f, params) {
        if (v8.isNative() === false || f === null || count < 1) return -1;
        var cnt = parseInt(count, 10);
        if (typeof params === 'undefined') {
            // Prime both Functions for Optimization
            benchmarkNoParams(1, f);
			benchmarkNoParams(1, f); // Have to Run this Twice now in v8 (See notes above)
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
    }

    function benchmarkParams(itter, f, params) {
        var startTime, i = 0;
        v8.collectGarbage();
        startTime = performance.now();
        for (; i < itter; ++i) f(params);
        return performance.now() - startTime;
    }

    function benchmarkNoParams(itter, f) {
        var startTime, i = 0;
        v8.collectGarbage();
        startTime = performance.now();
        for (; i < itter; ++i) f();
        return performance.now() - startTime;
    }

    function finishSetup() {
        _global.v8.helpers = {printStatus: printStatus, testOptimization: testOptimization, benchmark: benchmark};
    }

    function waitForV8(cb) {
        // Simple Hack to make sure we have the V8 namespace...
        if (typeof _global.v8 === 'undefined') {
            setTimeout(waitForV8, 100, cb);
            return;
        }
        cb();
    }

    if (testIfAllowNativeSyntax()) {
        loadScript('v8-native-calls.js', finishSetup);
    } else {
        loadScript('v8-native-dummy.js', finishSetup)
    }

    // Add this helper function
    _global.waitForV8 = waitForV8;

}(typeof exports === 'undefined' ? this : exports));
