// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    this['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    code = Pointer_stringify(code);
    if (code[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (code.indexOf('"', 1) === code.length-1) {
        code = code.substr(1, code.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + code + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    return Runtime.asmConstCache[code] = eval('(function(' + args.join(',') + '){ ' + code + ' })'); // new Function does not allow upvars in node
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    return rawList ? list : ret + flushList();
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))|0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(6651);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([104,0,0,0,0,0,0,0,104,101,108,112,0,0,0,0,112,114,105,110,116,32,116,104,105,115,32,104,101,108,112,32,97,110,100,32,101,120,105,116,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,118,101,114,115,105,111,110,0,112,114,105,110,116,32,118,101,114,115,105,111,110,32,105,110,102,111,114,109,97,116,105,111,110,32,97,110,100,32,101,120,105,116,0,0,0,0,0,0,115,0,0,0,0,0,0,0,115,116,114,0,0,0,0,0,60,115,116,114,62,0,0,0,65,110,105,109,97,116,105,111,110,32,115,116,114,105,110,103,0,0,0,0,0,0,0,0,111,109,102,95,112,97,114,115,101,0,0,0,0,0,0,0,37,115,58,32,105,110,115,117,102,102,105,99,105,101,110,116,32,109,101,109,111,114,121,10,0,0,0,0,0,0,0,0,84,114,121,32,39,37,115,32,45,45,104,101,108,112,39,32,102,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,46,10,0,0,37,115,32,118,48,46,49,10,0,0,0,0,0,0,0,0,85,115,97,103,101,58,32,37,115,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,37,45,50,53,115,32,37,115,10,0,0,0,0,0,0,0,45,0,0,0,0,0,0,0,80,97,114,115,105,110,103,32,34,37,115,34,46,10,10,0,37,100,46,32,70,114,97,109,101,32,37,100,58,32,39,37,99,37,100,39,10,0,0,0,37,115,0,0,0,0,0,0,85,110,107,110,111,119,110,0,37,100,0,0,0,0,0,0,32,42,32,37,45,52,115,32,37,45,52,115,32,37,115,10,0,0,0,0,0,0,0,0,32,42,32,37,45,52,115,32,32,32,32,32,32,37,115,10,0,0,0,0,0,0,0,0,32,42,32,37,45,57,99,32,60,85,110,108,105,115,116,101,100,32,116,97,103,33,62,10,0,0,0,0,0,0,0,0,10,65,114,103,117,109,101,110,116,115,58,0,0,0,0,0,67,111,109,109,97,110,100,32,108,105,110,101,32,79,110,101,32,77,117,115,116,32,70,97,108,108,32,50,48,57,55,32,65,110,105,109,97,116,105,111,110,32,115,116,114,105,110,103,32,112,97,114,115,101,114,0,83,111,117,114,99,101,32,99,111,100,101,32,105,115,32,97,118,97,105,108,97,98,108,101,32,97,116,32,104,116,116,112,115,58,47,47,103,105,116,104,117,98,46,99,111,109,47,111,109,102,50,48,57,55,32,117,110,100,101,114,32,77,73,84,32,108,105,99,101,110,115,101,46,0,0,0,0,0,0,0,40,67,41,32,50,48,49,52,32,84,117,111,109,97,115,32,86,105,114,116,97,110,101,110,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,116,111,111,32,109,97,110,121,32,101,114,114,111,114,115,32,116,111,32,100,105,115,112,108,97,121,0,0,0,0,0,0,105,110,115,117,102,102,105,99,101,110,116,32,109,101,109,111,114,121,0,0,0,0,0,0,117,110,101,120,112,101,99,116,101,100,32,97,114,103,117,109,101,110,116,32,34,37,115,34,0,0,0,0,0,0,0,0,111,112,116,105,111,110,32,34,37,115,34,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,0,0,0,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,116,105,111,110,32,34,37,115,34,0,0,0,0,0,105,110,118,97,108,105,100,32,111,112,116,105,111,110,32,34,45,37,99,34,0,0,0,0,37,115,58,32,109,105,115,115,105,110,103,32,111,112,116,105,111,110,32,0,0,0,0,0,10,0,0,0,0,0,0,0,37,115,58,32,101,120,116,114,97,110,101,111,117,115,32,111,112,116,105,111,110,32,0,0,60,115,116,114,105,110,103,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,58,32,0,0,0,0,109,105,115,115,105,110,103,32,111,112,116,105,111,110,32,0,10,0,0,0,0,0,0,0,101,120,99,101,115,115,32,111,112,116,105,111,110,32,0,0,0,0,0,0,0,0,0,0,124,0,0,0,0,0,0,0,32,37,115,0,0,0,0,0,32,91,37,115,93,0,0,0,32,91,37,115,93,32,91,37,115,93,0,0,0,0,0,0,32,91,37,115,93,46,46,46,0,0,0,0,0,0,0,0,32,32,37,45,50,48,115,32,37,115,10,0,0,0,0,0,44,32,0,0,0,0,0,0,32,0,0,0,0,0,0,0,91,0,0,0,0,0,0,0,93,0,0,0,0,0,0,0,45,45,0,0,0,0,0,0,44,0,0,0,0,0,0,0,61,0,0,0,0,0,0,0,32,45,37,99,0,0,0,0,32,91,45,37,99,0,0,0,37,99,0,0,0,0,0,0,91,37,99,0,0,0,0,0,136,11,0,0,0,0,0,0,0,0,0,0,144,11,0,0,0,0,0,0,0,0,0,0,152,11,0,0,0,0,0,0,0,0,0,0,160,11,0,0,0,0,0,0,0,0,0,0,168,11,0,0,0,0,0,0,0,0,0,0,176,11,0,0,0,0,0,0,0,0,0,0,184,11,0,0,0,0,0,0,0,0,0,0,192,11,0,0,0,0,0,0,0,0,0,0,200,11,0,0,0,0,0,0,0,0,0,0,208,11,0,0,0,0,0,0,0,0,0,0,216,11,0,0,0,0,0,0,0,0,0,0,224,11,0,0,0,0,0,0,0,0,0,0,232,11,0,0,0,0,0,0,0,0,0,0,240,11,0,0,0,0,0,0,0,0,0,0,248,11,0,0,0,0,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0,0,0,0,8,12,0,0,0,0,0,0,0,0,0,0,16,12,0,0,0,0,0,0,0,0,0,0,24,12,0,0,0,0,0,0,0,0,0,0,32,12,0,0,1,0,0,0,40,12,0,0,64,12,0,0,0,0,0,0,0,0,0,0,72,12,0,0,1,0,0,0,80,12,0,0,96,12,0,0,0,0,0,0,0,0,0,0,104,12,0,0,1,0,0,0,0,0,0,0,112,12,0,0,1,0,0,0,0,0,0,0,120,12,0,0,1,0,0,0,0,0,0,0,128,12,0,0,1,0,0,0,136,12,0,0,152,12,0,0,0,0,0,0,0,0,0,0,160,12,0,0,0,0,0,0,0,0,0,0,168,12,0,0,0,0,0,0,0,0,0,0,176,12,0,0,1,0,0,0,184,12,0,0,208,12,0,0,1,0,0,0,216,12,0,0,240,12,0,0,1,0,0,0,248,12,0,0,16,13,0,0,0,0,0,0,24,13,0,0,56,13,0,0,1,0,0,0,64,13,0,0,96,13,0,0,1,0,0,0,104,13,0,0,128,13,0,0,0,0,0,0,136,13,0,0,160,13,0,0,0,0,0,0,168,13,0,0,192,13,0,0,1,0,0,0,0,0,0,0,200,13,0,0,1,0,0,0,0,0,0,0,208,13,0,0,0,0,0,0,0,0,0,0,216,13,0,0,0,0,0,0,0,0,0,0,224,13,0,0,1,0,0,0,0,0,0,0,232,13,0,0,1,0,0,0,0,0,0,0,240,13,0,0,0,0,0,0,0,0,0,0,248,13,0,0,1,0,0,0,0,0,0,0,0,14,0,0,0,0,0,0,8,14,0,0,32,14,0,0,0,0,0,0,0,0,0,0,40,14,0,0,0,0,0,0,0,0,0,0,48,14,0,0,0,0,0,0,0,0,0,0,56,14,0,0,0,0,0,0,0,0,0,0,64,14,0,0,0,0,0,0,0,0,0,0,72,14,0,0,0,0,0,0,80,14,0,0,96,14,0,0,0,0,0,0,0,0,0,0,104,14,0,0,1,0,0,0,0,0,0,0,112,14,0,0,1,0,0,0,0,0,0,0,120,14,0,0,1,0,0,0,128,14,0,0,160,14,0,0,0,0,0,0,168,14,0,0,208,14,0,0,0,0,0,0,216,14,0,0,240,14,0,0,0,0,0,0,0,0,0,0,248,14,0,0,0,0,0,0,0,15,0,0,8,15,0,0,0,0,0,0,0,0,0,0,16,15,0,0,0,0,0,0,24,15,0,0,56,15,0,0,0,0,0,0,64,15,0,0,88,15,0,0,0,0,0,0,0,0,0,0,96,15,0,0,0,0,0,0,104,15,0,0,136,15,0,0,0,0,0,0,144,15,0,0,184,15,0,0,0,0,0,0,192,15,0,0,224,15,0,0,0,0,0,0,232,15,0,0,8,16,0,0,0,0,0,0,0,0,0,0,16,16,0,0,0,0,0,0,24,16,0,0,72,16,0,0,1,0,0,0,80,16,0,0,120,16,0,0,1,0,0,0,128,16,0,0,152,16,0,0,1,0,0,0,160,16,0,0,176,16,0,0,1,0,0,0,0,0,0,0,184,16,0,0,0,0,0,0,0,0,0,0,192,16,0,0,1,0,0,0,200,16,0,0,224,16,0,0,1,0,0,0,232,16,0,0,8,17,0,0,1,0,0,0,0,0,0,0,16,17,0,0,1,0,0,0,0,0,0,0,24,17,0,0,1,0,0,0,0,0,0,0,32,17,0,0,0,0,0,0,0,0,0,0,40,17,0,0,1,0,0,0,0,0,0,0,48,17,0,0,1,0,0,0,0,0,0,0,56,17,0,0,1,0,0,0,0,0,0,0,64,17,0,0,0,0,0,0,0,0,0,0,72,17,0,0,1,0,0,0,0,0,0,0,80,17,0,0,1,0,0,0,88,17,0,0,120,17,0,0,1,0,0,0,128,17,0,0,160,17,0,0,1,0,0,0,168,17,0,0,200,17,0,0,0,0,0,0,0,0,0,0,208,17,0,0,1,0,0,0,0,0,0,0,216,17,0,0,1,0,0,0,0,0,0,0,224,17,0,0,0,0,0,0,0,0,0,0,232,17,0,0,1,0,0,0,0,0,0,0,240,17,0,0,1,0,0,0,0,0,0,0,248,17,0,0,1,0,0,0,0,0,0,0,0,18,0,0,0,0,0,0,0,0,0,0,8,18,0,0,0,0,0,0,0,0,0,0,16,18,0,0,1,0,0,0,0,0,0,0,24,18,0,0,0,0,0,0,0,0,0,0,32,18,0,0,1,0,0,0,0,0,0,0,40,18,0,0,1,0,0,0,0,0,0,0,48,18,0,0,1,0,0,0,0,0,0,0,56,18,0,0,1,0,0,0,64,18,0,0,112,18,0,0,0,0,0,0,120,18,0,0,152,18,0,0,1,0,0,0,160,18,0,0,200,18,0,0,0,0,0,0,0,0,0,0,208,18,0,0,1,0,0,0,216,18,0,0,240,18,0,0,1,0,0,0,0,0,0,0,248,18,0,0,0,0,0,0,0,0,0,0,0,19,0,0,1,0,0,0,8,19,0,0,32,19,0,0,1,0,0,0,40,19,0,0,56,19,0,0,1,0,0,0,64,19,0,0,88,19,0,0,1,0,0,0,96,19,0,0,128,19,0,0,1,0,0,0,136,19,0,0,160,19,0,0,1,0,0,0,0,0,0,0,168,19,0,0,1,0,0,0,0,0,0,0,176,19,0,0,0,0,0,0,0,0,0,0,184,19,0,0,0,0,0,0,192,19,0,0,224,19,0,0,0,0,0,0,232,19,0,0,0,20,0,0,0,0,0,0,0,0,0,0,8,20,0,0,0,0,0,0,0,0,0,0,16,20,0,0,0,0,0,0,24,20,0,0,56,20,0,0,0,0,0,0,0,0,0,0,64,20,0,0,0,0,0,0,0,0,0,0,72,20,0,0,0,0,0,0,0,0,0,0,80,20,0,0,0,0,0,0,0,0,0,0,88,20,0,0,0,0,0,0,0,0,0,0,96,20,0,0,0,0,0,0,0,0,0,0,104,20,0,0,0,0,0,0,0,0,0,0,112,20,0,0,0,0,0,0,0,0,0,0,120,20,0,0,0,0,0,0,0,0,0,0,128,20,0,0,0,0,0,0,136,20,0,0,168,20,0,0,0,0,0,0,0,0,0,0,176,20,0,0,0,0,0,0,0,0,0,0,184,20,0,0,0,0,0,0,0,0,0,0,192,20,0,0,1,0,0,0,200,20,0,0,232,20,0,0,1,0,0,0,240,20,0,0,16,21,0,0,1,0,0,0,24,21,0,0,72,21,0,0,1,0,0,0,80,21,0,0,112,21,0,0,1,0,0,0,120,21,0,0,152,21,0,0,1,0,0,0,160,21,0,0,192,21,0,0,1,0,0,0,200,21,0,0,248,21,0,0,1,0,0,0,0,22,0,0,32,22,0,0,0,0,0,0,40,22,0,0,56,22,0,0,0,0,0,0,40,22,0,0,64,22,0,0,0,0,0,0,72,22,0,0,112,22,0,0,0,0,0,0,40,22,0,0,120,22,0,0,0,0,0,0,40,22,0,0,128,22,0,0,0,0,0,0,136,22,0,0,168,22,0,0,0,0,0,0,176,22,0,0,97,97,0,0,0,0,0,0,97,98,0,0,0,0,0,0,97,99,0,0,0,0,0,0,97,100,0,0,0,0,0,0,97,101,0,0,0,0,0,0,97,102,0,0,0,0,0,0,97,103,0,0,0,0,0,0,97,105,0,0,0,0,0,0,97,109,0,0,0,0,0,0,97,111,0,0,0,0,0,0,97,115,0,0,0,0,0,0,97,116,0,0,0,0,0,0,97,119,0,0,0,0,0,0,97,120,0,0,0,0,0,0,97,114,0,0,0,0,0,0,97,108,0,0,0,0,0,0,98,0,0,0,0,0,0,0,98,49,0,0,0,0,0,0,98,50,0,0,0,0,0,0,98,98,0,0,0,0,0,0,86,101,114,116,105,99,97,108,32,115,99,114,101,101,110,32,115,104,97,107,101,0,0,0,98,101,0,0,0,0,0,0,98,102,0,0,0,0,0,0,66,108,101,110,100,32,102,105,110,105,115,104,0,0,0,0,98,104,0,0,0,0,0,0,98,108,0,0,0,0,0,0,98,109,0,0,0,0,0,0,98,106,0,0,0,0,0,0,98,115,0,0,0,0,0,0,66,108,101,110,100,32,115,116,97,114,116,0,0,0,0,0,98,117,0,0,0,0,0,0,98,119,0,0,0,0,0,0,98,120,0,0,0,0,0,0,98,112,100,0,0,0,0,0,82,101,102,101,114,101,110,99,101,32,112,97,108,101,116,116,101,32,105,110,100,101,120,0,98,112,115,0,0,0,0,0,83,116,97,114,116,32,112,97,108,101,116,116,101,32,105,110,100,101,120,0,0,0,0,0,98,112,110,0,0,0,0,0,80,97,108,101,116,116,101,32,101,110,116,114,121,32,99,111,117,110,116,0,0,0,0,0,98,112,102,0,0,0,0,0,70,105,103,104,116,101,114,32,112,97,108,101,116,116,101,32,115,101,108,101,99,116,105,111,110,0,0,0,0,0,0,0,98,112,112,0,0,0,0,0,73,110,105,116,105,97,108,32,97,110,100,32,102,105,110,97,108,32,99,111,108,111,114,32,108,101,118,101,108,0,0,0,98,112,98,0,0,0,0,0,73,110,105,116,105,97,108,32,99,111,108,111,114,32,108,101,118,101,108,0,0,0,0,0,98,112,111,0,0,0,0,0,68,105,115,97,98,108,101,32,112,97,108,101,116,116,101,32,101,102,102,101,99,116,115,0,98,122,0,0,0,0,0,0,67,111,108,111,114,32,116,105,110,116,32,101,102,102,101,99,116,0,0,0,0,0,0,0,98,97,0,0,0,0,0,0,98,99,0,0,0,0,0,0,98,100,0,0,0,0,0,0,98,103,0,0,0,0,0,0,98,105,0,0,0,0,0,0,98,107,0,0,0,0,0,0,98,110,0,0,0,0,0,0,98,111,0,0,0,0,0,0,98,114,0,0,0,0,0,0,68,114,97,119,32,97,100,100,105,116,105,118,101,108,121,63,0,0,0,0,0,0,0,0,98,116,0,0,0,0,0,0,98,121,0,0,0,0,0,0,99,102,0,0,0,0,0,0,99,103,0,0,0,0,0,0,99,108,0,0,0,0,0,0,99,112,0,0,0,0,0,0,65,112,112,108,121,32,100,97,109,97,103,101,63,0,0,0,99,119,0,0,0,0,0,0,99,120,0,0,0,0,0,0,99,121,0,0,0,0,0,0,100,0,0,0,0,0,0,0,82,101,45,101,110,116,101,114,32,97,110,105,109,97,116,105,111,110,32,97,116,32,78,32,116,105,99,107,115,0,0,0,101,0,0,0,0,0,0,0,82,101,108,97,116,105,118,101,32,101,110,101,109,121,32,112,111,115,105,116,105,111,110,32,109,111,100,105,102,105,101,114,0,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,70,108,105,112,32,115,112,114,105,116,101,32,118,101,114,116,105,99,97,108,108,121,63,0,103,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,72,111,118,101,114,0,0,0,105,0,0,0,0,0,0,0,106,102,50,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,100,101,115,116,114,117,99,116,105,111,110,0,0,0,106,102,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,115,99,114,97,112,0,106,103,0,0,0,0,0,0,106,104,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,39,104,105,103,104,39,32,109,111,118,101,115,0,0,106,106,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,97,105,114,98,111,114,110,101,32,109,111,118,101,115,0,0,0,0,0,0,0,0,106,108,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,39,108,111,119,39,32,109,111,118,101,115,0,0,0,106,109,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,39,109,105,100,39,32,109,111,118,101,115,0,0,0,106,112,0,0,0,0,0,0,106,122,0,0,0,0,0,0,65,108,108,111,119,32,99,104,97,105,110,105,110,103,32,116,111,32,97,110,121,116,104,105,110,103,63,32,40,75,97,116,97,110,97,32,104,101,97,100,32,115,116,111,109,112,41,0,106,110,0,0,0,0,0,0,65,108,108,111,119,32,102,114,97,109,101,32,116,111,32,99,104,97,105,110,32,116,111,32,97,110,105,109,97,116,105,111,110,32,78,0,0,0,0,0,107,0,0,0,0,0,0,0,75,110,111,99,107,98,97,99,107,32,111,110,32,104,105,116,0,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,83,111,117,110,100,32,108,111,117,100,110,101,115,115,0,0,109,97,0,0,0,0,0,0,109,99,0,0,0,0,0,0,109,100,0,0,0,0,0,0,68,101,115,116,114,111,121,32,97,110,105,109,97,116,105,111,110,32,78,63,0,0,0,0,109,103,0,0,0,0,0,0,71,114,97,118,105,116,121,32,102,111,114,32,115,112,97,119,110,101,100,32,97,110,105,109,97,116,105,111,110,0,0,0,109,105,0,0,0,0,0,0,109,109,0,0,0,0,0,0,109,110,0,0,0,0,0,0,109,111,0,0,0,0,0,0,109,112,0,0,0,0,0,0,109,114,120,0,0,0,0,0,109,114,121,0,0,0,0,0,109,115,0,0,0,0,0,0,109,117,0,0,0,0,0,0,109,120,0,0,0,0,0,0,88,32,112,111,115,105,116,105,111,110,32,111,102,32,110,101,119,32,97,110,105,109,97,116,105,111,110,0,0,0,0,0,109,121,0,0,0,0,0,0,89,32,112,111,115,105,116,105,111,110,32,111,102,32,110,101,119,32,97,110,105,109,97,116,105,111,110,0,0,0,0,0,109,0,0,0,0,0,0,0,67,114,101,97,116,101,32,105,110,115,116,97,110,99,101,32,111,102,32,97,110,105,109,97,116,105,111,110,32,78,0,0,110,0,0,0,0,0,0,0,111,120,0,0,0,0,0,0,111,121,0,0,0,0,0,0,112,97,0,0,0,0,0,0,112,98,0,0,0,0,0,0,112,99,0,0,0,0,0,0,112,100,0,0,0,0,0,0,112,101,0,0,0,0,0,0,112,104,0,0,0,0,0,0,112,112,0,0,0,0,0,0,112,115,0,0,0,0,0,0,112,116,100,0,0,0,0,0,112,116,112,0,0,0,0,0,112,116,114,0,0,0,0,0,113,0,0,0,0,0,0,0,69,110,97,98,108,101,32,104,105,116,32,111,110,32,99,117,114,114,101,110,116,32,97,110,100,32,110,101,120,116,32,110,45,49,32,102,114,97,109,101,115,46,0,0,0,0,0,0,114,0,0,0,0,0,0,0,70,108,105,112,32,115,112,114,105,116,101,32,104,111,114,105,122,111,110,116,97,108,108,121,63,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,80,108,97,121,32,115,111,117,110,100,32,78,32,102,114,111,109,32,115,111,117,110,100,32,116,97,98,108,101,32,102,111,111,116,101,114,0,0,0,0,115,97,0,0,0,0,0,0,115,98,0,0,0,0,0,0,83,111,117,110,100,32,112,97,110,110,105,110,103,32,115,116,97,114,116,0,0,0,0,0,115,99,0,0,0,0,0,0,115,100,0,0,0,0,0,0,115,101,0,0,0,0,0,0,83,111,117,110,100,32,112,97,110,110,105,110,103,32,101,110,100,32,49,0,0,0,0,0,115,102,0,0,0,0,0,0,83,111,117,110,100,32,102,114,101,113,117,101,110,99,121,0,115,108,0,0,0,0,0,0,83,111,117,110,100,32,112,97,110,110,105,110,103,32,101,110,100,32,50,0,0,0,0,0,115,109,102,0,0,0,0,0,83,116,111,112,32,112,108,97,121,105,110,103,32,109,117,115,105,99,32,116,114,97,99,107,32,78,0,0,0,0,0,0,115,109,111,0,0,0,0,0,80,108,97,121,32,109,117,115,105,99,32,116,114,97,99,107,32,78,0,0,0,0,0,0,115,112,0,0,0,0,0,0,115,119,0,0,0,0,0,0,116,0,0,0,0,0,0,0,117,97,0,0,0,0,0,0,68,105,115,97,98,108,101,32,103,114,97,118,105,116,121,32,102,111,114,32,111,112,112,111,110,101,110,116,0,0,0,0,117,98,0,0,0,0,0,0,77,111,116,105,111,110,32,98,108,117,114,32,101,102,102,101,99,116,63,0,0,0,0,0,117,99,0,0,0,0,0,0,117,100,0,0,0,0,0,0,117,101,0,0,0,0,0,0,68,97,109,97,103,101,32,101,110,101,109,121,32,105,102,32,111,110,32,116,104,101,32,103,114,111,117,110,100,0,0,0,117,102,0,0,0,0,0,0,117,103,0,0,0,0,0,0,117,104,0,0,0,0,0,0,117,106,0,0,0,0,0,0,117,108,0,0,0,0,0,0,117,110,0,0,0,0,0,0,117,114,0,0,0,0,0,0,117,115,0,0,0,0,0,0,117,122,0,0,0,0,0,0,118,0,0,0,0,0,0,0,86,101,108,111,99,105,116,121,32,109,111,100,105,102,105,101,114,32,102,111,114,32,120,47,121,0,0,0,0,0,0,0,118,115,120,0,0,0,0,0,118,115,121,0,0,0,0,0,119,0,0,0,0,0,0,0,120,45,0,0,0,0,0,0,68,101,99,114,101,109,101,110,116,32,88,32,99,111,111,114,100,105,110,97,116,101,32,98,121,32,78,0,0,0,0,0,120,43,0,0,0,0,0,0,73,110,99,114,101,109,101,110,116,32,88,32,99,111,111,114,100,105,110,97,116,101,32,98,121,32,78,0,0,0,0,0,120,61,0,0,0,0,0,0,73,110,116,101,114,112,111,108,97,116,101,32,88,32,99,111,111,114,100,105,110,97,116,101,32,116,111,32,78,32,98,121,32,110,101,120,116,32,102,114,97,109,101,0,0,0,0,0,120,0,0,0,0,0,0,0,83,101,116,32,88,32,116,111,32,78,32,40,78,32,100,101,102,97,117,108,116,115,32,116,111,32,49,48,48,41,63,0,121,45,0,0,0,0,0,0,68,101,99,114,101,109,101,110,116,32,89,32,99,111,111,114,100,105,110,97,116,101,32,98,121,32,78,0,0,0,0,0,121,43,0,0,0,0,0,0,73,110,99,114,101,109,101,110,116,32,89,32,99,111,111,114,100,105,110,97,116,101,32,98,121,32,78,0,0,0,0,0,121,61,0,0,0,0,0,0,73,110,116,101,114,112,111,108,97,116,101,32,89,32,99,111,111,114,100,105,110,97,116,101,32,116,111,32,78,32,98,121,32,110,101,120,116,32,102,114,97,109,101,0,0,0,0,0,121,0,0,0,0,0,0,0,83,101,116,32,89,32,116,111,32,78,32,40,78,32,100,101,102,97,117,108,116,115,32,116,111,32,49,48,48,41,63,0,122,103,0,0,0,0,0,0,78,101,118,101,114,32,117,115,101,100,63,0,0,0,0,0,122,104,0,0,0,0,0,0,122,106,0,0,0,0,0,0,73,110,118,117,108,110,101,114,97,98,108,101,32,116,111,32,106,117,109,112,105,110,103,32,97,116,116,97,99,107,115,63,0,0,0,0,0,0,0,0,122,108,0,0,0,0,0,0,122,109,0,0,0,0,0,0,122,112,0,0,0,0,0,0,73,110,118,117,108,110,101,114,97,98,108,101,32,116,111,32,112,114,111,106,101,99,116,105,108,101,115,63,0,0,0,0,122,122,0,0,0,0,0,0,73,110,118,117,108,110,101,114,97,98,108,101,32,116,111,32,97,110,121,32,97,116,116,97,99,107,115,63,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,32,105,108,108,101,103,97,108,32,111,112,116,105,111,110,58,32,0,0,0,0,0,0,10,0,0,0,0,0,0,0,58,32,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,58,32,0,0,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  function _llvm_lifetime_end() {}

  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }

  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

   
  Module["_memset"] = _memset;

  function _abort() {
      Module['abort']();
    }

  var _llvm_memset_p0i8_i32=_memset;

  
  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;

  
  
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        if (stream.__proto__) {
          // reuse the object
          stream.__proto__ = FS.FSStream.prototype;
        } else {
          var newStream = new FS.FSStream();
          for (var p in stream) {
            newStream[p] = stream[p];
          }
          stream = newStream;
        }
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          function LazyUint8Array() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
  
              if (!hasByteServing) chunkSize = datalength;
  
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
  
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
  
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
  
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};
  
  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              var url = 'ws://' + addr + ':' + port;
              // the node ws library API is slightly different than the browser's
              var opts = ENVIRONMENT_IS_NODE ? {headers: {'websocket-protocol': ['binary']}} : ['binary'];
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  
  
  
  
  function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return 0;
      }
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop();
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(streamObj.fd, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return -1;
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }function _fgets(s, n, stream) {
      // char *fgets(char *restrict s, int n, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgets.html
      var streamObj = FS.getStreamFromPtr(stream);
      if (!streamObj) return 0;
      if (streamObj.error || streamObj.eof) return 0;
      var byte_;
      for (var i = 0; i < n - 1 && byte_ != 10; i++) {
        byte_ = _fgetc(stream);
        if (byte_ == -1) {
          if (streamObj.error || (streamObj.eof && i == 0)) return 0;
          else if (streamObj.eof) break;
        }
        HEAP8[(((s)+(i))|0)]=byte_;
      }
      HEAP8[(((s)+(i))|0)]=0;
      return s;
    }



  function _strncat(pdest, psrc, num) {
      var len = _strlen(pdest);
      var i = 0;
      while(1) {
        HEAP8[((pdest+len+i)|0)]=HEAP8[((psrc+i)|0)];
        if (HEAP8[(((pdest)+(len+i))|0)] == 0) break;
        i ++;
        if (i == num) {
          HEAP8[(((pdest)+(len+i))|0)]=0;
          break;
        }
      }
      return pdest;
    }

  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)|0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }

  function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }

  function _strcspn(pstr, pset) {
      var str = pstr, set, strcurr, setcurr;
      while (1) {
        strcurr = HEAP8[(str)];
        if (!strcurr) return str - pstr;
        set = pset;
        while (1) {
          setcurr = HEAP8[(set)];
          if (!setcurr || setcurr == strcurr) break;
          set++;
        }
        if (setcurr) return str - pstr;
        str++;
      }
    }

  
  function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      var fd = _fileno(stream);
      return _write(fd, s, _strlen(s));
    }function _puts(s) {
      // int puts(const char *s);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/puts.html
      // NOTE: puts() always writes an extra newline.
      var stdout = HEAP32[((_stdout)>>2)];
      var ret = _fputs(s, stdout);
      if (ret < 0) {
        return ret;
      } else {
        var newlineRet = _fputc(10, stdout);
        return (newlineRet < 0) ? -1 : ret + 1;
      }
    }

  function _llvm_lifetime_start() {}


  function ___errno_location() {
      return ___errno_state;
    }



  
  
  
  function _isspace(chr) {
      return (chr == 32) || (chr >= 9 && chr <= 13);
    }function __parseInt(str, endptr, base, min, max, bits, unsign) {
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
  
      // Check for a plus/minus sign.
      var multiplier = 1;
      if (HEAP8[(str)] == 45) {
        multiplier = -1;
        str++;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
  
      // Find base.
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            str++;
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
  
      // Get digits.
      var chr;
      var ret = 0;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          ret = ret * finalBase + digit;
          str++;
        }
      }
  
      // Apply sign.
      ret *= multiplier;
  
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str;
      }
  
      // Unsign if needed.
      if (unsign) {
        if (Math.abs(ret) > max) {
          ret = max;
          ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          ret = unSign(ret, bits);
        }
      }
  
      // Validate range.
      if (ret > max || ret < min) {
        ret = ret > max ? max : min;
        ___setErrNo(ERRNO_CODES.ERANGE);
      }
  
      if (bits == 64) {
        return ((asm["setTempRet0"]((tempDouble=ret,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)),ret>>>0)|0);
      }
  
      return ret;
    }function _strtol(str, endptr, base) {
      return __parseInt(str, endptr, base, -2147483648, 2147483647, 32);  // LONG_MIN, LONG_MAX.
    }function _atoi(ptr) {
      return _strtol(ptr, null, 10);
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        
        // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
        // Module['forcedAspectRatio'] = 4 / 3;
        
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'] ||
                                    canvas['msRequestPointerLock'] ||
                                    function(){};
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 document['msExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
  
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        var canvasContainer = canvas.parentNode;
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            var canvasContainer = canvas.parentNode;
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x, y;
          
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
          if (event.type == 'touchstart' ||
              event.type == 'touchend' ||
              event.type == 'touchmove') {
            var t = event.touches.item(0);
            if (t) {
              x = t.pageX - (scrollX + rect.left);
              y = t.pageY - (scrollY + rect.top);
            } else {
              return;
            }
          } else {
            x = event.pageX - (scrollX + rect.left);
            y = event.pageY - (scrollY + rect.top);
          }
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};

  
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }


