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

// For a complete list of %Commands see -
// https://github.com/v8/v8/blob/master/src/runtime/runtime.h

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
            f[0]();
            for (var i = 0; i < f.length; i++) {
                v8.optimizeFunctionOnNextCall(f[i]);
            }
            f[0]();
            for (var j = 0; j < f.length; j++) {
                printStatus(f[j], fname[j]);
            }
        } else {
            f();
            v8.optimizeFunctionOnNextCall(f);
            f();
            printStatus(f, fname);
        }
    }

    function benchmark(count, f, params) {
        if (v8.isNative() === false || f === null || count < 1) return -1;
        var cnt = parseInt(count, 10);
        if (typeof params === 'undefined') {
            // Prime both Functions for Optimization
            benchmarkNoParams(1, f);
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


    if (testIfAllowNativeSyntax()) {
		console.log("Using native");
        var v8 = _global.v8 = new Function('"use strict";\
        // v8 Functions are located in v8/lib/runtime.cc & runtime.h\
        // SMI = SMall Integer\n\
        \
        return {\
            isNative: function() { return true },\
            getOptimizationStatus: function(fun) {\
              return %GetOptimizationStatus(fun);\
            },\
            optimizeFunctionOnNextCall: function(fun) {\
                return %OptimizeFunctionOnNextCall(fun);\
            },\
            deoptimizeFunction: function(fun) {\
                return %DeoptimizeFunction(fun);\
            }, \
            deoptimizeNow: function() { \
                return %DeoptimizeNow(); \
            }, \
            ClearFunctionFeedback: function(fun) {\
                return %ClearFunctionFeedback(fun);\
            },\
            debugPrint: function(data) {\
                return %DebugPrint(data);\
            },\
            debugTrace: function() { \
                return %DebugTrace(); \
            }, \
            collectGarbage: function() {\
                return %CollectGarbage(null);\
            },\
            getHeapUsage: function() {\
                return %GetHeapUsage();\
            },\
            hasFastProperties: function(data) {\
                return %HasFastProperties(data);\
            },\
            hasFastElements: function(data) {\
                return %HasFastElements(data);\
            },\
            hasFastPackedElements: function(data) {\
				return %hasFastPackedElements(data);\
			},\
            hasFastObjectElements: function(data) {\
                return %HasFastObjectElements(data);\
            },\
            hasFastDoubleElements: function(data) {\
                return %HasFastDoubleElements(data);\
            },\
            hasDictionaryElements: function(data) {\
                return %HasDictionaryElements(data);\
            },\
            hasHoleyElements: function(data) {\
                return %HasHoleyElements(data);\
            },\
            hasFastSmiOrObjectElements: function(data) {\
                return %HasFastSmiOrObjectElements(data);\
            },\
            hasSloppyArgumentsElements: function(data) {\
                return %HasSloppyArgumentsElements(data);\
            },\
            haveSameMap: function(data1, data2) {\
                return %HaveSameMap(data1, data2);\
            },\
            functionGetName: function(func) {\
                return %GetFunctionName(func);\
            },\
            getFunctionName: function(func) {\
                return %GetFunctionName(func);\
            },\
            isSmi: function(data) {\
                return %IsSmi(data);\
            },\
            isValidSmi: function(data) {\
               return %IsValidSmi(data);\
            },\
            neverOptimizeFunction: function(func) {\
                return %NeverOptimizeFunction(func);\
            },\
            setFlags: function(flag) { \
                return %SetFlags(flag); \
            }, \
            traceEnter: function() { \
                return %TraceEnter(); \
            }, \
            traceExit: function(val) { \
                return %TraceExit(val); \
            }, \
            CompileOptimized(func, concurrent) {\
                if (concurrent) {\
                    return %CompileOptimized_Concurrent(func);\
                } else {\
                    return %CompileOptimized_NotConcurrent(func);\
                }\
            }\
        };\
        ')();

    } else {

        if (console && typeof console.warn === 'function') {
            console.warn("v8 engine is not running with --allow-natives-syntax; Native v8 functions are not available and will be shimmed with dummies.");
        }

        var v8 = _global.v8 = {
            isNative: function () {
                return false;
            }
        };

          // Returns a value; so we return 0
          v8.getHeapUsage = function() { return 0; }

          // Needs to return a string
          v8.getFunctionName = v8.functionGetName = function() { return "N/A"; };

          // Returns nothing
          v8.optimizeFunctionOnNextCall = v8.ClearFunctionFeedback = v8.deoptimizeNow = v8.debugTrace =
              v8.debugPrint = v8.deoptimizeFunction = v8.neverOptimizeFunction = v8.collectGarbage = function() { return; }

          // Returns booleans, so we return false
          v8.getOptimizationStatus = v8.hasFastProperties = v8.hasSmiElements = v8.hasFastPackedElements = v8.hasDoubleElements =
              v8.hasDictionaryElements = v8.hasHoleyElements = v8.haveSameMap = v8.isValidSmi = v8.isSmi =
              v8.hasFastSmiOrObjectElements = v8.hasSloppyArgumentsElements =
              v8.traceEnter = v8.traceExit = v8.setFlags = v8.isNative;

    }

    _global.v8.helpers = {printStatus: printStatus, testOptimization: testOptimization, benchmark: benchmark};


}(typeof exports === 'undefined' ? this : exports));
