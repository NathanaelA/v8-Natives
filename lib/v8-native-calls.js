/*
 --------------------------------------
 (c)2014-2021, Nathanael Anderson.
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

    "use strict";

// v8 Functions are located in v8/src/runtime/runtime.cc & runtime.h
// SMI = SMall Integer

_global.v8 = {
    isNative: function() { return true },
    getOptimizationStatus: function(fun) {
      return %GetOptimizationStatus(fun);
    },
    optimizeFunctionOnNextCall: function(fun) {
        return %OptimizeFunctionOnNextCall(fun);
    },
    deoptimizeFunction: function(fun) {
        return %DeoptimizeFunction(fun);
    },
    deoptimizeNow: function() {
        return %DeoptimizeNow();
    },
	ClearFunctionFeedback: function(fun) {
        return %ClearFunctionFeedback(fun);
    },
    debugPrint: function(data) {
        return %DebugPrint(data);
    },
    debugTrace: function() {
        return %DebugTrace();
    },
    collectGarbage: function() {
        return %CollectGarbage(null);
    },
    getHeapUsage: function() {
        console.log("This command no longer works, in a browser please use: window.performance.memory (with the --enable-precise-memory-info flag), if using node: process.memoryUsage();");
        return 0;
    },
    hasFastProperties: function(data) {
        return %HasFastProperties(data);
    },
    hasFastPackedElements: function(data) {
        return %HasFastPackedElements(data);
    },
	HasSmiElements: function(data) {
    	return %HasSmiElements(data);
	},
    hasDoubleElements: function(data) {
        return %HasDoubleElements(data);
    },
    hasDictionaryElements: function(data) {
        return %HasDictionaryElements(data);
    },
	HasHoleyElements: function(data) {
        return %HasHoleyElements(data);
    },
    hasSmiOrObjectElements: function(data) {
        return %HasSmiOrObjectElements(data);
    },
    hasSloppyArgumentsElements: function(data) {
        return %HasSloppyArgumentsElements(data);
    },
    haveSameMap: function(data1, data2) {
        return %HaveSameMap(data1, data2);
    },
    getFunctionName: function(func) {
        return %GetFunctionName(func);
    },
    functionGetName: function(func) {
        return %GetFunctionName(func);
    },
    isSmi: function(data) {
        return %IsSmi(data);
    },
    isValidSmi: function(data) {
       return %IsValidSmi(data);
    },
    neverOptimizeFunction: function(func) {
        return %NeverOptimizeFunction(func);
    },
    traceEnter: function() {
        return %TraceEnter();
    },
    traceExit: function(val) {
        return %TraceExit(val);
    },
    CompileOptimized(func, concurrent) {
        if (concurrent) {
            return %CompileOptimized_Concurrent(func);
        } else {
            return %CompileOptimized_NotConcurrent(func);
        }
    }
};


}(typeof exports === 'undefined' ? this : exports));