___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  try {
    Module["dynCall_viiiii"](index,a1,a2,a3,a4,a5);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}

function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stdin|0;var n=env._stdout|0;var o=0;var p=0;var q=0;var r=0;var s=+env.NaN,t=+env.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ba=env.assert;var ca=env.asmPrintInt;var da=env.asmPrintFloat;var ea=env.min;var fa=env.invoke_ii;var ga=env.invoke_vi;var ha=env.invoke_iii;var ia=env.invoke_viiiii;var ja=env._llvm_lifetime_start;var ka=env._send;var la=env._fread;var ma=env.___setErrNo;var na=env._strncat;var oa=env._atoi;var pa=env._fflush;var qa=env._pwrite;var ra=env._strtol;var sa=env.__reallyNegative;var ta=env._sbrk;var ua=env._snprintf;var va=env._emscripten_memcpy_big;var wa=env._fileno;var xa=env.__formatString;var ya=env._sysconf;var za=env._strchr;var Aa=env._strcspn;var Ba=env._fgets;var Ca=env._putchar;var Da=env._isspace;var Ea=env._pread;var Fa=env._puts;var Ga=env._printf;var Ha=env._sprintf;var Ia=env.__parseInt;var Ja=env._write;var Ka=env.___errno_location;var La=env._recv;var Ma=env._fgetc;var Na=env._fputc;var Oa=env._mkport;var Pa=env._read;var Qa=env._abort;var Ra=env._fwrite;var Sa=env._time;var Ta=env._fprintf;var Ua=env._llvm_lifetime_end;var Va=env._fputs;var Wa=0.0;
// EMSCRIPTEN_START_FUNCS
function $a(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function ab(){return i|0}function bb(a){a=a|0;i=a}function cb(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function db(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function eb(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function fb(a){a=a|0;D=a}function gb(a){a=a|0;E=a}function hb(a){a=a|0;F=a}function ib(a){a=a|0;G=a}function jb(a){a=a|0;H=a}function kb(a){a=a|0;I=a}function lb(a){a=a|0;J=a}function mb(a){a=a|0;K=a}function nb(a){a=a|0;L=a}function ob(a){a=a|0;M=a}function pb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0;e=i;i=i+8|0;f=e;g=i;i=i+8|0;h=i;i=i+16|0;j=i;i=i+8|0;k=i;i=i+8|0;l=i;i=i+16|0;o=i;i=i+8|0;p=i;i=i+8|0;q=i;i=i+8|0;r=i;i=i+8|0;s=i;i=i+8|0;t=i;i=i+24|0;u=i;i=i+16|0;v=i;i=i+8|0;w=i;i=i+2048|0;x=i;i=i+8|0;y=i;i=i+8|0;z=i;i=i+8|0;A=ub(8,16,24)|0;B=ub(56,64,72)|0;C=zb(112,120,128,136)|0;D=qb(20)|0;E=u;c[E>>2]=A;c[u+4>>2]=B;c[u+8>>2]=C;c[u+12>>2]=D;if((Jb(E)|0)!=0){c[s>>2]=160;Ga(176,s|0)|0;Kb(E,4);F=w;i=e;return 0}if((Eb(b,d,E)|0)>0){tb(c[n>>2]|0,D,160);c[r>>2]=160;Ga(208,r|0)|0;Kb(E,4);F=w;i=e;return 0}if((c[B+52>>2]|0)>0){c[q>>2]=160;Ga(248,q|0)|0;Fa(472)|0;Fa(528)|0;Fa(608)|0;Kb(E,4);F=w;i=e;return 0}if((c[A+52>>2]|0)>0){c[p>>2]=160;Ga(264,p|0)|0;p=c[n>>2]|0;Hb(p,E,280);Fa(456)|0;Ib(p,E,288);Kb(E,4);F=w;i=e;return 0}p=c[c[C+56>>2]>>2]|0;if((Sb(304,p)|0)==0){C=Qb(512)|0;Ba(C|0,512,c[m>>2]|0)|0;a[C+((Wb(C|0)|0)+ -1)|0]=0;G=1;H=C}else{G=0;H=p}c[o>>2]=H;Ga(312,o|0)|0;o=Wb(H|0)|0;p=w;a[p]=0;a:do{if((o|0)>0){C=v;A=t;q=z;B=0;r=H;D=1;while(1){d=B;b=r;b:while(1){while(1){s=a[b]|0;I=s<<24>>24;if((s+ -65<<24>>24&255)<26){break b}if((s+ -97<<24>>24&255)<26){J=3;break}}while(1){Vb(C|0,H+d|0,J|0)|0;a[v+J|0]=0;c[y>>2]=0;if((Lb(C,x,y)|0)==0){K=27;break}s=J+ -1|0;if((s|0)>0){J=s}else{K=42;break}}do{if((K|0)==27){K=0;s=c[y>>2]|0;if((s|0)==0){c[y>>2]=360;L=360}else{L=s}s=J+d|0;if((c[x>>2]|0)==0){u=w+(Wb(p|0)|0)|0;c[g>>2]=C;c[g+4>>2]=L;Ha(u|0,400,g|0)|0;M=s;break}N=A+0|0;O=N+20|0;do{a[N]=0;N=N+1|0}while((N|0)<(O|0));u=a[H+s|0]|0;do{if(u<<24>>24==45){P=s+1|0;Q=a[H+P|0]|0;if(!((Q+ -48<<24>>24&255)<10)){R=0;S=s;break}a[A]=45;T=Q;U=P;V=1;K=34}else if(u<<24>>24==43){P=s+1|0;T=a[H+P|0]|0;U=P;V=0;K=34}else{T=u;U=s;V=0;K=34}}while(0);do{if((K|0)==34){K=0;if((T+ -48<<24>>24&255)<10){s=U;u=T;P=V;while(1){a[t+P|0]=u;Q=s+1|0;W=P+1|0;X=a[H+Q|0]|0;if((X+ -48<<24>>24&255)<10){P=W;u=X;s=Q}else{Y=Q;Z=W;break}}}else{Y=U;Z=V}if((Z|0)==0){R=0;S=Y;break}R=oa(A|0)|0;S=Y}}while(0);c[j>>2]=R;Ha(q|0,368,j|0)|0;s=w+(Wb(p|0)|0)|0;u=c[y>>2]|0;c[h>>2]=C;c[h+4>>2]=q;c[h+8>>2]=u;Ha(s|0,376,h|0)|0;M=S}else if((K|0)==42){K=0;s=w+(Wb(p|0)|0)|0;c[f>>2]=a[H+d|0]|0;Ha(s|0,424,f|0)|0;M=d+1|0}}while(0);if((M|0)<(o|0)){d=M;b=H+M|0}else{break a}}b=d+1|0;N=A+0|0;O=N+20|0;do{a[N]=0;N=N+1|0}while((N|0)<(O|0));s=a[H+b|0]|0;do{if(s<<24>>24==45){u=d+2|0;P=a[H+u|0]|0;if(!((P+ -48<<24>>24&255)<10)){_=0;$=b;break}a[A]=45;aa=P;ba=u;ca=1;K=20}else if(s<<24>>24==43){u=d+2|0;aa=a[H+u|0]|0;ba=u;ca=0;K=20}else{aa=s;ba=b;ca=0;K=20}}while(0);do{if((K|0)==20){K=0;if((aa+ -48<<24>>24&255)<10){b=ba;s=aa;d=ca;while(1){a[t+d|0]=s;u=b+1|0;P=d+1|0;W=a[H+u|0]|0;if((W+ -48<<24>>24&255)<10){d=P;s=W;b=u}else{da=u;ea=P;break}}}else{da=ba;ea=ca}if((ea|0)==0){_=0;$=da;break}_=oa(A|0)|0;$=da}}while(0);c[l>>2]=D;c[l+4>>2]=I+ -65;c[l+8>>2]=I;c[l+12>>2]=_;Ga(328,l|0)|0;c[k>>2]=p;Ga(352,k|0)|0;Ca(10)|0;a[p]=0;b=$+1|0;if((b|0)<(o|0)){B=b;r=H+b|0;D=D+1|0}else{break}}}}while(0);if((G|0)==0){Kb(E,4);F=w;i=e;return 0}Rb(H);Kb(E,4);F=w;i=e;return 0}function qb(b){b=b|0;var d=0,e=0,f=0,g=0,h=0;d=i;e=Qb((b*12|0)+68|0)|0;f=e;if((e|0)==0){i=d;return f|0}a[e]=1;g=e+4|0;h=e+20|0;c[g+0>>2]=0;c[g+4>>2]=0;c[g+8>>2]=0;c[g+12>>2]=0;c[h>>2]=1;c[e+24>>2]=b;c[e+28>>2]=e;c[e+32>>2]=1;c[e+36>>2]=0;c[e+40>>2]=0;c[e+44>>2]=1;h=e+68|0;c[e+56>>2]=h;c[e+60>>2]=h+(b<<2);c[e+64>>2]=h+(b<<1<<2);i=d;return f|0}function rb(a){a=a|0;c[a+52>>2]=0;i=i;return}function sb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0;a=i;i=i+8|0;g=a;h=i;i=i+8|0;j=i;i=i+8|0;k=i;i=i+8|0;l=i;i=i+8|0;m=(e|0)!=0?e:640;c[l>>2]=(f|0)!=0?f:640;Ta(b|0,648,l|0)|0;switch(d|0){case 4:{c[h>>2]=m;Ta(b|0,784,h|0)|0;Na(10,b|0)|0;i=a;return};case 1:{Ra(656,26,1,b|0)|0;Na(10,b|0)|0;i=a;return};case 2:{Ra(688,18,1,b|0)|0;Na(10,b|0)|0;i=a;return};case 3:{c[k>>2]=m;Ta(b|0,712,k|0)|0;Na(10,b|0)|0;i=a;return};case 5:{c[j>>2]=m;Ta(b|0,744,j|0)|0;Na(10,b|0)|0;i=a;return};default:{c[g>>2]=d;Ta(b|0,808,g|0)|0;Na(10,b|0)|0;i=a;return}}}function tb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;e=i;f=b+52|0;g=c[f>>2]|0;if((g|0)<=0){i=e;return}h=b+60|0;j=b+56|0;k=b+64|0;b=g;g=0;while(1){l=c[(c[h>>2]|0)+(g<<2)>>2]|0;m=c[l+44>>2]|0;if((m|0)==0){n=b}else{_a[m&3](l,a,c[(c[j>>2]|0)+(g<<2)>>2]|0,c[(c[k>>2]|0)+(g<<2)>>2]|0,d);n=c[f>>2]|0}l=g+1|0;if((l|0)<(n|0)){b=n;g=l}else{break}}i=e;return}function ub(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=i;g=Qb(56)|0;h=g;if((g|0)==0){i=f;return h|0}a[g]=0;c[g+4>>2]=b;c[g+8>>2]=d;c[g+12>>2]=0;c[g+16>>2]=e;c[g+20>>2]=0;c[g+24>>2]=1;c[g+28>>2]=g;c[g+32>>2]=2;c[g+36>>2]=1;c[g+40>>2]=1;c[g+44>>2]=2;c[g+52>>2]=0;i=f;return h|0}function vb(a){a=a|0;c[a+52>>2]=0;i=i;return}function wb(a,b){a=a|0;b=b|0;var d=0,e=0;b=a+52|0;d=c[b>>2]|0;if((d|0)<(c[a+24>>2]|0)){c[b>>2]=d+1;e=0}else{e=2}i=i;return e|0}function xb(a){a=a|0;i=i;return(c[a+52>>2]|0)<(c[a+20>>2]|0)|0}function yb(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;e=i;i=i+8|0;g=e;h=i;i=i+8|0;j=c[a+4>>2]|0;k=c[a+8>>2]|0;l=c[a+12>>2]|0;if((d|0)==1){c[h>>2]=f;Ta(b|0,832,h|0)|0;Fb(b,j,k,l,856);Na(10,b|0)|0;i=e;return}else if((d|0)==2){c[g>>2]=f;Ta(b|0,864,g|0)|0;Fb(b,j,k,l,856);i=e;return}else{i=e;return}}function zb(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;h=Qb(64)|0;j=h;if((h|0)==0){i=g;return j|0}a[h]=2;c[h+4>>2]=b;c[h+8>>2]=d;c[h+12>>2]=(e|0)!=0?e:888;c[h+16>>2]=f;c[h+20>>2]=1;c[h+24>>2]=1;c[h+28>>2]=h;c[h+32>>2]=3;c[h+36>>2]=2;c[h+40>>2]=2;c[h+44>>2]=3;f=h+60|0;c[h+56>>2]=f;c[h+52>>2]=0;c[f>>2]=904;i=g;return j|0}function Ab(a){a=a|0;c[a+52>>2]=0;i=i;return}function Bb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;e=a+52|0;f=c[e>>2]|0;do{if((f|0)==(c[a+24>>2]|0)){g=2}else{c[e>>2]=f+1;if((b|0)==0){g=0;break}c[(c[a+56>>2]|0)+(f<<2)>>2]=b;g=0}}while(0);i=d;return g|0}function Cb(a){a=a|0;i=i;return(c[a+52>>2]|0)<(c[a+20>>2]|0)|0}function Db(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0;g=i;i=i+8|0;h=g;j=c[a+4>>2]|0;k=c[a+8>>2]|0;l=c[a+12>>2]|0;c[h>>2]=f;Ta(b|0,912,h|0)|0;if((d|0)==1){Ra(920,15,1,b|0)|0;Fb(b,j,k,l,936);i=g;return}else if((d|0)==2){Ra(944,14,1,b|0)|0;Fb(b,j,k,(e|0)!=0?e:904,936);i=g;return}else{i=g;return}}function Eb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0;f=i;g=0;while(1){h=e+(g<<2)|0;j=c[h>>2]|0;k=c[j+32>>2]|0;if((k|0)==0){l=j}else{Ya[k&3](c[j+28>>2]|0);l=c[h>>2]|0}if((a[l]&1)==0){g=g+1|0}else{break}}g=d;d=0;while(1){m=c[e+(d<<2)>>2]|0;if((a[m]&1)==0){d=d+1|0}else{break}}if((b|0)==0){d=m+52|0;l=m+24|0;h=m+56|0;j=m+60|0;k=m+64|0;n=0;while(1){o=e+(n<<2)|0;p=c[o>>2]|0;q=c[p+40>>2]|0;do{if((q|0)!=0){r=c[p+28>>2]|0;s=Xa[q&3](r)|0;if((s|0)==0){break}t=c[d>>2]|0;u=c[l>>2]|0;if((t|0)<(u|0)){c[(c[h>>2]|0)+(t<<2)>>2]=s;s=c[d>>2]|0;c[(c[j>>2]|0)+(s<<2)>>2]=r;c[(c[k>>2]|0)+(s<<2)>>2]=0;c[d>>2]=s+1;break}else{c[(c[h>>2]|0)+(u+ -1<<2)>>2]=1;u=(c[l>>2]|0)+ -1|0;c[(c[j>>2]|0)+(u<<2)>>2]=m;c[(c[k>>2]|0)+(u<<2)>>2]=0;break}}}while(0);if((a[c[o>>2]|0]&1)==0){n=n+1|0}else{break}}v=m+52|0;w=v;x=c[w>>2]|0;i=f;return x|0}n=Qb(b<<2)|0;k=n;if((n|0)==0){j=m+52|0;l=c[j>>2]|0;h=m+24|0;d=c[h>>2]|0;if((l|0)<(d|0)){c[(c[m+56>>2]|0)+(l<<2)>>2]=2;l=c[j>>2]|0;c[(c[m+60>>2]|0)+(l<<2)>>2]=m;c[(c[m+64>>2]|0)+(l<<2)>>2]=0;c[j>>2]=l+1;v=m+52|0;w=v;x=c[w>>2]|0;i=f;return x|0}else{c[(c[m+56>>2]|0)+(d+ -1<<2)>>2]=1;d=(c[h>>2]|0)+ -1|0;c[(c[m+60>>2]|0)+(d<<2)>>2]=m;c[(c[m+64>>2]|0)+(d<<2)>>2]=0;v=m+52|0;w=v;x=c[w>>2]|0;i=f;return x|0}}if((b|0)>0){Vb(n|0,g|0,b<<2|0)|0;y=0;z=1;A=0}else{y=0;z=1;A=0}while(1){g=c[e+(A<<2)>>2]|0;d=c[g+8>>2]|0;if((d|0)==0){B=1;C=z}else{h=Wb(d|0)|0;l=d;d=z;do{d=d+1|0;l=za(l+1|0,44)|0;}while((l|0)!=0);B=h+1|0;C=d}D=B+y|0;if((a[g]&1)==0){y=D;z=C;A=A+1|0}else{break}}A=Qb((C<<4|12)+D|0)|0;D=(A|0)==0;if(!D){z=A;c[z>>2]=0;c[A+4>>2]=C;y=A+12|0;B=A+8|0;c[B>>2]=y;l=c[e>>2]|0;if((a[l]&1)==0){o=l;l=e;j=y;q=0;p=y+(C<<4)|0;C=0;while(1){u=c[o+8>>2]|0;a:do{if((u|0)==0){E=j;F=q;G=p}else{s=j;r=u;t=q;H=p;while(1){I=a[r]|0;if(I<<24>>24==0){E=s;F=t;G=H;break a}else{J=I;K=r;L=H}while(1){if(J<<24>>24==44|J<<24>>24==0){break}I=K+1|0;a[L]=J;J=a[I]|0;K=I;L=L+1|0}I=L+1|0;a[L]=0;M=(a[K]|0)==44?K+1|0:K;c[(c[B>>2]|0)+(t<<4)>>2]=H;c[(c[B>>2]|0)+(t<<4)+8>>2]=z;N=c[B>>2]|0;c[N+(t<<4)+12>>2]=C;O=a[c[l>>2]|0]|0;do{if((O&4|0)==0){P=N+(t<<4)+4|0;if((O&2|0)==0){c[P>>2]=0;break}else{c[P>>2]=1;break}}else{c[N+(t<<4)+4>>2]=2}}while(0);O=t+1|0;if((M|0)==0){E=N;F=O;G=I;break}else{s=N;r=M;t=O;H=I}}}}while(0);u=C+1|0;g=e+(u<<2)|0;d=c[g>>2]|0;if((a[d]&1)==0){o=d;l=g;j=E;q=F;p=G;C=u}else{Q=E;R=F;break}}}else{Q=y;R=0}c[Q+(R<<4)>>2]=0;Q=c[B>>2]|0;c[Q+(R<<4)+4>>2]=0;c[Q+(R<<4)+8>>2]=0;c[(c[B>>2]|0)+(R<<4)+12>>2]=0}R=c[e>>2]|0;B=R;Q=(a[R]&1)==0;if(Q){y=B;F=2;E=0;while(1){C=c[y+4>>2]|0;if((C|0)==0){S=0}else{S=(Wb(C|0)|0)*3|0}C=S+F|0;G=E+1|0;p=c[e+(G<<2)>>2]|0;if((a[p]&1)==0){y=p;F=C;E=G}else{T=C;break}}}else{T=2}E=Qb(T)|0;do{if((E|0)==0){U=53}else{T=E+1|0;a[E]=58;if(Q){F=R;y=B;S=T;C=0;while(1){G=c[y+4>>2]|0;do{if((G|0)==0){V=S}else{p=a[G]|0;if(p<<24>>24==0){V=S;break}else{W=p;X=S;Y=G}while(1){p=Y+1|0;q=X+1|0;a[X]=W;j=a[F]|0;if((j&2)==0){Z=j;_=q}else{a[q]=58;Z=a[F]|0;_=X+2|0}if((Z&4)==0){$=_}else{a[_]=58;$=_+1|0}q=a[p]|0;if(q<<24>>24==0){V=$;break}else{W=q;X=$;Y=p}}}}while(0);G=C+1|0;I=c[e+(G<<2)>>2]|0;if((a[I]&1)==0){F=I;y=I;S=V;C=G}else{aa=V;break}}}else{aa=T}a[aa]=0;if(D){U=53;break}c[1460]=0;c[1462]=0;C=A+8|0;S=m+52|0;y=m+24|0;F=m+56|0;G=m+60|0;I=m+64|0;M=A;b:while(1){N=Nb(b,k,E,c[C>>2]|0,0)|0;if((N|0)==0){p=e+(c[M>>2]<<2)|0;q=c[p>>2]|0;j=c[q+28>>2]|0;l=c[1486]|0;do{if((l|0)!=0){if((a[l]|0)!=0){break}if((a[q]&2)==0){break}o=c[S>>2]|0;z=c[y>>2]|0;if((o|0)<(z|0)){K=c[k+((c[1460]|0)+ -1<<2)>>2]|0;c[(c[F>>2]|0)+(o<<2)>>2]=5;o=c[S>>2]|0;c[(c[G>>2]|0)+(o<<2)>>2]=m;c[(c[I>>2]|0)+(o<<2)>>2]=K;c[S>>2]=o+1;break}else{c[(c[F>>2]|0)+(z+ -1<<2)>>2]=1;z=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(z<<2)>>2]=m;c[(c[I>>2]|0)+(z<<2)>>2]=0;break}}}while(0);q=c[(c[p>>2]|0)+36>>2]|0;if((q|0)==0){continue}l=Za[q&3](j,c[1486]|0)|0;if((l|0)==0){continue}q=c[S>>2]|0;z=c[y>>2]|0;if((q|0)<(z|0)){o=c[1486]|0;c[(c[F>>2]|0)+(q<<2)>>2]=l;l=c[S>>2]|0;c[(c[G>>2]|0)+(l<<2)>>2]=j;c[(c[I>>2]|0)+(l<<2)>>2]=o;c[S>>2]=l+1;continue}else{c[(c[F>>2]|0)+(z+ -1<<2)>>2]=1;z=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(z<<2)>>2]=m;c[(c[I>>2]|0)+(z<<2)>>2]=0;continue}}else if((N|0)==63){z=c[1468]|0;l=c[S>>2]|0;o=c[y>>2]|0;q=(l|0)<(o|0);if((z|0)==0){if(q){K=c[k+((c[1460]|0)+ -1<<2)>>2]|0;c[(c[F>>2]|0)+(l<<2)>>2]=4;L=c[S>>2]|0;c[(c[G>>2]|0)+(L<<2)>>2]=m;c[(c[I>>2]|0)+(L<<2)>>2]=K;c[S>>2]=L+1;continue}else{c[(c[F>>2]|0)+(o+ -1<<2)>>2]=1;L=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(L<<2)>>2]=m;c[(c[I>>2]|0)+(L<<2)>>2]=0;continue}}else{if(q){c[(c[F>>2]|0)+(l<<2)>>2]=z;z=c[S>>2]|0;c[(c[G>>2]|0)+(z<<2)>>2]=m;c[(c[I>>2]|0)+(z<<2)>>2]=0;c[S>>2]=z+1;continue}else{c[(c[F>>2]|0)+(o+ -1<<2)>>2]=1;o=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(o<<2)>>2]=m;c[(c[I>>2]|0)+(o<<2)>>2]=0;continue}}}else if((N|0)==58){o=c[S>>2]|0;z=c[y>>2]|0;if((o|0)<(z|0)){l=c[k+((c[1460]|0)+ -1<<2)>>2]|0;c[(c[F>>2]|0)+(o<<2)>>2]=5;o=c[S>>2]|0;c[(c[G>>2]|0)+(o<<2)>>2]=m;c[(c[I>>2]|0)+(o<<2)>>2]=l;c[S>>2]=o+1;continue}else{c[(c[F>>2]|0)+(z+ -1<<2)>>2]=1;z=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(z<<2)>>2]=m;c[(c[I>>2]|0)+(z<<2)>>2]=0;continue}}else if((N|0)==-1){break}else{z=N<<24>>24;o=c[e>>2]|0;c:do{if((a[o]&1)==0){l=o;q=0;while(1){L=c[l+4>>2]|0;if((L|0)!=0){if((za(L|0,z|0)|0)!=0){break}}L=q+1|0;K=c[e+(L<<2)>>2]|0;if((a[K]&1)==0){l=K;q=L}else{break c}}if((q|0)==-1){break}L=c[l+36>>2]|0;if((L|0)==0){continue b}K=c[l+28>>2]|0;J=Za[L&3](K,c[1486]|0)|0;if((J|0)==0){continue b}L=c[S>>2]|0;u=c[y>>2]|0;if((L|0)<(u|0)){g=c[1486]|0;c[(c[F>>2]|0)+(L<<2)>>2]=J;J=c[S>>2]|0;c[(c[G>>2]|0)+(J<<2)>>2]=K;c[(c[I>>2]|0)+(J<<2)>>2]=g;c[S>>2]=J+1;continue b}else{c[(c[F>>2]|0)+(u+ -1<<2)>>2]=1;u=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(u<<2)>>2]=m;c[(c[I>>2]|0)+(u<<2)>>2]=0;continue b}}}while(0);z=c[S>>2]|0;o=c[y>>2]|0;if((z|0)<(o|0)){c[(c[F>>2]|0)+(z<<2)>>2]=N;z=c[S>>2]|0;c[(c[G>>2]|0)+(z<<2)>>2]=m;c[(c[I>>2]|0)+(z<<2)>>2]=0;c[S>>2]=z+1;continue}else{c[(c[F>>2]|0)+(o+ -1<<2)>>2]=1;o=(c[y>>2]|0)+ -1|0;c[(c[G>>2]|0)+(o<<2)>>2]=m;c[(c[I>>2]|0)+(o<<2)>>2]=0;continue}}}Rb(E);Rb(A)}}while(0);if((U|0)==53){D=m+52|0;aa=c[D>>2]|0;V=m+24|0;Y=c[V>>2]|0;if((aa|0)<(Y|0)){c[(c[m+56>>2]|0)+(aa<<2)>>2]=2;aa=c[D>>2]|0;c[(c[m+60>>2]|0)+(aa<<2)>>2]=m;c[(c[m+64>>2]|0)+(aa<<2)>>2]=0;c[D>>2]=aa+1}else{c[(c[m+56>>2]|0)+(Y+ -1<<2)>>2]=1;Y=(c[V>>2]|0)+ -1|0;c[(c[m+60>>2]|0)+(Y<<2)>>2]=m;c[(c[m+64>>2]|0)+(Y<<2)>>2]=0}Rb(E);Rb(A)}A=c[e>>2]|0;E=c[1460]|0;d:do{if((a[A]&1)==0){Y=A;V=E;aa=0;D=0;$=0;X=0;e:while(1){W=Y;ba=V;ca=aa;_=X;while(1){if((ba|0)<(b|0)){da=W;ea=_}else{break d}f:while(1){do{if((c[da+8>>2]|0)==0){if((c[da+4>>2]|0)!=0){break}fa=c[da+36>>2]|0;if((fa|0)!=0){break f}}}while(0);Z=ea+1|0;B=c[e+(Z<<2)>>2]|0;if((a[B]&1)==0){da=B;ea=Z}else{U=104;break e}}ga=c[da+28>>2]|0;ha=Za[fa&3](ga,c[k+(ba<<2)>>2]|0)|0;if((ha|0)!=0){break}l=(c[1460]|0)+1|0;c[1460]=l;q=c[e+(ea<<2)>>2]|0;if((a[q]&1)==0){W=q;ba=l;ca=0;_=ea}else{ia=l;U=109;break d}}_=ea+1|0;W=c[1460]|0;N=c[k+(W<<2)>>2]|0;l=c[e+(_<<2)>>2]|0;if((a[l]&1)==0){Y=l;V=W;aa=ha;D=N;$=ga;X=_}else{ja=ha;ka=N;la=ga;break}}if((U|0)==104){if((ca|0)==0){ia=ba;U=109;break}else{ja=ca;ka=D;la=$}}X=m+52|0;aa=c[X>>2]|0;V=m+24|0;Y=c[V>>2]|0;if((aa|0)<(Y|0)){c[(c[m+56>>2]|0)+(aa<<2)>>2]=ja;aa=c[X>>2]|0;c[(c[m+60>>2]|0)+(aa<<2)>>2]=la;c[(c[m+64>>2]|0)+(aa<<2)>>2]=ka;c[X>>2]=aa+1}else{c[(c[m+56>>2]|0)+(Y+ -1<<2)>>2]=1;Y=(c[V>>2]|0)+ -1|0;c[(c[m+60>>2]|0)+(Y<<2)>>2]=m;c[(c[m+64>>2]|0)+(Y<<2)>>2]=0}Y=(c[1460]|0)+1|0;c[1460]=Y;ia=Y;U=109}else{ia=E;U=109}}while(0);do{if((U|0)==109){if((ia|0)>=(b|0)){break}E=m+52|0;ka=m+24|0;la=m+56|0;ja=m+60|0;ca=m+64|0;ba=ia;do{c[1460]=ba+1;ga=c[E>>2]|0;ha=c[ka>>2]|0;if((ga|0)<(ha|0)){ea=c[k+(ba<<2)>>2]|0;c[(c[la>>2]|0)+(ga<<2)>>2]=3;ga=c[E>>2]|0;c[(c[ja>>2]|0)+(ga<<2)>>2]=m;c[(c[ca>>2]|0)+(ga<<2)>>2]=ea;c[E>>2]=ga+1}else{c[(c[la>>2]|0)+(ha+ -1<<2)>>2]=1;ha=(c[ka>>2]|0)+ -1|0;c[(c[ja>>2]|0)+(ha<<2)>>2]=m;c[(c[ca>>2]|0)+(ha<<2)>>2]=0}ba=c[1460]|0;}while((ba|0)<(b|0))}}while(0);b=m+52|0;g:do{if((c[b>>2]|0)==0){k=m+24|0;ia=m+56|0;U=m+60|0;ba=m+64|0;ca=0;while(1){ja=e+(ca<<2)|0;ka=c[ja>>2]|0;la=c[ka+40>>2]|0;do{if((la|0)!=0){E=c[ka+28>>2]|0;$=Xa[la&3](E)|0;if(($|0)==0){break}D=c[b>>2]|0;ha=c[k>>2]|0;if((D|0)<(ha|0)){c[(c[ia>>2]|0)+(D<<2)>>2]=$;$=c[b>>2]|0;c[(c[U>>2]|0)+($<<2)>>2]=E;c[(c[ba>>2]|0)+($<<2)>>2]=0;c[b>>2]=$+1;break}else{c[(c[ia>>2]|0)+(ha+ -1<<2)>>2]=1;ha=(c[k>>2]|0)+ -1|0;c[(c[U>>2]|0)+(ha<<2)>>2]=m;c[(c[ba>>2]|0)+(ha<<2)>>2]=0;break}}}while(0);if(!((a[c[ja>>2]|0]&1)==0)){break g}ca=ca+1|0}}}while(0);Rb(n);v=m+52|0;w=v;x=c[w>>2]|0;i=f;return x|0}function Fb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=i;i=i+200|0;g=f;Ub(g|0,0,200)|0;Gb(g,b,c,d,0,968);Va(g|0,a|0)|0;Va(((e|0)!=0?e:960)|0,a|0)|0;i=f;return}function Gb(b,c,d,e,f,g){b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0;h=i;i=i+8|0;j=h;k=(g|0)!=0?g:960;g=(c|0)!=0;do{if(g){a:do{if((a[c]|0)==0){l=200;m=b}else{n=j;o=j+1|0;p=j+2|0;q=200;r=c;s=b;while(1){a[n]=45;a[o]=a[r]|0;a[p]=0;t=s+q|0;b:do{if((q|0)>0){u=s;while(1){v=u+1|0;if((a[u]|0)==0){w=u;break b}if(v>>>0<t>>>0){u=v}else{w=v;break}}}else{w=s}}while(0);c:do{if(w>>>0<t>>>0){u=n;v=45;x=w;while(1){if(v<<24>>24==0){y=x;break c}z=u+1|0;A=x+1|0;a[x]=v;if(!(A>>>0<t>>>0)){y=A;break c}u=z;v=a[z]|0;x=A}}else{y=w}}while(0);a[y]=0;x=t-y|0;v=r+1|0;if((a[v]|0)==0){l=x;m=y;break a}u=y+x|0;d:do{if((x|0)>0){A=k;z=y;while(1){B=a[A]|0;if(B<<24>>24==0){C=z;break d}D=z+1|0;a[z]=B;if(D>>>0<u>>>0){A=A+1|0;z=D}else{C=D;break}}}else{C=y}}while(0);a[C]=0;x=u-C|0;if((a[v]|0)==0){l=x;m=C;break}else{q=x;r=v;s=C}}}}while(0);if((d|0)==0){E=l;F=0;G=m;break}s=m+l|0;e:do{if((l|0)>0){r=m;while(1){q=r+1|0;if((a[r]|0)==0){H=r;break e}if(q>>>0<s>>>0){r=q}else{H=q;break}}}else{H=m}}while(0);f:do{if(H>>>0<s>>>0){r=k;q=H;while(1){n=a[r]|0;if(n<<24>>24==0){I=q;break f}p=q+1|0;a[q]=n;if(p>>>0<s>>>0){r=r+1|0;q=p}else{I=p;break}}}else{I=H}}while(0);a[I]=0;J=s-I|0;K=I;L=24}else{J=200;K=b;L=24}}while(0);do{if((L|0)==24){b=(d|0)!=0;if(!b){E=J;F=0;G=K;break}if((a[d]|0)==0){E=J;F=1;G=K;break}else{M=J;N=d;O=K}while(1){I=O+M|0;g:do{if((M|0)>0){H=O;while(1){m=H+1|0;if((a[H]|0)==0){P=H;break g}if(m>>>0<I>>>0){H=m}else{P=m;break}}}else{P=O}}while(0);h:do{if(P>>>0<I>>>0){H=1072;v=P;while(1){u=a[H]|0;if(u<<24>>24==0){Q=v;break h}m=v+1|0;a[v]=u;if(m>>>0<I>>>0){H=H+1|0;v=m}else{Q=m;break}}}else{Q=P}}while(0);a[Q]=0;v=I-Q|0;H=Aa(N|0,1080)|0;na(Q|0,N|0,(H>>>0<v>>>0?H:v)|0)|0;m=N+H|0;u=a[m]|0;if(u<<24>>24==44){l=Q+v|0;i:do{if((v|0)>0){C=Q;while(1){y=C+1|0;if((a[C]|0)==0){R=C;break i}if(y>>>0<l>>>0){C=y}else{R=y;break}}}else{R=Q}}while(0);j:do{if(R>>>0<l>>>0){I=k;C=R;while(1){y=a[I]|0;if(y<<24>>24==0){S=C;break j}w=C+1|0;a[C]=y;if(w>>>0<l>>>0){I=I+1|0;C=w}else{S=w;break}}}else{S=R}}while(0);a[S]=0;C=N+(H+1)|0;T=l-S|0;U=a[C]|0;V=C;W=S}else{T=v;U=u;V=m;W=Q}if(U<<24>>24==0){E=T;F=b;G=W;break}else{M=T;N=V;O=W}}}}while(0);if((e|0)==0){i=h;return}do{if(F){W=G+E|0;k:do{if((E|0)>0){O=G;while(1){V=O+1|0;if((a[O]|0)==0){X=O;break k}if(V>>>0<W>>>0){O=V}else{X=V;break}}}else{X=G}}while(0);l:do{if(X>>>0<W>>>0){O=1088;m=X;while(1){u=a[O]|0;if(u<<24>>24==0){Y=m;break l}v=m+1|0;a[m]=u;if(v>>>0<W>>>0){O=O+1|0;m=v}else{Y=v;break}}}else{Y=X}}while(0);a[Y]=0;Z=W-Y|0;_=Y}else{if(!g){Z=E;_=G;break}m=G+E|0;m:do{if((E|0)>0){O=G;while(1){v=O+1|0;if((a[O]|0)==0){$=O;break m}if(v>>>0<m>>>0){O=v}else{$=v;break}}}else{$=G}}while(0);n:do{if($>>>0<m>>>0){W=1048;O=$;while(1){v=a[W]|0;if(v<<24>>24==0){aa=O;break n}u=O+1|0;a[O]=v;if(u>>>0<m>>>0){W=W+1|0;O=u}else{aa=u;break}}}else{aa=$}}while(0);a[aa]=0;Z=m-aa|0;_=aa}}while(0);aa=_+Z|0;$=(Z|0)>0;if((f|0)==0){o:do{if($){f=_;while(1){Z=f+1|0;if((a[f]|0)==0){ba=f;break o}if(Z>>>0<aa>>>0){f=Z}else{ba=Z;break}}}else{ba=_}}while(0);p:do{if(ba>>>0<aa>>>0){f=e;m=ba;while(1){Z=a[f]|0;if(Z<<24>>24==0){ca=m;break p}G=m+1|0;a[m]=Z;if(G>>>0<aa>>>0){f=f+1|0;m=G}else{ca=G;break}}}else{ca=ba}}while(0);a[ca]=0;i=h;return}q:do{if($){ca=_;while(1){ba=ca+1|0;if((a[ca]|0)==0){da=ca;break q}if(ba>>>0<aa>>>0){ca=ba}else{da=ba;break}}}else{da=_}}while(0);r:do{if(da>>>0<aa>>>0){_=1056;$=da;while(1){ca=a[_]|0;if(ca<<24>>24==0){ea=$;break r}ba=$+1|0;a[$]=ca;if(ba>>>0<aa>>>0){_=_+1|0;$=ba}else{ea=ba;break}}}else{ea=da}}while(0);a[ea]=0;da=aa-ea|0;aa=ea+da|0;s:do{if((da|0)>0){$=e;_=ea;while(1){ba=a[$]|0;if(ba<<24>>24==0){fa=_;break s}ca=_+1|0;a[_]=ba;if(ca>>>0<aa>>>0){$=$+1|0;_=ca}else{fa=ca;break}}}else{fa=ea}}while(0);a[fa]=0;ea=aa-fa|0;aa=fa+ea|0;t:do{if((ea|0)>0){e=1064;da=fa;while(1){_=a[e]|0;if(_<<24>>24==0){ga=da;break t}$=da+1|0;a[da]=_;if($>>>0<aa>>>0){e=e+1|0;da=$}else{ga=$;break}}}else{ga=fa}}while(0);a[ga]=0;i=h;return}function Hb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0;f=i;i=i+8|0;g=f;h=i;i=i+8|0;j=i;i=i+8|0;k=i;i=i+8|0;l=i;i=i+8|0;m=i;i=i+8|0;n=i;i=i+8|0;o=i;i=i+200|0;p=c[d>>2]|0;a:do{if((p|0)==0){q=960}else{r=p;s=1096;t=1104;u=0;while(1){v=a[r]|0;if((v&1|0)!=0){w=t;break}do{if((c[r+20>>2]|0)<1){x=s;y=t}else{z=c[r+4>>2]|0;if((z|0)==0){x=s;y=t;break}if((v&2|0)!=0){x=s;y=t;break}c[m>>2]=a[z]|0;Ta(b|0,s|0,m|0)|0;x=1112;y=1120}}while(0);v=u+1|0;z=c[d+(v<<2)>>2]|0;if((z|0)==0){w=y;break}else{r=z;s=x;t=y;u=v}}u=c[d>>2]|0;if((u|0)==0){q=960;break}else{A=u;B=w;C=960;D=0}while(1){u=a[A]|0;if((u&1|0)!=0){q=C;break a}do{if((c[A+20>>2]|0)>0){E=B;F=C}else{t=c[A+4>>2]|0;if((t|0)==0){E=B;F=C;break}if((u&2|0)!=0){E=B;F=C;break}c[l>>2]=a[t]|0;Ta(b|0,B|0,l|0)|0;E=1112;F=1064}}while(0);u=D+1|0;t=c[d+(u<<2)>>2]|0;if((t|0)==0){q=F;break}else{A=t;B=E;C=F;D=u}}}}while(0);Va(q|0,b|0)|0;q=c[d>>2]|0;b:do{if((q|0)!=0){D=o;F=n;C=o+200|0;E=C;B=n+1|0;A=n+2|0;l=q;w=d;y=0;do{if(!((a[l]&1)==0)){break b}Ub(D|0,0,200)|0;x=c[l+4>>2]|0;m=(x|0)==0;p=a[l]|0;if(m){G=20}else{if(!((p&2)==0)){G=20}}do{if((G|0)==20){G=0;u=c[l+8>>2]|0;t=c[l+12>>2]|0;s=p&4;do{if(m){if((u|0)==0){if((t|0)==0){break}if((s|0)==0){r=t;v=D;while(1){z=a[r]|0;if(z<<24>>24==0){H=v;break}I=v+1|0;a[v]=z;if(I>>>0<C>>>0){r=r+1|0;v=I}else{H=I;break}}a[H]=0;break}else{J=1056;K=D}while(1){v=a[J]|0;if(v<<24>>24==0){L=K;break}r=K+1|0;a[K]=v;if(r>>>0<C>>>0){J=J+1|0;K=r}else{L=r;break}}a[L]=0;r=E-L|0;v=L+r|0;c:do{if((r|0)>0){I=t;z=L;while(1){M=a[I]|0;if(M<<24>>24==0){N=z;break c}O=z+1|0;a[z]=M;if(O>>>0<v>>>0){I=I+1|0;z=O}else{N=O;break}}}else{N=L}}while(0);a[N]=0;r=v-N|0;z=N+r|0;d:do{if((r|0)>0){I=1064;O=N;while(1){M=a[I]|0;if(M<<24>>24==0){P=O;break d}Q=O+1|0;a[O]=M;if(Q>>>0<z>>>0){I=I+1|0;O=Q}else{P=Q;break}}}else{P=N}}while(0);a[P]=0;break}else{R=1072;S=D}while(1){z=a[R]|0;if(z<<24>>24==0){T=S;break}r=S+1|0;a[S]=z;if(r>>>0<C>>>0){R=R+1|0;S=r}else{T=r;break}}a[T]=0;r=E-T|0;z=Aa(u|0,1080)|0;na(T|0,u|0,(z>>>0<r>>>0?z:r)|0)|0;if((t|0)==0){break}z=T+r|0;e:do{if((r|0)>0){v=T;while(1){O=v+1|0;if((a[v]|0)==0){U=v;break e}if(O>>>0<z>>>0){v=O}else{U=O;break}}}else{U=T}}while(0);f:do{if(U>>>0<z>>>0){r=1088;v=U;while(1){O=a[r]|0;if(O<<24>>24==0){V=v;break f}I=v+1|0;a[v]=O;if(I>>>0<z>>>0){r=r+1|0;v=I}else{V=I;break}}}else{V=U}}while(0);a[V]=0;v=z-V|0;r=V+v|0;I=(v|0)>0;if((s|0)==0){g:do{if(I){v=t;O=V;while(1){Q=a[v]|0;if(Q<<24>>24==0){W=O;break g}M=O+1|0;a[O]=Q;if(M>>>0<r>>>0){v=v+1|0;O=M}else{W=M;break}}}else{W=V}}while(0);a[W]=0;break}h:do{if(I){z=1056;O=V;while(1){v=a[z]|0;if(v<<24>>24==0){X=O;break h}M=O+1|0;a[O]=v;if(M>>>0<r>>>0){z=z+1|0;O=M}else{X=M;break}}}else{X=V}}while(0);a[X]=0;I=r-X|0;O=X+I|0;i:do{if((I|0)>0){z=t;M=X;while(1){v=a[z]|0;if(v<<24>>24==0){Y=M;break i}Q=M+1|0;a[M]=v;if(Q>>>0<O>>>0){z=z+1|0;M=Q}else{Y=Q;break}}}else{Y=X}}while(0);a[Y]=0;I=O-Y|0;r=Y+I|0;j:do{if((I|0)>0){M=1064;z=Y;while(1){Q=a[M]|0;if(Q<<24>>24==0){Z=z;break j}v=z+1|0;a[z]=Q;if(v>>>0<r>>>0){M=M+1|0;z=v}else{Z=v;break}}}else{Z=Y}}while(0);a[Z]=0}else{a[F]=45;a[B]=a[x]|0;a[A]=0;r=F;I=45;O=D;while(1){z=r+1|0;_=O+1|0;a[O]=I;if(!(_>>>0<C>>>0)){break}M=a[z]|0;if(M<<24>>24==0){break}else{I=M;O=_;r=z}}a[_]=0;if((t|0)==0){break}r=E-_|0;O=_+r|0;k:do{if((r|0)>0){I=1048;z=_;while(1){M=a[I]|0;if(M<<24>>24==0){$=z;break k}v=z+1|0;a[z]=M;if(v>>>0<O>>>0){I=I+1|0;z=v}else{$=v;break}}}else{$=_}}while(0);a[$]=0;r=O-$|0;z=$+r|0;I=(r|0)>0;if((s|0)==0){l:do{if(I){r=t;v=$;while(1){M=a[r]|0;if(M<<24>>24==0){aa=v;break l}Q=v+1|0;a[v]=M;if(Q>>>0<z>>>0){r=r+1|0;v=Q}else{aa=Q;break}}}else{aa=$}}while(0);a[aa]=0;break}m:do{if(I){O=1056;v=$;while(1){r=a[O]|0;if(r<<24>>24==0){ba=v;break m}Q=v+1|0;a[v]=r;if(Q>>>0<z>>>0){O=O+1|0;v=Q}else{ba=Q;break}}}else{ba=$}}while(0);a[ba]=0;I=z-ba|0;v=ba+I|0;n:do{if((I|0)>0){O=t;Q=ba;while(1){r=a[O]|0;if(r<<24>>24==0){ca=Q;break n}M=Q+1|0;a[Q]=r;if(M>>>0<v>>>0){O=O+1|0;Q=M}else{ca=M;break}}}else{ca=ba}}while(0);a[ca]=0;I=v-ca|0;z=ca+I|0;o:do{if((I|0)>0){Q=1064;O=ca;while(1){M=a[Q]|0;if(M<<24>>24==0){da=O;break o}r=O+1|0;a[O]=M;if(r>>>0<z>>>0){Q=Q+1|0;O=r}else{da=r;break}}}else{da=ca}}while(0);a[da]=0}}while(0);if((a[D]|0)==0){break}t=c[w>>2]|0;s=c[t+20>>2]|0;if((s|0)>0){u=0;while(1){c[k>>2]=D;Ta(b|0,976,k|0)|0;z=u+1|0;I=c[w>>2]|0;v=c[I+20>>2]|0;if((z|0)<(v|0)){u=z}else{ea=I;fa=v;break}}}else{ea=t;fa=s}u=(c[ea+24>>2]|0)-fa|0;if((u|0)==1){c[j>>2]=D;Ta(b|0,984,j|0)|0;break}else if((u|0)==2){c[h>>2]=D;c[h+4>>2]=D;Ta(b|0,992,h|0)|0;break}else if((u|0)==0){break}else{c[g>>2]=D;Ta(b|0,1008,g|0)|0;break}}}while(0);y=y+1|0;w=d+(y<<2)|0;l=c[w>>2]|0;}while((l|0)!=0)}}while(0);if((e|0)==0){i=f;return}Va(e|0,b|0)|0;i=f;return}function Ib(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0;f=i;i=i+8|0;g=f;h=i;i=i+200|0;j=(e|0)!=0?e:1024;e=c[d>>2]|0;if(!((a[e]&1)==0)){i=f;return}k=h;h=e;e=0;do{l=h+16|0;if((c[l>>2]|0)!=0){Ub(k|0,0,200)|0;m=c[l>>2]|0;Gb(k,c[h+4>>2]|0,c[h+8>>2]|0,c[h+12>>2]|0,a[h]&4,1040);c[g>>2]=k;c[g+4>>2]=m;Ta(b|0,j|0,g|0)|0}e=e+1|0;h=c[d+(e<<2)>>2]|0;}while((a[h]&1)==0);i=f;return}function Jb(b){b=b|0;var d=0,e=0,f=0,g=0;d=i;a:do{if((b|0)==0){e=1}else{f=0;while(1){g=c[b+(f<<2)>>2]|0;if((g|0)==0){e=1;break a}if((a[g]&1)==0){f=f+1|0}else{e=0;break}}}}while(0);i=d;return e|0}function Kb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;d=i;if((b|0)==0){i=d;return}else{e=0}do{f=a+(e<<2)|0;g=c[f>>2]|0;if((g|0)!=0){Rb(g);c[f>>2]=0}e=e+1|0;}while((e|0)!=(b|0));i=d;return}function Lb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0;e=i;f=0;while(1){g=f+1|0;if((Sb(a,c[1128+(f*12|0)>>2]|0)|0)==0){break}if((g|0)<152){f=g}else{h=1;j=5;break}}if((j|0)==5){i=e;return h|0}c[b>>2]=c[1132+(f*12|0)>>2];c[d>>2]=c[1136+(f*12|0)>>2];h=0;i=e;return h|0}function Mb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;f=i;i=i+16|0;g=f;h=f+8|0;j=c[1460]|0;if((j|0)==0|(c[1464]|0)!=0){c[1464]=0;c[1466]=0;c[1460]=1;k=1}else{k=j}if((k|0)>=(b|0)){l=-1;i=f;return l|0}j=c[d+(k<<2)>>2]|0;if((j|0)==0){l=-1;i=f;return l|0}if((a[j]|0)!=45){l=-1;i=f;return l|0}m=a[j+1|0]|0;if(m<<24>>24==45){n=7}else if(m<<24>>24==0){l=-1;i=f;return l|0}do{if((n|0)==7){if((a[j+2|0]|0)!=0){break}c[1460]=k+1;l=-1;i=f;return l|0}}while(0);k=c[1466]|0;if((k|0)==0){c[1466]=1;o=1}else{o=k}k=Pb(g,j+o|0,4)|0;if((k|0)<0){c[g>>2]=65533;p=65533;q=1}else{p=c[g>>2]|0;q=k}k=c[1460]|0;o=c[d+(k<<2)>>2]|0;j=c[1466]|0;n=o+j|0;c[1468]=p;p=j+q|0;c[1466]=p;if((a[o+p|0]|0)==0){c[1460]=k+1;c[1466]=0}k=Pb(h,e,4)|0;a:do{if((k|0)==0){r=0}else{p=k;o=0;while(1){if((c[h>>2]|0)==(c[g>>2]|0)){r=o;break a}j=((p|0)<1?1:p)+o|0;m=Pb(h,e+j|0,4)|0;if((m|0)==0){r=j;break}else{p=m;o=j}}}}while(0);k=c[h>>2]|0;if((k|0)!=(c[g>>2]|0)){if(!((a[e]|0)!=58&(c[1462]|0)!=0)){l=63;i=f;return l|0}g=c[d>>2]|0;Ja(2,g|0,Wb(g|0)|0)|0;Ja(2,5880,18)|0;Ja(2,n|0,q|0)|0;Ja(2,5904,1)|0;l=63;i=f;return l|0}if((a[e+(r+1)|0]|0)!=58){l=k;i=f;return l|0}r=c[1460]|0;if((r|0)<(b|0)){c[1460]=r+1;c[1486]=(c[d+(r<<2)>>2]|0)+(c[1466]|0);c[1466]=0;l=k;i=f;return l|0}if((a[e]|0)==58){l=58;i=f;return l|0}if((c[1462]|0)==0){l=63;i=f;return l|0}e=c[d>>2]|0;Ja(2,e|0,Wb(e|0)|0)|0;Ja(2,5912,31)|0;Ja(2,n|0,q|0)|0;Ja(2,5904,1)|0;l=63;i=f;return l|0}function Nb(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;var f=0,g=0;f=i;g=Ob(a,b,c,d,e,0)|0;i=f;return g|0}function Ob(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0;j=i;k=c[1460]|0;if((k|0)==0|(c[1464]|0)!=0){c[1464]=0;c[1466]=0;c[1460]=1;l=1}else{l=k}if((l|0)>=(b|0)){m=-1;i=j;return m|0}k=c[d+(l<<2)>>2]|0;if((k|0)==0){m=-1;i=j;return m|0}if((a[k]|0)!=45){m=-1;i=j;return m|0}n=a[k+1|0]|0;do{if((h|0)==0){if(!(n<<24>>24==45)){break}if((a[k+2|0]|0)!=0){o=45;p=10}}else{if(!(n<<24>>24==0)){o=n;p=10}}}while(0);do{if((p|0)==10){n=c[f>>2]|0;h=k+1|0;q=o<<24>>24==45;a:do{if((n|0)!=0){r=n;s=0;b:while(1){t=q?k+2|0:h;u=a[r]|0;c:do{if(u<<24>>24==0){v=t;p=15}else{w=u;x=r;y=t;while(1){if(!(w<<24>>24==(a[y]|0))){break}z=x+1|0;A=y+1|0;B=a[z]|0;if(B<<24>>24==0){v=A;p=15;break c}else{w=B;x=z;y=A}}if(w<<24>>24==0){v=y;p=15}}}while(0);do{if((p|0)==15){p=0;t=a[v]|0;if(!(t<<24>>24==61|t<<24>>24==0)){break}C=c[f+(s<<4)+4>>2]|0;if(!(t<<24>>24==61)){p=19;break b}if((C|0)!=0){p=18;break b}}}while(0);t=s+1|0;u=c[f+(t<<4)>>2]|0;if((u|0)==0){break a}else{r=u;s=t}}do{if((p|0)==18){c[1486]=v+1;D=l}else if((p|0)==19){if((C|0)!=1){c[1486]=0;D=l;break}r=l+1|0;c[1460]=r;t=c[d+(r<<2)>>2]|0;c[1486]=t;if((t|0)==0){m=58}else{D=r;break}i=j;return m|0}}while(0);c[1460]=D+1;if((g|0)!=0){c[g>>2]=s}r=c[f+(s<<4)+8>>2]|0;t=c[f+(s<<4)+12>>2]|0;if((r|0)==0){m=t;i=j;return m|0}c[r>>2]=t;m=0;i=j;return m|0}}while(0);if(!q){break}c[1460]=l+1;m=63;i=j;return m|0}}while(0);m=Mb(b,d,e)|0;i=j;return m|0}function Pb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,m=0,n=0;g=i;i=i+8|0;h=g;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){k=h;c[h>>2]=k;l=k}else{l=b}k=a[e]|0;m=k&255;if(k<<24>>24>-1){c[l>>2]=m;j=k<<24>>24!=0|0;i=g;return j|0}k=m+ -194|0;if(k>>>0>50){break}m=e+1|0;n=c[5952+(k<<2)>>2]|0;if(f>>>0<4){if((n&-2147483648>>>((f*6|0)+ -6|0)|0)!=0){break}}k=d[m]|0;m=k>>>3;if((m+ -16|m+(n>>26))>>>0>7){break}m=k+ -128|n<<6;if((m|0)>=0){c[l>>2]=m;j=2;i=g;return j|0}n=(d[e+2|0]|0)+ -128|0;if(n>>>0>63){break}k=n|m<<6;if((k|0)>=0){c[l>>2]=k;j=3;i=g;return j|0}m=(d[e+3|0]|0)+ -128|0;if(m>>>0>63){break}c[l>>2]=m|k<<6;j=4;i=g;return j|0}}while(0);c[(Ka()|0)>>2]=84;j=-1;i=g;return j|0}function Qb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ba=0,ca=0,da=0,ea=0,fa=0,ga=0,ha=0,ia=0,ja=0,ka=0,la=0,ma=0,na=0,oa=0,pa=0,qa=0,ra=0,sa=0,ua=0,va=0,wa=0,xa=0,za=0,Aa=0,Ba=0,Ca=0,Da=0,Ea=0,Fa=0,Ga=0,Ha=0,Ia=0,Ja=0,La=0,Ma=0,Na=0,Oa=0,Pa=0,Ra=0;b=i;do{if(a>>>0<245){if(a>>>0<11){d=16}else{d=a+11&-8}e=d>>>3;f=c[1540]|0;g=f>>>e;if((g&3|0)!=0){h=(g&1^1)+e|0;j=h<<1;k=6200+(j<<2)|0;l=6200+(j+2<<2)|0;j=c[l>>2]|0;m=j+8|0;n=c[m>>2]|0;do{if((k|0)==(n|0)){c[1540]=f&~(1<<h)}else{if(n>>>0<(c[6176>>2]|0)>>>0){Qa()}o=n+12|0;if((c[o>>2]|0)==(j|0)){c[o>>2]=k;c[l>>2]=n;break}else{Qa()}}}while(0);n=h<<3;c[j+4>>2]=n|3;l=j+(n|4)|0;c[l>>2]=c[l>>2]|1;p=m;i=b;return p|0}if(!(d>>>0>(c[6168>>2]|0)>>>0)){q=d;break}if((g|0)!=0){l=2<<e;n=g<<e&(l|0-l);l=(n&0-n)+ -1|0;n=l>>>12&16;k=l>>>n;l=k>>>5&8;o=k>>>l;k=o>>>2&4;r=o>>>k;o=r>>>1&2;s=r>>>o;r=s>>>1&1;t=(l|n|k|o|r)+(s>>>r)|0;r=t<<1;s=6200+(r<<2)|0;o=6200+(r+2<<2)|0;r=c[o>>2]|0;k=r+8|0;n=c[k>>2]|0;do{if((s|0)==(n|0)){c[1540]=f&~(1<<t)}else{if(n>>>0<(c[6176>>2]|0)>>>0){Qa()}l=n+12|0;if((c[l>>2]|0)==(r|0)){c[l>>2]=s;c[o>>2]=n;break}else{Qa()}}}while(0);n=t<<3;o=n-d|0;c[r+4>>2]=d|3;s=r;f=s+d|0;c[s+(d|4)>>2]=o|1;c[s+n>>2]=o;n=c[6168>>2]|0;if((n|0)!=0){s=c[6180>>2]|0;e=n>>>3;n=e<<1;g=6200+(n<<2)|0;m=c[1540]|0;j=1<<e;do{if((m&j|0)==0){c[1540]=m|j;u=6200+(n+2<<2)|0;v=g}else{e=6200+(n+2<<2)|0;h=c[e>>2]|0;if(!(h>>>0<(c[6176>>2]|0)>>>0)){u=e;v=h;break}Qa()}}while(0);c[u>>2]=s;c[v+12>>2]=s;c[s+8>>2]=v;c[s+12>>2]=g}c[6168>>2]=o;c[6180>>2]=f;p=k;i=b;return p|0}n=c[6164>>2]|0;if((n|0)==0){q=d;break}j=(n&0-n)+ -1|0;n=j>>>12&16;m=j>>>n;j=m>>>5&8;r=m>>>j;m=r>>>2&4;t=r>>>m;r=t>>>1&2;h=t>>>r;t=h>>>1&1;e=c[6464+((j|n|m|r|t)+(h>>>t)<<2)>>2]|0;t=(c[e+4>>2]&-8)-d|0;h=e;r=e;while(1){e=c[h+16>>2]|0;if((e|0)==0){m=c[h+20>>2]|0;if((m|0)==0){break}else{w=m}}else{w=e}e=(c[w+4>>2]&-8)-d|0;m=e>>>0<t>>>0;t=m?e:t;h=w;r=m?w:r}h=r;k=c[6176>>2]|0;if(h>>>0<k>>>0){Qa()}f=h+d|0;o=f;if(!(h>>>0<f>>>0)){Qa()}f=c[r+24>>2]|0;g=c[r+12>>2]|0;do{if((g|0)==(r|0)){s=r+20|0;m=c[s>>2]|0;if((m|0)==0){e=r+16|0;n=c[e>>2]|0;if((n|0)==0){x=0;break}else{y=n;z=e}}else{y=m;z=s}while(1){s=y+20|0;m=c[s>>2]|0;if((m|0)!=0){z=s;y=m;continue}m=y+16|0;s=c[m>>2]|0;if((s|0)==0){break}else{y=s;z=m}}if(z>>>0<k>>>0){Qa()}else{c[z>>2]=0;x=y;break}}else{m=c[r+8>>2]|0;if(m>>>0<k>>>0){Qa()}s=m+12|0;if((c[s>>2]|0)!=(r|0)){Qa()}e=g+8|0;if((c[e>>2]|0)==(r|0)){c[s>>2]=g;c[e>>2]=m;x=g;break}else{Qa()}}}while(0);a:do{if((f|0)!=0){g=c[r+28>>2]|0;k=6464+(g<<2)|0;do{if((r|0)==(c[k>>2]|0)){c[k>>2]=x;if((x|0)!=0){break}c[6164>>2]=c[6164>>2]&~(1<<g);break a}else{if(f>>>0<(c[6176>>2]|0)>>>0){Qa()}m=f+16|0;if((c[m>>2]|0)==(r|0)){c[m>>2]=x}else{c[f+20>>2]=x}if((x|0)==0){break a}}}while(0);if(x>>>0<(c[6176>>2]|0)>>>0){Qa()}c[x+24>>2]=f;g=c[r+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[x+16>>2]=g;c[g+24>>2]=x;break}}}while(0);g=c[r+20>>2]|0;if((g|0)==0){break}if(g>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[x+20>>2]=g;c[g+24>>2]=x;break}}}while(0);if(t>>>0<16){f=t+d|0;c[r+4>>2]=f|3;g=h+(f+4)|0;c[g>>2]=c[g>>2]|1}else{c[r+4>>2]=d|3;c[h+(d|4)>>2]=t|1;c[h+(t+d)>>2]=t;g=c[6168>>2]|0;if((g|0)!=0){f=c[6180>>2]|0;k=g>>>3;g=k<<1;m=6200+(g<<2)|0;e=c[1540]|0;s=1<<k;do{if((e&s|0)==0){c[1540]=e|s;A=6200+(g+2<<2)|0;B=m}else{k=6200+(g+2<<2)|0;n=c[k>>2]|0;if(!(n>>>0<(c[6176>>2]|0)>>>0)){A=k;B=n;break}Qa()}}while(0);c[A>>2]=f;c[B+12>>2]=f;c[f+8>>2]=B;c[f+12>>2]=m}c[6168>>2]=t;c[6180>>2]=o}p=r+8|0;i=b;return p|0}else{if(a>>>0>4294967231){q=-1;break}g=a+11|0;s=g&-8;e=c[6164>>2]|0;if((e|0)==0){q=s;break}h=0-s|0;n=g>>>8;do{if((n|0)==0){C=0}else{if(s>>>0>16777215){C=31;break}g=(n+1048320|0)>>>16&8;k=n<<g;j=(k+520192|0)>>>16&4;l=k<<j;k=(l+245760|0)>>>16&2;D=14-(j|g|k)+(l<<k>>>15)|0;C=s>>>(D+7|0)&1|D<<1}}while(0);n=c[6464+(C<<2)>>2]|0;b:do{if((n|0)==0){E=h;F=0;G=0}else{if((C|0)==31){H=0}else{H=25-(C>>>1)|0}r=h;o=0;t=s<<H;m=n;f=0;while(1){D=c[m+4>>2]&-8;k=D-s|0;if(k>>>0<r>>>0){if((D|0)==(s|0)){E=k;F=m;G=m;break b}else{I=k;J=m}}else{I=r;J=f}k=c[m+20>>2]|0;D=c[m+(t>>>31<<2)+16>>2]|0;l=(k|0)==0|(k|0)==(D|0)?o:k;if((D|0)==0){E=I;F=l;G=J;break}else{r=I;o=l;t=t<<1;m=D;f=J}}}}while(0);if((F|0)==0&(G|0)==0){n=2<<C;h=e&(n|0-n);if((h|0)==0){q=s;break}n=(h&0-h)+ -1|0;h=n>>>12&16;f=n>>>h;n=f>>>5&8;m=f>>>n;f=m>>>2&4;t=m>>>f;m=t>>>1&2;o=t>>>m;t=o>>>1&1;K=c[6464+((n|h|f|m|t)+(o>>>t)<<2)>>2]|0}else{K=F}if((K|0)==0){L=E;M=G}else{t=E;o=K;m=G;while(1){f=(c[o+4>>2]&-8)-s|0;h=f>>>0<t>>>0;n=h?f:t;f=h?o:m;h=c[o+16>>2]|0;if((h|0)!=0){N=f;O=n;m=N;o=h;t=O;continue}h=c[o+20>>2]|0;if((h|0)==0){L=n;M=f;break}else{N=f;O=n;o=h;m=N;t=O}}}if((M|0)==0){q=s;break}if(!(L>>>0<((c[6168>>2]|0)-s|0)>>>0)){q=s;break}t=M;m=c[6176>>2]|0;if(t>>>0<m>>>0){Qa()}o=t+s|0;e=o;if(!(t>>>0<o>>>0)){Qa()}h=c[M+24>>2]|0;n=c[M+12>>2]|0;do{if((n|0)==(M|0)){f=M+20|0;r=c[f>>2]|0;if((r|0)==0){D=M+16|0;l=c[D>>2]|0;if((l|0)==0){P=0;break}else{Q=l;R=D}}else{Q=r;R=f}while(1){f=Q+20|0;r=c[f>>2]|0;if((r|0)!=0){R=f;Q=r;continue}r=Q+16|0;f=c[r>>2]|0;if((f|0)==0){break}else{Q=f;R=r}}if(R>>>0<m>>>0){Qa()}else{c[R>>2]=0;P=Q;break}}else{r=c[M+8>>2]|0;if(r>>>0<m>>>0){Qa()}f=r+12|0;if((c[f>>2]|0)!=(M|0)){Qa()}D=n+8|0;if((c[D>>2]|0)==(M|0)){c[f>>2]=n;c[D>>2]=r;P=n;break}else{Qa()}}}while(0);c:do{if((h|0)!=0){n=c[M+28>>2]|0;m=6464+(n<<2)|0;do{if((M|0)==(c[m>>2]|0)){c[m>>2]=P;if((P|0)!=0){break}c[6164>>2]=c[6164>>2]&~(1<<n);break c}else{if(h>>>0<(c[6176>>2]|0)>>>0){Qa()}r=h+16|0;if((c[r>>2]|0)==(M|0)){c[r>>2]=P}else{c[h+20>>2]=P}if((P|0)==0){break c}}}while(0);if(P>>>0<(c[6176>>2]|0)>>>0){Qa()}c[P+24>>2]=h;n=c[M+16>>2]|0;do{if((n|0)!=0){if(n>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[P+16>>2]=n;c[n+24>>2]=P;break}}}while(0);n=c[M+20>>2]|0;if((n|0)==0){break}if(n>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[P+20>>2]=n;c[n+24>>2]=P;break}}}while(0);d:do{if(L>>>0<16){h=L+s|0;c[M+4>>2]=h|3;n=t+(h+4)|0;c[n>>2]=c[n>>2]|1}else{c[M+4>>2]=s|3;c[t+(s|4)>>2]=L|1;c[t+(L+s)>>2]=L;n=L>>>3;if(L>>>0<256){h=n<<1;m=6200+(h<<2)|0;r=c[1540]|0;D=1<<n;do{if((r&D|0)==0){c[1540]=r|D;S=6200+(h+2<<2)|0;T=m}else{n=6200+(h+2<<2)|0;f=c[n>>2]|0;if(!(f>>>0<(c[6176>>2]|0)>>>0)){S=n;T=f;break}Qa()}}while(0);c[S>>2]=e;c[T+12>>2]=e;c[t+(s+8)>>2]=T;c[t+(s+12)>>2]=m;break}h=o;D=L>>>8;do{if((D|0)==0){U=0}else{if(L>>>0>16777215){U=31;break}r=(D+1048320|0)>>>16&8;f=D<<r;n=(f+520192|0)>>>16&4;l=f<<n;f=(l+245760|0)>>>16&2;k=14-(n|r|f)+(l<<f>>>15)|0;U=L>>>(k+7|0)&1|k<<1}}while(0);D=6464+(U<<2)|0;c[t+(s+28)>>2]=U;c[t+(s+20)>>2]=0;c[t+(s+16)>>2]=0;m=c[6164>>2]|0;k=1<<U;if((m&k|0)==0){c[6164>>2]=m|k;c[D>>2]=h;c[t+(s+24)>>2]=D;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break}k=c[D>>2]|0;if((U|0)==31){V=0}else{V=25-(U>>>1)|0}e:do{if((c[k+4>>2]&-8|0)==(L|0)){W=k}else{D=L<<V;m=k;while(1){X=m+(D>>>31<<2)+16|0;f=c[X>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(L|0)){W=f;break e}else{D=D<<1;m=f}}if(X>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[X>>2]=h;c[t+(s+24)>>2]=m;c[t+(s+12)>>2]=h;c[t+(s+8)>>2]=h;break d}}}while(0);k=W+8|0;D=c[k>>2]|0;f=c[6176>>2]|0;if(W>>>0<f>>>0){Qa()}if(D>>>0<f>>>0){Qa()}else{c[D+12>>2]=h;c[k>>2]=h;c[t+(s+8)>>2]=D;c[t+(s+12)>>2]=W;c[t+(s+24)>>2]=0;break}}}while(0);p=M+8|0;i=b;return p|0}}while(0);M=c[6168>>2]|0;if(!(q>>>0>M>>>0)){W=M-q|0;X=c[6180>>2]|0;if(W>>>0>15){L=X;c[6180>>2]=L+q;c[6168>>2]=W;c[L+(q+4)>>2]=W|1;c[L+M>>2]=W;c[X+4>>2]=q|3}else{c[6168>>2]=0;c[6180>>2]=0;c[X+4>>2]=M|3;W=X+(M+4)|0;c[W>>2]=c[W>>2]|1}p=X+8|0;i=b;return p|0}X=c[6172>>2]|0;if(q>>>0<X>>>0){W=X-q|0;c[6172>>2]=W;X=c[6184>>2]|0;M=X;c[6184>>2]=M+q;c[M+(q+4)>>2]=W|1;c[X+4>>2]=q|3;p=X+8|0;i=b;return p|0}do{if((c[1658]|0)==0){X=ya(30)|0;if((X+ -1&X|0)==0){c[6640>>2]=X;c[6636>>2]=X;c[6644>>2]=-1;c[6648>>2]=-1;c[6652>>2]=0;c[6604>>2]=0;c[1658]=(Sa(0)|0)&-16^1431655768;break}else{Qa()}}}while(0);X=q+48|0;W=c[6640>>2]|0;M=q+47|0;L=W+M|0;V=0-W|0;W=L&V;if(!(W>>>0>q>>>0)){p=0;i=b;return p|0}U=c[6600>>2]|0;do{if((U|0)!=0){T=c[6592>>2]|0;S=T+W|0;if(S>>>0<=T>>>0|S>>>0>U>>>0){p=0}else{break}i=b;return p|0}}while(0);f:do{if((c[6604>>2]&4|0)==0){U=c[6184>>2]|0;g:do{if((U|0)==0){Y=182}else{S=U;T=6608|0;while(1){Z=T;P=c[Z>>2]|0;if(!(P>>>0>S>>>0)){_=T+4|0;if((P+(c[_>>2]|0)|0)>>>0>S>>>0){break}}P=c[T+8>>2]|0;if((P|0)==0){Y=182;break g}else{T=P}}if((T|0)==0){Y=182;break}S=L-(c[6172>>2]|0)&V;if(!(S>>>0<2147483647)){$=0;break}h=ta(S|0)|0;P=(h|0)==((c[Z>>2]|0)+(c[_>>2]|0)|0);aa=h;ba=S;ca=P?h:-1;da=P?S:0;Y=191}}while(0);do{if((Y|0)==182){U=ta(0)|0;if((U|0)==(-1|0)){$=0;break}S=U;P=c[6636>>2]|0;h=P+ -1|0;if((h&S|0)==0){ea=W}else{ea=W-S+(h+S&0-P)|0}P=c[6592>>2]|0;S=P+ea|0;if(!(ea>>>0>q>>>0&ea>>>0<2147483647)){$=0;break}h=c[6600>>2]|0;if((h|0)!=0){if(S>>>0<=P>>>0|S>>>0>h>>>0){$=0;break}}h=ta(ea|0)|0;S=(h|0)==(U|0);aa=h;ba=ea;ca=S?U:-1;da=S?ea:0;Y=191}}while(0);h:do{if((Y|0)==191){S=0-ba|0;if((ca|0)!=(-1|0)){fa=ca;ga=da;Y=202;break f}do{if((aa|0)!=(-1|0)&ba>>>0<2147483647&ba>>>0<X>>>0){U=c[6640>>2]|0;h=M-ba+U&0-U;if(!(h>>>0<2147483647)){ha=ba;break}if((ta(h|0)|0)==(-1|0)){ta(S|0)|0;$=da;break h}else{ha=h+ba|0;break}}else{ha=ba}}while(0);if((aa|0)==(-1|0)){$=da}else{fa=aa;ga=ha;Y=202;break f}}}while(0);c[6604>>2]=c[6604>>2]|4;ia=$;Y=199}else{ia=0;Y=199}}while(0);do{if((Y|0)==199){if(!(W>>>0<2147483647)){break}$=ta(W|0)|0;ha=ta(0)|0;if(!((ha|0)!=(-1|0)&($|0)!=(-1|0)&$>>>0<ha>>>0)){break}aa=ha-$|0;ha=aa>>>0>(q+40|0)>>>0;if(ha){fa=$;ga=ha?aa:ia;Y=202}}}while(0);do{if((Y|0)==202){ia=(c[6592>>2]|0)+ga|0;c[6592>>2]=ia;if(ia>>>0>(c[6596>>2]|0)>>>0){c[6596>>2]=ia}ia=c[6184>>2]|0;i:do{if((ia|0)==0){W=c[6176>>2]|0;if((W|0)==0|fa>>>0<W>>>0){c[6176>>2]=fa}c[6608>>2]=fa;c[6612>>2]=ga;c[6620>>2]=0;c[6196>>2]=c[1658];c[6192>>2]=-1;W=0;do{aa=W<<1;ha=6200+(aa<<2)|0;c[6200+(aa+3<<2)>>2]=ha;c[6200+(aa+2<<2)>>2]=ha;W=W+1|0;}while((W|0)!=32);W=fa+8|0;if((W&7|0)==0){ja=0}else{ja=0-W&7}W=ga+ -40-ja|0;c[6184>>2]=fa+ja;c[6172>>2]=W;c[fa+(ja+4)>>2]=W|1;c[fa+(ga+ -36)>>2]=40;c[6188>>2]=c[6648>>2]}else{W=6608|0;while(1){ka=c[W>>2]|0;la=W+4|0;ma=c[la>>2]|0;if((fa|0)==(ka+ma|0)){Y=214;break}ha=c[W+8>>2]|0;if((ha|0)==0){break}else{W=ha}}do{if((Y|0)==214){if((c[W+12>>2]&8|0)!=0){break}ha=ia;if(!(ha>>>0>=ka>>>0&ha>>>0<fa>>>0)){break}c[la>>2]=ma+ga;aa=(c[6172>>2]|0)+ga|0;$=ia+8|0;if(($&7|0)==0){na=0}else{na=0-$&7}$=aa-na|0;c[6184>>2]=ha+na;c[6172>>2]=$;c[ha+(na+4)>>2]=$|1;c[ha+(aa+4)>>2]=40;c[6188>>2]=c[6648>>2];break i}}while(0);if(fa>>>0<(c[6176>>2]|0)>>>0){c[6176>>2]=fa}W=fa+ga|0;aa=6608|0;while(1){oa=aa;if((c[oa>>2]|0)==(W|0)){Y=224;break}ha=c[aa+8>>2]|0;if((ha|0)==0){break}else{aa=ha}}do{if((Y|0)==224){if((c[aa+12>>2]&8|0)!=0){break}c[oa>>2]=fa;W=aa+4|0;c[W>>2]=(c[W>>2]|0)+ga;W=fa+8|0;if((W&7|0)==0){pa=0}else{pa=0-W&7}W=fa+(ga+8)|0;if((W&7|0)==0){qa=0}else{qa=0-W&7}W=fa+(qa+ga)|0;ha=W;$=pa+q|0;da=fa+$|0;ba=da;M=W-(fa+pa)-q|0;c[fa+(pa+4)>>2]=q|3;j:do{if((ha|0)==(c[6184>>2]|0)){X=(c[6172>>2]|0)+M|0;c[6172>>2]=X;c[6184>>2]=ba;c[fa+($+4)>>2]=X|1}else{if((ha|0)==(c[6180>>2]|0)){X=(c[6168>>2]|0)+M|0;c[6168>>2]=X;c[6180>>2]=ba;c[fa+($+4)>>2]=X|1;c[fa+(X+$)>>2]=X;break}X=ga+4|0;ca=c[fa+(X+qa)>>2]|0;if((ca&3|0)==1){ea=ca&-8;_=ca>>>3;k:do{if(ca>>>0<256){Z=c[fa+((qa|8)+ga)>>2]|0;V=c[fa+(ga+12+qa)>>2]|0;L=6200+(_<<1<<2)|0;do{if((Z|0)!=(L|0)){if(Z>>>0<(c[6176>>2]|0)>>>0){Qa()}if((c[Z+12>>2]|0)==(ha|0)){break}Qa()}}while(0);if((V|0)==(Z|0)){c[1540]=c[1540]&~(1<<_);break}do{if((V|0)==(L|0)){ra=V+8|0}else{if(V>>>0<(c[6176>>2]|0)>>>0){Qa()}S=V+8|0;if((c[S>>2]|0)==(ha|0)){ra=S;break}Qa()}}while(0);c[Z+12>>2]=V;c[ra>>2]=Z}else{L=W;S=c[fa+((qa|24)+ga)>>2]|0;T=c[fa+(ga+12+qa)>>2]|0;do{if((T|0)==(L|0)){h=qa|16;U=fa+(X+h)|0;P=c[U>>2]|0;if((P|0)==0){Q=fa+(h+ga)|0;h=c[Q>>2]|0;if((h|0)==0){sa=0;break}else{ua=h;va=Q}}else{ua=P;va=U}while(1){U=ua+20|0;P=c[U>>2]|0;if((P|0)!=0){va=U;ua=P;continue}P=ua+16|0;U=c[P>>2]|0;if((U|0)==0){break}else{ua=U;va=P}}if(va>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[va>>2]=0;sa=ua;break}}else{P=c[fa+((qa|8)+ga)>>2]|0;if(P>>>0<(c[6176>>2]|0)>>>0){Qa()}U=P+12|0;if((c[U>>2]|0)!=(L|0)){Qa()}Q=T+8|0;if((c[Q>>2]|0)==(L|0)){c[U>>2]=T;c[Q>>2]=P;sa=T;break}else{Qa()}}}while(0);if((S|0)==0){break}T=c[fa+(ga+28+qa)>>2]|0;Z=6464+(T<<2)|0;do{if((L|0)==(c[Z>>2]|0)){c[Z>>2]=sa;if((sa|0)!=0){break}c[6164>>2]=c[6164>>2]&~(1<<T);break k}else{if(S>>>0<(c[6176>>2]|0)>>>0){Qa()}V=S+16|0;if((c[V>>2]|0)==(L|0)){c[V>>2]=sa}else{c[S+20>>2]=sa}if((sa|0)==0){break k}}}while(0);if(sa>>>0<(c[6176>>2]|0)>>>0){Qa()}c[sa+24>>2]=S;L=qa|16;T=c[fa+(L+ga)>>2]|0;do{if((T|0)!=0){if(T>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[sa+16>>2]=T;c[T+24>>2]=sa;break}}}while(0);T=c[fa+(X+L)>>2]|0;if((T|0)==0){break}if(T>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[sa+20>>2]=T;c[T+24>>2]=sa;break}}}while(0);wa=fa+((ea|qa)+ga)|0;xa=ea+M|0}else{wa=ha;xa=M}X=wa+4|0;c[X>>2]=c[X>>2]&-2;c[fa+($+4)>>2]=xa|1;c[fa+(xa+$)>>2]=xa;X=xa>>>3;if(xa>>>0<256){_=X<<1;ca=6200+(_<<2)|0;T=c[1540]|0;S=1<<X;do{if((T&S|0)==0){c[1540]=T|S;za=6200+(_+2<<2)|0;Aa=ca}else{X=6200+(_+2<<2)|0;Z=c[X>>2]|0;if(!(Z>>>0<(c[6176>>2]|0)>>>0)){za=X;Aa=Z;break}Qa()}}while(0);c[za>>2]=ba;c[Aa+12>>2]=ba;c[fa+($+8)>>2]=Aa;c[fa+($+12)>>2]=ca;break}_=da;S=xa>>>8;do{if((S|0)==0){Ba=0}else{if(xa>>>0>16777215){Ba=31;break}T=(S+1048320|0)>>>16&8;ea=S<<T;Z=(ea+520192|0)>>>16&4;X=ea<<Z;ea=(X+245760|0)>>>16&2;V=14-(Z|T|ea)+(X<<ea>>>15)|0;Ba=xa>>>(V+7|0)&1|V<<1}}while(0);S=6464+(Ba<<2)|0;c[fa+($+28)>>2]=Ba;c[fa+($+20)>>2]=0;c[fa+($+16)>>2]=0;ca=c[6164>>2]|0;V=1<<Ba;if((ca&V|0)==0){c[6164>>2]=ca|V;c[S>>2]=_;c[fa+($+24)>>2]=S;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break}V=c[S>>2]|0;if((Ba|0)==31){Ca=0}else{Ca=25-(Ba>>>1)|0}l:do{if((c[V+4>>2]&-8|0)==(xa|0)){Da=V}else{S=xa<<Ca;ca=V;while(1){Ea=ca+(S>>>31<<2)+16|0;ea=c[Ea>>2]|0;if((ea|0)==0){break}if((c[ea+4>>2]&-8|0)==(xa|0)){Da=ea;break l}else{S=S<<1;ca=ea}}if(Ea>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[Ea>>2]=_;c[fa+($+24)>>2]=ca;c[fa+($+12)>>2]=_;c[fa+($+8)>>2]=_;break j}}}while(0);V=Da+8|0;S=c[V>>2]|0;L=c[6176>>2]|0;if(Da>>>0<L>>>0){Qa()}if(S>>>0<L>>>0){Qa()}else{c[S+12>>2]=_;c[V>>2]=_;c[fa+($+8)>>2]=S;c[fa+($+12)>>2]=Da;c[fa+($+24)>>2]=0;break}}}while(0);p=fa+(pa|8)|0;i=b;return p|0}}while(0);aa=ia;$=6608|0;while(1){Fa=c[$>>2]|0;if(!(Fa>>>0>aa>>>0)){Ga=c[$+4>>2]|0;Ha=Fa+Ga|0;if(Ha>>>0>aa>>>0){break}}$=c[$+8>>2]|0}$=Fa+(Ga+ -39)|0;if(($&7|0)==0){Ia=0}else{Ia=0-$&7}$=Fa+(Ga+ -47+Ia)|0;da=$>>>0<(ia+16|0)>>>0?aa:$;$=da+8|0;ba=$;M=fa+8|0;if((M&7|0)==0){Ja=0}else{Ja=0-M&7}M=ga+ -40-Ja|0;c[6184>>2]=fa+Ja;c[6172>>2]=M;c[fa+(Ja+4)>>2]=M|1;c[fa+(ga+ -36)>>2]=40;c[6188>>2]=c[6648>>2];c[da+4>>2]=27;c[$+0>>2]=c[6608>>2];c[$+4>>2]=c[6612>>2];c[$+8>>2]=c[6616>>2];c[$+12>>2]=c[6620>>2];c[6608>>2]=fa;c[6612>>2]=ga;c[6620>>2]=0;c[6616>>2]=ba;ba=da+28|0;c[ba>>2]=7;if((da+32|0)>>>0<Ha>>>0){$=ba;while(1){ba=$+4|0;c[ba>>2]=7;if(($+8|0)>>>0<Ha>>>0){$=ba}else{break}}}if((da|0)==(aa|0)){break}$=da-ia|0;ba=aa+($+4)|0;c[ba>>2]=c[ba>>2]&-2;c[ia+4>>2]=$|1;c[aa+$>>2]=$;ba=$>>>3;if($>>>0<256){M=ba<<1;ha=6200+(M<<2)|0;W=c[1540]|0;m=1<<ba;do{if((W&m|0)==0){c[1540]=W|m;La=6200+(M+2<<2)|0;Ma=ha}else{ba=6200+(M+2<<2)|0;S=c[ba>>2]|0;if(!(S>>>0<(c[6176>>2]|0)>>>0)){La=ba;Ma=S;break}Qa()}}while(0);c[La>>2]=ia;c[Ma+12>>2]=ia;c[ia+8>>2]=Ma;c[ia+12>>2]=ha;break}M=ia;m=$>>>8;do{if((m|0)==0){Na=0}else{if($>>>0>16777215){Na=31;break}W=(m+1048320|0)>>>16&8;aa=m<<W;da=(aa+520192|0)>>>16&4;S=aa<<da;aa=(S+245760|0)>>>16&2;ba=14-(da|W|aa)+(S<<aa>>>15)|0;Na=$>>>(ba+7|0)&1|ba<<1}}while(0);m=6464+(Na<<2)|0;c[ia+28>>2]=Na;c[ia+20>>2]=0;c[ia+16>>2]=0;ha=c[6164>>2]|0;ba=1<<Na;if((ha&ba|0)==0){c[6164>>2]=ha|ba;c[m>>2]=M;c[ia+24>>2]=m;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break}ba=c[m>>2]|0;if((Na|0)==31){Oa=0}else{Oa=25-(Na>>>1)|0}m:do{if((c[ba+4>>2]&-8|0)==($|0)){Pa=ba}else{m=$<<Oa;ha=ba;while(1){Ra=ha+(m>>>31<<2)+16|0;aa=c[Ra>>2]|0;if((aa|0)==0){break}if((c[aa+4>>2]&-8|0)==($|0)){Pa=aa;break m}else{m=m<<1;ha=aa}}if(Ra>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[Ra>>2]=M;c[ia+24>>2]=ha;c[ia+12>>2]=ia;c[ia+8>>2]=ia;break i}}}while(0);$=Pa+8|0;ba=c[$>>2]|0;m=c[6176>>2]|0;if(Pa>>>0<m>>>0){Qa()}if(ba>>>0<m>>>0){Qa()}else{c[ba+12>>2]=M;c[$>>2]=M;c[ia+8>>2]=ba;c[ia+12>>2]=Pa;c[ia+24>>2]=0;break}}}while(0);ia=c[6172>>2]|0;if(!(ia>>>0>q>>>0)){break}ba=ia-q|0;c[6172>>2]=ba;ia=c[6184>>2]|0;$=ia;c[6184>>2]=$+q;c[$+(q+4)>>2]=ba|1;c[ia+4>>2]=q|3;p=ia+8|0;i=b;return p|0}}while(0);c[(Ka()|0)>>2]=12;p=0;i=b;return p|0}function Rb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0;b=i;if((a|0)==0){i=b;return}d=a+ -8|0;e=d;f=c[6176>>2]|0;if(d>>>0<f>>>0){Qa()}g=c[a+ -4>>2]|0;h=g&3;if((h|0)==1){Qa()}j=g&-8;k=a+(j+ -8)|0;l=k;a:do{if((g&1|0)==0){m=c[d>>2]|0;if((h|0)==0){i=b;return}n=-8-m|0;o=a+n|0;p=o;q=m+j|0;if(o>>>0<f>>>0){Qa()}if((p|0)==(c[6180>>2]|0)){r=a+(j+ -4)|0;if((c[r>>2]&3|0)!=3){s=p;t=q;break}c[6168>>2]=q;c[r>>2]=c[r>>2]&-2;c[a+(n+4)>>2]=q|1;c[k>>2]=q;i=b;return}r=m>>>3;if(m>>>0<256){m=c[a+(n+8)>>2]|0;u=c[a+(n+12)>>2]|0;v=6200+(r<<1<<2)|0;do{if((m|0)!=(v|0)){if(m>>>0<f>>>0){Qa()}if((c[m+12>>2]|0)==(p|0)){break}Qa()}}while(0);if((u|0)==(m|0)){c[1540]=c[1540]&~(1<<r);s=p;t=q;break}do{if((u|0)==(v|0)){w=u+8|0}else{if(u>>>0<f>>>0){Qa()}x=u+8|0;if((c[x>>2]|0)==(p|0)){w=x;break}Qa()}}while(0);c[m+12>>2]=u;c[w>>2]=m;s=p;t=q;break}v=o;r=c[a+(n+24)>>2]|0;x=c[a+(n+12)>>2]|0;do{if((x|0)==(v|0)){y=a+(n+20)|0;z=c[y>>2]|0;if((z|0)==0){A=a+(n+16)|0;B=c[A>>2]|0;if((B|0)==0){C=0;break}else{D=B;E=A}}else{D=z;E=y}while(1){y=D+20|0;z=c[y>>2]|0;if((z|0)!=0){E=y;D=z;continue}z=D+16|0;y=c[z>>2]|0;if((y|0)==0){break}else{D=y;E=z}}if(E>>>0<f>>>0){Qa()}else{c[E>>2]=0;C=D;break}}else{z=c[a+(n+8)>>2]|0;if(z>>>0<f>>>0){Qa()}y=z+12|0;if((c[y>>2]|0)!=(v|0)){Qa()}A=x+8|0;if((c[A>>2]|0)==(v|0)){c[y>>2]=x;c[A>>2]=z;C=x;break}else{Qa()}}}while(0);if((r|0)==0){s=p;t=q;break}x=c[a+(n+28)>>2]|0;o=6464+(x<<2)|0;do{if((v|0)==(c[o>>2]|0)){c[o>>2]=C;if((C|0)!=0){break}c[6164>>2]=c[6164>>2]&~(1<<x);s=p;t=q;break a}else{if(r>>>0<(c[6176>>2]|0)>>>0){Qa()}m=r+16|0;if((c[m>>2]|0)==(v|0)){c[m>>2]=C}else{c[r+20>>2]=C}if((C|0)==0){s=p;t=q;break a}}}while(0);if(C>>>0<(c[6176>>2]|0)>>>0){Qa()}c[C+24>>2]=r;v=c[a+(n+16)>>2]|0;do{if((v|0)!=0){if(v>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[C+16>>2]=v;c[v+24>>2]=C;break}}}while(0);v=c[a+(n+20)>>2]|0;if((v|0)==0){s=p;t=q;break}if(v>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[C+20>>2]=v;c[v+24>>2]=C;s=p;t=q;break}}else{s=e;t=j}}while(0);e=s;if(!(e>>>0<k>>>0)){Qa()}C=a+(j+ -4)|0;f=c[C>>2]|0;if((f&1|0)==0){Qa()}do{if((f&2|0)==0){if((l|0)==(c[6184>>2]|0)){D=(c[6172>>2]|0)+t|0;c[6172>>2]=D;c[6184>>2]=s;c[s+4>>2]=D|1;if((s|0)!=(c[6180>>2]|0)){i=b;return}c[6180>>2]=0;c[6168>>2]=0;i=b;return}if((l|0)==(c[6180>>2]|0)){D=(c[6168>>2]|0)+t|0;c[6168>>2]=D;c[6180>>2]=s;c[s+4>>2]=D|1;c[e+D>>2]=D;i=b;return}D=(f&-8)+t|0;E=f>>>3;b:do{if(f>>>0<256){w=c[a+j>>2]|0;h=c[a+(j|4)>>2]|0;d=6200+(E<<1<<2)|0;do{if((w|0)!=(d|0)){if(w>>>0<(c[6176>>2]|0)>>>0){Qa()}if((c[w+12>>2]|0)==(l|0)){break}Qa()}}while(0);if((h|0)==(w|0)){c[1540]=c[1540]&~(1<<E);break}do{if((h|0)==(d|0)){F=h+8|0}else{if(h>>>0<(c[6176>>2]|0)>>>0){Qa()}g=h+8|0;if((c[g>>2]|0)==(l|0)){F=g;break}Qa()}}while(0);c[w+12>>2]=h;c[F>>2]=w}else{d=k;g=c[a+(j+16)>>2]|0;v=c[a+(j|4)>>2]|0;do{if((v|0)==(d|0)){r=a+(j+12)|0;x=c[r>>2]|0;if((x|0)==0){o=a+(j+8)|0;m=c[o>>2]|0;if((m|0)==0){G=0;break}else{H=m;I=o}}else{H=x;I=r}while(1){r=H+20|0;x=c[r>>2]|0;if((x|0)!=0){I=r;H=x;continue}x=H+16|0;r=c[x>>2]|0;if((r|0)==0){break}else{H=r;I=x}}if(I>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[I>>2]=0;G=H;break}}else{x=c[a+j>>2]|0;if(x>>>0<(c[6176>>2]|0)>>>0){Qa()}r=x+12|0;if((c[r>>2]|0)!=(d|0)){Qa()}o=v+8|0;if((c[o>>2]|0)==(d|0)){c[r>>2]=v;c[o>>2]=x;G=v;break}else{Qa()}}}while(0);if((g|0)==0){break}v=c[a+(j+20)>>2]|0;w=6464+(v<<2)|0;do{if((d|0)==(c[w>>2]|0)){c[w>>2]=G;if((G|0)!=0){break}c[6164>>2]=c[6164>>2]&~(1<<v);break b}else{if(g>>>0<(c[6176>>2]|0)>>>0){Qa()}h=g+16|0;if((c[h>>2]|0)==(d|0)){c[h>>2]=G}else{c[g+20>>2]=G}if((G|0)==0){break b}}}while(0);if(G>>>0<(c[6176>>2]|0)>>>0){Qa()}c[G+24>>2]=g;d=c[a+(j+8)>>2]|0;do{if((d|0)!=0){if(d>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[G+16>>2]=d;c[d+24>>2]=G;break}}}while(0);d=c[a+(j+12)>>2]|0;if((d|0)==0){break}if(d>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[G+20>>2]=d;c[d+24>>2]=G;break}}}while(0);c[s+4>>2]=D|1;c[e+D>>2]=D;if((s|0)!=(c[6180>>2]|0)){J=D;break}c[6168>>2]=D;i=b;return}else{c[C>>2]=f&-2;c[s+4>>2]=t|1;c[e+t>>2]=t;J=t}}while(0);t=J>>>3;if(J>>>0<256){e=t<<1;f=6200+(e<<2)|0;C=c[1540]|0;G=1<<t;do{if((C&G|0)==0){c[1540]=C|G;K=6200+(e+2<<2)|0;L=f}else{t=6200+(e+2<<2)|0;j=c[t>>2]|0;if(!(j>>>0<(c[6176>>2]|0)>>>0)){K=t;L=j;break}Qa()}}while(0);c[K>>2]=s;c[L+12>>2]=s;c[s+8>>2]=L;c[s+12>>2]=f;i=b;return}f=s;L=J>>>8;do{if((L|0)==0){M=0}else{if(J>>>0>16777215){M=31;break}K=(L+1048320|0)>>>16&8;e=L<<K;G=(e+520192|0)>>>16&4;C=e<<G;e=(C+245760|0)>>>16&2;j=14-(G|K|e)+(C<<e>>>15)|0;M=J>>>(j+7|0)&1|j<<1}}while(0);L=6464+(M<<2)|0;c[s+28>>2]=M;c[s+20>>2]=0;c[s+16>>2]=0;j=c[6164>>2]|0;e=1<<M;c:do{if((j&e|0)==0){c[6164>>2]=j|e;c[L>>2]=f;c[s+24>>2]=L;c[s+12>>2]=s;c[s+8>>2]=s}else{C=c[L>>2]|0;if((M|0)==31){N=0}else{N=25-(M>>>1)|0}d:do{if((c[C+4>>2]&-8|0)==(J|0)){O=C}else{K=J<<N;G=C;while(1){P=G+(K>>>31<<2)+16|0;t=c[P>>2]|0;if((t|0)==0){break}if((c[t+4>>2]&-8|0)==(J|0)){O=t;break d}else{K=K<<1;G=t}}if(P>>>0<(c[6176>>2]|0)>>>0){Qa()}else{c[P>>2]=f;c[s+24>>2]=G;c[s+12>>2]=s;c[s+8>>2]=s;break c}}}while(0);C=O+8|0;D=c[C>>2]|0;K=c[6176>>2]|0;if(O>>>0<K>>>0){Qa()}if(D>>>0<K>>>0){Qa()}else{c[D+12>>2]=f;c[C>>2]=f;c[s+8>>2]=D;c[s+12>>2]=O;c[s+24>>2]=0;break}}}while(0);s=(c[6192>>2]|0)+ -1|0;c[6192>>2]=s;if((s|0)==0){Q=6616|0}else{i=b;return}while(1){s=c[Q>>2]|0;if((s|0)==0){break}else{Q=s+8|0}}c[6192>>2]=-1;i=b;return}function Sb(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0;d=i;e=a[b]|0;f=a[c]|0;if(e<<24>>24!=f<<24>>24|e<<24>>24==0|f<<24>>24==0){g=e;h=f;j=g&255;k=h&255;l=j-k|0;i=d;return l|0}else{m=b;n=c}while(1){c=m+1|0;b=n+1|0;f=a[c]|0;e=a[b]|0;if(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0){g=f;h=e;break}else{n=b;m=c}}j=g&255;k=h&255;l=j-k|0;i=d;return l|0}function Tb(){}function Ub(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;g=b&3;h=d|d<<8|d<<16|d<<24;i=f&~3;if(g){g=b+4-g|0;while((b|0)<(g|0)){a[b]=d;b=b+1|0}}while((b|0)<(i|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}return b-e|0}function Vb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return va(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function Wb(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function Xb(a,b){a=a|0;b=b|0;return Xa[a&3](b|0)|0}function Yb(a,b){a=a|0;b=b|0;Ya[a&3](b|0)}function Zb(a,b,c){a=a|0;b=b|0;c=c|0;return Za[a&3](b|0,c|0)|0}function _b(a,b,c,d,e,f){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;f=f|0;_a[a&3](b|0,c|0,d|0,e|0,f|0)}function $b(a){a=a|0;aa(0);return 0}function ac(a){a=a|0;aa(1)}function bc(a,b){a=a|0;b=b|0;aa(2);return 0}function cc(a,b,c,d,e){a=a|0;b=b|0;c=c|0;d=d|0;e=e|0;aa(3)}




// EMSCRIPTEN_END_FUNCS
var Xa=[$b,xb,Cb,$b];var Ya=[ac,rb,vb,Ab];var Za=[bc,wb,Bb,bc];var _a=[cc,sb,yb,Db];return{_strlen:Wb,_free:Rb,_main:pb,_memset:Ub,_malloc:Qb,_memcpy:Vb,runPostSets:Tb,stackAlloc:$a,stackSave:ab,stackRestore:bb,setThrew:cb,setTempRet0:fb,setTempRet1:gb,setTempRet2:hb,setTempRet3:ib,setTempRet4:jb,setTempRet5:kb,setTempRet6:lb,setTempRet7:mb,setTempRet8:nb,setTempRet9:ob,dynCall_ii:Xb,dynCall_vi:Yb,dynCall_iii:Zb,dynCall_viiiii:_b}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_vi": invoke_vi, "invoke_iii": invoke_iii, "invoke_viiiii": invoke_viiiii, "_llvm_lifetime_start": _llvm_lifetime_start, "_send": _send, "_fread": _fread, "___setErrNo": ___setErrNo, "_strncat": _strncat, "_atoi": _atoi, "_fflush": _fflush, "_pwrite": _pwrite, "_strtol": _strtol, "__reallyNegative": __reallyNegative, "_sbrk": _sbrk, "_snprintf": _snprintf, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "__formatString": __formatString, "_sysconf": _sysconf, "_strchr": _strchr, "_strcspn": _strcspn, "_fgets": _fgets, "_putchar": _putchar, "_isspace": _isspace, "_pread": _pread, "_puts": _puts, "_printf": _printf, "_sprintf": _sprintf, "__parseInt": __parseInt, "_write": _write, "___errno_location": ___errno_location, "_recv": _recv, "_fgetc": _fgetc, "_fputc": _fputc, "_mkport": _mkport, "_read": _read, "_abort": _abort, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "_llvm_lifetime_end": _llvm_lifetime_end, "_fputs": _fputs, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stdin": _stdin, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];

Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
    Module.printErr('preload time: ' + (Date.now() - preloadStartTime) + ' ms');
  }

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






