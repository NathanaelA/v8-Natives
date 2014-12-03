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

if (process.execArgv.indexOf('--allow-natives-syntax') >= 0) {
    var v8 = require('./v8-native-calls.js').v8;

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
    var v8 = require('./v8-native-dummy').v8;
}


var printStatus = function(fn, fName) {
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
};

var testOptimization = function(f, fname) {
    var i, j, keys;
    if (v8.isNative() === false) return -1;
    if (Array.isArray(f)) {
        f[0]();
        for (i = 0; i < f.length; i++) {
            v8.optimizeFunctionOnNextCall(f[i]);

            // Check for Class Functions
            keys = Object.keys(f[i]);
            for (j=0;j<keys.length;j++) {
                v8.optimizeFunctionOnNextCall(f[i][keys[j]]);
            }
        }
        f[0]();
        for (i = 0; i < f.length; i++) {
            printStatus(f[i], fname[i]);

            keys = Object.keys(f[i]);
            for (j=0;j<keys.length;j++) {
                v8.optimizeFunctionOnNextCall(f[i][keys[j]]);
            }


        }
    } else {
        f();
        v8.optimizeFunctionOnNextCall(f);
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



