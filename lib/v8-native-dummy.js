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

    "use strict";

    if (console && typeof console.warn === 'function') {
        console.warn("v8 engine is not running with --allow-natives-syntax; Native v8 functions are not available and will be shimmed with dummies.");
    }

var v8 = {
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

_global.v8 = v8;



}(typeof exports === 'undefined' ? this : exports));


