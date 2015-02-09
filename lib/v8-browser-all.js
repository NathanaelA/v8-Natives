/*
 --------------------------------------
 (c)2014, Nathanael Anderson.
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

(function (_global) {

    function testIfAllowNativeSyntax() {
        var native = false;
        try {
            eval('%GetV8Version();');
            native = true;
        }
        catch (err) {
            native = false;
        }
        return native;
    }

    function printStatus(fn, fName) {
        if (v8.isNative() === false) return -1;
        var optStatus = v8.getOptimizationStatus(fn);
        if (fName == null || fName === '') {
            fName = v8.functionGetName(fn);
        }
        switch (optStatus) {
            case -1:
                console.log("Function", fName, 'status is unknown as Native functions are disabled.');
                break;
            case 1:
                console.log("Function", fName, "is optimized");
                break;
            case 2:
                console.log("Function", fName, "is not optimized");
                break;
            case 3:
                console.log("Function", fName, "is always optimized");
                break;
            case 4:
                console.log("Function", fName, "is never optimized");
                break;
            case 6:
                console.log("Function", fName, "is maybe deoptimized");
                break;
            default:
                console.log("Function", fName, "has unknown status", optStatus);
                break;
        }
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
        return !(res === 1 || res === 3);
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

        var v8 = _global.v8 = new Function('"use strict";\
        // v8 Functions are located in v8/lib/runtime.cc & runtime.h\
        // SMI = SMall Integer\n\
        \
        return {\
            isNative: function() { return true },\
            getOptimizationStatus: function(fun) {\
              return %GetOptimizationStatus(fun);\
            },\
            getOptimizationCount: function(fun) {\
               return %GetOptimizationCount(fun);\
            },\
            optimizeFunctionOnNextCall: function(fun) {\
                return %OptimizeFunctionOnNextCall(fun);\
            },\
            deoptimizeFunction: function(fun) {\
                return %DeoptimizeFunction(fun);\
            },\
            clearFunctionTypeFeedback: function(fun) {\
                return %ClearFunctionTypeFeedback(fun);\
            },\
            debugPrint: function(data) {\
                return %DebugPrint(data);\
            },\
            collectGarbage: function() {\
                return %CollectGarbage(null);\
            },\
            getHeapUsage: function() {\
                return %GetHeapUsage();\
            },\
            hasFastProperties: function(data) {\
                return %HasFastProperties(data);\
            },\
            hasFastSmiElements: function(data) {\
                return %HasFastSmiElements(data);\
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
            hasFastHoleyElements: function(data) {\
                return %HasFastHoleyElements(data);\
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
                return %FunctionGetName(func);\
            },\
            isInPrototypeChain: function(value, proto) {\
                return %IsInPrototypeChain(value, proto);\
            },\
            isSmi: function(data) {\
                return %_IsSmi(data);\
            },\
            isValidSmi: function(data) {\
               return %IsValidSmi(data);\
            },\
            neverOptimizeFunction: function(func) {\
                return %NeverOptimizeFunction(func);\
            },\
            getV8Version: function() {\
                return %GetV8Version();\
            },\
            isObserved: function(data) {\
                return %IsObserved(data);\
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
          v8.getOptimizationCount = v8.getHeapUsage = function() { return 0; }

          // Needs to return a string
          v8.getV8Version = v8.functionGetName = function() { return "N/A"};

          // Returns nothing
          v8.optimizeFunctionOnNextCall = v8.clearFunctionTypeFeedback =
              v8.debugPrint = v8.deoptimizeFunction = v8.neverOptimizeFunction = v8.collectGarbage = function() { return; }

          // Returns booleans, so we return false
          v8.getOptimizationStatus = v8.hasFastProperties = v8.hasFastSmiElements = v8.hasFastObjectElements = v8.hasFastDoubleElements =
              v8.hasDictionaryElements = v8.hasFastHoleyElements = v8.haveSameMap = v8.isObserved = v8.isValidSmi = v8.isSmi =
              v8.isInPrototypeChain = v8.hasFastSmiOrObjectElements = v8.hasSloppyArgumentsElements = v8.isNative;

    }

    _global.v8.helpers = {printStatus: printStatus, testOptimization: testOptimization, benchmark: benchmark};


}(typeof exports === 'undefined' ? this : exports));
