(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";

require("core-js/shim");

require("regenerator/runtime");

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"core-js/shim":90,"regenerator/runtime":91}],2:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = $.toObject($this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(fromIndex, length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":23}],3:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function($this, callbackfn, that){
    var O      = Object($.assertDefined($this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, that, 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":23,"./$.ctx":11}],4:[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":23}],5:[function(require,module,exports){
var $        = require('./$')
  , enumKeys = require('./$.enum-keys');
// 19.1.2.1 Object.assign(target, source, ...)
/* eslint-disable no-unused-vars */
module.exports = Object.assign || function assign(target, source){
/* eslint-enable no-unused-vars */
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = enumKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":23,"./$.enum-keys":14}],6:[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":23,"./$.wks":41}],7:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , step     = require('./$.iter').step
  , $has     = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , isExtensible = Object.isExtensible || isObject
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      assert.inst(that, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  setIter: function(C, NAME, IS_MAP){
    require('./$.iter-define')(C, NAME, function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    }, function(){
      var iter  = this[ITER]
        , kind  = iter.k
        , entry = iter.l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
        // or finish the iteration
        iter.o = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);
  }
};
},{"./$":23,"./$.assert":4,"./$.ctx":11,"./$.for-of":15,"./$.iter":22,"./$.iter-define":20,"./$.mix":25,"./$.uid":39}],8:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $def  = require('./$.def')
  , forOf = require('./$.for-of');
module.exports = function(NAME){
  $def($def.P, NAME, {
    toJSON: function toJSON(){
      var arr = [];
      forOf(this, false, arr.push, arr);
      return arr;
    }
  });
};
},{"./$.def":12,"./$.for-of":15}],9:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.for-of')
  , $has      = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isExtensible = Object.isExtensible || isObject
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      $.set(assert.inst(that, C, NAME), ID, id++);
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    require('./$.mix')(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this)['delete'](key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        if(!isExtensible(key))return leakStore(this).has(key);
        return $has(key, WEAK) && $has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(!isExtensible(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      $has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":23,"./$.array-methods":3,"./$.assert":4,"./$.for-of":15,"./$.mix":25,"./$.uid":39}],10:[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , BUGGY = require('./$.iter').BUGGY
  , forOf = require('./$.for-of')
  , species = require('./$.species')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY){
    var fn = proto[KEY];
    require('./$.redef')(proto, KEY,
      KEY == 'delete' ? function(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'has' ? function has(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'get' ? function get(a){ return fn.call(this, a === 0 ? 0 : a); }
      : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
      : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  }
  if(!$.isFunction(C) || !(IS_WEAK || !BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    require('./$.mix')(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](IS_WEAK ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if(!require('./$.iter-detect')(function(iter){ new C(iter); })){ // eslint-disable-line no-new
      C = wrapper(function(target, iterable){
        assertInstance(target, C, NAME);
        var that = new Base;
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    IS_WEAK || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER);
  }

  require('./$.cof').set(C, NAME);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);
  species(C);
  species($.core[NAME]); // for wrapper

  if(!IS_WEAK)common.setIter(C, NAME, IS_MAP);

  return C;
};
},{"./$":23,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.for-of":15,"./$.iter":22,"./$.iter-detect":21,"./$.mix":25,"./$.redef":28,"./$.species":33}],11:[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":4}],12:[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction
  , $redef     = require('./$.redef');
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , isProto  = type & $def.P
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = isProto && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own)$redef(target, key, out);
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
    if(isProto)(exports.prototype || (exports.prototype = {}))[key] = out;
  }
}
module.exports = $def;
},{"./$":23,"./$.redef":28}],13:[function(require,module,exports){
var $        = require('./$')
  , document = $.g.document
  , isObject = $.isObject
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$":23}],14:[function(require,module,exports){
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getDesc    = $.getDesc
    , getSymbols = $.getSymbols;
  if(getSymbols)$.each.call(getSymbols(it), function(key){
    if(getDesc(it, key).enumerable)keys.push(key);
  });
  return keys;
};
},{"./$":23}],15:[function(require,module,exports){
var ctx  = require('./$.ctx')
  , get  = require('./$.iter').get
  , call = require('./$.iter-call');
module.exports = function(iterable, entries, fn, that){
  var iterator = get(iterable)
    , f        = ctx(fn, that, entries ? 2 : 1)
    , step;
  while(!(step = iterator.next()).done){
    if(call(iterator, f, step.value, entries) === false){
      return call.close(iterator);
    }
  }
};
},{"./$.ctx":11,"./$.iter":22,"./$.iter-call":19}],16:[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],17:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var $ = require('./$')
  , toString = {}.toString
  , getNames = $.getNames;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

function getWindowNames(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
}

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames($.toObject(it));
};
},{"./$":23}],18:[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],19:[function(require,module,exports){
var assertObject = require('./$.assert').obj;
function close(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function call(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    close(iterator);
    throw e;
  }
}
call.close = close;
module.exports = call;
},{"./$.assert":4}],20:[function(require,module,exports){
var $def            = require('./$.def')
  , $redef          = require('./$.redef')
  , $               = require('./$')
  , cof             = require('./$.cof')
  , $iter           = require('./$.iter')
  , SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , FF_ITERATOR     = '@@iterator'
  , KEYS            = 'keys'
  , VALUES          = 'values'
  , Iterators       = $iter.Iterators;
module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
  $iter.create(Constructor, NAME, next);
  function createMethod(kind){
    function $$(that){
      return new Constructor(that, kind);
    }
    switch(kind){
      case KEYS: return function keys(){ return $$(this); };
      case VALUES: return function values(){ return $$(this); };
    } return function entries(){ return $$(this); };
  }
  var TAG      = NAME + ' Iterator'
    , proto    = Base.prototype
    , _native  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , _default = _native || createMethod(DEFAULT)
    , methods, key;
  // Fix native
  if(_native){
    var IteratorPrototype = $.getProto(_default.call(new Base));
    // Set @@toStringTag to native iterators
    cof.set(IteratorPrototype, TAG, true);
    // FF fix
    if($.FW && $.has(proto, FF_ITERATOR))$iter.set(IteratorPrototype, $.that);
  }
  // Define iterator
  if($.FW || FORCE)$iter.set(proto, _default);
  // Plug for library
  Iterators[NAME] = _default;
  Iterators[TAG]  = $.that;
  if(DEFAULT){
    methods = {
      keys:    IS_SET            ? _default : createMethod(KEYS),
      values:  DEFAULT == VALUES ? _default : createMethod(VALUES),
      entries: DEFAULT != VALUES ? _default : createMethod('entries')
    };
    if(FORCE)for(key in methods){
      if(!(key in proto))$redef(proto, key, methods[key]);
    } else $def($def.P + $def.F * $iter.BUGGY, NAME, methods);
  }
};
},{"./$":23,"./$.cof":6,"./$.def":12,"./$.iter":22,"./$.redef":28,"./$.wks":41}],21:[function(require,module,exports){
var SYMBOL_ITERATOR = require('./$.wks')('iterator')
  , SAFE_CLOSING    = false;
try {
  var riter = [7][SYMBOL_ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }
module.exports = function(exec){
  if(!SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[SYMBOL_ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[SYMBOL_ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":41}],22:[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , cof               = require('./$.cof')
  , classof           = cof.classof
  , assert            = require('./$.assert')
  , assertObject      = assert.obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = require('./$.shared')('iterators')
  , IteratorPrototype = {};
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}

module.exports = {
  // Safari has buggy iterators w/o `next`
  BUGGY: 'keys' in [] && !('next' in [].keys()),
  Iterators: Iterators,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol;
    return (Symbol && Symbol.iterator || FF_ITERATOR) in O
      || SYMBOL_ITERATOR in O
      || $.has(Iterators, classof(O));
  },
  get: function(it){
    var Symbol = $.g.Symbol
      , getIter;
    if(it != undefined){
      getIter = it[Symbol && Symbol.iterator || FF_ITERATOR]
        || it[SYMBOL_ITERATOR]
        || Iterators[classof(it)];
    }
    assert($.isFunction(getIter), it, ' is not iterable!');
    return assertObject(getIter.call(it));
  },
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || IteratorPrototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  }
};
},{"./$":23,"./$.assert":4,"./$.cof":6,"./$.shared":32,"./$.wks":41}],23:[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value));
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  setDescs:   Object.defineProperties,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  assertDefined: assertDefined,
  // Dummy, fix for not array-like ES3 string in es5 module
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  each: [].forEach
});
/* eslint-disable no-undef */
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":16}],24:[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":23}],25:[function(require,module,exports){
var $redef = require('./$.redef');
module.exports = function(target, src){
  for(var key in src)$redef(target, key, src[key]);
  return target;
};
},{"./$.redef":28}],26:[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function ownKeys(it){
  assertObject(it);
  var keys       = $.getNames(it)
    , getSymbols = $.getSymbols;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"./$":23,"./$.assert":4}],27:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":23,"./$.assert":4,"./$.invoke":18}],28:[function(require,module,exports){
var $   = require('./$')
  , tpl = String({}.hasOwnProperty)
  , SRC = require('./$.uid').safe('src')
  , _toString = Function.toString;

function $redef(O, key, val, safe){
  if($.isFunction(val)){
    var base = O[key];
    $.hide(val, SRC, base ? String(base) : tpl.replace(/hasOwnProperty/, String(key)));
    if(!('name' in val))val.name = key;
  }
  if(O === $.g){
    O[key] = val;
  } else {
    if(!safe)delete O[key];
    $.hide(O, key, val);
  }
}

// add fake Function#toString for correct work wrapped methods / constructors
// with methods similar to LoDash isNative
$redef(Function.prototype, 'toString', function toString(){
  return $.has(this, SRC) ? this[SRC] : _toString.call(this);
});

$.core.inspectSource = function(it){
  return _toString.call(it);
};

module.exports = $redef;
},{"./$":23,"./$.uid":39}],29:[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],30:[function(require,module,exports){
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],31:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
function check(O, proto){
  assert.obj(O);
  assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
}
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
    ? function(buggy, set){
        try {
          set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
          set({}, []);
        } catch(e){ buggy = true; }
        return function setPrototypeOf(O, proto){
          check(O, proto);
          if(buggy)O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }()
    : undefined),
  check: check
};
},{"./$":23,"./$.assert":4,"./$.ctx":11}],32:[function(require,module,exports){
var $      = require('./$')
  , SHARED = '__core-js_shared__'
  , store  = $.g[SHARED] || $.hide($.g, SHARED, {})[SHARED];
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$":23}],33:[function(require,module,exports){
var $       = require('./$')
  , SPECIES = require('./$.wks')('species');
module.exports = function(C){
  if($.DESC && !(SPECIES in C))$.setDesc(C, SPECIES, {
    configurable: true,
    get: $.that
  });
};
},{"./$":23,"./$.wks":41}],34:[function(require,module,exports){
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String($.assertDefined(that))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":23}],35:[function(require,module,exports){
// http://wiki.ecmascript.org/doku.php?id=strawman:string_padding
var $      = require('./$')
  , repeat = require('./$.string-repeat');

module.exports = function(that, minLength, fillChar, left){
  // 1. Let O be CheckObjectCoercible(this value).
  // 2. Let S be ToString(O).
  var S = String($.assertDefined(that));
  // 4. If intMinLength is undefined, return S.
  if(minLength === undefined)return S;
  // 4. Let intMinLength be ToInteger(minLength).
  var intMinLength = $.toInteger(minLength);
  // 5. Let fillLen be the number of characters in S minus intMinLength.
  var fillLen = intMinLength - S.length;
  // 6. If fillLen < 0, then throw a RangeError exception.
  // 7. If fillLen is +∞, then throw a RangeError exception.
  if(fillLen < 0 || fillLen === Infinity){
    throw new RangeError('Cannot satisfy string length ' + minLength + ' for string: ' + S);
  }
  // 8. Let sFillStr be the string represented by fillStr.
  // 9. If sFillStr is undefined, let sFillStr be a space character.
  var sFillStr = fillChar === undefined ? ' ' : String(fillChar);
  // 10. Let sFillVal be a String made of sFillStr, repeated until fillLen is met.
  var sFillVal = repeat.call(sFillStr, Math.ceil(fillLen / sFillStr.length));
  // truncate if we overflowed
  if(sFillVal.length > fillLen)sFillVal = left
    ? sFillVal.slice(sFillVal.length - fillLen)
    : sFillVal.slice(0, fillLen);
  // 11. Return a string made from sFillVal, followed by S.
  // 11. Return a String made from S, followed by sFillVal.
  return left ? sFillVal.concat(S) : S.concat(sFillVal);
};
},{"./$":23,"./$.string-repeat":36}],36:[function(require,module,exports){
'use strict';
var $ = require('./$');

module.exports = function repeat(count){
  var str = String($.assertDefined(this))
    , res = ''
    , n   = $.toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"./$":23}],37:[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , cel    = require('./$.dom-create')
  , global             = $.g
  , isFunction         = $.isFunction
  , html               = $.html
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !global.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":23,"./$.cof":6,"./$.ctx":11,"./$.dom-create":13,"./$.invoke":18}],38:[function(require,module,exports){
module.exports = function(exec){
  try {
    exec();
    return false;
  } catch(e){
    return true;
  }
};
},{}],39:[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++sid + Math.random()).toString(36));
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":23}],40:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./$.wks')('unscopables');
if(!(UNSCOPABLES in []))require('./$').hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  [][UNSCOPABLES][key] = true;
};
},{"./$":23,"./$.wks":41}],41:[function(require,module,exports){
var global = require('./$').g
  , store  = require('./$.shared')('wks');
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":23,"./$.shared":32,"./$.uid":39}],42:[function(require,module,exports){
var $                = require('./$')
  , cel              = require('./$.dom-create')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , html             = $.html
  , A                = []
  , _slice           = A.slice
  , _join            = A.join
  , classof          = cof.classof
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , defineProperties = $.setDescs
  , isFunction       = $.isFunction
  , isObject         = $.isObject
  , toObject         = $.toObject
  , toLength         = $.toLength
  , toIndex          = $.toIndex
  , IE8_DOM_DEFINE   = false
  , $indexOf         = require('./$.array-includes')(false)
  , $forEach         = arrayMethod(0)
  , $map             = arrayMethod(1)
  , $filter          = arrayMethod(2)
  , $some            = arrayMethod(3)
  , $every           = arrayMethod(4);

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(cel('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  $.setDescs = defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = cel('iframe')
    , i      = keysLen1
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~$indexOf(result, key) || result.push(key);
    }
    return result;
  };
}
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: function seal(it){
    return it; // <- cap
  },
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: function freeze(it){
    return it; // <- cap
  },
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: function preventExtensions(it){
    return it; // <- cap
  },
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: function isSealed(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: function isFrozen(it){
    return !isObject(it); // <- cap
  },
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: function isExtensible(it){
    return isObject(it); // <- cap
  }
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = _slice.call(arguments, 1);
    function bound(/* args... */){
      var args   = partArgs.concat(_slice.call(arguments))
        , constr = this instanceof bound
        , ctx    = constr ? $.create(fn.prototype) : that
        , result = invoke(fn, args, ctx);
      return constr ? ctx : result;
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string and DOM objects
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}

var buggySlice = true;
try {
  if(html)_slice.call(html);
  buggySlice = false;
} catch(e){ /* empty */ }

$def($def.P + $def.F * buggySlice, 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return _slice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});

$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  join: function join(){
    return _join.apply($.ES5Object(this), arguments);
  }
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || function forEach(callbackfn/*, that = undefined */){
    return $forEach(this, callbackfn, arguments[1]);
  },
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn/*, that = undefined */){
    return $map(this, callbackfn, arguments[1]);
  },
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn/*, that = undefined */){
    return $filter(this, callbackfn, arguments[1]);
  },
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn/*, that = undefined */){
    return $some(this, callbackfn, arguments[1]);
  },
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn/*, that = undefined */){
    return $every(this, callbackfn, arguments[1]);
  },
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(el /*, fromIndex = 0 */){
    return $indexOf(this, el, arguments[1]);
  },
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}

// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
// PhantomJS and old webkit had a broken Date implementation.
var date       = new Date(-5e13 - 1)
  , brokenDate = !(date.toISOString && date.toISOString() == '0385-07-25T07:06:39.999Z'
      && require('./$.throws')(function(){ new Date(NaN).toISOString(); }));
$def($def.P + $def.F * brokenDate, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":23,"./$.array-includes":2,"./$.array-methods":3,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.dom-create":13,"./$.invoke":18,"./$.replacer":29,"./$.throws":38,"./$.uid":39}],43:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function copyWithin(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":23,"./$.def":12,"./$.unscope":40}],44:[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function fill(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":23,"./$.def":12,"./$.unscope":40}],45:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var KEY    = 'findIndex'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(6);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":40}],46:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var KEY    = 'find'
  , $def   = require('./$.def')
  , forced = true
  , $find  = require('./$.array-methods')(5);
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$def($def.P + $def.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments[1]);
  }
});
require('./$.unscope')(KEY);
},{"./$.array-methods":3,"./$.def":12,"./$.unscope":40}],47:[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , call  = require('./$.iter-call');
$def($def.S + $def.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":23,"./$.ctx":11,"./$.def":12,"./$.iter":22,"./$.iter-call":19,"./$.iter-detect":21}],48:[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":23,"./$.iter":22,"./$.iter-define":20,"./$.uid":39,"./$.unscope":40}],49:[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":12}],50:[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":33}],51:[function(require,module,exports){
var $             = require('./$')
  , HAS_INSTANCE  = require('./$.wks')('hasInstance')
  , FunctionProto = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))$.setDesc(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(!$.isFunction(this) || !$.isObject(O))return false;
  if(!$.isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = $.getProto(O))if(this.prototype === O)return true;
  return false;
}});
},{"./$":23,"./$.wks":41}],52:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":23}],53:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', function(get){
  return function Map(){ return get(this, arguments[0]); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":10,"./$.collection-strong":7}],54:[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);
function roundTiesToEven(n){
  return n + 1 / EPSILON - 1 / EPSILON;
}

// 20.2.2.28 Math.sign(x)
function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
}
// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function cbrt(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - floor(log(x + 0.5) * Math.LOG2E) : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  fround: function fround(x){
    var $abs  = abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , len  = arguments.length
      , larg = 0
      , arg, div;
    while(i < len){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function imul(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function log1p(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function log10(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function log2(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function sinh(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function trunc(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":12}],55:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , $Number    = $.g[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    return this instanceof $Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has($Number, key)){
        $.setDesc($Number, key, $.getDesc(Base, key));
      }
    }
  );
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./$.redef')($.g, NUMBER, $Number);
}
},{"./$":23,"./$.redef":28}],56:[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , _isFinite = $.g.isFinite
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && _isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function isNaN(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":23,"./$.def":12}],57:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":5,"./$.def":12}],58:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: require('./$.same')
});
},{"./$.def":12,"./$.same":30}],59:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.def":12,"./$.set-proto":31}],60:[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
$.each.call(('freeze,seal,preventExtensions,isFrozen,isSealed,isExtensible,' +
  'getOwnPropertyDescriptor,getPrototypeOf,keys,getOwnPropertyNames').split(',')
, function(KEY, ID){
  var fn     = ($.core.Object || {})[KEY] || Object[KEY]
    , forced = 0
    , method = {};
  method[KEY] = ID == 0 ? function freeze(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 1 ? function seal(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 2 ? function preventExtensions(it){
    return isObject(it) ? fn(it) : it;
  } : ID == 3 ? function isFrozen(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 4 ? function isSealed(it){
    return isObject(it) ? fn(it) : true;
  } : ID == 5 ? function isExtensible(it){
    return isObject(it) ? fn(it) : false;
  } : ID == 6 ? function getOwnPropertyDescriptor(it, key){
    return fn(toObject(it), key);
  } : ID == 7 ? function getPrototypeOf(it){
    return fn(Object($.assertDefined(it)));
  } : ID == 8 ? function keys(it){
    return fn(toObject(it));
  } : require('./$.get-names').get;
  try {
    fn('z');
  } catch(e){
    forced = 1;
  }
  $def($def.S + $def.F * forced, 'Object', method);
});
},{"./$":23,"./$.def":12,"./$.get-names":17}],61:[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if(require('./$').FW && cof(tmp) != 'z'){
  require('./$.redef')(Object.prototype, 'toString', function toString(){
    return '[object ' + cof.classof(this) + ']';
  }, true);
}
},{"./$":23,"./$.cof":6,"./$.redef":28,"./$.wks":41}],62:[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , cof      = require('./$.cof')
  , $def     = require('./$.def')
  , assert   = require('./$.assert')
  , forOf    = require('./$.for-of')
  , setProto = require('./$.set-proto').set
  , same     = require('./$.same')
  , species  = require('./$.species')
  , SPECIES  = require('./$.wks')('species')
  , RECORD   = require('./$.uid').safe('record')
  , PROMISE  = 'Promise'
  , global   = $.g
  , process  = global.process
  , asap     = process && process.nextTick || require('./$.task').set
  , P        = global[PROMISE]
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , Wrapper;

function testResolve(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
}

var useNative = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = isFunction(P) && isFunction(P.resolve) && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && $.DESC){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
function isPromise(it){
  return isObject(it) && (useNative ? cof.classof(it) == 'Promise' : RECORD in it);
}
function sameConstructor(a, b){
  // library wrapper special case
  if(!$.FW && a === P && b === Wrapper)return true;
  return same(a, b);
}
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
function isThenable(it){
  var then;
  if(isObject(it))then = it.then;
  return isFunction(then) ? then : false;
}
function notify(record){
  var chain = record.c;
  if(chain.length)asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    function run(react){
      var cb = ok ? react.ok : react.fail
        , ret, then;
      try {
        if(cb){
          if(!ok)record.h = true;
          ret = cb === true ? value : cb(value);
          if(ret === react.P){
            react.rej(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(ret)){
            then.call(ret, react.res, react.rej);
          } else react.res(ret);
        } else react.rej(value);
      } catch(err){
        react.rej(err);
      }
    }
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
  });
}
function isUnhandled(promise){
  var record = promise[RECORD]
    , chain  = record.a || record.c
    , i      = 0
    , react;
  if(record.h)return false;
  while(chain.length > i){
    react = chain[i++];
    if(react.fail || !isUnhandled(react.P))return false;
  } return true;
}
function $reject(value){
  var record = this
    , promise;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  setTimeout(function(){
    asap(function(){
      if(isUnhandled(promise = record.p)){
        if(cof(process) == 'process'){
          process.emit('unhandledRejection', value, promise);
        } else if(global.console && isFunction(console.error)){
          console.error('Unhandled promise rejection', value);
        }
      }
      record.a = undefined;
    });
  }, 1);
  notify(record);
}
function $resolve(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
}

// constructor polyfill
if(!useNative){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, P, PROMISE),       // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.mix')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var promise = react.P = new (S != undefined ? S : P)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      if(record.a)record.a.push(react);
      if(record.s)notify(record);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

// export
$def($def.G + $def.W + $def.F * !useNative, {Promise: P});
cof.set(P, PROMISE);
species(P);
species(Wrapper = $.core[PROMISE]);

// statics
$def($def.S + $def.F * !useNative, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    return new (getConstructor(this))(function(res, rej){ rej(r); });
  }
});
$def($def.S + $def.F * (!useNative || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    return isPromise(x) && sameConstructor(x.constructor, this)
      ? x : new this(function(res){ res(x); });
  }
});
$def($def.S + $def.F * !(useNative && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(res, rej){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || res(results);
        }, rej);
      });
      else res(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C = getConstructor(this);
    return new C(function(res, rej){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(res, rej);
      });
    });
  }
});
},{"./$":23,"./$.assert":4,"./$.cof":6,"./$.ctx":11,"./$.def":12,"./$.for-of":15,"./$.iter-detect":21,"./$.mix":25,"./$.same":30,"./$.set-proto":31,"./$.species":33,"./$.task":37,"./$.uid":39,"./$.wks":41}],63:[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITERATOR  = require('./$.wks')('iterator')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getProto  = $.getProto
  , $Reflect  = $.g.Reflect
  , _apply    = Function.apply
  , assertObject = assert.obj
  , _isExtensible = Object.isExtensible || isObject
  , _preventExtensions = Object.preventExtensions
  // IE TP has broken Reflect.enumerate
  , buggyEnumerate = !($Reflect && $Reflect.enumerate && ITERATOR in $Reflect.enumerate({}));

function Enumerate(iterated){
  $.set(this, ITER, {o: iterated, k: undefined, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.k
    , key;
  if(keys == undefined){
    iter.k = keys = [];
    for(key in iter.o)keys.push(key);
  }
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: function apply(target, thisArgument, argumentsList){
    return _apply.call(target, thisArgument, argumentsList);
  },
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function construct(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = _apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: function defineProperty(target, propertyKey, attributes){
    assertObject(target);
    try {
      $.setDesc(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = $.getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: function get(target, propertyKey/*, receiver*/){
    var receiver = arguments.length < 3 ? target : arguments[2]
      , desc = $.getDesc(assertObject(target), propertyKey), proto;
    if(desc)return $.has(desc, 'value')
      ? desc.value
      : desc.get === undefined
        ? undefined
        : desc.get.call(receiver);
    return isObject(proto = getProto(target))
      ? get(proto, propertyKey, receiver)
      : undefined;
  },
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return $.getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function has(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function isExtensible(target){
    return _isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: function preventExtensions(target){
    assertObject(target);
    try {
      if(_preventExtensions)_preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  },
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: function set(target, propertyKey, V/*, receiver*/){
    var receiver = arguments.length < 4 ? target : arguments[3]
      , ownDesc  = $.getDesc(assertObject(target), propertyKey)
      , existingDescriptor, proto;
    if(!ownDesc){
      if(isObject(proto = getProto(target))){
        return set(proto, propertyKey, V, receiver);
      }
      ownDesc = $.desc(0);
    }
    if($.has(ownDesc, 'value')){
      if(ownDesc.writable === false || !isObject(receiver))return false;
      existingDescriptor = $.getDesc(receiver, propertyKey) || $.desc(0);
      existingDescriptor.value = V;
      $.setDesc(receiver, propertyKey, existingDescriptor);
      return true;
    }
    return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
  }
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function setPrototypeOf(target, proto){
  setProto.check(target, proto);
  try {
    setProto.set(target, proto);
    return true;
  } catch(e){
    return false;
  }
};

$def($def.G, {Reflect: {}});

$def($def.S + $def.F * buggyEnumerate, 'Reflect', {
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function enumerate(target){
    return new Enumerate(assertObject(target));
  }
});

$def($def.S, 'Reflect', reflect);
},{"./$":23,"./$.assert":4,"./$.def":12,"./$.iter":22,"./$.own-keys":26,"./$.set-proto":31,"./$.uid":39,"./$.wks":41}],64:[function(require,module,exports){
var $       = require('./$')
  , cof     = require('./$.cof')
  , $RegExp = $.g.RegExp
  , Base    = $RegExp
  , proto   = $RegExp.prototype
  , re      = /a/g
  // "new" creates a new object
  , CORRECT_NEW = new $RegExp(re) !== re
  // RegExp allows a regex with flags as the pattern
  , ALLOWS_RE_WITH_FLAGS = function(){
    try {
      return $RegExp(re, 'i') == '/a/i';
    } catch(e){ /* empty */ }
  }();
if($.FW && $.DESC){
  if(!CORRECT_NEW || !ALLOWS_RE_WITH_FLAGS){
    $RegExp = function RegExp(pattern, flags){
      var patternIsRegExp  = cof(pattern) == 'RegExp'
        , flagsIsUndefined = flags === undefined;
      if(!(this instanceof $RegExp) && patternIsRegExp && flagsIsUndefined)return pattern;
      return CORRECT_NEW
        ? new Base(patternIsRegExp && !flagsIsUndefined ? pattern.source : pattern, flags)
        : new Base(patternIsRegExp ? pattern.source : pattern
          , patternIsRegExp && flagsIsUndefined ? pattern.flags : flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in $RegExp || $.setDesc($RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = $RegExp;
    $RegExp.prototype = proto;
    require('./$.redef')($.g, 'RegExp', $RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')($RegExp);
},{"./$":23,"./$.cof":6,"./$.redef":28,"./$.replacer":29,"./$.species":33}],65:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', function(get){
  return function Set(){ return get(this, arguments[0]); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":10,"./$.collection-strong":7}],66:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(false);
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":34}],67:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.endsWith(/./); }), 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":23,"./$.cof":6,"./$.def":12,"./$.throws":38}],68:[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$def($def.S + $def.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":23,"./$.def":12}],69:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function includes(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":23,"./$.cof":6,"./$.def":12}],70:[function(require,module,exports){
var set   = require('./$').set
  , $at   = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = $at(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":23,"./$.iter":22,"./$.iter-define":20,"./$.string-at":34,"./$.uid":39}],71:[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl = $.toObject(callSite.raw)
      , len = $.toLength(tpl.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":23,"./$.def":12}],72:[function(require,module,exports){
var $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./$.string-repeat')
});
},{"./$.def":12,"./$.string-repeat":36}],73:[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

// should throw error on regex
$def($def.P + $def.F * !require('./$.throws')(function(){ 'q'.startsWith(/./); }), 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function startsWith(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":23,"./$.cof":6,"./$.def":12,"./$.throws":38}],74:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , shared   = require('./$.shared')
  , $def     = require('./$.def')
  , $redef   = require('./$.redef')
  , keyOf    = require('./$.keyof')
  , enumKeys = require('./$.enum-keys')
  , assertObject = require('./$.assert').obj
  , ObjectProto = Object.prototype
  , DESC     = $.DESC
  , has      = $.has
  , $create  = $.create
  , getDesc  = $.getDesc
  , setDesc  = $.setDesc
  , desc     = $.desc
  , $names   = require('./$.get-names')
  , getNames = $names.get
  , toObject = $.toObject
  , $Symbol  = $.g.Symbol
  , setter   = false
  , TAG      = uid('tag')
  , HIDDEN   = uid('hidden')
  , _propertyIsEnumerable = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols = shared('symbols')
  , useNative = $.isFunction($Symbol);

var setSymbolDesc = DESC ? function(){ // fallback for old Android
  try {
    return $create(setDesc({}, HIDDEN, {
      get: function(){
        return setDesc(this, HIDDEN, {value: false})[HIDDEN];
      }
    }))[HIDDEN] || setDesc;
  } catch(e){
    return function(it, key, D){
      var protoDesc = getDesc(ObjectProto, key);
      if(protoDesc)delete ObjectProto[key];
      setDesc(it, key, D);
      if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
    };
  }
}() : setDesc;

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($create($Symbol.prototype), TAG, tag);
  DESC && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, desc(1, value));
    }
  });
  return sym;
}

function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, desc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = $create(D, {enumerable: desc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
}
function defineProperties(it, P){
  assertObject(it);
  var keys = enumKeys(P = toObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)defineProperty(it, key = keys[i++], P[key]);
  return it;
}
function create(it, P){
  return P === undefined ? $create(it) : defineProperties($create(it), P);
}
function propertyIsEnumerable(key){
  var E = _propertyIsEnumerable.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
}
function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
}
function getOwnPropertyNames(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
}
function getOwnPropertySymbols(it){
  var names  = getNames(toObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
}

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments[0]));
  };
  $redef($Symbol.prototype, 'toString', function(){
    return this[TAG];
  });

  $.create     = create;
  $.setDesc    = defineProperty;
  $.getDesc    = getOwnPropertyDescriptor;
  $.setDescs   = defineProperties;
  $.getNames   = $names.get = getOwnPropertyNames;
  $.getSymbols = getOwnPropertySymbols;

  if($.DESC && $.FW)$redef(ObjectProto, 'propertyIsEnumerable', propertyIsEnumerable, true);
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  }
);

setter = true;

$def($def.G + $def.W, {Symbol: $Symbol});

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: getOwnPropertySymbols
});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":23,"./$.assert":4,"./$.cof":6,"./$.def":12,"./$.enum-keys":14,"./$.get-names":17,"./$.keyof":24,"./$.redef":28,"./$.shared":32,"./$.uid":39,"./$.wks":41}],75:[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isExtensible = Object.isExtensible || isObject
  , tmp       = {};

// 23.3 WeakMap Objects
var $WeakMap = require('./$.collection')('WeakMap', function(get){
  return function WeakMap(){ return get(this, arguments[0]); };
}, {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      if(!isExtensible(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    require('./$.redef')(proto, key, function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && !isExtensible(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"./$":23,"./$.collection":10,"./$.collection-weak":9,"./$.redef":28}],76:[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments[0]); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":10,"./$.collection-weak":9}],77:[function(require,module,exports){
'use strict';
var $def      = require('./$.def')
  , $includes = require('./$.array-includes')(true);
$def($def.P, 'Array', {
  // https://github.com/domenic/Array.prototype.includes
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments[1]);
  }
});
require('./$.unscope')('includes');
},{"./$.array-includes":2,"./$.def":12,"./$.unscope":40}],78:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Map');
},{"./$.collection-to-json":8}],79:[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":23,"./$.def":12,"./$.own-keys":26}],80:[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(O)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":23,"./$.def":12}],81:[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":12,"./$.replacer":29}],82:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
require('./$.collection-to-json')('Set');
},{"./$.collection-to-json":8}],83:[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
'use strict';
var $def = require('./$.def')
  , $at  = require('./$.string-at')(true);
$def($def.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"./$.def":12,"./$.string-at":34}],84:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  lpad: function lpad(n){
    return $pad(this, n, arguments[1], true);
  }
});
},{"./$.def":12,"./$.string-pad":35}],85:[function(require,module,exports){
'use strict';
var $def = require('./$.def')
  , $pad = require('./$.string-pad');
$def($def.P, 'String', {
  rpad: function rpad(n){
    return $pad(this, n, arguments[1], false);
  }
});
},{"./$.def":12,"./$.string-pad":35}],86:[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , $Array  = $.core.Array || Array
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in $Array)statics[key] = $Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":23,"./$.ctx":11,"./$.def":12}],87:[function(require,module,exports){
require('./es6.array.iterator');
var $           = require('./$')
  , Iterators   = require('./$.iter').Iterators
  , ITERATOR    = require('./$.wks')('iterator')
  , ArrayValues = Iterators.Array
  , NL          = $.g.NodeList
  , HTC         = $.g.HTMLCollection
  , NLProto     = NL && NL.prototype
  , HTCProto    = HTC && HTC.prototype;
if($.FW){
  if(NL && !(ITERATOR in NLProto))$.hide(NLProto, ITERATOR, ArrayValues);
  if(HTC && !(ITERATOR in HTCProto))$.hide(HTCProto, ITERATOR, ArrayValues);
}
Iterators.NodeList = Iterators.HTMLCollection = ArrayValues;
},{"./$":23,"./$.iter":22,"./$.wks":41,"./es6.array.iterator":48}],88:[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":12,"./$.task":37}],89:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $         = require('./$')
  , $def      = require('./$.def')
  , invoke    = require('./$.invoke')
  , partial   = require('./$.partial')
  , navigator = $.g.navigator
  , MSIE      = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":23,"./$.def":12,"./$.invoke":18,"./$.partial":27}],90:[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.function.has-instance');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.string.lpad');
require('./modules/es7.string.rpad');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/es7.map.to-json');
require('./modules/es7.set.to-json');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;

},{"./modules/$":23,"./modules/es5":42,"./modules/es6.array.copy-within":43,"./modules/es6.array.fill":44,"./modules/es6.array.find":46,"./modules/es6.array.find-index":45,"./modules/es6.array.from":47,"./modules/es6.array.iterator":48,"./modules/es6.array.of":49,"./modules/es6.array.species":50,"./modules/es6.function.has-instance":51,"./modules/es6.function.name":52,"./modules/es6.map":53,"./modules/es6.math":54,"./modules/es6.number.constructor":55,"./modules/es6.number.statics":56,"./modules/es6.object.assign":57,"./modules/es6.object.is":58,"./modules/es6.object.set-prototype-of":59,"./modules/es6.object.statics-accept-primitives":60,"./modules/es6.object.to-string":61,"./modules/es6.promise":62,"./modules/es6.reflect":63,"./modules/es6.regexp":64,"./modules/es6.set":65,"./modules/es6.string.code-point-at":66,"./modules/es6.string.ends-with":67,"./modules/es6.string.from-code-point":68,"./modules/es6.string.includes":69,"./modules/es6.string.iterator":70,"./modules/es6.string.raw":71,"./modules/es6.string.repeat":72,"./modules/es6.string.starts-with":73,"./modules/es6.symbol":74,"./modules/es6.weak-map":75,"./modules/es6.weak-set":76,"./modules/es7.array.includes":77,"./modules/es7.map.to-json":78,"./modules/es7.object.get-own-property-descriptors":79,"./modules/es7.object.to-array":80,"./modules/es7.regexp.escape":81,"./modules/es7.set.to-json":82,"./modules/es7.string.at":83,"./modules/es7.string.lpad":84,"./modules/es7.string.rpad":85,"./modules/js.array.statics":86,"./modules/web.dom.iterable":87,"./modules/web.immediate":88,"./modules/web.timers":89}],91:[function(require,module,exports){
(function (process,global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);

    generator._invoke = makeInvokeMethod(
      innerFn, self || null,
      new Context(tryLocsList || [])
    );

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    // This invoke function is written in a style that assumes some
    // calling function (or Promise) will handle exceptions.
    function invoke(method, arg) {
      var result = generator[method](arg);
      var value = result.value;
      return value instanceof AwaitArgument
        ? Promise.resolve(value.arg).then(invokeNext, invokeThrow)
        : result;
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var invokeNext = invoke.bind(generator, "next");
    var invokeThrow = invoke.bind(generator, "throw");
    var invokeReturn = invoke.bind(generator, "return");
    var previousPromise;

    function enqueue(method, arg) {
      var enqueueResult =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(function() {
          return invoke(method, arg);
        }) : new Promise(function(resolve) {
          resolve(invoke(method, arg));
        });

      // Avoid propagating enqueueResult failures to Promises returned by
      // later invocations of the iterator, and call generator.return() to
      // allow the generator a chance to clean up.
      previousPromise = enqueueResult.catch(invokeReturn);

      return enqueueResult;
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":94}],92:[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":1}],93:[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":92}],94:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],95:[function(require,module,exports){
/*
 * ===========================================================================
 * File: starfield.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var MaxLayers = 8;
var NumSparklingStars = 3;

var Starfield = (function () {
    function Starfield(parent) {
        var numLayers = arguments[1] === undefined ? 8 : arguments[1];
        var starsEachLayer = arguments[2] === undefined ? 100 : arguments[2];

        _classCallCheck(this, Starfield);

        this._parent = parent;
        this._numLayers = Math.min(MaxLayers, numLayers);
        this._starsEachLayer = starsEachLayer;

        this._stars = this._parent.add.group();
        this._sparklingStars = this._parent.add.group();

        this._createStars();
        this._createSparklingStars();
    }

    _createClass(Starfield, [{
        key: 'update',
        value: function update() {
            var w = this._parent.game.width;
            var world = this._parent.world;

            for (var i = 0, l = this._stars.total; i < l; i++) {
                var star = this._stars.getAt(i);
                var depth = i % this._numLayers;

                var speed = depth < 1 ? 1.5 : depth * 1.5;
                star.x -= star.isShootingStar ? speed * 2 : speed;

                if (star.x < 0) {
                    star.x = w + 32;
                    star.y = world.randomY;
                }
            }
        }
    }, {
        key: '_createStars',
        value: function _createStars() {
            var world = this._parent.world;

            for (var i = 0; i < this._numLayers * this._starsEachLayer; i++) {
                var star = this._stars.create(world.randomX, world.randomY, this._parent.cache.getBitmapData(_const2['default'].FILLED_RECT));
                var depth = i % this._numLayers;

                star.anchor.set(0.5);
                star.width = star.height = 2;
                star.alpha = (depth + 1) / this._numLayers;

                // set a select few stars to be shooting stars
                if (star.alpha === 1 && Phaser.Math.chanceRoll(10)) {
                    star.width = 16;
                    star.isShootingStar = true;
                }
            }
        }
    }, {
        key: '_createSparklingStars',
        value: function _createSparklingStars() {
            var _this = this;

            var world = this._parent.game.world;

            var _loop = function () {
                var star = _this._sparklingStars.create(world.randomX, world.randomY, _const2['default'].SPRITE_SHEET, 314);

                star.anchor.set(0.5);
                star.scale.set(2);

                var duration = _this._parent.rnd.between(500, 850);
                var delay = _this._parent.rnd.between(250, 500);
                _this._parent.add.tween(star.scale).to({ x: 0, y: 0 }, duration, Phaser.Easing.Sinusoidal.Out, true, delay, -1, true).onLoop.add(function (s, t) {
                    return _this._onSparklingStarUpdate(star);
                });
            };

            for (var i = 0; i < NumSparklingStars; i++) {
                _loop();
            }
        }
    }, {
        key: '_onSparklingStarUpdate',
        value: function _onSparklingStarUpdate(star) {
            var world = this._parent.world;

            star.x = world.randomX;
            star.y = world.randomY;
        }
    }]);

    return Starfield;
})();

exports['default'] = Starfield;
module.exports = exports['default'];

},{"const":119}],96:[function(require,module,exports){
/*
 * ===========================================================================
 * File: entity.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var Entity = (function (_Phaser$Sprite) {
    function Entity(game, x, y, key, frame) {
        _classCallCheck(this, Entity);

        _get(Object.getPrototypeOf(Entity.prototype), "constructor", this).call(this, game, x, y, key, frame);

        this.facing = Phaser.LEFT;
    }

    _inherits(Entity, _Phaser$Sprite);

    _createClass(Entity, [{
        key: "setup",
        value: function setup(level) {
            level.physics.enable(this, Phaser.Physics.ARCADE);
            this.anchor.set(0.5, 1);
            this.body.fixedRotation = true;
        }
    }, {
        key: "pause",
        value: function pause() {
            this.animations.currentAnim.paused = true;
            this.body.enable = false;
        }
    }, {
        key: "resume",
        value: function resume() {
            this.animations.currentAnim.paused = false;
            this.body.enable = true;
        }
    }, {
        key: "flip",
        value: function flip() {
            var dir = this.facing === 1 ? -2 : 2;
            this.scale.x = dir;
        }
    }, {
        key: "_addAnimations",
        value: function _addAnimations(anims) {
            var frameRate = arguments[1] === undefined ? 60 : arguments[1];
            var loop = arguments[2] === undefined ? false : arguments[2];

            for (var i = 0, l = anims.length; i < l; ++i) {
                var anim = anims[i];
                this.animations.add(anim.name, anim.frames, frameRate, loop);
            }
        }
    }]);

    return Entity;
})(Phaser.Sprite);

exports["default"] = Entity;
module.exports = exports["default"];

},{}],97:[function(require,module,exports){
/*
 * ===========================================================================
 * File: gate.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var Gate = (function (_Phaser$Sprite) {
    function Gate(game, x, y, blockW, blockH) {
        var callback = arguments[5] === undefined ? null : arguments[5];

        _classCallCheck(this, Gate);

        _get(Object.getPrototypeOf(Gate.prototype), 'constructor', this).call(this, game, x, y, game.cache.getBitmapData(_const2['default'].FILLED_RECT));

        this.anchor.set(0.5);
        this.width = _const2['default'].BLOCK_SIZE * blockW;
        this.height = _const2['default'].BLOCK_SIZE * blockH;
        this.tint = 255;

        game.add.tween(this).to({ alpha: 0.25 }, 500, Phaser.Easing.Sinusoidal.Out, true, 0, -1, true);
    }

    _inherits(Gate, _Phaser$Sprite);

    return Gate;
})(Phaser.Sprite);

exports['default'] = Gate;
module.exports = exports['default'];

},{"const":119}],98:[function(require,module,exports){
/*
 * ===========================================================================
 * File: player.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientEntitiesEntity = require('client/entities/entity');

var _clientEntitiesEntity2 = _interopRequireDefault(_clientEntitiesEntity);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var PlayerStates = {
    Idle: 0,
    Walking: 1,
    Jumping: 2,
    Falling: 4
};

var Player = (function (_Entity) {
    function Player(game, x, y) {
        _classCallCheck(this, Player);

        _get(Object.getPrototypeOf(Player.prototype), 'constructor', this).call(this, game, x, y, _const2['default'].SPRITE_SHEET, 0);
        this.currentState = PlayerStates.Falling;
        this.jumpReleased = true;

        this._grounded = false;
        this._moving = [];
        this._addAnimations([{ name: 'walk', frames: [1, 2, 3, 4, 5] }], 20, true);
        this.scale.set(2, 2);
    }

    _inherits(Player, _Entity);

    _createClass(Player, [{
        key: 'setup',
        value: function setup(level) {
            _get(Object.getPrototypeOf(Player.prototype), 'setup', this).call(this, level);

            this._velocity = this.body.velocity;
            this._acceleration = this.body.acceleration;
            this.body.setSize(8, 6);
            this.body.maxVelocity.x = _const2['default'].PLAYER_MAX_VEL;
            this.body.drag.set(_const2['default'].PLAYER_DRAG, 0);
        }
    }, {
        key: 'update',
        value: function update() {
            this._updateAnimations();
            this._grounded = this.body.onFloor() || this.body.touching.down;

            if (this._isCurrentState(PlayerStates.Falling)) {
                if (this._grounded) {
                    this.game.hitGroundSound.play();
                }
            }

            if (this._moving[Phaser.LEFT]) {
                this._acceleration.x = -_const2['default'].PLAYER_ACCEL;
                if (this._grounded) {
                    this.currentState = PlayerStates.Walking;
                }
            } else if (this._moving[Phaser.RIGHT]) {
                this._acceleration.x = _const2['default'].PLAYER_ACCEL;
                if (this._grounded) {
                    this.currentState = PlayerStates.Walking;
                }
            } else {
                this._acceleration.x = 0;
                if (this._grounded) {
                    this.currentState = PlayerStates.Idle;
                }
            }

            // perform variable jump height check
            if (this._isCurrentState(PlayerStates.Jumping) && this.jumpReleased) {
                if (this._velocity.y < _const2['default'].PLAYER_JUMP_SPEED / 4) {
                    this._velocity.y = _const2['default'].PLAYER_JUMP_SPEED / 4;
                }
            }

            if (this._isCurrentState(PlayerStates.Jumping) && this._velocity.y > 0) {
                this.currentState = PlayerStates.Falling;
            }

            // cap player fall speed
            this._velocity.y = Math.min(this._velocity.y, _const2['default'].PLAYER_MAX_FALL_SPEED);
        }
    }, {
        key: 'jump',
        value: function jump() {
            if (this._grounded && !this._isCurrentState(PlayerStates.Jumping) && this.jumpReleased) {
                this.jumpReleased = false;

                // set the appropriate state
                this.currentState = PlayerStates.Jumping;
                this._velocity.y = _const2['default'].PLAYER_JUMP_SPEED;
                this.game.jumpSound.play();
            }
        }
    }, {
        key: 'move',
        value: function move(direction, active) {
            this._moving[direction] = active;
            this.facing = direction;
        }
    }, {
        key: '_updateAnimations',
        value: function _updateAnimations() {
            this.flip();

            switch (this.currentState) {
                case PlayerStates.Walking:
                    this.animations.play('walk');
                    break;
                case PlayerStates.Jumping:
                    this.frame = 26;
                    break;
                case PlayerStates.Falling:
                    this.frame = 27;
                    break;
                case PlayerStates.Idle: // jshint ignore:line
                default:
                    this.frame = 0;
                    break;
            }
        }
    }, {
        key: '_isCurrentState',
        value: function _isCurrentState(state) {
            return this.currentState === state;
        }
    }]);

    return Player;
})(_clientEntitiesEntity2['default']);

exports['default'] = Player;
module.exports = exports['default'];

},{"client/entities/entity":96,"const":119}],99:[function(require,module,exports){
/*
 * ===========================================================================
 * File: game.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesBoot = require('client/states/boot');

var _clientStatesBoot2 = _interopRequireDefault(_clientStatesBoot);

var _clientStatesPreload = require('client/states/preload');

var _clientStatesPreload2 = _interopRequireDefault(_clientStatesPreload);

var _clientStatesSplash = require('client/states/splash');

var _clientStatesSplash2 = _interopRequireDefault(_clientStatesSplash);

var _clientStatesMenu = require('client/states/menu');

var _clientStatesMenu2 = _interopRequireDefault(_clientStatesMenu);

var _clientStatesLeaderboard = require('client/states/leaderboard');

var _clientStatesLeaderboard2 = _interopRequireDefault(_clientStatesLeaderboard);

var _clientStatesPlay = require('client/states/play');

var _clientStatesPlay2 = _interopRequireDefault(_clientStatesPlay);

var worlds = require('client/levels/worlds');

var Game = (function (_Phaser$Game) {
    function Game() {
        _classCallCheck(this, Game);

        _get(Object.getPrototypeOf(Game.prototype), 'constructor', this).call(this, 400, 240, Phaser.AUTO, 'game', null, false, false);

        this.isPaused = false;
    }

    _inherits(Game, _Phaser$Game);

    _createClass(Game, [{
        key: 'start',
        value: function start() {
            this.state.add('boot', _clientStatesBoot2['default'], true);
            this.state.add('preload', _clientStatesPreload2['default'], false);
            this.state.add('splash', _clientStatesSplash2['default'], false);
            this.state.add('mainmenu', _clientStatesMenu2['default'], false);
            this.state.add('leaderboard', _clientStatesLeaderboard2['default'], false);
            this.state.add('play', _clientStatesPlay2['default'], false);
            this._addWorlds(worlds);

            return this;
        }
    }, {
        key: '_addWorlds',
        value: function _addWorlds(worlds) {
            var _this = this;

            var i = 1;
            _.each(worlds, function (v, k) {
                _this._addLevel(v, i++);
            });
        }
    }, {
        key: '_addLevel',
        value: function _addLevel(levels, worldIdx) {
            var _this2 = this;

            var levelIdx = 1;
            _.each(levels, function (v, k) {
                _this2.state.add('level_' + worldIdx + '_' + levelIdx, v, false);
                levelIdx++;
            });
        }
    }]);

    return Game;
})(Phaser.Game);

exports['default'] = Game;
module.exports = exports['default'];

},{"client/levels/worlds":110,"client/states/boot":112,"client/states/leaderboard":113,"client/states/menu":114,"client/states/play":115,"client/states/preload":116,"client/states/splash":117}],100:[function(require,module,exports){
/*
 * ===========================================================================
 * File: dialog.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientGuiText_label = require('client/gui/text_label');

var _clientGuiText_label2 = _interopRequireDefault(_clientGuiText_label);

var _clientGuiText_button = require('client/gui/text_button');

var _clientGuiText_button2 = _interopRequireDefault(_clientGuiText_button);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var Dialog = (function (_Phaser$Group) {
    function Dialog(game, parent, title) {
        var onClose = arguments[3] === undefined ? null : arguments[3];
        var autoShow = arguments[4] === undefined ? false : arguments[4];

        _classCallCheck(this, Dialog);

        _get(Object.getPrototypeOf(Dialog.prototype), 'constructor', this).call(this, game);

        this._parent = parent;
        this._title = title;
        this._onClose = onClose;
        this._autoShow = autoShow;

        this.fixedToCamera = true;
    }

    _inherits(Dialog, _Phaser$Group);

    _createClass(Dialog, [{
        key: 'setup',
        value: function setup(bodyTextItems, close) {
            bodyTextItems.unshift({ type: 'label', pos: 'center',
                text: this._title, newLine: true });

            if (close) {
                bodyTextItems.push({ type: 'button', pos: 'center',
                    text: 'Close', newLine: true, fn: this.hide, ctx: this });
            }

            this._bodyTextItems = bodyTextItems;
            this._init();

            if (this._autoShow) {
                this.show();
            }
        }
    }, {
        key: 'show',
        value: function show() {
            this.visible = true;
            this._textItemsGroup.visible = false;
            this._startOpenTween();
        }
    }, {
        key: 'hide',
        value: function hide() {
            this._textItemsGroup.visible = false;
            this._startCloseTween();
        }
    }, {
        key: '_init',
        value: function _init() {
            // setup the dialog background sprite
            this.visible = false;
            this._dialogSprite = this.create(this.game.width / 2, this.game.height * 0.75, this.game.cache.getBitmapData(_const2['default'].RECT));
            this._dialogSprite.anchor.set(0.5);
            this._dialogSprite.alpha = 0.8;
            this._dialogSprite.width = this.game.width + 64;
            this._dialogSprite.height = _.size(this._bodyTextItems) * 12;

            // setup all the text items
            var centerX = this._dialogSprite.x;
            var centerY = this._dialogSprite.y;
            this._textItemsGroup = new Phaser.Group(this.game, this);
            this._initBodyText(centerX, centerY);
            this._dialogSprite.height = 0;
        }
    }, {
        key: '_initBodyText',
        value: function _initBodyText(centerX, centerY) {
            var _this = this;

            var size = _.size(this._bodyTextItems);
            var yPos = size > 1 ? centerY + this._dialogSprite.height / 2 - 12 - size * 8 : centerY;

            _.each(this._bodyTextItems, function (v, k) {
                var xPos = centerX;

                if (v.pos === 'left') {
                    xPos = centerX - _this._dialogSprite.width / 6;
                } else if (v.pos === 'right') {
                    xPos = centerX + _this._dialogSprite.width / 6;
                }

                var item = v.type === 'label' ? new _clientGuiText_label2['default'](_this.game, xPos, yPos, v.text, _this._textItemsGroup) : new _clientGuiText_button2['default'](_this.game, xPos, yPos, v.text, _this._textItemsGroup, false, { fn: v.fn, ctx: v.ctx });

                if (v.newLine) {
                    yPos += item.height * 2;
                }
            });
        }
    }, {
        key: '_startOpenTween',
        value: function _startOpenTween() {
            var _this2 = this;

            var h = this.game.height / 3;
            var tween = this._createTween(h);

            tween.onComplete.add(function (f) {
                return _this2._textItemsGroup.visible = true;
            });
            tween.start();
        }
    }, {
        key: '_startCloseTween',
        value: function _startCloseTween() {
            var _this3 = this;

            var tween = this._createTween(0);

            tween.onComplete.add(function (f) {
                _this3.visible = false;

                // if user defined a onclose callback, invoke it
                if (_this3._onClose) {
                    _this3._onClose();
                }
            });
            tween.start();
        }
    }, {
        key: '_createTween',
        value: function _createTween(height) {
            var tween = this._parent.add.tween(this._dialogSprite).to({ height: height }, 500, Phaser.Easing.Quintic.Out);

            return tween;
        }
    }]);

    return Dialog;
})(Phaser.Group);

exports['default'] = Dialog;
module.exports = exports['default'];

},{"client/gui/text_button":103,"client/gui/text_label":104,"const":119}],101:[function(require,module,exports){
/*
 * ===========================================================================
 * File: options_dialog.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientGuiDialog = require('client/gui/dialog');

var _clientGuiDialog2 = _interopRequireDefault(_clientGuiDialog);

var MainMenuDialog = (function (_Dialog) {
    function MainMenuDialog(game, parent, onClose, autoStart) {
        _classCallCheck(this, MainMenuDialog);

        _get(Object.getPrototypeOf(MainMenuDialog.prototype), 'constructor', this).call(this, game, parent, 'Starguard', onClose, autoStart);

        this.setup();
    }

    _inherits(MainMenuDialog, _Dialog);

    _createClass(MainMenuDialog, [{
        key: 'setup',
        value: function setup() {
            _get(Object.getPrototypeOf(MainMenuDialog.prototype), 'setup', this).call(this, [{ type: 'button', pos: 'center', text: 'Start',
                newLine: true, fn: this._onStartSelected, ctx: this }, { type: 'button', pos: 'center', text: 'Leaderboard',
                newLine: true, fn: this._onLeaderboardSelected, ctx: this }, { type: 'button', pos: 'center', text: 'Options',
                newLine: true, fn: this._onOptionsSelected, ctx: this }]);
        }
    }, {
        key: '_onStartSelected',
        value: function _onStartSelected() {
            this._parent.state.start('play');
        }
    }, {
        key: '_onLeaderboardSelected',
        value: function _onLeaderboardSelected() {
            this._parent.state.start('leaderboard');
        }
    }, {
        key: '_onOptionsSelected',
        value: function _onOptionsSelected() {
            this.hide();
        }
    }]);

    return MainMenuDialog;
})(_clientGuiDialog2['default']);

exports['default'] = MainMenuDialog;
module.exports = exports['default'];

},{"client/gui/dialog":100}],102:[function(require,module,exports){
/*
 * ===========================================================================
 * File: options_dialog.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientGuiDialog = require('client/gui/dialog');

var _clientGuiDialog2 = _interopRequireDefault(_clientGuiDialog);

var OptionsDialog = (function (_Dialog) {
    function OptionsDialog(game, parent, onClose) {
        var returnToMenu = arguments[3] === undefined ? false : arguments[3];

        _classCallCheck(this, OptionsDialog);

        _get(Object.getPrototypeOf(OptionsDialog.prototype), 'constructor', this).call(this, game, parent, 'Options', onClose, false);

        this.setup(returnToMenu);
    }

    _inherits(OptionsDialog, _Dialog);

    _createClass(OptionsDialog, [{
        key: 'setup',
        value: function setup(returnToMenu) {
            var items = [{ type: 'label', pos: 'left', text: 'fullscreen', newLine: false }, { type: 'button', pos: 'right', text: 'off',
                fn: this._onFullscreenToggle, ctx: this, newLine: true }, { type: 'label', pos: 'left', text: 'audio', newLine: false }, { type: 'button', pos: 'right', text: 'on',
                fn: this._onAudioToggle, ctx: this, newLine: true }];

            if (returnToMenu) {
                items.push({ type: 'button', pos: 'center', text: 'MainMenu',
                    fn: this._onMainMenu, ctx: this, newLine: true });
            }

            _get(Object.getPrototypeOf(OptionsDialog.prototype), 'setup', this).call(this, items, true);
        }
    }, {
        key: '_onFullscreenToggle',
        value: function _onFullscreenToggle(button) {
            if (this._parent.scale.isFullScreen) {
                this._parent.scale.stopFullScreen();
                button.setText('off');
            } else {
                this._parent.scale.startFullScreen(false);
                this._parent.scale.setScreenSize();
                button.setText('on');
            }
        }
    }, {
        key: '_onAudioToggle',
        value: function _onAudioToggle(button) {
            var isMuted = this._parent.sound.mute;
            var status = isMuted ? 'on' : 'off';

            this._parent.sound.mute = !this._parent.sound.mute;
            button.setText(status);
        }
    }, {
        key: '_onMainMenu',
        value: function _onMainMenu() {
            this._parent.resume();
            this._parent.state.start('mainmenu');
        }
    }]);

    return OptionsDialog;
})(_clientGuiDialog2['default']);

exports['default'] = OptionsDialog;
module.exports = exports['default'];

},{"client/gui/dialog":100}],103:[function(require,module,exports){
/*
 * ===========================================================================
 * File: text_button.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var _clientGuiText_label = require('client/gui/text_label');

var _clientGuiText_label2 = _interopRequireDefault(_clientGuiText_label);

var TextButton = (function (_TextLabel) {
    function TextButton(game, x, y, text, parent, fixedToCam, callbackObj, centerText, align, size) {
        var _this = this;

        var overTint = arguments[10] === undefined ? 16711680 : arguments[10];
        var outTint = arguments[11] === undefined ? 16777215 : arguments[11];

        _classCallCheck(this, TextButton);

        _get(Object.getPrototypeOf(TextButton.prototype), 'constructor', this).call(this, game, x, y, text, parent, fixedToCam, centerText, align, size);

        // enable input and setup callback events
        this.inputEnabled = true;
        this.events.onInputOver.add(function (f) {
            return _this.tint = overTint;
        });
        this.events.onInputOut.add(function (f) {
            return _this.tint = outTint;
        });
        this.events.onInputDown.add(callbackObj.fn, callbackObj.ctx);
    }

    _inherits(TextButton, _TextLabel);

    return TextButton;
})(_clientGuiText_label2['default']);

exports['default'] = TextButton;
module.exports = exports['default'];

},{"client/gui/text_label":104,"const":119}],104:[function(require,module,exports){
/*
 * ===========================================================================
 * File: text_label.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var TextLabel = (function (_Phaser$BitmapText) {
    function TextLabel(game, x, y, text) {
        var parent = arguments[4] === undefined ? null : arguments[4];
        var fixedToCam = arguments[5] === undefined ? false : arguments[5];
        var centerText = arguments[6] === undefined ? true : arguments[6];
        var align = arguments[7] === undefined ? 'center' : arguments[7];
        var size = arguments[8] === undefined ? 8 : arguments[8];

        _classCallCheck(this, TextLabel);

        _get(Object.getPrototypeOf(TextLabel.prototype), 'constructor', this).call(this, game, x, y, _const2['default'].GAME_FONT, text, size);

        if (parent) {
            parent.add(this);
        }

        this.align = align;
        this.fixedToCamera = fixedToCam;

        if (centerText) {
            this.anchor.x = Math.round(this.width * 0.5) / this.width;
            this.anchor.y = Math.round(this.height * 0.5) / this.height;
        }
    }

    _inherits(TextLabel, _Phaser$BitmapText);

    return TextLabel;
})(Phaser.BitmapText);

exports['default'] = TextLabel;
module.exports = exports['default'];

},{"const":119}],105:[function(require,module,exports){
/*
 * ===========================================================================
 * File: client_game_manager.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _clientGame = require('client/game');

var _clientGame2 = _interopRequireDefault(_clientGame);

require('babel/polyfill');

window.onload = function () {
  var game = new _clientGame2['default']().start();
};

},{"babel/polyfill":93,"client/game":99}],106:[function(require,module,exports){
/*
 * ===========================================================================
 * File: input_handler.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputHandler = (function () {
    function InputHandler() {
        _classCallCheck(this, InputHandler);

        this._inputMap = {};
        this._listenerMap = {};
    }

    _createClass(InputHandler, [{
        key: "setInputMap",
        value: function setInputMap() {
            var inputMap = arguments[0] === undefined ? {} : arguments[0];

            this._inputMap = inputMap;
        }
    }, {
        key: "addListener",
        value: function addListener(key) {
            var ctx = arguments[1] === undefined ? null : arguments[1];
            var handler = arguments[2] === undefined ? null : arguments[2];
            var onDown = arguments[3] === undefined ? null : arguments[3];
            var onUp = arguments[4] === undefined ? null : arguments[4];

            if (_.has(this._inputMap, key)) {
                this._listenerMap[key] = {
                    handler: handler,
                    ctx: ctx,
                    onDown: onDown,
                    onUp: onUp
                };
            } else {
                console.log("Error: " + key + " not found in input map");
            }
        }
    }, {
        key: "_getListenerByInputCode",
        value: function _getListenerByInputCode(code) {
            var key;
            var listener = null;

            // get the inputMap key via a phaser input code (i.e Phaser.Keyboard.UP)
            _.each(this._inputMap, function (v, k) {
                if (v === code) {
                    key = k;
                }
            });

            // use this key to retrieve the listener
            if (_.has(this._listenerMap, key)) {
                listener = this._listenerMap[key];
            }

            return listener;
        }
    }]);

    return InputHandler;
})();

exports["default"] = InputHandler;
module.exports = exports["default"];

},{}],107:[function(require,module,exports){
/*
 * ===========================================================================
 * File: keyboard_handler.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientInputInput_handler = require('client/input/input_handler');

var _clientInputInput_handler2 = _interopRequireDefault(_clientInputInput_handler);

var KeyboardHandler = (function (_InputHandler) {
    function KeyboardHandler() {
        _classCallCheck(this, KeyboardHandler);

        if (_InputHandler != null) {
            _InputHandler.apply(this, arguments);
        }
    }

    _inherits(KeyboardHandler, _InputHandler);

    _createClass(KeyboardHandler, [{
        key: 'create',
        value: function create(input) {
            input.keyboard.addCallbacks(this, this._onKeyDown, this._onKeyUp);
        }
    }, {
        key: 'setInputMap',
        value: function setInputMap(inputMap) {
            _get(Object.getPrototypeOf(KeyboardHandler.prototype), 'setInputMap', this).call(this, inputMap);

            // extend the inputMap with some default keys
            // that will generally be used in all states
            _.extend(this._inputMap, {
                up: Phaser.Keyboard.UP,
                down: Phaser.Keyboard.DOWN,
                left: Phaser.Keyboard.LEFT,
                right: Phaser.Keyboard.RIGHT
            });
        }
    }, {
        key: '_onKeyDown',
        value: function _onKeyDown(event) {
            var keyCode = event.keyCode;
            var listener = this._getListenerByInputCode(keyCode);

            if (listener) {
                if (listener.onDown) {
                    listener.onDown.call(listener.ctx, keyCode);
                }

                if (listener.handler) {
                    listener.handler.call(listener.ctx, keyCode, true);
                }
            }
        }
    }, {
        key: '_onKeyUp',
        value: function _onKeyUp(event) {
            var keyCode = event.keyCode;
            var listener = this._getListenerByInputCode(keyCode);

            if (listener) {
                if (listener.onUp) {
                    listener.onUp.call(listener.ctx, keyCode);
                }

                if (listener.handler) {
                    listener.handler.call(listener.ctx, keyCode, false);
                }
            }
        }
    }]);

    return KeyboardHandler;
})(_clientInputInput_handler2['default']);

exports['default'] = KeyboardHandler;
module.exports = exports['default'];

},{"client/input/input_handler":106}],108:[function(require,module,exports){
/*
 * ===========================================================================
 * File: level.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var _clientLevelsLevel_manager = require('client/levels/level_manager');

var _clientLevelsLevel_manager2 = _interopRequireDefault(_clientLevelsLevel_manager);

var _clientGuiOptions_dialog = require('client/gui/options_dialog');

var _clientGuiOptions_dialog2 = _interopRequireDefault(_clientGuiOptions_dialog);

var Level = (function (_State) {
    function Level(game, gravity) {
        _classCallCheck(this, Level);

        _get(Object.getPrototypeOf(Level.prototype), 'constructor', this).call(this, game);

        this.gravity = gravity;
        this.mapKey = '';
        this.levelManager = null;
        this.timer = null;
        this.player = null;
    }

    _inherits(Level, _State);

    _createClass(Level, [{
        key: 'preload',
        value: function preload() {
            _get(Object.getPrototypeOf(Level.prototype), 'preload', this).call(this);

            // TODO: get tilemap from cache, this should be loaded in the
            // preload state
        }
    }, {
        key: 'create',
        value: function create() {
            var _this = this;

            _get(Object.getPrototypeOf(Level.prototype), 'create', this).call(this);

            this.timer = new Phaser.Timer(this.game, false);
            this.time.add(this.timer);
            this._initInputHandler();
            this.player = this.game.player;
            this.levelManager = new _clientLevelsLevel_manager2['default'](this);

            this.levelManager.create();
            this._optionsDialog = new _clientGuiOptions_dialog2['default'](this.game, this, function (f) {
                return _this.resume();
            }, true);
            this.game.startSound.play();
        }
    }, {
        key: 'shutdown',
        value: function shutdown() {
            _get(Object.getPrototypeOf(Level.prototype), 'shutdown', this).call(this);
            this.levelManager.shutdown();
        }
    }, {
        key: 'update',
        value: function update() {
            this.levelManager.update();
        }
    }, {
        key: 'pause',

        //render() {
        //this.game.debug.body(this.player, '#FF0000', false);
        //}

        value: function pause() {
            if (!this.game.isPaused) {
                this._optionsDialog.show();
                this.levelManager.pause();
                this.game.isPaused = true;
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (this.game.isPaused) {
                this.levelManager.resume();
                this.game.isPaused = false;
            }
        }
    }, {
        key: '_initInputHandler',
        value: function _initInputHandler() {
            this.inputHandler.setInputMap({
                jump: Phaser.Keyboard.Z,
                shoot: Phaser.Keyboard.X,
                pause: Phaser.Keyboard.ENTER
            });

            this.inputHandler.addListener('left', this, this._onMove);
            this.inputHandler.addListener('right', this, this._onMove);
            this.inputHandler.addListener('jump', this, null, this._onJump, this._onJumpReleased);
            this.inputHandler.addListener('pause', this, this._onPause);
        }
    }, {
        key: '_onMove',

        /**
         * input listeners
         */
        value: function _onMove(keycode, active) {
            var dir = keycode === Phaser.Keyboard.LEFT ? Phaser.LEFT : Phaser.RIGHT;
            this.player.move(dir, active);
        }
    }, {
        key: '_onJump',
        value: function _onJump(keycode) {
            this.player.jump();
        }
    }, {
        key: '_onJumpReleased',
        value: function _onJumpReleased(keycode) {
            this.player.jumpReleased = true;
        }
    }, {
        key: '_onPause',
        value: function _onPause(keycode) {
            this.pause();
        }
    }]);

    return Level;
})(_clientStatesState2['default']);

exports['default'] = Level;
module.exports = exports['default'];

},{"client/gui/options_dialog":102,"client/levels/level_manager":109,"client/states/state":118,"const":119}],109:[function(require,module,exports){
/*
 * ===========================================================================
 * File: level_manager.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _clientEntitiesGate = require('client/entities/gate');

var _clientEntitiesGate2 = _interopRequireDefault(_clientEntitiesGate);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var LevelManager = (function () {
    function LevelManager(level) {
        _classCallCheck(this, LevelManager);

        this.map = null;

        this._player = level.player;
        this._level = level;
        this._game = level.game;
        this._physics = level.physics;
        this._inputHandler = level.inputHandler;
        this._timer = level.timer;
        this._mainGroup = null;
        this._entitiesGroup = null;
        this._collisionLayer = null;
        this._staticLayer = null;
    }

    _createClass(LevelManager, [{
        key: 'create',
        value: function create() {
            this._mainGroup = this._level.add.group();
            this._entitiesGroup = this._level.add.group();
            this._mainGroup.add(this._entitiesGroup);

            this._createWorld();
            this._player.setup(this._level);
            this._entitiesGroup.add(this._player);

            // make sure the entities group is rendered on top
            this._mainGroup.bringToTop(this._entitiesGroup);

            this._level.camera.checkBounds();
            this._level.camera.follow(this._player, Phaser.FOLLOW_PLATFORMER);
            this._physics.arcade.gravity.y = this._level.gravity;
        }
    }, {
        key: 'shutdown',
        value: function shutdown() {
            this._level.camera.reset();
            this._mainGroup.destroy();
        }
    }, {
        key: 'update',
        value: function update() {
            this._updateCollision();
            this._updateEntities();
        }
    }, {
        key: 'pause',
        value: function pause() {
            if (!this._game.inMultiplayerMode) {
                this._game.input.keyboard.enabled = false;
                this._entitiesGroup.callAll('pause');
            }
        }
    }, {
        key: 'resume',
        value: function resume() {
            if (!this._game.inMultiplayerMode) {
                this._game.input.keyboard.enabled = true;
                this._entitiesGroup.callAll('resume');
            }
        }
    }, {
        key: '_createWorld',
        value: function _createWorld() {
            this._createMap();
            this._createMapObjects();
        }
    }, {
        key: '_createMap',
        value: function _createMap() {
            this.map = this._level.add.tilemap(this._level.mapKey);
            this.map.addTilesetImage(_const2['default'].TILESET_IMG, _const2['default'].TILESET_IMG);

            this._collisionLayer = this.map.createLayer('collision_layer');
            this._collisionLayer.visible = false;
            this._staticLayer = this.map.createLayer('static_layer');
            this._collisionLayer.resizeWorld();

            this.map.setCollision(9, true, this._collisionLayer);
            this._mainGroup.add(this._staticLayer);
        }
    }, {
        key: '_createMapObjects',
        value: function _createMapObjects() {
            var objLayer = this.map.objects.object_layer;

            // set player spawn point
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = objLayer[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var obj = _step.value;

                    var props = obj.properties;

                    switch (obj.name) {
                        case 'spawn':
                            var gate = new _clientEntitiesGate2['default'](this._game, obj.x, obj.y, props.width, props.height);
                            this._entitiesGroup.add(gate);
                            this._player.position.set(obj.x, obj.y);
                            break;
                        case 'exit':
                            var exit = new _clientEntitiesGate2['default'](this._game, obj.x, obj.y, props.width, props.height);
                            this._entitiesGroup.add(exit);
                            break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: '_updateCollision',
        value: function _updateCollision() {
            this._physics.arcade.collide(this._player, this._collisionLayer);
        }
    }, {
        key: '_updateEntities',
        value: function _updateEntities() {
            this._entitiesGroup.callAll('update');
        }
    }, {
        key: '_addEntity',
        value: function _addEntity(entity) {}
    }]);

    return LevelManager;
})();

exports['default'] = LevelManager;
module.exports = exports['default'];

},{"client/entities/gate":97,"const":119}],110:[function(require,module,exports){
/*
 * ===========================================================================
 * File: index.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

exports.world_1 = require('client/levels/worlds/world_1');

},{"client/levels/worlds/world_1":111}],111:[function(require,module,exports){
/*
 * ===========================================================================
 * File: world_1.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientLevelsLevel = require('client/levels/level');

var _clientLevelsLevel2 = _interopRequireDefault(_clientLevelsLevel);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var TestLevel = (function (_Level) {
    function TestLevel(game) {
        _classCallCheck(this, TestLevel);

        _get(Object.getPrototypeOf(TestLevel.prototype), 'constructor', this).call(this, game, _const2['default'].NORMAL_GRAVITY);

        this.mapKey = 'testmap';
    }

    _inherits(TestLevel, _Level);

    _createClass(TestLevel, [{
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(TestLevel.prototype), 'create', this).call(this);

            this.stage.backgroundColor = 0;
        }
    }]);

    return TestLevel;
})(_clientLevelsLevel2['default']);

exports.TestLevel = TestLevel;

},{"client/levels/level":108,"const":119}],112:[function(require,module,exports){
/*
 * ===========================================================================
 * File: boot.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var BootState = (function (_State) {
    function BootState(game) {
        _classCallCheck(this, BootState);

        _get(Object.getPrototypeOf(BootState.prototype), 'constructor', this).call(this, game);
    }

    _inherits(BootState, _State);

    _createClass(BootState, [{
        key: 'create',
        value: function create() {
            this._configureScale();
            this._configureInput();

            this.game.renderer.renderSession.roundPixels = true;
            this.stage.smoothed = false;
            this.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.add.plugin(Phaser.Plugin.Debug);

            this._prerender();
            this.state.start('preload');
        }
    }, {
        key: '_prerender',
        value: function _prerender() {
            // pre-render some simple assets that I cannot be bothered
            // creating in GIMP
            var bmd = this.add.bitmapData(1, 1);
            bmd.context.fillStyle = '#FFFFFF';
            bmd.context.fillRect(0, 0, 1, 1);
            this.cache.addBitmapData(_const2['default'].FILLED_RECT, bmd);

            bmd = this.add.bitmapData(16, 16);
            bmd.context.fillStyle = '#000000';
            bmd.context.fillRect(0, 0, 16, 16);
            bmd.context.strokeStyle = '#FFFFFF';
            bmd.context.rect(0, 0, 16, 16);
            bmd.context.stroke();
            this.cache.addBitmapData(_const2['default'].RECT, bmd);
        }
    }, {
        key: '_configureScale',
        value: function _configureScale() {
            this.scale.minWidth = this.width;
            this.scale.minHeight = this.height;
            this.scale.pageAlignHorizontally = true;
            this.scale.pageAlignVertically = true;

            this.scale.scaleMode = this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setScreenSize();
        }
    }, {
        key: '_configureInput',
        value: function _configureInput() {
            // capture certain keys to prevent their default actions in the browser.
            // this is only necessary because this is an HTML5 game.
            this.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.UP, Phaser.Keyboard.DOWN]);

            this.input.maxPointers = 1;
        }
    }]);

    return BootState;
})(_clientStatesState2['default']);

exports['default'] = BootState;
module.exports = exports['default'];

},{"client/states/state":118,"const":119}],113:[function(require,module,exports){
/*
 * ===========================================================================
 * File: leaderboard.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _clientGuiText_label = require('client/gui/text_label');

var _clientGuiText_label2 = _interopRequireDefault(_clientGuiText_label);

var _clientGuiText_button = require('client/gui/text_button');

var _clientGuiText_button2 = _interopRequireDefault(_clientGuiText_button);

var LeaderboardState = (function (_State) {
    function LeaderboardState(game) {
        _classCallCheck(this, LeaderboardState);

        _get(Object.getPrototypeOf(LeaderboardState.prototype), 'constructor', this).call(this, game);
    }

    _inherits(LeaderboardState, _State);

    _createClass(LeaderboardState, [{
        key: 'preload',
        value: function preload() {
            this.load.json('leaderboard', '/leaderboard');
        }
    }, {
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(LeaderboardState.prototype), 'create', this).call(this);

            var title = new _clientGuiText_label2['default'](this.game, this.game.width / 2, 20, 'leaderboard', null, true, true, 'center', 10);
            var exit = new _clientGuiText_button2['default'](this.game, this.game.width / 2, this.game.height - 30, 'mainmenu', null, true, { fn: this._onMainMenuSelected, ctx: this }, true, 'center', 10);
            this.add.existing(title);
            this.add.existing(exit);

            this._initLeaderboard();
        }
    }, {
        key: '_initLeaderboard',
        value: function _initLeaderboard() {
            var board = this.cache.getJSON('leaderboard');

            var yPos = 40;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = board[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var entry = _step.value;

                    var entryLabel = new _clientGuiText_label2['default'](this.game, this.game.width / 2, yPos, '' + entry.name + '     ' + entry.score);

                    this.add.existing(entryLabel);
                    yPos += entryLabel.height * 2;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: '_onMainMenuSelected',
        value: function _onMainMenuSelected() {
            this.state.start('mainmenu');
        }
    }]);

    return LeaderboardState;
})(_clientStatesState2['default']);

exports['default'] = LeaderboardState;
module.exports = exports['default'];

},{"client/gui/text_button":103,"client/gui/text_label":104,"client/states/state":118}],114:[function(require,module,exports){
/*
 * ===========================================================================
 * File: menu.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _clientEffectsStarfield = require('client/effects/starfield');

var _clientEffectsStarfield2 = _interopRequireDefault(_clientEffectsStarfield);

var _clientGuiOptions_dialog = require('client/gui/options_dialog');

var _clientGuiOptions_dialog2 = _interopRequireDefault(_clientGuiOptions_dialog);

var _clientGuiMain_menu_dialog = require('client/gui/main_menu_dialog');

var _clientGuiMain_menu_dialog2 = _interopRequireDefault(_clientGuiMain_menu_dialog);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var MenuState = (function (_State) {
    function MenuState(game) {
        _classCallCheck(this, MenuState);

        _get(Object.getPrototypeOf(MenuState.prototype), 'constructor', this).call(this, game);

        this.optionsDialog = null;

        this._starfield = null;
        this._mainMenuDialog = null;
    }

    _inherits(MenuState, _State);

    _createClass(MenuState, [{
        key: 'create',
        value: function create() {
            var _this = this;

            _get(Object.getPrototypeOf(MenuState.prototype), 'create', this).call(this);

            this.world.resize(this.game.width, this.game.height);
            this._starfield = new _clientEffectsStarfield2['default'](this, 4, 32);
            this._createLogo();

            this.optionsDialog = new _clientGuiOptions_dialog2['default'](this.game, this, function (f) {
                return _this._onOptionsClose();
            });
            this._mainMenuDialog = new _clientGuiMain_menu_dialog2['default'](this.game, this, function (f) {
                return _this._onMainMenuClose();
            });
        }
    }, {
        key: 'update',
        value: function update() {
            this._starfield.update();
        }
    }, {
        key: '_createLogo',
        value: function _createLogo() {
            var _this2 = this;

            var topHalf = this.add.sprite(-36, this.game.height / 2 - 54, _const2['default'].GAME_LOGO, 0);
            var bottomHalf = this.add.sprite(this.game.width + 36, this.game.height / 2 - 18, _const2['default'].GAME_LOGO, 1);

            topHalf.anchor.x = topHalf.anchor.y = bottomHalf.anchor.x = bottomHalf.anchor.y = 0.5;
            topHalf.scale.x = topHalf.scale.y = bottomHalf.scale.x = bottomHalf.scale.y = 3;
            this.add.tween(topHalf).to({ x: this.game.width / 2 }, 1000, Phaser.Easing.Exponential.Out, true);
            this.add.tween(bottomHalf).to({ x: this.game.width / 2 }, 1000, Phaser.Easing.Exponential.Out, true).onComplete.add(function (f) {
                return _this2._mainMenuDialog.show();
            });
        }
    }, {
        key: '_onOptionsClose',
        value: function _onOptionsClose() {
            this._mainMenuDialog.show();
        }
    }, {
        key: '_onMainMenuClose',
        value: function _onMainMenuClose() {
            this.optionsDialog.show();
        }
    }]);

    return MenuState;
})(_clientStatesState2['default']);

exports['default'] = MenuState;
module.exports = exports['default'];

},{"client/effects/starfield":95,"client/gui/main_menu_dialog":101,"client/gui/options_dialog":102,"client/states/state":118,"const":119}],115:[function(require,module,exports){
/*
 * ===========================================================================
 * File: play.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _clientEntitiesPlayer = require('client/entities/player');

var _clientEntitiesPlayer2 = _interopRequireDefault(_clientEntitiesPlayer);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var PlayState = (function (_State) {
    function PlayState(game) {
        _classCallCheck(this, PlayState);

        _get(Object.getPrototypeOf(PlayState.prototype), 'constructor', this).call(this, game);
    }

    _inherits(PlayState, _State);

    _createClass(PlayState, [{
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(PlayState.prototype), 'create', this).call(this);

            this.game.player = new _clientEntitiesPlayer2['default'](this.game, 0, 0);
            this.game.startSound = this.game.add.audio(_const2['default'].START_SOUND);
            this.game.hitGroundSound = this.game.add.audio(_const2['default'].FALL_SOUND);
            this.game.jumpSound = this.game.add.audio(_const2['default'].JUMP_SOUND);

            this.state.start('level_1_1');
        }
    }]);

    return PlayState;
})(_clientStatesState2['default']);

exports['default'] = PlayState;
module.exports = exports['default'];

},{"client/entities/player":98,"client/states/state":118,"const":119}],116:[function(require,module,exports){
/*
 * ===========================================================================
 * File: preload.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var PreloadState = (function (_State) {
    function PreloadState(game) {
        _classCallCheck(this, PreloadState);

        _get(Object.getPrototypeOf(PreloadState.prototype), 'constructor', this).call(this, game);
    }

    _inherits(PreloadState, _State);

    _createClass(PreloadState, [{
        key: 'preload',
        value: function preload() {
            _get(Object.getPrototypeOf(PreloadState.prototype), 'preload', this).call(this);

            var loadingBar = this.add.sprite(this.game.width / 2, this.game.height / 2, this.cache.getBitmapData(_const2['default'].FILLED_RECT));
            loadingBar.anchor.set(0.5);
            loadingBar.width = 128;
            loadingBar.height = 16;
            this.load.setPreloadSprite(loadingBar);

            this.load.spritesheet(_const2['default'].SPRITE_SHEET, 'res/img/sheet.png', 12, 12);
            this.load.spritesheet(_const2['default'].GAME_LOGO, 'res/img/logo.png', 24, 12);
            this.load.image(_const2['default'].HTML_LOGO, 'res/img/html.png');
            this.load.bitmapFont(_const2['default'].GAME_FONT, 'res/fonts/font.png', 'res/fonts/font.xml');

            this.load.tilemap('testmap', 'res/tilemaps/testmap.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image(_const2['default'].TILESET_IMG, 'res/tilemaps/tiles.png');

            this.load.audio(_const2['default'].START_SOUND, 'res/sounds/start.mp3');
            this.load.audio(_const2['default'].JUMP_SOUND, 'res/sounds/jump.mp3');
            this.load.audio(_const2['default'].FALL_SOUND, 'res/sounds/hit_ground.mp3');
        }
    }, {
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(PreloadState.prototype), 'create', this).call(this);

            this.state.start('splash');
        }
    }]);

    return PreloadState;
})(_clientStatesState2['default']);

exports['default'] = PreloadState;
module.exports = exports['default'];

},{"client/states/state":118,"const":119}],117:[function(require,module,exports){
/*
 * ===========================================================================
 * File: splash.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientStatesState = require('client/states/state');

var _clientStatesState2 = _interopRequireDefault(_clientStatesState);

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var SplashState = (function (_State) {
    function SplashState(game) {
        _classCallCheck(this, SplashState);

        _get(Object.getPrototypeOf(SplashState.prototype), 'constructor', this).call(this, game);
    }

    _inherits(SplashState, _State);

    _createClass(SplashState, [{
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(SplashState.prototype), 'create', this).call(this);
            this._htmlLogo = this.add.sprite(this.world.centerX, this.world.centerY, _const2['default'].HTML_LOGO);
            this._htmlLogo.smoothed = true;
            this._htmlLogo.anchor.set(0.5, 0.5);
            this._htmlLogo.scale.set(0.5);
            this._htmlLogo.alpha = 0;

            this._createHtmlTween();
        }
    }, {
        key: '_createHtmlTween',
        value: function _createHtmlTween() {
            var _this = this;

            var htmlTween = this.add.tween(this._htmlLogo).to({ alpha: 1 }, 1000, Phaser.Easing.Cubic.In, true, 0, 0, true);
            htmlTween.onComplete.add(function () {
                _this.state.start('mainmenu');
            });
        }
    }]);

    return SplashState;
})(_clientStatesState2['default']);

exports['default'] = SplashState;
module.exports = exports['default'];

},{"client/states/state":118,"const":119}],118:[function(require,module,exports){
/*
 * ===========================================================================
 * File: state.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _clientInputKeyboard_handler = require('client/input/keyboard_handler');

var _clientInputKeyboard_handler2 = _interopRequireDefault(_clientInputKeyboard_handler);

var State = (function (_Phaser$State) {
    function State(game) {
        _classCallCheck(this, State);

        _get(Object.getPrototypeOf(State.prototype), 'constructor', this).call(this, game);

        this.inputHandler = new _clientInputKeyboard_handler2['default']();
    }

    _inherits(State, _Phaser$State);

    _createClass(State, [{
        key: 'create',
        value: function create() {
            _get(Object.getPrototypeOf(State.prototype), 'create', this).call(this);
            this.stage.backgroundColor = 0;
            this.inputHandler.create(this.input);
        }
    }, {
        key: 'shutdown',
        value: function shutdown() {
            this.sound.stopAll();
        }
    }]);

    return State;
})(Phaser.State);

exports['default'] = State;
module.exports = exports['default'];

},{"client/input/keyboard_handler":107}],119:[function(require,module,exports){
/*
 * ===========================================================================
 * File: constants.js
 * Author: Anthony Del Ciotto
 * Desc: TODO
 * ===========================================================================
 */

'use strict';

module.exports = {
  /**
   * color constants
   */
  SKY_BLUE: 7181308,
  GOLD: 16766720,

  /**
   * physics constants
   */
  NORMAL_GRAVITY: 520,
  PLAYER_ACCEL: 480,
  PLAYER_MAX_VEL: 120,
  PLAYER_DRAG: 520,
  PLAYER_JUMP_SPEED: -256,
  PLAYER_MAX_FALL_SPEED: 320,

  /**
   * asset constants
   */
  HTML_LOGO: 'html_logo',
  GAME_LOGO: 'game_logo',
  SPRITE_SHEET: 'spritesheet',
  FILLED_RECT: 'filled_rect',
  RECT: 'rect',
  TILESET_IMG: 'tiles',
  GAME_FONT: 'retro_fnt',
  START_SOUND: 'start',
  JUMP_SOUND: 'jump',
  FALL_SOUND: 'fall',

  /**
   * size constants
   */
  BLOCK_SIZE: 12
};

},{}]},{},[105])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmludm9rZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1jYWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5rZXlvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQubWl4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vd24ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucmVkZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlcGxhY2VyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zYW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcGFkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcmVwZWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50YXNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50aHJvd3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudW5zY29wZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQud2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM1LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkub2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuaXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmF3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLXNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcucmVnZXhwLmVzY2FwZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcuYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5pbW1lZGlhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudGltZXJzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2NsaWVudC9lZmZlY3RzL3N0YXJmaWVsZC5qcyIsInNyYy9jbGllbnQvZW50aXRpZXMvZW50aXR5LmpzIiwic3JjL2NsaWVudC9lbnRpdGllcy9nYXRlLmpzIiwic3JjL2NsaWVudC9lbnRpdGllcy9wbGF5ZXIuanMiLCJzcmMvY2xpZW50L2dhbWUuanMiLCJzcmMvY2xpZW50L2d1aS9kaWFsb2cuanMiLCJzcmMvY2xpZW50L2d1aS9tYWluX21lbnVfZGlhbG9nLmpzIiwic3JjL2NsaWVudC9ndWkvb3B0aW9uc19kaWFsb2cuanMiLCJzcmMvY2xpZW50L2d1aS90ZXh0X2J1dHRvbi5qcyIsInNyYy9jbGllbnQvZ3VpL3RleHRfbGFiZWwuanMiLCJzcmMvY2xpZW50L2luZGV4LmpzIiwic3JjL2NsaWVudC9pbnB1dC9pbnB1dF9oYW5kbGVyLmpzIiwic3JjL2NsaWVudC9pbnB1dC9rZXlib2FyZF9oYW5kbGVyLmpzIiwic3JjL2NsaWVudC9sZXZlbHMvbGV2ZWwuanMiLCJzcmMvY2xpZW50L2xldmVscy9sZXZlbF9tYW5hZ2VyLmpzIiwic3JjL2NsaWVudC9sZXZlbHMvd29ybGRzL2luZGV4LmpzIiwic3JjL2NsaWVudC9sZXZlbHMvd29ybGRzL3dvcmxkXzEuanMiLCJzcmMvY2xpZW50L3N0YXRlcy9ib290LmpzIiwic3JjL2NsaWVudC9zdGF0ZXMvbGVhZGVyYm9hcmQuanMiLCJzcmMvY2xpZW50L3N0YXRlcy9tZW51LmpzIiwic3JjL2NsaWVudC9zdGF0ZXMvcGxheS5qcyIsInNyYy9jbGllbnQvc3RhdGVzL3ByZWxvYWQuanMiLCJzcmMvY2xpZW50L3N0YXRlcy9zcGxhc2guanMiLCJzcmMvY2xpZW50L3N0YXRlcy9zdGF0ZS5qcyIsInNyYy9jb25zdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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SUFBSSxnQ0FBZ0MsdUJBQXVCOztBQUUzRCxJQWxCTSxRQUFLLENBQUEsVUFBQSxlQUFBO0lBQ0ksU0FEVCxNQUNVLE1BQU07UUFtQmQsZ0JBQWdCLE1BcEJsQjs7UUFFRSxLQUFBLE9BQUEsZUFGRixNQUFLLFlBQUEsZUFBQSxNQUFBLEtBQUEsTUFFRzs7UUFFTixLQUFLLGVBQWUsSUFBQSw4QkFBQTs7O0lBdUJ4QixVQTNCRSxPQUFLOztJQTZCUCxhQTdCRSxPQUFLLENBQUE7UUE4QkgsS0FBSztRQUNMLE9BeEJFLFNBQUEsU0FBRztZQUNMLEtBQUEsT0FBQSxlQVJGLE1BQUssWUFBQSxVQUFBLE1BQUEsS0FBQTtZQVNILEtBQUssTUFBTSxrQkFBa0I7WUFDN0IsS0FBSyxhQUFhLE9BQU8sS0FBSzs7T0EwQi9CO1FBQ0MsS0FBSztRQUNMLE9BekJJLFNBQUEsV0FBRztZQUNQLEtBQUssTUFBTTs7OztJQTZCZixPQTNDRTtHQUFjLE9BQU87O0FBOEMzQixRQUFRLGFBNUJPO0FBNkJmLE9BQU8sVUFBVSxRQUFRO3N5REFDNndEOztBQzFEdHlEOzs7Ozs7OztBQVFBOztBQUFBLE9BQU8sVUFBVTs7OztFQUliLFVBQVU7RUFDVixNQUFNOzs7OztFQUtOLGdCQUFnQjtFQUNoQixjQUFjO0VBQ2QsZ0JBQWdCO0VBQ2hCLGFBQWE7RUFDYixtQkFBbUIsQ0FBQztFQUNwQix1QkFBdUI7Ozs7O0VBS3ZCLFdBQVc7RUFDWCxXQUFXO0VBQ1gsY0FBYztFQUNkLGFBQWE7RUFDYixNQUFNO0VBQ04sYUFBYTtFQUNiLFdBQVc7RUFDWCxhQUFhO0VBQ2IsWUFBWTtFQUNaLFlBQVk7Ozs7O0VBS1osWUFBWTs7OG9FQUk4bkUiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxucmVxdWlyZShcImNvcmUtanMvc2hpbVwiKTtcblxucmVxdWlyZShcInJlZ2VuZXJhdG9yL3J1bnRpbWVcIik7XG5cbmlmIChnbG9iYWwuX2JhYmVsUG9seWZpbGwpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwib25seSBvbmUgaW5zdGFuY2Ugb2YgYmFiZWwvcG9seWZpbGwgaXMgYWxsb3dlZFwiKTtcbn1cbmdsb2JhbC5fYmFiZWxQb2x5ZmlsbCA9IHRydWU7IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdCgkdGhpcylcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gJC50b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XG4gICAgICB2YWx1ZSA9IE9baW5kZXgrK107XG4gICAgICBpZih2YWx1ZSAhPSB2YWx1ZSlyZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXg7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTsiLCIvLyAwIC0+IEFycmF5I2ZvckVhY2hcbi8vIDEgLT4gQXJyYXkjbWFwXG4vLyAyIC0+IEFycmF5I2ZpbHRlclxuLy8gMyAtPiBBcnJheSNzb21lXG4vLyA0IC0+IEFycmF5I2V2ZXJ5XG4vLyA1IC0+IEFycmF5I2ZpbmRcbi8vIDYgLT4gQXJyYXkjZmluZEluZGV4XG52YXIgJCAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggPSByZXF1aXJlKCcuLyQuY3R4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRZUEUpe1xuICB2YXIgSVNfTUFQICAgICAgICA9IFRZUEUgPT0gMVxuICAgICwgSVNfRklMVEVSICAgICA9IFRZUEUgPT0gMlxuICAgICwgSVNfU09NRSAgICAgICA9IFRZUEUgPT0gM1xuICAgICwgSVNfRVZFUlkgICAgICA9IFRZUEUgPT0gNFxuICAgICwgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNlxuICAgICwgTk9fSE9MRVMgICAgICA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQpe1xuICAgIHZhciBPICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKCR0aGlzKSlcbiAgICAgICwgc2VsZiAgID0gJC5FUzVPYmplY3QoTylcbiAgICAgICwgZiAgICAgID0gY3R4KGNhbGxiYWNrZm4sIHRoYXQsIDMpXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoc2VsZi5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IDBcbiAgICAgICwgcmVzdWx0ID0gSVNfTUFQID8gQXJyYXkobGVuZ3RoKSA6IElTX0ZJTFRFUiA/IFtdIDogdW5kZWZpbmVkXG4gICAgICAsIHZhbCwgcmVzO1xuICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZil7XG4gICAgICB2YWwgPSBzZWxmW2luZGV4XTtcbiAgICAgIHJlcyA9IGYodmFsLCBpbmRleCwgTyk7XG4gICAgICBpZihUWVBFKXtcbiAgICAgICAgaWYoSVNfTUFQKXJlc3VsdFtpbmRleF0gPSByZXM7ICAgICAgICAgICAgLy8gbWFwXG4gICAgICAgIGVsc2UgaWYocmVzKXN3aXRjaChUWVBFKXtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbDsgICAgICAgICAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcbiAgICAgICAgfSBlbHNlIGlmKElTX0VWRVJZKXJldHVybiBmYWxzZTsgICAgICAgICAgLy8gZXZlcnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIElTX0ZJTkRfSU5ERVggPyAtMSA6IElTX1NPTUUgfHwgSVNfRVZFUlkgPyBJU19FVkVSWSA6IHJlc3VsdDtcbiAgfTtcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1zZzEsIG1zZzIpe1xuICBpZighY29uZGl0aW9uKXRocm93IFR5cGVFcnJvcihtc2cyID8gbXNnMSArIG1zZzIgOiBtc2cxKTtcbn1cbmFzc2VydC5kZWYgPSAkLmFzc2VydERlZmluZWQ7XG5hc3NlcnQuZm4gPSBmdW5jdGlvbihpdCl7XG4gIGlmKCEkLmlzRnVuY3Rpb24oaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XG4gIHJldHVybiBpdDtcbn07XG5hc3NlcnQub2JqID0gZnVuY3Rpb24oaXQpe1xuICBpZighJC5pc09iamVjdChpdCkpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYW4gb2JqZWN0IScpO1xuICByZXR1cm4gaXQ7XG59O1xuYXNzZXJ0Lmluc3QgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUpe1xuICBpZighKGl0IGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXRocm93IFR5cGVFcnJvcihuYW1lICsgXCI6IHVzZSB0aGUgJ25ldycgb3BlcmF0b3IhXCIpO1xuICByZXR1cm4gaXQ7XG59O1xubW9kdWxlLmV4cG9ydHMgPSBhc3NlcnQ7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKTtcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVudXNlZC12YXJzICovXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlKXtcbi8qIGVzbGludC1lbmFibGUgbm8tdW51c2VkLXZhcnMgKi9cbiAgdmFyIFQgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRhcmdldCkpXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgaSA9IDE7XG4gIHdoaWxlKGwgPiBpKXtcbiAgICB2YXIgUyAgICAgID0gJC5FUzVPYmplY3QoYXJndW1lbnRzW2krK10pXG4gICAgICAsIGtleXMgICA9IGVudW1LZXlzKFMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGogICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKGxlbmd0aCA+IGopVFtrZXkgPSBrZXlzW2orK11dID0gU1trZXldO1xuICB9XG4gIHJldHVybiBUO1xufTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIFRBRyAgICAgID0gcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXG4gICwgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcbmZ1bmN0aW9uIGNvZihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59XG5jb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQ7XG4gIHJldHVybiBpdCA9PSB1bmRlZmluZWQgPyBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiAnTnVsbCdcbiAgICA6IHR5cGVvZiAoVCA9IChPID0gT2JqZWN0KGl0KSlbVEFHXSkgPT0gJ3N0cmluZycgPyBUIDogY29mKE8pO1xufTtcbmNvZi5zZXQgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgISQuaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKSQuaGlkZShpdCwgVEFHLCB0YWcpO1xufTtcbm1vZHVsZS5leHBvcnRzID0gY29mOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBzYWZlICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBmb3JPZiAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHN0ZXAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5zdGVwXG4gICwgJGhhcyAgICAgPSAkLmhhc1xuICAsIHNldCAgICAgID0gJC5zZXRcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcbiAgLCBoaWRlICAgICA9ICQuaGlkZVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBJRCAgICAgICA9IHNhZmUoJ2lkJylcbiAgLCBPMSAgICAgICA9IHNhZmUoJ08xJylcbiAgLCBMQVNUICAgICA9IHNhZmUoJ2xhc3QnKVxuICAsIEZJUlNUICAgID0gc2FmZSgnZmlyc3QnKVxuICAsIElURVIgICAgID0gc2FmZSgnaXRlcicpXG4gICwgU0laRSAgICAgPSAkLkRFU0MgPyBzYWZlKCdzaXplJykgOiAnc2l6ZSdcbiAgLCBpZCAgICAgICA9IDA7XG5cbmZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighJGhhcyhpdCwgSUQpKXtcbiAgICAvLyBjYW4ndCBzZXQgaWQgdG8gZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcbiAgICBpZighY3JlYXRlKXJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3Npbmcgb2JqZWN0IGlkXG4gICAgaGlkZShpdCwgSUQsICsraWQpO1xuICAvLyByZXR1cm4gb2JqZWN0IGlkIHdpdGggcHJlZml4XG4gIH0gcmV0dXJuICdPJyArIGl0W0lEXTtcbn1cblxuZnVuY3Rpb24gZ2V0RW50cnkodGhhdCwga2V5KXtcbiAgLy8gZmFzdCBjYXNlXG4gIHZhciBpbmRleCA9IGZhc3RLZXkoa2V5KSwgZW50cnk7XG4gIGlmKGluZGV4ICE9PSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcbiAgLy8gZnJvemVuIG9iamVjdCBjYXNlXG4gIGZvcihlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGhhdCwgaXRlcmFibGUpe1xuICAgICAgYXNzZXJ0Lmluc3QodGhhdCwgQywgTkFNRSk7XG4gICAgICBzZXQodGhhdCwgTzEsICQuY3JlYXRlKG51bGwpKTtcbiAgICAgIHNldCh0aGF0LCBTSVpFLCAwKTtcbiAgICAgIHNldCh0aGF0LCBMQVNULCB1bmRlZmluZWQpO1xuICAgICAgc2V0KHRoYXQsIEZJUlNULCB1bmRlZmluZWQpO1xuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgLy8gMjMuMi4zLjIgU2V0LnByb3RvdHlwZS5jbGVhcigpXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIoKXtcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihlbnRyeS5wKWVudHJ5LnAgPSBlbnRyeS5wLm4gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XG4gICAgICAgIH1cbiAgICAgICAgdGhhdFtGSVJTVF0gPSB0aGF0W0xBU1RdID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGF0W1NJWkVdID0gMDtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuMyBNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcbiAgICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgICB2YXIgdGhhdCAgPSB0aGlzXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XG4gICAgICAgIGlmKGVudHJ5KXtcbiAgICAgICAgICB2YXIgbmV4dCA9IGVudHJ5Lm5cbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XG4gICAgICAgICAgZGVsZXRlIHRoYXRbTzFdW2VudHJ5LmldO1xuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcbiAgICAgICAgICBpZihuZXh0KW5leHQucCA9IHByZXY7XG4gICAgICAgICAgaWYodGhhdFtGSVJTVF0gPT0gZW50cnkpdGhhdFtGSVJTVF0gPSBuZXh0O1xuICAgICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XG4gICAgICAgICAgdGhhdFtTSVpFXS0tO1xuICAgICAgICB9IHJldHVybiAhIWVudHJ5O1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjIuMy42IFNldC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgLy8gMjMuMS4zLjUgTWFwLnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXG4gICAgICAgICAgLCBlbnRyeTtcbiAgICAgICAgd2hpbGUoZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiB0aGlzW0ZJUlNUXSl7XG4gICAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcbiAgICAgICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIC8vIDIzLjEuMy43IE1hcC5wcm90b3R5cGUuaGFzKGtleSlcbiAgICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZigkLkRFU0MpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIGFzc2VydC5kZWYodGhpc1tTSVpFXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgdmFyIGVudHJ5ID0gZ2V0RW50cnkodGhhdCwga2V5KVxuICAgICAgLCBwcmV2LCBpbmRleDtcbiAgICAvLyBjaGFuZ2UgZXhpc3RpbmcgZW50cnlcbiAgICBpZihlbnRyeSl7XG4gICAgICBlbnRyeS52ID0gdmFsdWU7XG4gICAgLy8gY3JlYXRlIG5ldyBlbnRyeVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XG4gICAgICAgIGk6IGluZGV4ID0gZmFzdEtleShrZXksIHRydWUpLCAvLyA8LSBpbmRleFxuICAgICAgICBrOiBrZXksICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0ga2V5XG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgICBwOiBwcmV2ID0gdGhhdFtMQVNUXSwgICAgICAgICAgLy8gPC0gcHJldmlvdXMgZW50cnlcbiAgICAgICAgbjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgIC8vIDwtIG5leHQgZW50cnlcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcbiAgICAgIH07XG4gICAgICBpZighdGhhdFtGSVJTVF0pdGhhdFtGSVJTVF0gPSBlbnRyeTtcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XG4gICAgICB0aGF0W1NJWkVdKys7XG4gICAgICAvLyBhZGQgdG8gaW5kZXhcbiAgICAgIGlmKGluZGV4ICE9PSAnRicpdGhhdFtPMV1baW5kZXhdID0gZW50cnk7XG4gICAgfSByZXR1cm4gdGhhdDtcbiAgfSxcbiAgZ2V0RW50cnk6IGdldEVudHJ5LFxuICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cbiAgLy8gMjMuMS4zLjQsIDIzLjEuMy44LCAyMy4xLjMuMTEsIDIzLjEuMy4xMiwgMjMuMi4zLjUsIDIzLjIuMy44LCAyMy4yLjMuMTAsIDIzLjIuMy4xMVxuICBzZXRJdGVyOiBmdW5jdGlvbihDLCBOQU1FLCBJU19NQVApe1xuICAgIHJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEMsIE5BTUUsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgICAgIHNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IGtpbmR9KTtcbiAgICB9LCBmdW5jdGlvbigpe1xuICAgICAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxuICAgICAgICAsIGtpbmQgID0gaXRlci5rXG4gICAgICAgICwgZW50cnkgPSBpdGVyLmw7XG4gICAgICAvLyByZXZlcnQgdG8gdGhlIGxhc3QgZXhpc3RpbmcgZW50cnlcbiAgICAgIHdoaWxlKGVudHJ5ICYmIGVudHJ5LnIpZW50cnkgPSBlbnRyeS5wO1xuICAgICAgLy8gZ2V0IG5leHQgZW50cnlcbiAgICAgIGlmKCFpdGVyLm8gfHwgIShpdGVyLmwgPSBlbnRyeSA9IGVudHJ5ID8gZW50cnkubiA6IGl0ZXIub1tGSVJTVF0pKXtcbiAgICAgICAgLy8gb3IgZmluaXNoIHRoZSBpdGVyYXRpb25cbiAgICAgICAgaXRlci5vID0gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gc3RlcCgxKTtcbiAgICAgIH1cbiAgICAgIC8vIHJldHVybiBzdGVwIGJ5IGtpbmRcbiAgICAgIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgZW50cnkuayk7XG4gICAgICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xuICAgICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcbiAgICB9LCBJU19NQVAgPyAnZW50cmllcycgOiAndmFsdWVzJyAsICFJU19NQVAsIHRydWUpO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FKXtcbiAgJGRlZigkZGVmLlAsIE5BTUUsIHtcbiAgICB0b0pTT046IGZ1bmN0aW9uIHRvSlNPTigpe1xuICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgZm9yT2YodGhpcywgZmFsc2UsIGFyci5wdXNoLCBhcnIpO1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBzYWZlICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZVxuICAsIGFzc2VydCAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGZvck9mICAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsICRoYXMgICAgICA9ICQuaGFzXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxuICAsIGhpZGUgICAgICA9ICQuaGlkZVxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBpZCAgICAgICAgPSAwXG4gICwgSUQgICAgICAgID0gc2FmZSgnaWQnKVxuICAsIFdFQUsgICAgICA9IHNhZmUoJ3dlYWsnKVxuICAsIExFQUsgICAgICA9IHNhZmUoJ2xlYWsnKVxuICAsIG1ldGhvZCAgICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJylcbiAgLCBmaW5kICAgICAgPSBtZXRob2QoNSlcbiAgLCBmaW5kSW5kZXggPSBtZXRob2QoNik7XG5mdW5jdGlvbiBmaW5kRnJvemVuKHN0b3JlLCBrZXkpe1xuICByZXR1cm4gZmluZChzdG9yZS5hcnJheSwgZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdFswXSA9PT0ga2V5O1xuICB9KTtcbn1cbi8vIGZhbGxiYWNrIGZvciBmcm96ZW4ga2V5c1xuZnVuY3Rpb24gbGVha1N0b3JlKHRoYXQpe1xuICByZXR1cm4gdGhhdFtMRUFLXSB8fCBoaWRlKHRoYXQsIExFQUssIHtcbiAgICBhcnJheTogW10sXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpe1xuICAgICAgdmFyIGVudHJ5ID0gZmluZEZyb3plbih0aGlzLCBrZXkpO1xuICAgICAgaWYoZW50cnkpcmV0dXJuIGVudHJ5WzFdO1xuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpe1xuICAgICAgcmV0dXJuICEhZmluZEZyb3plbih0aGlzLCBrZXkpO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICAgIGlmKGVudHJ5KWVudHJ5WzFdID0gdmFsdWU7XG4gICAgICBlbHNlIHRoaXMuYXJyYXkucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgIH0sXG4gICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICB2YXIgaW5kZXggPSBmaW5kSW5kZXgodGhpcy5hcnJheSwgZnVuY3Rpb24oaXQpe1xuICAgICAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgICAgIH0pO1xuICAgICAgaWYofmluZGV4KXRoaXMuYXJyYXkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHJldHVybiAhIX5pbmRleDtcbiAgICB9XG4gIH0pW0xFQUtdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0Q29uc3RydWN0b3I6IGZ1bmN0aW9uKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpe1xuICAgIHZhciBDID0gd3JhcHBlcihmdW5jdGlvbih0aGF0LCBpdGVyYWJsZSl7XG4gICAgICAkLnNldChhc3NlcnQuaW5zdCh0aGF0LCBDLCBOQU1FKSwgSUQsIGlkKyspO1xuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKWZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcbiAgICB9KTtcbiAgICByZXF1aXJlKCcuLyQubWl4JykoQy5wcm90b3R5cGUsIHtcbiAgICAgIC8vIDIzLjMuMy4yIFdlYWtNYXAucHJvdG90eXBlLmRlbGV0ZShrZXkpXG4gICAgICAvLyAyMy40LjMuMyBXZWFrU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZighaXNFeHRlbnNpYmxlKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKVsnZGVsZXRlJ10oa2V5KTtcbiAgICAgICAgcmV0dXJuICRoYXMoa2V5LCBXRUFLKSAmJiAkaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pICYmIGRlbGV0ZSBrZXlbV0VBS11bdGhpc1tJRF1dO1xuICAgICAgfSxcbiAgICAgIC8vIDIzLjMuMy40IFdlYWtNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy40LjMuNCBXZWFrU2V0LnByb3RvdHlwZS5oYXModmFsdWUpXG4gICAgICBoYXM6IGZ1bmN0aW9uIGhhcyhrZXkpe1xuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmKCFpc0V4dGVuc2libGUoa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmhhcyhrZXkpO1xuICAgICAgICByZXR1cm4gJGhhcyhrZXksIFdFQUspICYmICRoYXMoa2V5W1dFQUtdLCB0aGlzW0lEXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIEM7XG4gIH0sXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XG4gICAgaWYoIWlzRXh0ZW5zaWJsZShhc3NlcnQub2JqKGtleSkpKXtcbiAgICAgIGxlYWtTdG9yZSh0aGF0KS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRoYXMoa2V5LCBXRUFLKSB8fCBoaWRlKGtleSwgV0VBSywge30pO1xuICAgICAga2V5W1dFQUtdW3RoYXRbSURdXSA9IHZhbHVlO1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGxlYWtTdG9yZTogbGVha1N0b3JlLFxuICBXRUFLOiBXRUFLLFxuICBJRDogSURcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIEJVR0dZID0gcmVxdWlyZSgnLi8kLml0ZXInKS5CVUdHWVxuICAsIGZvck9mID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc3BlY2llcyA9IHJlcXVpcmUoJy4vJC5zcGVjaWVzJylcbiAgLCBhc3NlcnRJbnN0YW5jZSA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5pbnN0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIHdyYXBwZXIsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBJU19XRUFLKXtcbiAgdmFyIEJhc2UgID0gJC5nW05BTUVdXG4gICAgLCBDICAgICA9IEJhc2VcbiAgICAsIEFEREVSID0gSVNfTUFQID8gJ3NldCcgOiAnYWRkJ1xuICAgICwgcHJvdG8gPSBDICYmIEMucHJvdG90eXBlXG4gICAgLCBPICAgICA9IHt9O1xuICBmdW5jdGlvbiBmaXhNZXRob2QoS0VZKXtcbiAgICB2YXIgZm4gPSBwcm90b1tLRVldO1xuICAgIHJlcXVpcmUoJy4vJC5yZWRlZicpKHByb3RvLCBLRVksXG4gICAgICBLRVkgPT0gJ2RlbGV0ZScgPyBmdW5jdGlvbihhKXsgcmV0dXJuIGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhKTsgfVxuICAgICAgOiBLRVkgPT0gJ2hhcycgPyBmdW5jdGlvbiBoYXMoYSl7IHJldHVybiBmbi5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSk7IH1cbiAgICAgIDogS0VZID09ICdnZXQnID8gZnVuY3Rpb24gZ2V0KGEpeyByZXR1cm4gZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpOyB9XG4gICAgICA6IEtFWSA9PSAnYWRkJyA/IGZ1bmN0aW9uIGFkZChhKXsgZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpOyByZXR1cm4gdGhpczsgfVxuICAgICAgOiBmdW5jdGlvbiBzZXQoYSwgYil7IGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhLCBiKTsgcmV0dXJuIHRoaXM7IH1cbiAgICApO1xuICB9XG4gIGlmKCEkLmlzRnVuY3Rpb24oQykgfHwgIShJU19XRUFLIHx8ICFCVUdHWSAmJiBwcm90by5mb3JFYWNoICYmIHByb3RvLmVudHJpZXMpKXtcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuICAgIEMgPSBjb21tb24uZ2V0Q29uc3RydWN0b3Iod3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUik7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCBtZXRob2RzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW5zdCAgPSBuZXcgQ1xuICAgICAgLCBjaGFpbiA9IGluc3RbQURERVJdKElTX1dFQUsgPyB7fSA6IC0wLCAxKVxuICAgICAgLCBidWdneVplcm87XG4gICAgLy8gd3JhcCBmb3IgaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXG4gICAgaWYoIXJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBuZXcgQyhpdGVyKTsgfSkpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICAgICAgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGFyZ2V0LCBpdGVyYWJsZSl7XG4gICAgICAgIGFzc2VydEluc3RhbmNlKHRhcmdldCwgQywgTkFNRSk7XG4gICAgICAgIHZhciB0aGF0ID0gbmV3IEJhc2U7XG4gICAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgICAgIHJldHVybiB0aGF0O1xuICAgICAgfSk7XG4gICAgICBDLnByb3RvdHlwZSA9IHByb3RvO1xuICAgICAgcHJvdG8uY29uc3RydWN0b3IgPSBDO1xuICAgIH1cbiAgICBJU19XRUFLIHx8IGluc3QuZm9yRWFjaChmdW5jdGlvbih2YWwsIGtleSl7XG4gICAgICBidWdneVplcm8gPSAxIC8ga2V5ID09PSAtSW5maW5pdHk7XG4gICAgfSk7XG4gICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXG4gICAgaWYoYnVnZ3laZXJvKXtcbiAgICAgIGZpeE1ldGhvZCgnZGVsZXRlJyk7XG4gICAgICBmaXhNZXRob2QoJ2hhcycpO1xuICAgICAgSVNfTUFQICYmIGZpeE1ldGhvZCgnZ2V0Jyk7XG4gICAgfVxuICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xuICAgIGlmKGJ1Z2d5WmVybyB8fCBjaGFpbiAhPT0gaW5zdClmaXhNZXRob2QoQURERVIpO1xuICB9XG5cbiAgcmVxdWlyZSgnLi8kLmNvZicpLnNldChDLCBOQU1FKTtcblxuICBPW05BTUVdID0gQztcbiAgJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAoQyAhPSBCYXNlKSwgTyk7XG4gIHNwZWNpZXMoQyk7XG4gIHNwZWNpZXMoJC5jb3JlW05BTUVdKTsgLy8gZm9yIHdyYXBwZXJcblxuICBpZighSVNfV0VBSyljb21tb24uc2V0SXRlcihDLCBOQU1FLCBJU19NQVApO1xuXG4gIHJldHVybiBDO1xufTsiLCIvLyBPcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFzc2VydEZ1bmN0aW9uKGZuKTtcbiAgaWYofmxlbmd0aCAmJiB0aGF0ID09PSB1bmRlZmluZWQpcmV0dXJuIGZuO1xuICBzd2l0Y2gobGVuZ3RoKXtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYiwgYyk7XG4gICAgfTtcbiAgfSByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgICB9O1xufTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZ2xvYmFsICAgICA9ICQuZ1xuICAsIGNvcmUgICAgICAgPSAkLmNvcmVcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uXG4gICwgJHJlZGVmICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpO1xuZnVuY3Rpb24gY3R4KGZuLCB0aGF0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5nbG9iYWwuY29yZSA9IGNvcmU7XG4vLyB0eXBlIGJpdG1hcFxuJGRlZi5GID0gMTsgIC8vIGZvcmNlZFxuJGRlZi5HID0gMjsgIC8vIGdsb2JhbFxuJGRlZi5TID0gNDsgIC8vIHN0YXRpY1xuJGRlZi5QID0gODsgIC8vIHByb3RvXG4kZGVmLkIgPSAxNjsgLy8gYmluZFxuJGRlZi5XID0gMzI7IC8vIHdyYXBcbmZ1bmN0aW9uICRkZWYodHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxuICAgICwgaXNHbG9iYWwgPSB0eXBlICYgJGRlZi5HXG4gICAgLCBpc1Byb3RvICA9IHR5cGUgJiAkZGVmLlBcbiAgICAsIHRhcmdldCAgID0gaXNHbG9iYWwgPyBnbG9iYWwgOiB0eXBlICYgJGRlZi5TXG4gICAgICAgID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSkucHJvdG90eXBlXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XG4gIGlmKGlzR2xvYmFsKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhKHR5cGUgJiAkZGVmLkYpICYmIHRhcmdldCAmJiBrZXkgaW4gdGFyZ2V0O1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIGlmKHR5cGUgJiAkZGVmLkIgJiYgb3duKWV4cCA9IGN0eChvdXQsIGdsb2JhbCk7XG4gICAgZWxzZSBleHAgPSBpc1Byb3RvICYmIGlzRnVuY3Rpb24ob3V0KSA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICBpZih0YXJnZXQgJiYgIW93bikkcmVkZWYodGFyZ2V0LCBrZXksIG91dCk7XG4gICAgLy8gZXhwb3J0XG4gICAgaWYoZXhwb3J0c1trZXldICE9IG91dCkkLmhpZGUoZXhwb3J0cywga2V5LCBleHApO1xuICAgIGlmKGlzUHJvdG8pKGV4cG9ydHMucHJvdG90eXBlIHx8IChleHBvcnRzLnByb3RvdHlwZSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAkZGVmOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZG9jdW1lbnQgPSAkLmcuZG9jdW1lbnRcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIga2V5cyAgICAgICA9ICQuZ2V0S2V5cyhpdClcbiAgICAsIGdldERlc2MgICAgPSAkLmdldERlc2NcbiAgICAsIGdldFN5bWJvbHMgPSAkLmdldFN5bWJvbHM7XG4gIGlmKGdldFN5bWJvbHMpJC5lYWNoLmNhbGwoZ2V0U3ltYm9scyhpdCksIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYoZ2V0RGVzYyhpdCwga2V5KS5lbnVtZXJhYmxlKWtleXMucHVzaChrZXkpO1xuICB9KTtcbiAgcmV0dXJuIGtleXM7XG59OyIsInZhciBjdHggID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgZ2V0ICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuZ2V0XG4gICwgY2FsbCA9IHJlcXVpcmUoJy4vJC5pdGVyLWNhbGwnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcbiAgdmFyIGl0ZXJhdG9yID0gZ2V0KGl0ZXJhYmxlKVxuICAgICwgZiAgICAgICAgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcbiAgICAsIHN0ZXA7XG4gIHdoaWxlKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSl7XG4gICAgaWYoY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcykgPT09IGZhbHNlKXtcbiAgICAgIHJldHVybiBjYWxsLmNsb3NlKGl0ZXJhdG9yKTtcbiAgICB9XG4gIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkKXtcbiAgJC5GVyAgID0gdHJ1ZTtcbiAgJC5wYXRoID0gJC5nO1xuICByZXR1cm4gJDtcbn07IiwiLy8gZmFsbGJhY2sgZm9yIElFMTEgYnVnZ3kgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgd2l0aCBpZnJhbWUgYW5kIHdpbmRvd1xyXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCB0b1N0cmluZyA9IHt9LnRvU3RyaW5nXHJcbiAgLCBnZXROYW1lcyA9ICQuZ2V0TmFtZXM7XHJcblxyXG52YXIgd2luZG93TmFtZXMgPSB0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXHJcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XHJcblxyXG5mdW5jdGlvbiBnZXRXaW5kb3dOYW1lcyhpdCl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBnZXROYW1lcyhpdCk7XHJcbiAgfSBjYXRjaChlKXtcclxuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuZ2V0ID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XHJcbiAgaWYod2luZG93TmFtZXMgJiYgdG9TdHJpbmcuY2FsbChpdCkgPT0gJ1tvYmplY3QgV2luZG93XScpcmV0dXJuIGdldFdpbmRvd05hbWVzKGl0KTtcclxuICByZXR1cm4gZ2V0TmFtZXMoJC50b09iamVjdChpdCkpO1xyXG59OyIsIi8vIEZhc3QgYXBwbHlcbi8vIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcbiAgICBjYXNlIDU6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pO1xuICB9IHJldHVybiAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgYXJncyk7XG59OyIsInZhciBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqO1xuZnVuY3Rpb24gY2xvc2UoaXRlcmF0b3Ipe1xuICB2YXIgcmV0ID0gaXRlcmF0b3JbJ3JldHVybiddO1xuICBpZihyZXQgIT09IHVuZGVmaW5lZClhc3NlcnRPYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbn1cbmZ1bmN0aW9uIGNhbGwoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGVudHJpZXMgPyBmbihhc3NlcnRPYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIH0gY2F0Y2goZSl7XG4gICAgY2xvc2UoaXRlcmF0b3IpO1xuICAgIHRocm93IGU7XG4gIH1cbn1cbmNhbGwuY2xvc2UgPSBjbG9zZTtcbm1vZHVsZS5leHBvcnRzID0gY2FsbDsiLCJ2YXIgJGRlZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHJlZGVmICAgICAgICAgID0gcmVxdWlyZSgnLi8kLnJlZGVmJylcbiAgLCAkICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRpdGVyICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBGRl9JVEVSQVRPUiAgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICAgPSAndmFsdWVzJ1xuICAsIEl0ZXJhdG9ycyAgICAgICA9ICRpdGVyLkl0ZXJhdG9ycztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0Upe1xuICAkaXRlci5jcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICBmdW5jdGlvbiBjcmVhdGVNZXRob2Qoa2luZCl7XG4gICAgZnVuY3Rpb24gJCQodGhhdCl7XG4gICAgICByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoYXQsIGtpbmQpO1xuICAgIH1cbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgICB9IHJldHVybiBmdW5jdGlvbiBlbnRyaWVzKCl7IHJldHVybiAkJCh0aGlzKTsgfTtcbiAgfVxuICB2YXIgVEFHICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIHByb3RvICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsIF9uYXRpdmUgID0gcHJvdG9bU1lNQk9MX0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgX2RlZmF1bHQgPSBfbmF0aXZlIHx8IGNyZWF0ZU1ldGhvZChERUZBVUxUKVxuICAgICwgbWV0aG9kcywga2V5O1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKF9uYXRpdmUpe1xuICAgIHZhciBJdGVyYXRvclByb3RvdHlwZSA9ICQuZ2V0UHJvdG8oX2RlZmF1bHQuY2FsbChuZXcgQmFzZSkpO1xuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcbiAgICBjb2Yuc2V0KEl0ZXJhdG9yUHJvdG90eXBlLCBUQUcsIHRydWUpO1xuICAgIC8vIEZGIGZpeFxuICAgIGlmKCQuRlcgJiYgJC5oYXMocHJvdG8sIEZGX0lURVJBVE9SKSkkaXRlci5zZXQoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCQuRlcgfHwgRk9SQ0UpJGl0ZXIuc2V0KHByb3RvLCBfZGVmYXVsdCk7XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gX2RlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9ICQudGhhdDtcbiAgaWYoREVGQVVMVCl7XG4gICAgbWV0aG9kcyA9IHtcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgICAgICAgID8gX2RlZmF1bHQgOiBjcmVhdGVNZXRob2QoS0VZUyksXG4gICAgICB2YWx1ZXM6ICBERUZBVUxUID09IFZBTFVFUyA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKFZBTFVFUyksXG4gICAgICBlbnRyaWVzOiBERUZBVUxUICE9IFZBTFVFUyA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKCdlbnRyaWVzJylcbiAgICB9O1xuICAgIGlmKEZPUkNFKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpJHJlZGVmKHByb3RvLCBrZXksIG1ldGhvZHNba2V5XSk7XG4gICAgfSBlbHNlICRkZWYoJGRlZi5QICsgJGRlZi5GICogJGl0ZXIuQlVHR1ksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG59OyIsInZhciBTWU1CT0xfSVRFUkFUT1IgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBTQUZFX0NMT1NJTkcgICAgPSBmYWxzZTtcbnRyeSB7XG4gIHZhciByaXRlciA9IFs3XVtTWU1CT0xfSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgaWYoIVNBRkVfQ0xPU0lORylyZXR1cm4gZmFsc2U7XG4gIHZhciBzYWZlID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgdmFyIGFyciAgPSBbN11cbiAgICAgICwgaXRlciA9IGFycltTWU1CT0xfSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgc2FmZSA9IHRydWU7IH07XG4gICAgYXJyW1NZTUJPTF9JVEVSQVRPUl0gPSBmdW5jdGlvbigpeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIHNhZmU7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBjbGFzc29mICAgICAgICAgICA9IGNvZi5jbGFzc29mXG4gICwgYXNzZXJ0ICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBhc3NlcnRPYmplY3QgICAgICA9IGFzc2VydC5vYmpcbiAgLCBTWU1CT0xfSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEZGX0lURVJBVE9SICAgICAgID0gJ0BAaXRlcmF0b3InXG4gICwgSXRlcmF0b3JzICAgICAgICAgPSByZXF1aXJlKCcuLyQuc2hhcmVkJykoJ2l0ZXJhdG9ycycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbi8vIDI1LjEuMi4xLjEgJUl0ZXJhdG9yUHJvdG90eXBlJVtAQGl0ZXJhdG9yXSgpXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcbmZ1bmN0aW9uIHNldEl0ZXJhdG9yKE8sIHZhbHVlKXtcbiAgJC5oaWRlKE8sIFNZTUJPTF9JVEVSQVRPUiwgdmFsdWUpO1xuICAvLyBBZGQgaXRlcmF0b3IgZm9yIEZGIGl0ZXJhdG9yIHByb3RvY29sXG4gIGlmKEZGX0lURVJBVE9SIGluIFtdKSQuaGlkZShPLCBGRl9JVEVSQVRPUiwgdmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICBCVUdHWTogJ2tleXMnIGluIFtdICYmICEoJ25leHQnIGluIFtdLmtleXMoKSksXG4gIEl0ZXJhdG9yczogSXRlcmF0b3JzLFxuICBzdGVwOiBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XG4gICAgcmV0dXJuIHt2YWx1ZTogdmFsdWUsIGRvbmU6ICEhZG9uZX07XG4gIH0sXG4gIGlzOiBmdW5jdGlvbihpdCl7XG4gICAgdmFyIE8gICAgICA9IE9iamVjdChpdClcbiAgICAgICwgU3ltYm9sID0gJC5nLlN5bWJvbDtcbiAgICByZXR1cm4gKFN5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgRkZfSVRFUkFUT1IpIGluIE9cbiAgICAgIHx8IFNZTUJPTF9JVEVSQVRPUiBpbiBPXG4gICAgICB8fCAkLmhhcyhJdGVyYXRvcnMsIGNsYXNzb2YoTykpO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgU3ltYm9sID0gJC5nLlN5bWJvbFxuICAgICAgLCBnZXRJdGVyO1xuICAgIGlmKGl0ICE9IHVuZGVmaW5lZCl7XG4gICAgICBnZXRJdGVyID0gaXRbU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUl1cbiAgICAgICAgfHwgaXRbU1lNQk9MX0lURVJBVE9SXVxuICAgICAgICB8fCBJdGVyYXRvcnNbY2xhc3NvZihpdCldO1xuICAgIH1cbiAgICBhc3NlcnQoJC5pc0Z1bmN0aW9uKGdldEl0ZXIpLCBpdCwgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gICAgcmV0dXJuIGFzc2VydE9iamVjdChnZXRJdGVyLmNhbGwoaXQpKTtcbiAgfSxcbiAgc2V0OiBzZXRJdGVyYXRvcixcbiAgY3JlYXRlOiBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCwgcHJvdG8pe1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9ICQuY3JlYXRlKHByb3RvIHx8IEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogJC5kZXNjKDEsIG5leHQpfSk7XG4gICAgY29mLnNldChDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG52YXIgZ2xvYmFsID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKVxuICAsIGNvcmUgICA9IHt9XG4gICwgZGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHlcbiAgLCBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5XG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBtYXggICA9IE1hdGgubWF4XG4gICwgbWluICAgPSBNYXRoLm1pbjtcbi8vIFRoZSBlbmdpbmUgd29ya3MgZmluZSB3aXRoIGRlc2NyaXB0b3JzPyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5LlxudmFyIERFU0MgPSAhIWZ1bmN0aW9uKCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiAyOyB9fSkuYSA9PSAyO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59KCk7XG52YXIgaGlkZSA9IGNyZWF0ZURlZmluZXIoMSk7XG4vLyA3LjEuNCBUb0ludGVnZXJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufVxuZnVuY3Rpb24gZGVzYyhiaXRtYXAsIHZhbHVlKXtcbiAgcmV0dXJuIHtcbiAgICBlbnVtZXJhYmxlICA6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlICAgIDogIShiaXRtYXAgJiA0KSxcbiAgICB2YWx1ZSAgICAgICA6IHZhbHVlXG4gIH07XG59XG5mdW5jdGlvbiBzaW1wbGVTZXQob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcbiAgcmV0dXJuIERFU0MgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICAgIHJldHVybiAkLnNldERlc2Mob2JqZWN0LCBrZXksIGRlc2MoYml0bWFwLCB2YWx1ZSkpO1xuICB9IDogc2ltcGxlU2V0O1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChpdCl7XG4gIHJldHVybiBpdCAhPT0gbnVsbCAmJiAodHlwZW9mIGl0ID09ICdvYmplY3QnIHx8IHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nKTtcbn1cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhc3NlcnREZWZpbmVkKGl0KXtcbiAgaWYoaXQgPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uICBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufVxuXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xuICBnOiBnbG9iYWwsXG4gIGNvcmU6IGNvcmUsXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2NvcmUtanMtaXNvYmplY3RcbiAgaXNPYmplY3Q6ICAgaXNPYmplY3QsXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIC8vIDcuMS40IFRvSW50ZWdlclxuICB0b0ludGVnZXI6IHRvSW50ZWdlcixcbiAgLy8gNy4xLjE1IFRvTGVuZ3RoXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGl0ID4gMCA/IG1pbih0b0ludGVnZXIoaXQpLCAweDFmZmZmZmZmZmZmZmZmKSA6IDA7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTFcbiAgfSxcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gICAgaW5kZXggPSB0b0ludGVnZXIoaW5kZXgpO1xuICAgIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xuICB9LFxuICBoYXM6IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGl0LCBrZXkpO1xuICB9LFxuICBjcmVhdGU6ICAgICBPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICBPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIERFU0M6ICAgICAgIERFU0MsXG4gIGRlc2M6ICAgICAgIGRlc2MsXG4gIGdldERlc2M6ICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxuICBzZXREZXNjczogICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICBnZXRTeW1ib2xzOiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBhc3NlcnREZWZpbmVkOiBhc3NlcnREZWZpbmVkLFxuICAvLyBEdW1teSwgZml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGluIGVzNSBtb2R1bGVcbiAgRVM1T2JqZWN0OiBPYmplY3QsXG4gIHRvT2JqZWN0OiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcbiAgfSxcbiAgaGlkZTogaGlkZSxcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxuICBzZXQ6IGdsb2JhbC5TeW1ib2wgPyBzaW1wbGVTZXQgOiBoaWRlLFxuICBlYWNoOiBbXS5mb3JFYWNoXG59KTtcbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5pZih0eXBlb2YgX19lICE9ICd1bmRlZmluZWQnKV9fZSA9IGNvcmU7XG5pZih0eXBlb2YgX19nICE9ICd1bmRlZmluZWQnKV9fZyA9IGdsb2JhbDsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGVsKXtcbiAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxuICAgICwga2V5cyAgID0gJC5nZXRLZXlzKE8pXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICwgaW5kZXggID0gMFxuICAgICwga2V5O1xuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xufTsiLCJ2YXIgJHJlZGVmID0gcmVxdWlyZSgnLi8kLnJlZGVmJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBzcmMpe1xyXG4gIGZvcih2YXIga2V5IGluIHNyYykkcmVkZWYodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcclxuICByZXR1cm4gdGFyZ2V0O1xyXG59OyIsInZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmo7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG93bktleXMoaXQpe1xuICBhc3NlcnRPYmplY3QoaXQpO1xuICB2YXIga2V5cyAgICAgICA9ICQuZ2V0TmFtZXMoaXQpXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzO1xuICByZXR1cm4gZ2V0U3ltYm9scyA/IGtleXMuY29uY2F0KGdldFN5bWJvbHMoaXQpKSA6IGtleXM7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGludm9rZSA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIGFzc2VydEZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmZuO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigvKiAuLi5wYXJncyAqLyl7XG4gIHZhciBmbiAgICAgPSBhc3NlcnRGdW5jdGlvbih0aGlzKVxuICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgcGFyZ3MgID0gQXJyYXkobGVuZ3RoKVxuICAgICwgaSAgICAgID0gMFxuICAgICwgXyAgICAgID0gJC5wYXRoLl9cbiAgICAsIGhvbGRlciA9IGZhbHNlO1xuICB3aGlsZShsZW5ndGggPiBpKWlmKChwYXJnc1tpXSA9IGFyZ3VtZW50c1tpKytdKSA9PT0gXylob2xkZXIgPSB0cnVlO1xuICByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XG4gICAgdmFyIHRoYXQgICAgPSB0aGlzXG4gICAgICAsIF9sZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIGogPSAwLCBrID0gMCwgYXJncztcbiAgICBpZighaG9sZGVyICYmICFfbGVuZ3RoKXJldHVybiBpbnZva2UoZm4sIHBhcmdzLCB0aGF0KTtcbiAgICBhcmdzID0gcGFyZ3Muc2xpY2UoKTtcbiAgICBpZihob2xkZXIpZm9yKDtsZW5ndGggPiBqOyBqKyspaWYoYXJnc1tqXSA9PT0gXylhcmdzW2pdID0gYXJndW1lbnRzW2srK107XG4gICAgd2hpbGUoX2xlbmd0aCA+IGspYXJncy5wdXNoKGFyZ3VtZW50c1trKytdKTtcbiAgICByZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcbiAgfTtcbn07IiwidmFyICQgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCB0cGwgPSBTdHJpbmcoe30uaGFzT3duUHJvcGVydHkpXHJcbiAgLCBTUkMgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnc3JjJylcclxuICAsIF90b1N0cmluZyA9IEZ1bmN0aW9uLnRvU3RyaW5nO1xyXG5cclxuZnVuY3Rpb24gJHJlZGVmKE8sIGtleSwgdmFsLCBzYWZlKXtcclxuICBpZigkLmlzRnVuY3Rpb24odmFsKSl7XHJcbiAgICB2YXIgYmFzZSA9IE9ba2V5XTtcclxuICAgICQuaGlkZSh2YWwsIFNSQywgYmFzZSA/IFN0cmluZyhiYXNlKSA6IHRwbC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eS8sIFN0cmluZyhrZXkpKSk7XHJcbiAgICBpZighKCduYW1lJyBpbiB2YWwpKXZhbC5uYW1lID0ga2V5O1xyXG4gIH1cclxuICBpZihPID09PSAkLmcpe1xyXG4gICAgT1trZXldID0gdmFsO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBpZighc2FmZSlkZWxldGUgT1trZXldO1xyXG4gICAgJC5oaWRlKE8sIGtleSwgdmFsKTtcclxuICB9XHJcbn1cclxuXHJcbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzXHJcbi8vIHdpdGggbWV0aG9kcyBzaW1pbGFyIHRvIExvRGFzaCBpc05hdGl2ZVxyXG4kcmVkZWYoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xyXG4gIHJldHVybiAkLmhhcyh0aGlzLCBTUkMpID8gdGhpc1tTUkNdIDogX3RvU3RyaW5nLmNhbGwodGhpcyk7XHJcbn0pO1xyXG5cclxuJC5jb3JlLmluc3BlY3RTb3VyY2UgPSBmdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIF90b1N0cmluZy5jYWxsKGl0KTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gJHJlZGVmOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocmVnRXhwLCByZXBsYWNlLCBpc1N0YXRpYyl7XG4gIHZhciByZXBsYWNlciA9IHJlcGxhY2UgPT09IE9iamVjdChyZXBsYWNlKSA/IGZ1bmN0aW9uKHBhcnQpe1xuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xuICB9IDogcmVwbGFjZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5pcyB8fCBmdW5jdGlvbiBpcyh4LCB5KXtcclxuICByZXR1cm4geCA9PT0geSA/IHggIT09IDAgfHwgMSAvIHggPT09IDEgLyB5IDogeCAhPSB4ICYmIHkgIT0geTtcclxufTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBhc3NlcnQgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jyk7XG5mdW5jdGlvbiBjaGVjayhPLCBwcm90byl7XG4gIGFzc2VydC5vYmooTyk7XG4gIGFzc2VydChwcm90byA9PT0gbnVsbCB8fCAkLmlzT2JqZWN0KHByb3RvKSwgcHJvdG8sIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsICQuZ2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcbiAgICAgICAgICBzZXQoe30sIFtdKTtcbiAgICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90byl7XG4gICAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICAgIHJldHVybiBPO1xuICAgICAgICB9O1xuICAgICAgfSgpXG4gICAgOiB1bmRlZmluZWQpLFxuICBjaGVjazogY2hlY2tcbn07IiwidmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJ1xyXG4gICwgc3RvcmUgID0gJC5nW1NIQVJFRF0gfHwgJC5oaWRlKCQuZywgU0hBUkVELCB7fSlbU0hBUkVEXTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xyXG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xyXG59OyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBTUEVDSUVTID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEMpe1xuICBpZigkLkRFU0MgJiYgIShTUEVDSUVTIGluIEMpKSQuc2V0RGVzYyhDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogJC50aGF0XG4gIH0pO1xufTsiLCIvLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gJC50b0ludGVnZXIocG9zKVxuICAgICAgLCBsID0gcy5sZW5ndGhcbiAgICAgICwgYSwgYjtcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xuICAgIGEgPSBzLmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGEgPCAweGQ4MDAgfHwgYSA+IDB4ZGJmZiB8fCBpICsgMSA9PT0gbFxuICAgICAgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICAgID8gVE9fU1RSSU5HID8gcy5jaGFyQXQoaSkgOiBhXG4gICAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCIvLyBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1zdHJhd21hbjpzdHJpbmdfcGFkZGluZ1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgcmVwZWF0ID0gcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0aGF0LCBtaW5MZW5ndGgsIGZpbGxDaGFyLCBsZWZ0KXtcbiAgLy8gMS4gTGV0IE8gYmUgQ2hlY2tPYmplY3RDb2VyY2libGUodGhpcyB2YWx1ZSkuXG4gIC8vIDIuIExldCBTIGJlIFRvU3RyaW5nKE8pLlxuICB2YXIgUyA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhhdCkpO1xuICAvLyA0LiBJZiBpbnRNaW5MZW5ndGggaXMgdW5kZWZpbmVkLCByZXR1cm4gUy5cbiAgaWYobWluTGVuZ3RoID09PSB1bmRlZmluZWQpcmV0dXJuIFM7XG4gIC8vIDQuIExldCBpbnRNaW5MZW5ndGggYmUgVG9JbnRlZ2VyKG1pbkxlbmd0aCkuXG4gIHZhciBpbnRNaW5MZW5ndGggPSAkLnRvSW50ZWdlcihtaW5MZW5ndGgpO1xuICAvLyA1LiBMZXQgZmlsbExlbiBiZSB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gUyBtaW51cyBpbnRNaW5MZW5ndGguXG4gIHZhciBmaWxsTGVuID0gaW50TWluTGVuZ3RoIC0gUy5sZW5ndGg7XG4gIC8vIDYuIElmIGZpbGxMZW4gPCAwLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gIC8vIDcuIElmIGZpbGxMZW4gaXMgK+KIniwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICBpZihmaWxsTGVuIDwgMCB8fCBmaWxsTGVuID09PSBJbmZpbml0eSl7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0Nhbm5vdCBzYXRpc2Z5IHN0cmluZyBsZW5ndGggJyArIG1pbkxlbmd0aCArICcgZm9yIHN0cmluZzogJyArIFMpO1xuICB9XG4gIC8vIDguIExldCBzRmlsbFN0ciBiZSB0aGUgc3RyaW5nIHJlcHJlc2VudGVkIGJ5IGZpbGxTdHIuXG4gIC8vIDkuIElmIHNGaWxsU3RyIGlzIHVuZGVmaW5lZCwgbGV0IHNGaWxsU3RyIGJlIGEgc3BhY2UgY2hhcmFjdGVyLlxuICB2YXIgc0ZpbGxTdHIgPSBmaWxsQ2hhciA9PT0gdW5kZWZpbmVkID8gJyAnIDogU3RyaW5nKGZpbGxDaGFyKTtcbiAgLy8gMTAuIExldCBzRmlsbFZhbCBiZSBhIFN0cmluZyBtYWRlIG9mIHNGaWxsU3RyLCByZXBlYXRlZCB1bnRpbCBmaWxsTGVuIGlzIG1ldC5cbiAgdmFyIHNGaWxsVmFsID0gcmVwZWF0LmNhbGwoc0ZpbGxTdHIsIE1hdGguY2VpbChmaWxsTGVuIC8gc0ZpbGxTdHIubGVuZ3RoKSk7XG4gIC8vIHRydW5jYXRlIGlmIHdlIG92ZXJmbG93ZWRcbiAgaWYoc0ZpbGxWYWwubGVuZ3RoID4gZmlsbExlbilzRmlsbFZhbCA9IGxlZnRcbiAgICA/IHNGaWxsVmFsLnNsaWNlKHNGaWxsVmFsLmxlbmd0aCAtIGZpbGxMZW4pXG4gICAgOiBzRmlsbFZhbC5zbGljZSgwLCBmaWxsTGVuKTtcbiAgLy8gMTEuIFJldHVybiBhIHN0cmluZyBtYWRlIGZyb20gc0ZpbGxWYWwsIGZvbGxvd2VkIGJ5IFMuXG4gIC8vIDExLiBSZXR1cm4gYSBTdHJpbmcgbWFkZSBmcm9tIFMsIGZvbGxvd2VkIGJ5IHNGaWxsVmFsLlxuICByZXR1cm4gbGVmdCA/IHNGaWxsVmFsLmNvbmNhdChTKSA6IFMuY29uY2F0KHNGaWxsVmFsKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXBlYXQoY291bnQpe1xuICB2YXIgc3RyID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAsIHJlcyA9ICcnXG4gICAgLCBuICAgPSAkLnRvSW50ZWdlcihjb3VudCk7XG4gIGlmKG4gPCAwIHx8IG4gPT0gSW5maW5pdHkpdGhyb3cgUmFuZ2VFcnJvcihcIkNvdW50IGNhbid0IGJlIG5lZ2F0aXZlXCIpO1xuICBmb3IoO24gPiAwOyAobiA+Pj49IDEpICYmIChzdHIgKz0gc3RyKSlpZihuICYgMSlyZXMgKz0gc3RyO1xuICByZXR1cm4gcmVzO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjb2YgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCBpbnZva2UgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBjZWwgICAgPSByZXF1aXJlKCcuLyQuZG9tLWNyZWF0ZScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gJC5nXG4gICwgaXNGdW5jdGlvbiAgICAgICAgID0gJC5pc0Z1bmN0aW9uXG4gICwgaHRtbCAgICAgICAgICAgICAgID0gJC5odG1sXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXG4gICwgcG9zdE1lc3NhZ2UgICAgICAgID0gZ2xvYmFsLnBvc3RNZXNzYWdlXG4gICwgYWRkRXZlbnRMaXN0ZW5lciAgID0gZ2xvYmFsLmFkZEV2ZW50TGlzdGVuZXJcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcbiAgLCBjb3VudGVyICAgICAgICAgICAgPSAwXG4gICwgcXVldWUgICAgICAgICAgICAgID0ge31cbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xuICAsIGRlZmVyLCBjaGFubmVsLCBwb3J0O1xuZnVuY3Rpb24gcnVuKCl7XG4gIHZhciBpZCA9ICt0aGlzO1xuICBpZigkLmhhcyhxdWV1ZSwgaWQpKXtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59XG5mdW5jdGlvbiBsaXN0bmVyKGV2ZW50KXtcbiAgcnVuLmNhbGwoZXZlbnQuZGF0YSk7XG59XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZighaXNGdW5jdGlvbihzZXRUYXNrKSB8fCAhaXNGdW5jdGlvbihjbGVhclRhc2spKXtcbiAgc2V0VGFzayA9IGZ1bmN0aW9uKGZuKXtcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xuICAgICAgaW52b2tlKGlzRnVuY3Rpb24oZm4pID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uKGlkKXtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICB9O1xuICAvLyBOb2RlLmpzIDAuOC1cbiAgaWYoY29mKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gTW9kZXJuIGJyb3dzZXJzLCBza2lwIGltcGxlbWVudGF0aW9uIGZvciBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzIG9iamVjdFxuICB9IGVsc2UgaWYoYWRkRXZlbnRMaXN0ZW5lciAmJiBpc0Z1bmN0aW9uKHBvc3RNZXNzYWdlKSAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgcG9zdE1lc3NhZ2UoaWQsICcqJyk7XG4gICAgfTtcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xuICAvLyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZihpc0Z1bmN0aW9uKE1lc3NhZ2VDaGFubmVsKSl7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RuZXI7XG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICBleGVjKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsInZhciBzaWQgPSAwO1xuZnVuY3Rpb24gdWlkKGtleSl7XG4gIHJldHVybiAnU3ltYm9sKCcuY29uY2F0KGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXksICcpXycsICgrK3NpZCArIE1hdGgucmFuZG9tKCkpLnRvU3RyaW5nKDM2KSk7XG59XG51aWQuc2FmZSA9IHJlcXVpcmUoJy4vJCcpLmcuU3ltYm9sIHx8IHVpZDtcbm1vZHVsZS5leHBvcnRzID0gdWlkOyIsIi8vIDIyLjEuMy4zMSBBcnJheS5wcm90b3R5cGVbQEB1bnNjb3BhYmxlc11cbnZhciBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndW5zY29wYWJsZXMnKTtcbmlmKCEoVU5TQ09QQUJMRVMgaW4gW10pKXJlcXVpcmUoJy4vJCcpLmhpZGUoQXJyYXkucHJvdG90eXBlLCBVTlNDT1BBQkxFUywge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICBbXVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLyQnKS5nXG4gICwgc3RvcmUgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCd3a3MnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIGdsb2JhbC5TeW1ib2wgJiYgZ2xvYmFsLlN5bWJvbFtuYW1lXSB8fCByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnU3ltYm9sLicgKyBuYW1lKSk7XG59OyIsInZhciAkICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjZWwgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxuICAsIGNvZiAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaW52b2tlICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxuICAsIGFycmF5TWV0aG9kICAgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpXG4gICwgSUVfUFJPVE8gICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdfX3Byb3RvX18nKVxuICAsIGFzc2VydCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBhc3NlcnRPYmplY3QgICAgID0gYXNzZXJ0Lm9ialxuICAsIE9iamVjdFByb3RvICAgICAgPSBPYmplY3QucHJvdG90eXBlXG4gICwgaHRtbCAgICAgICAgICAgICA9ICQuaHRtbFxuICAsIEEgICAgICAgICAgICAgICAgPSBbXVxuICAsIF9zbGljZSAgICAgICAgICAgPSBBLnNsaWNlXG4gICwgX2pvaW4gICAgICAgICAgICA9IEEuam9pblxuICAsIGNsYXNzb2YgICAgICAgICAgPSBjb2YuY2xhc3NvZlxuICAsIGhhcyAgICAgICAgICAgICAgPSAkLmhhc1xuICAsIGRlZmluZVByb3BlcnR5ICAgPSAkLnNldERlc2NcbiAgLCBnZXRPd25EZXNjcmlwdG9yID0gJC5nZXREZXNjXG4gICwgZGVmaW5lUHJvcGVydGllcyA9ICQuc2V0RGVzY3NcbiAgLCBpc0Z1bmN0aW9uICAgICAgID0gJC5pc0Z1bmN0aW9uXG4gICwgaXNPYmplY3QgICAgICAgICA9ICQuaXNPYmplY3RcbiAgLCB0b09iamVjdCAgICAgICAgID0gJC50b09iamVjdFxuICAsIHRvTGVuZ3RoICAgICAgICAgPSAkLnRvTGVuZ3RoXG4gICwgdG9JbmRleCAgICAgICAgICA9ICQudG9JbmRleFxuICAsIElFOF9ET01fREVGSU5FICAgPSBmYWxzZVxuICAsICRpbmRleE9mICAgICAgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktaW5jbHVkZXMnKShmYWxzZSlcbiAgLCAkZm9yRWFjaCAgICAgICAgID0gYXJyYXlNZXRob2QoMClcbiAgLCAkbWFwICAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMSlcbiAgLCAkZmlsdGVyICAgICAgICAgID0gYXJyYXlNZXRob2QoMilcbiAgLCAkc29tZSAgICAgICAgICAgID0gYXJyYXlNZXRob2QoMylcbiAgLCAkZXZlcnkgICAgICAgICAgID0gYXJyYXlNZXRob2QoNCk7XG5cbmlmKCEkLkRFU0Mpe1xuICB0cnkge1xuICAgIElFOF9ET01fREVGSU5FID0gZGVmaW5lUHJvcGVydHkoY2VsKCdkaXYnKSwgJ3gnLFxuICAgICAge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDg7IH19XG4gICAgKS54ID09IDg7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgJC5zZXREZXNjID0gZnVuY3Rpb24oTywgUCwgQXR0cmlidXRlcyl7XG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gICAgaWYoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKWFzc2VydE9iamVjdChPKVtQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gICAgcmV0dXJuIE87XG4gIH07XG4gICQuZ2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFApe1xuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICAgaWYoaGFzKE8sIFApKXJldHVybiAkLmRlc2MoIU9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoTywgUCksIE9bUF0pO1xuICB9O1xuICAkLnNldERlc2NzID0gZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uKE8sIFByb3BlcnRpZXMpe1xuICAgIGFzc2VydE9iamVjdChPKTtcbiAgICB2YXIga2V5cyAgID0gJC5nZXRLZXlzKFByb3BlcnRpZXMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGkgPSAwXG4gICAgICAsIFA7XG4gICAgd2hpbGUobGVuZ3RoID4gaSkkLnNldERlc2MoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XG4gICAgcmV0dXJuIE87XG4gIH07XG59XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICEkLkRFU0MsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi42IC8gMTUuMi4zLjMgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICQuZ2V0RGVzYyxcbiAgLy8gMTkuMS4yLjQgLyAxNS4yLjMuNiBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICQuc2V0RGVzYyxcbiAgLy8gMTkuMS4yLjMgLyAxNS4yLjMuNyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzXG59KTtcblxuICAvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG52YXIga2V5czEgPSAoJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsJyArXG4gICAgICAgICAgICAndG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZicpLnNwbGl0KCcsJylcbiAgLy8gQWRkaXRpb25hbCBrZXlzIGZvciBnZXRPd25Qcm9wZXJ0eU5hbWVzXG4gICwga2V5czIgPSBrZXlzMS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKVxuICAsIGtleXNMZW4xID0ga2V5czEubGVuZ3RoO1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbigpe1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gY2VsKCdpZnJhbWUnKVxuICAgICwgaSAgICAgID0ga2V5c0xlbjFcbiAgICAsIGd0ICAgICA9ICc+J1xuICAgICwgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcbiAgLy8gaHRtbC5yZW1vdmVDaGlsZChpZnJhbWUpO1xuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XG4gIGlmcmFtZURvY3VtZW50LndyaXRlKCc8c2NyaXB0PmRvY3VtZW50LkY9T2JqZWN0PC9zY3JpcHQnICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUoaS0tKWRlbGV0ZSBjcmVhdGVEaWN0LnByb3RvdHlwZVtrZXlzMVtpXV07XG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XG59O1xuZnVuY3Rpb24gY3JlYXRlR2V0S2V5cyhuYW1lcywgbGVuZ3RoKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KG9iamVjdClcbiAgICAgICwgaSAgICAgID0gMFxuICAgICAgLCByZXN1bHQgPSBbXVxuICAgICAgLCBrZXk7XG4gICAgZm9yKGtleSBpbiBPKWlmKGtleSAhPSBJRV9QUk9UTyloYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAgIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgICB3aGlsZShsZW5ndGggPiBpKWlmKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSl7XG4gICAgICB+JGluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5mdW5jdGlvbiBFbXB0eSgpe31cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuOSAvIDE1LjIuMy4yIE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxuICBnZXRQcm90b3R5cGVPZjogJC5nZXRQcm90byA9ICQuZ2V0UHJvdG8gfHwgZnVuY3Rpb24oTyl7XG4gICAgTyA9IE9iamVjdChhc3NlcnQuZGVmKE8pKTtcbiAgICBpZihoYXMoTywgSUVfUFJPVE8pKXJldHVybiBPW0lFX1BST1RPXTtcbiAgICBpZihpc0Z1bmN0aW9uKE8uY29uc3RydWN0b3IpICYmIE8gaW5zdGFuY2VvZiBPLmNvbnN0cnVjdG9yKXtcbiAgICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICB9IHJldHVybiBPIGluc3RhbmNlb2YgT2JqZWN0ID8gT2JqZWN0UHJvdG8gOiBudWxsO1xuICB9LFxuICAvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICQuZ2V0TmFtZXMgPSAkLmdldE5hbWVzIHx8IGNyZWF0ZUdldEtleXMoa2V5czIsIGtleXMyLmxlbmd0aCwgdHJ1ZSksXG4gIC8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICQuY3JlYXRlID0gJC5jcmVhdGUgfHwgZnVuY3Rpb24oTywgLyo/Ki9Qcm9wZXJ0aWVzKXtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmKE8gIT09IG51bGwpe1xuICAgICAgRW1wdHkucHJvdG90eXBlID0gYXNzZXJ0T2JqZWN0KE8pO1xuICAgICAgcmVzdWx0ID0gbmV3IEVtcHR5KCk7XG4gICAgICBFbXB0eS5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBzaGltXG4gICAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xuICAgIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkZWZpbmVQcm9wZXJ0aWVzKHJlc3VsdCwgUHJvcGVydGllcyk7XG4gIH0sXG4gIC8vIDE5LjEuMi4xNCAvIDE1LjIuMy4xNCBPYmplY3Qua2V5cyhPKVxuICBrZXlzOiAkLmdldEtleXMgPSAkLmdldEtleXMgfHwgY3JlYXRlR2V0S2V5cyhrZXlzMSwga2V5c0xlbjEsIGZhbHNlKSxcbiAgLy8gMTkuMS4yLjE3IC8gMTUuMi4zLjggT2JqZWN0LnNlYWwoTylcbiAgc2VhbDogZnVuY3Rpb24gc2VhbChpdCl7XG4gICAgcmV0dXJuIGl0OyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjUgLyAxNS4yLjMuOSBPYmplY3QuZnJlZXplKE8pXG4gIGZyZWV6ZTogZnVuY3Rpb24gZnJlZXplKGl0KXtcbiAgICByZXR1cm4gaXQ7IC8vIDwtIGNhcFxuICB9LFxuICAvLyAxOS4xLjIuMTUgLyAxNS4yLjMuMTAgT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKE8pXG4gIHByZXZlbnRFeHRlbnNpb25zOiBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhpdCl7XG4gICAgcmV0dXJuIGl0OyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjEzIC8gMTUuMi4zLjExIE9iamVjdC5pc1NlYWxlZChPKVxuICBpc1NlYWxlZDogZnVuY3Rpb24gaXNTZWFsZWQoaXQpe1xuICAgIHJldHVybiAhaXNPYmplY3QoaXQpOyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjEyIC8gMTUuMi4zLjEyIE9iamVjdC5pc0Zyb3plbihPKVxuICBpc0Zyb3plbjogZnVuY3Rpb24gaXNGcm96ZW4oaXQpe1xuICAgIHJldHVybiAhaXNPYmplY3QoaXQpOyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjExIC8gMTUuMi4zLjEzIE9iamVjdC5pc0V4dGVuc2libGUoTylcbiAgaXNFeHRlbnNpYmxlOiBmdW5jdGlvbiBpc0V4dGVuc2libGUoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCk7IC8vIDwtIGNhcFxuICB9XG59KTtcblxuLy8gMTkuMi4zLjIgLyAxNS4zLjQuNSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCh0aGlzQXJnLCBhcmdzLi4uKVxuJGRlZigkZGVmLlAsICdGdW5jdGlvbicsIHtcbiAgYmluZDogZnVuY3Rpb24odGhhdCAvKiwgYXJncy4uLiAqLyl7XG4gICAgdmFyIGZuICAgICAgID0gYXNzZXJ0LmZuKHRoaXMpXG4gICAgICAsIHBhcnRBcmdzID0gX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBmdW5jdGlvbiBib3VuZCgvKiBhcmdzLi4uICovKXtcbiAgICAgIHZhciBhcmdzICAgPSBwYXJ0QXJncy5jb25jYXQoX3NsaWNlLmNhbGwoYXJndW1lbnRzKSlcbiAgICAgICAgLCBjb25zdHIgPSB0aGlzIGluc3RhbmNlb2YgYm91bmRcbiAgICAgICAgLCBjdHggICAgPSBjb25zdHIgPyAkLmNyZWF0ZShmbi5wcm90b3R5cGUpIDogdGhhdFxuICAgICAgICAsIHJlc3VsdCA9IGludm9rZShmbiwgYXJncywgY3R4KTtcbiAgICAgIHJldHVybiBjb25zdHIgPyBjdHggOiByZXN1bHQ7XG4gICAgfVxuICAgIGlmKGZuLnByb3RvdHlwZSlib3VuZC5wcm90b3R5cGUgPSBmbi5wcm90b3R5cGU7XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9XG59KTtcblxuLy8gRml4IGZvciBub3QgYXJyYXktbGlrZSBFUzMgc3RyaW5nIGFuZCBET00gb2JqZWN0c1xuaWYoISgwIGluIE9iamVjdCgneicpICYmICd6J1swXSA9PSAneicpKXtcbiAgJC5FUzVPYmplY3QgPSBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xuICB9O1xufVxuXG52YXIgYnVnZ3lTbGljZSA9IHRydWU7XG50cnkge1xuICBpZihodG1sKV9zbGljZS5jYWxsKGh0bWwpO1xuICBidWdneVNsaWNlID0gZmFsc2U7XG59IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG5cbiRkZWYoJGRlZi5QICsgJGRlZi5GICogYnVnZ3lTbGljZSwgJ0FycmF5Jywge1xuICBzbGljZTogZnVuY3Rpb24gc2xpY2UoYmVnaW4sIGVuZCl7XG4gICAgdmFyIGxlbiAgID0gdG9MZW5ndGgodGhpcy5sZW5ndGgpXG4gICAgICAsIGtsYXNzID0gY29mKHRoaXMpO1xuICAgIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogZW5kO1xuICAgIGlmKGtsYXNzID09ICdBcnJheScpcmV0dXJuIF9zbGljZS5jYWxsKHRoaXMsIGJlZ2luLCBlbmQpO1xuICAgIHZhciBzdGFydCAgPSB0b0luZGV4KGJlZ2luLCBsZW4pXG4gICAgICAsIHVwVG8gICA9IHRvSW5kZXgoZW5kLCBsZW4pXG4gICAgICAsIHNpemUgICA9IHRvTGVuZ3RoKHVwVG8gLSBzdGFydClcbiAgICAgICwgY2xvbmVkID0gQXJyYXkoc2l6ZSlcbiAgICAgICwgaSAgICAgID0gMDtcbiAgICBmb3IoOyBpIDwgc2l6ZTsgaSsrKWNsb25lZFtpXSA9IGtsYXNzID09ICdTdHJpbmcnXG4gICAgICA/IHRoaXMuY2hhckF0KHN0YXJ0ICsgaSlcbiAgICAgIDogdGhpc1tzdGFydCArIGldO1xuICAgIHJldHVybiBjbG9uZWQ7XG4gIH1cbn0pO1xuXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICgkLkVTNU9iamVjdCAhPSBPYmplY3QpLCAnQXJyYXknLCB7XG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oKXtcbiAgICByZXR1cm4gX2pvaW4uYXBwbHkoJC5FUzVPYmplY3QodGhpcyksIGFyZ3VtZW50cyk7XG4gIH1cbn0pO1xuXG4vLyAyMi4xLjIuMiAvIDE1LjQuMy4yIEFycmF5LmlzQXJyYXkoYXJnKVxuJGRlZigkZGVmLlMsICdBcnJheScsIHtcbiAgaXNBcnJheTogZnVuY3Rpb24oYXJnKXtcbiAgICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5JztcbiAgfVxufSk7XG5mdW5jdGlvbiBjcmVhdGVBcnJheVJlZHVjZShpc1JpZ2h0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNhbGxiYWNrZm4sIG1lbW8pe1xuICAgIGFzc2VydC5mbihjYWxsYmFja2ZuKTtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IGlzUmlnaHQgPyBsZW5ndGggLSAxIDogMFxuICAgICAgLCBpICAgICAgPSBpc1JpZ2h0ID8gLTEgOiAxO1xuICAgIGlmKGFyZ3VtZW50cy5sZW5ndGggPCAyKWZvcig7Oyl7XG4gICAgICBpZihpbmRleCBpbiBPKXtcbiAgICAgICAgbWVtbyA9IE9baW5kZXhdO1xuICAgICAgICBpbmRleCArPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGluZGV4ICs9IGk7XG4gICAgICBhc3NlcnQoaXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleCwgJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnKTtcbiAgICB9XG4gICAgZm9yKDtpc1JpZ2h0ID8gaW5kZXggPj0gMCA6IGxlbmd0aCA+IGluZGV4OyBpbmRleCArPSBpKWlmKGluZGV4IGluIE8pe1xuICAgICAgbWVtbyA9IGNhbGxiYWNrZm4obWVtbywgT1tpbmRleF0sIGluZGV4LCB0aGlzKTtcbiAgICB9XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG59XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjMuMTAgLyAxNS40LjQuMTggQXJyYXkucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgZm9yRWFjaDogJC5lYWNoID0gJC5lYWNoIHx8IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGZvckVhY2godGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjE1IC8gMTUuNC40LjE5IEFycmF5LnByb3RvdHlwZS5tYXAoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcbiAgbWFwOiBmdW5jdGlvbiBtYXAoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJG1hcCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuNyAvIDE1LjQuNC4yMCBBcnJheS5wcm90b3R5cGUuZmlsdGVyKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIGZpbHRlcjogZnVuY3Rpb24gZmlsdGVyKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaWx0ZXIodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjIzIC8gMTUuNC40LjE3IEFycmF5LnByb3RvdHlwZS5zb21lKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIHNvbWU6IGZ1bmN0aW9uIHNvbWUoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJHNvbWUodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjUgLyAxNS40LjQuMTYgQXJyYXkucHJvdG90eXBlLmV2ZXJ5KGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIGV2ZXJ5OiBmdW5jdGlvbiBldmVyeShjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZXZlcnkodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjE4IC8gMTUuNC40LjIxIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxuICByZWR1Y2U6IGNyZWF0ZUFycmF5UmVkdWNlKGZhbHNlKSxcbiAgLy8gMjIuMS4zLjE5IC8gMTUuNC40LjIyIEFycmF5LnByb3RvdHlwZS5yZWR1Y2VSaWdodChjYWxsYmFja2ZuIFssIGluaXRpYWxWYWx1ZV0pXG4gIHJlZHVjZVJpZ2h0OiBjcmVhdGVBcnJheVJlZHVjZSh0cnVlKSxcbiAgLy8gMjIuMS4zLjExIC8gMTUuNC40LjE0IEFycmF5LnByb3RvdHlwZS5pbmRleE9mKHNlYXJjaEVsZW1lbnQgWywgZnJvbUluZGV4XSlcbiAgaW5kZXhPZjogZnVuY3Rpb24gaW5kZXhPZihlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XG4gICAgcmV0dXJuICRpbmRleE9mKHRoaXMsIGVsLCBhcmd1bWVudHNbMV0pO1xuICB9LFxuICAvLyAyMi4xLjMuMTQgLyAxNS40LjQuMTUgQXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mKHNlYXJjaEVsZW1lbnQgWywgZnJvbUluZGV4XSlcbiAgbGFzdEluZGV4T2Y6IGZ1bmN0aW9uKGVsLCBmcm9tSW5kZXggLyogPSBAWyotMV0gKi8pe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdCh0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gbGVuZ3RoIC0gMTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoID4gMSlpbmRleCA9IE1hdGgubWluKGluZGV4LCAkLnRvSW50ZWdlcihmcm9tSW5kZXgpKTtcbiAgICBpZihpbmRleCA8IDApaW5kZXggPSB0b0xlbmd0aChsZW5ndGggKyBpbmRleCk7XG4gICAgZm9yKDtpbmRleCA+PSAwOyBpbmRleC0tKWlmKGluZGV4IGluIE8paWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBpbmRleDtcbiAgICByZXR1cm4gLTE7XG4gIH1cbn0pO1xuXG4vLyAyMS4xLjMuMjUgLyAxNS41LjQuMjAgU3RyaW5nLnByb3RvdHlwZS50cmltKClcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge3RyaW06IHJlcXVpcmUoJy4vJC5yZXBsYWNlcicpKC9eXFxzKihbXFxzXFxTXSpcXFMpP1xccyokLywgJyQxJyl9KTtcblxuLy8gMjAuMy4zLjEgLyAxNS45LjQuNCBEYXRlLm5vdygpXG4kZGVmKCRkZWYuUywgJ0RhdGUnLCB7bm93OiBmdW5jdGlvbigpe1xuICByZXR1cm4gK25ldyBEYXRlO1xufX0pO1xuXG5mdW5jdGlvbiBseihudW0pe1xuICByZXR1cm4gbnVtID4gOSA/IG51bSA6ICcwJyArIG51bTtcbn1cblxuLy8gMjAuMy40LjM2IC8gMTUuOS41LjQzIERhdGUucHJvdG90eXBlLnRvSVNPU3RyaW5nKClcbi8vIFBoYW50b21KUyBhbmQgb2xkIHdlYmtpdCBoYWQgYSBicm9rZW4gRGF0ZSBpbXBsZW1lbnRhdGlvbi5cbnZhciBkYXRlICAgICAgID0gbmV3IERhdGUoLTVlMTMgLSAxKVxuICAsIGJyb2tlbkRhdGUgPSAhKGRhdGUudG9JU09TdHJpbmcgJiYgZGF0ZS50b0lTT1N0cmluZygpID09ICcwMzg1LTA3LTI1VDA3OjA2OjM5Ljk5OVonXG4gICAgICAmJiByZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgbmV3IERhdGUoTmFOKS50b0lTT1N0cmluZygpOyB9KSk7XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJyb2tlbkRhdGUsICdEYXRlJywge3RvSVNPU3RyaW5nOiBmdW5jdGlvbigpe1xuICBpZighaXNGaW5pdGUodGhpcykpdGhyb3cgUmFuZ2VFcnJvcignSW52YWxpZCB0aW1lIHZhbHVlJyk7XG4gIHZhciBkID0gdGhpc1xuICAgICwgeSA9IGQuZ2V0VVRDRnVsbFllYXIoKVxuICAgICwgbSA9IGQuZ2V0VVRDTWlsbGlzZWNvbmRzKClcbiAgICAsIHMgPSB5IDwgMCA/ICctJyA6IHkgPiA5OTk5ID8gJysnIDogJyc7XG4gIHJldHVybiBzICsgKCcwMDAwMCcgKyBNYXRoLmFicyh5KSkuc2xpY2UocyA/IC02IDogLTQpICtcbiAgICAnLScgKyBseihkLmdldFVUQ01vbnRoKCkgKyAxKSArICctJyArIGx6KGQuZ2V0VVRDRGF0ZSgpKSArXG4gICAgJ1QnICsgbHooZC5nZXRVVENIb3VycygpKSArICc6JyArIGx6KGQuZ2V0VVRDTWludXRlcygpKSArXG4gICAgJzonICsgbHooZC5nZXRVVENTZWNvbmRzKCkpICsgJy4nICsgKG0gPiA5OSA/IG0gOiAnMCcgKyBseihtKSkgKyAnWic7XG59fSk7XG5cbmlmKGNsYXNzb2YoZnVuY3Rpb24oKXsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA9PSAnT2JqZWN0Jyljb2YuY2xhc3NvZiA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHRhZyA9IGNsYXNzb2YoaXQpO1xuICByZXR1cm4gdGFnID09ICdPYmplY3QnICYmIGlzRnVuY3Rpb24oaXQuY2FsbGVlKSA/ICdBcmd1bWVudHMnIDogdGFnO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjMuMyBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbih0YXJnZXQsIHN0YXJ0LCBlbmQgPSB0aGlzLmxlbmd0aClcbiAgY29weVdpdGhpbjogZnVuY3Rpb24gY29weVdpdGhpbih0YXJnZXQvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XG4gICAgdmFyIE8gICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgbGVuICAgPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXG4gICAgICAsIGZyb20gID0gdG9JbmRleChzdGFydCwgbGVuKVxuICAgICAgLCBlbmQgICA9IGFyZ3VtZW50c1syXVxuICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcbiAgICAgICwgY291bnQgPSBNYXRoLm1pbihmaW4gLSBmcm9tLCBsZW4gLSB0bylcbiAgICAgICwgaW5jICAgPSAxO1xuICAgIGlmKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCl7XG4gICAgICBpbmMgID0gLTE7XG4gICAgICBmcm9tID0gZnJvbSArIGNvdW50IC0gMTtcbiAgICAgIHRvICAgPSB0byAgICsgY291bnQgLSAxO1xuICAgIH1cbiAgICB3aGlsZShjb3VudC0tID4gMCl7XG4gICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xuICAgICAgZWxzZSBkZWxldGUgT1t0b107XG4gICAgICB0byAgICs9IGluYztcbiAgICAgIGZyb20gKz0gaW5jO1xuICAgIH0gcmV0dXJuIE87XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnY29weVdpdGhpbicpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgdG9JbmRleCA9ICQudG9JbmRleDtcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxuICBmaWxsOiBmdW5jdGlvbiBmaWxsKHZhbHVlIC8qLCBzdGFydCA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xuICAgIHZhciBPICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGFyZ3VtZW50c1sxXSwgbGVuZ3RoKVxuICAgICAgLCBlbmQgICAgPSBhcmd1bWVudHNbMl1cbiAgICAgICwgZW5kUG9zID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW5ndGggOiB0b0luZGV4KGVuZCwgbGVuZ3RoKTtcbiAgICB3aGlsZShlbmRQb3MgPiBpbmRleClPW2luZGV4KytdID0gdmFsdWU7XG4gICAgcmV0dXJuIE87XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnZmlsbCcpOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDIyLjEuMy45IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXgocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxudmFyIEtFWSAgICA9ICdmaW5kSW5kZXgnXG4gICwgJGRlZiAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgZm9yY2VkID0gdHJ1ZVxuICAsICRmaW5kICA9IHJlcXVpcmUoJy4vJC5hcnJheS1tZXRob2RzJykoNik7XG4vLyBTaG91bGRuJ3Qgc2tpcCBob2xlc1xuaWYoS0VZIGluIFtdKUFycmF5KDEpW0tFWV0oZnVuY3Rpb24oKXsgZm9yY2VkID0gZmFsc2U7IH0pO1xuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBmb3JjZWQsICdBcnJheScsIHtcbiAgZmluZEluZGV4OiBmdW5jdGlvbiBmaW5kSW5kZXgoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGZpbmQodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfVxufSk7XG5yZXF1aXJlKCcuLyQudW5zY29wZScpKEtFWSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMjIuMS4zLjggQXJyYXkucHJvdG90eXBlLmZpbmQocHJlZGljYXRlLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxudmFyIEtFWSAgICA9ICdmaW5kJ1xuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGZvcmNlZCA9IHRydWVcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDUpO1xuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcbmlmKEtFWSBpbiBbXSlBcnJheSgxKVtLRVldKGZ1bmN0aW9uKCl7IGZvcmNlZCA9IGZhbHNlOyB9KTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XG4gIGZpbmQ6IGZ1bmN0aW9uIGZpbmQoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGZpbmQodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfVxufSk7XG5yZXF1aXJlKCcuLyQudW5zY29wZScpKEtFWSk7IiwidmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJGl0ZXIgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgY2FsbCAgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJyk7XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcbiAgICB2YXIgTyAgICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcbiAgICAgICwgbWFwZm4gICA9IGFyZ3VtZW50c1sxXVxuICAgICAgLCBtYXBwaW5nID0gbWFwZm4gIT09IHVuZGVmaW5lZFxuICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxuICAgICAgLCBpbmRleCAgID0gMFxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYoJGl0ZXIuaXMoTykpe1xuICAgICAgaXRlcmF0b3IgPSAkaXRlci5nZXQoTyk7XG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxuICAgICAgcmVzdWx0ICAgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpO1xuICAgICAgZm9yKDsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBmLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXG4gICAgICByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpKTtcbiAgICAgIGZvcig7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IG1hcHBpbmcgPyBmKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pOyIsInZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBzZXRVbnNjb3BlID0gcmVxdWlyZSgnLi8kLnVuc2NvcGUnKVxuICAsIElURVIgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXG4gICwgJGl0ZXIgICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBzdGVwICAgICAgID0gJGl0ZXIuc3RlcFxuICAsIEl0ZXJhdG9ycyAgPSAkaXRlci5JdGVyYXRvcnM7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKEFycmF5LCAnQXJyYXknLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiAkLnRvT2JqZWN0KGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXG4gICAgLCBPICAgICA9IGl0ZXIub1xuICAgICwga2luZCAgPSBpdGVyLmtcbiAgICAsIGluZGV4ID0gaXRlci5pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHN0ZXAoMSk7XG4gIH1cbiAgaWYoa2luZCA9PSAna2V5cycgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XG4gIGlmKGtpbmQgPT0gJ3ZhbHVlcycpcmV0dXJuIHN0ZXAoMCwgT1tpbmRleF0pO1xuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XG59LCAndmFsdWVzJyk7XG5cbi8vIGFyZ3VtZW50c0xpc3RbQEBpdGVyYXRvcl0gaXMgJUFycmF5UHJvdG9fdmFsdWVzJSAoOS40LjQuNiwgOS40LjQuNylcbkl0ZXJhdG9ycy5Bcmd1bWVudHMgPSBJdGVyYXRvcnMuQXJyYXk7XG5cbnNldFVuc2NvcGUoJ2tleXMnKTtcbnNldFVuc2NvcGUoJ3ZhbHVlcycpO1xuc2V0VW5zY29wZSgnZW50cmllcycpOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjMgQXJyYXkub2YoIC4uLml0ZW1zKVxuICBvZjogZnVuY3Rpb24gb2YoLyogLi4uYXJncyAqLyl7XG4gICAgdmFyIGluZGV4ICA9IDBcbiAgICAgICwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cbiAgICAgICwgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGgpO1xuICAgIHdoaWxlKGxlbmd0aCA+IGluZGV4KXJlc3VsdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXgrK107XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTsiLCJyZXF1aXJlKCcuLyQuc3BlY2llcycpKEFycmF5KTsiLCJ2YXIgJCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgSEFTX0lOU1RBTkNFICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaGFzSW5zdGFuY2UnKVxuICAsIEZ1bmN0aW9uUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4vLyAxOS4yLjMuNiBGdW5jdGlvbi5wcm90b3R5cGVbQEBoYXNJbnN0YW5jZV0oVilcbmlmKCEoSEFTX0lOU1RBTkNFIGluIEZ1bmN0aW9uUHJvdG8pKSQuc2V0RGVzYyhGdW5jdGlvblByb3RvLCBIQVNfSU5TVEFOQ0UsIHt2YWx1ZTogZnVuY3Rpb24oTyl7XG4gIGlmKCEkLmlzRnVuY3Rpb24odGhpcykgfHwgISQuaXNPYmplY3QoTykpcmV0dXJuIGZhbHNlO1xuICBpZighJC5pc09iamVjdCh0aGlzLnByb3RvdHlwZSkpcmV0dXJuIE8gaW5zdGFuY2VvZiB0aGlzO1xuICAvLyBmb3IgZW52aXJvbm1lbnQgdy9vIG5hdGl2ZSBgQEBoYXNJbnN0YW5jZWAgbG9naWMgZW5vdWdoIGBpbnN0YW5jZW9mYCwgYnV0IGFkZCB0aGlzOlxuICB3aGlsZShPID0gJC5nZXRQcm90byhPKSlpZih0aGlzLnByb3RvdHlwZSA9PT0gTylyZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIGZhbHNlO1xufX0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBOQU1FID0gJ25hbWUnXG4gICwgc2V0RGVzYyA9ICQuc2V0RGVzY1xuICAsIEZ1bmN0aW9uUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG4vLyAxOS4yLjQuMiBuYW1lXG5OQU1FIGluIEZ1bmN0aW9uUHJvdG8gfHwgJC5GVyAmJiAkLkRFU0MgJiYgc2V0RGVzYyhGdW5jdGlvblByb3RvLCBOQU1FLCB7XG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbigpe1xuICAgIHZhciBtYXRjaCA9IFN0cmluZyh0aGlzKS5tYXRjaCgvXlxccypmdW5jdGlvbiAoW14gKF0qKS8pXG4gICAgICAsIG5hbWUgID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xuICAgICQuaGFzKHRoaXMsIE5BTUUpIHx8IHNldERlc2ModGhpcywgTkFNRSwgJC5kZXNjKDUsIG5hbWUpKTtcbiAgICByZXR1cm4gbmFtZTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgJC5oYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCAkLmRlc2MoMCwgdmFsdWUpKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4xIE1hcCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdNYXAnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gTWFwKCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuMS4zLjYgTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIHZhciBlbnRyeSA9IHN0cm9uZy5nZXRFbnRyeSh0aGlzLCBrZXkpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xuICB9LFxuICAvLyAyMy4xLjMuOSBNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCBrZXkgPT09IDAgPyAwIDoga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZywgdHJ1ZSk7IiwidmFyIEluZmluaXR5ID0gMSAvIDBcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIEUgICAgID0gTWF0aC5FXG4gICwgcG93ICAgPSBNYXRoLnBvd1xuICAsIGFicyAgID0gTWF0aC5hYnNcbiAgLCBleHAgICA9IE1hdGguZXhwXG4gICwgbG9nICAgPSBNYXRoLmxvZ1xuICAsIHNxcnQgID0gTWF0aC5zcXJ0XG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBFUFNJTE9OICAgPSBwb3coMiwgLTUyKVxuICAsIEVQU0lMT04zMiA9IHBvdygyLCAtMjMpXG4gICwgTUFYMzIgICAgID0gcG93KDIsIDEyNykgKiAoMiAtIEVQU0lMT04zMilcbiAgLCBNSU4zMiAgICAgPSBwb3coMiwgLTEyNik7XG5mdW5jdGlvbiByb3VuZFRpZXNUb0V2ZW4obil7XG4gIHJldHVybiBuICsgMSAvIEVQU0lMT04gLSAxIC8gRVBTSUxPTjtcbn1cblxuLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxuZnVuY3Rpb24gc2lnbih4KXtcbiAgcmV0dXJuICh4ID0gK3gpID09IDAgfHwgeCAhPSB4ID8geCA6IHggPCAwID8gLTEgOiAxO1xufVxuLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxuZnVuY3Rpb24gYXNpbmgoeCl7XG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xufVxuLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcbmZ1bmN0aW9uIGV4cG0xKHgpe1xuICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiB4ID4gLTFlLTYgJiYgeCA8IDFlLTYgPyB4ICsgeCAqIHggLyAyIDogZXhwKHgpIC0gMTtcbn1cblxuJGRlZigkZGVmLlMsICdNYXRoJywge1xuICAvLyAyMC4yLjIuMyBNYXRoLmFjb3NoKHgpXG4gIGFjb3NoOiBmdW5jdGlvbiBhY29zaCh4KXtcbiAgICByZXR1cm4gKHggPSAreCkgPCAxID8gTmFOIDogaXNGaW5pdGUoeCkgPyBsb2coeCAvIEUgKyBzcXJ0KHggKyAxKSAqIHNxcnQoeCAtIDEpIC8gRSkgKyAxIDogeDtcbiAgfSxcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxuICBhc2luaDogYXNpbmgsXG4gIC8vIDIwLjIuMi43IE1hdGguYXRhbmgoeClcbiAgYXRhbmg6IGZ1bmN0aW9uIGF0YW5oKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IGxvZygoMSArIHgpIC8gKDEgLSB4KSkgLyAyO1xuICB9LFxuICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcbiAgY2JydDogZnVuY3Rpb24gY2JydCh4KXtcbiAgICByZXR1cm4gc2lnbih4ID0gK3gpICogcG93KGFicyh4KSwgMSAvIDMpO1xuICB9LFxuICAvLyAyMC4yLjIuMTEgTWF0aC5jbHozMih4KVxuICBjbHozMjogZnVuY3Rpb24gY2x6MzIoeCl7XG4gICAgcmV0dXJuICh4ID4+Pj0gMCkgPyAzMSAtIGZsb29yKGxvZyh4ICsgMC41KSAqIE1hdGguTE9HMkUpIDogMzI7XG4gIH0sXG4gIC8vIDIwLjIuMi4xMiBNYXRoLmNvc2goeClcbiAgY29zaDogZnVuY3Rpb24gY29zaCh4KXtcbiAgICByZXR1cm4gKGV4cCh4ID0gK3gpICsgZXhwKC14KSkgLyAyO1xuICB9LFxuICAvLyAyMC4yLjIuMTQgTWF0aC5leHBtMSh4KVxuICBleHBtMTogZXhwbTEsXG4gIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxuICBmcm91bmQ6IGZ1bmN0aW9uIGZyb3VuZCh4KXtcbiAgICB2YXIgJGFicyAgPSBhYnMoeClcbiAgICAgICwgJHNpZ24gPSBzaWduKHgpXG4gICAgICAsIGEsIHJlc3VsdDtcbiAgICBpZigkYWJzIDwgTUlOMzIpcmV0dXJuICRzaWduICogcm91bmRUaWVzVG9FdmVuKCRhYnMgLyBNSU4zMiAvIEVQU0lMT04zMikgKiBNSU4zMiAqIEVQU0lMT04zMjtcbiAgICBhID0gKDEgKyBFUFNJTE9OMzIgLyBFUFNJTE9OKSAqICRhYnM7XG4gICAgcmVzdWx0ID0gYSAtIChhIC0gJGFicyk7XG4gICAgaWYocmVzdWx0ID4gTUFYMzIgfHwgcmVzdWx0ICE9IHJlc3VsdClyZXR1cm4gJHNpZ24gKiBJbmZpbml0eTtcbiAgICByZXR1cm4gJHNpZ24gKiByZXN1bHQ7XG4gIH0sXG4gIC8vIDIwLjIuMi4xNyBNYXRoLmh5cG90KFt2YWx1ZTFbLCB2YWx1ZTJbLCDigKYgXV1dKVxuICBoeXBvdDogZnVuY3Rpb24gaHlwb3QodmFsdWUxLCB2YWx1ZTIpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdmFyIHN1bSAgPSAwXG4gICAgICAsIGkgICAgPSAwXG4gICAgICAsIGxlbiAgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIGxhcmcgPSAwXG4gICAgICAsIGFyZywgZGl2O1xuICAgIHdoaWxlKGkgPCBsZW4pe1xuICAgICAgYXJnID0gYWJzKGFyZ3VtZW50c1tpKytdKTtcbiAgICAgIGlmKGxhcmcgPCBhcmcpe1xuICAgICAgICBkaXYgID0gbGFyZyAvIGFyZztcbiAgICAgICAgc3VtICA9IHN1bSAqIGRpdiAqIGRpdiArIDE7XG4gICAgICAgIGxhcmcgPSBhcmc7XG4gICAgICB9IGVsc2UgaWYoYXJnID4gMCl7XG4gICAgICAgIGRpdiAgPSBhcmcgLyBsYXJnO1xuICAgICAgICBzdW0gKz0gZGl2ICogZGl2O1xuICAgICAgfSBlbHNlIHN1bSArPSBhcmc7XG4gICAgfVxuICAgIHJldHVybiBsYXJnID09PSBJbmZpbml0eSA/IEluZmluaXR5IDogbGFyZyAqIHNxcnQoc3VtKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjE4IE1hdGguaW11bCh4LCB5KVxuICBpbXVsOiBmdW5jdGlvbiBpbXVsKHgsIHkpe1xuICAgIHZhciBVSW50MTYgPSAweGZmZmZcbiAgICAgICwgeG4gPSAreFxuICAgICAgLCB5biA9ICt5XG4gICAgICAsIHhsID0gVUludDE2ICYgeG5cbiAgICAgICwgeWwgPSBVSW50MTYgJiB5bjtcbiAgICByZXR1cm4gMCB8IHhsICogeWwgKyAoKFVJbnQxNiAmIHhuID4+PiAxNikgKiB5bCArIHhsICogKFVJbnQxNiAmIHluID4+PiAxNikgPDwgMTYgPj4+IDApO1xuICB9LFxuICAvLyAyMC4yLjIuMjAgTWF0aC5sb2cxcCh4KVxuICBsb2cxcDogZnVuY3Rpb24gbG9nMXAoeCl7XG4gICAgcmV0dXJuICh4ID0gK3gpID4gLTFlLTggJiYgeCA8IDFlLTggPyB4IC0geCAqIHggLyAyIDogbG9nKDEgKyB4KTtcbiAgfSxcbiAgLy8gMjAuMi4yLjIxIE1hdGgubG9nMTAoeClcbiAgbG9nMTA6IGZ1bmN0aW9uIGxvZzEwKHgpe1xuICAgIHJldHVybiBsb2coeCkgLyBNYXRoLkxOMTA7XG4gIH0sXG4gIC8vIDIwLjIuMi4yMiBNYXRoLmxvZzIoeClcbiAgbG9nMjogZnVuY3Rpb24gbG9nMih4KXtcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjI7XG4gIH0sXG4gIC8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcbiAgc2lnbjogc2lnbixcbiAgLy8gMjAuMi4yLjMwIE1hdGguc2luaCh4KVxuICBzaW5oOiBmdW5jdGlvbiBzaW5oKHgpe1xuICAgIHJldHVybiBhYnMoeCA9ICt4KSA8IDEgPyAoZXhwbTEoeCkgLSBleHBtMSgteCkpIC8gMiA6IChleHAoeCAtIDEpIC0gZXhwKC14IC0gMSkpICogKEUgLyAyKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjMzIE1hdGgudGFuaCh4KVxuICB0YW5oOiBmdW5jdGlvbiB0YW5oKHgpe1xuICAgIHZhciBhID0gZXhwbTEoeCA9ICt4KVxuICAgICAgLCBiID0gZXhwbTEoLXgpO1xuICAgIHJldHVybiBhID09IEluZmluaXR5ID8gMSA6IGIgPT0gSW5maW5pdHkgPyAtMSA6IChhIC0gYikgLyAoZXhwKHgpICsgZXhwKC14KSk7XG4gIH0sXG4gIC8vIDIwLjIuMi4zNCBNYXRoLnRydW5jKHgpXG4gIHRydW5jOiBmdW5jdGlvbiB0cnVuYyhpdCl7XG4gICAgcmV0dXJuIChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGlzT2JqZWN0ICAgPSAkLmlzT2JqZWN0XG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvblxuICAsIE5VTUJFUiAgICAgPSAnTnVtYmVyJ1xuICAsICROdW1iZXIgICAgPSAkLmdbTlVNQkVSXVxuICAsIEJhc2UgICAgICAgPSAkTnVtYmVyXG4gICwgcHJvdG8gICAgICA9ICROdW1iZXIucHJvdG90eXBlO1xuZnVuY3Rpb24gdG9QcmltaXRpdmUoaXQpe1xuICB2YXIgZm4sIHZhbDtcbiAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnZhbHVlT2YpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnRvU3RyaW5nKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIG51bWJlclwiKTtcbn1cbmZ1bmN0aW9uIHRvTnVtYmVyKGl0KXtcbiAgaWYoaXNPYmplY3QoaXQpKWl0ID0gdG9QcmltaXRpdmUoaXQpO1xuICBpZih0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMiAmJiBpdC5jaGFyQ29kZUF0KDApID09IDQ4KXtcbiAgICB2YXIgYmluYXJ5ID0gZmFsc2U7XG4gICAgc3dpdGNoKGl0LmNoYXJDb2RlQXQoMSkpe1xuICAgICAgY2FzZSA2NiA6IGNhc2UgOTggIDogYmluYXJ5ID0gdHJ1ZTtcbiAgICAgIGNhc2UgNzkgOiBjYXNlIDExMSA6IHJldHVybiBwYXJzZUludChpdC5zbGljZSgyKSwgYmluYXJ5ID8gMiA6IDgpO1xuICAgIH1cbiAgfSByZXR1cm4gK2l0O1xufVxuaWYoJC5GVyAmJiAhKCROdW1iZXIoJzBvMScpICYmICROdW1iZXIoJzBiMScpKSl7XG4gICROdW1iZXIgPSBmdW5jdGlvbiBOdW1iZXIoaXQpe1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgJE51bWJlciA/IG5ldyBCYXNlKHRvTnVtYmVyKGl0KSkgOiB0b051bWJlcihpdCk7XG4gIH07XG4gICQuZWFjaC5jYWxsKCQuREVTQyA/ICQuZ2V0TmFtZXMoQmFzZSkgOiAoXG4gICAgICAvLyBFUzM6XG4gICAgICAnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFksJyArXG4gICAgICAvLyBFUzYgKGluIGNhc2UsIGlmIG1vZHVsZXMgd2l0aCBFUzYgTnVtYmVyIHN0YXRpY3MgcmVxdWlyZWQgYmVmb3JlKTpcbiAgICAgICdFUFNJTE9OLGlzRmluaXRlLGlzSW50ZWdlcixpc05hTixpc1NhZmVJbnRlZ2VyLE1BWF9TQUZFX0lOVEVHRVIsJyArXG4gICAgICAnTUlOX1NBRkVfSU5URUdFUixwYXJzZUZsb2F0LHBhcnNlSW50LGlzSW50ZWdlcidcbiAgICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XG4gICAgICBpZigkLmhhcyhCYXNlLCBrZXkpICYmICEkLmhhcygkTnVtYmVyLCBrZXkpKXtcbiAgICAgICAgJC5zZXREZXNjKCROdW1iZXIsIGtleSwgJC5nZXREZXNjKEJhc2UsIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgKTtcbiAgJE51bWJlci5wcm90b3R5cGUgPSBwcm90bztcbiAgcHJvdG8uY29uc3RydWN0b3IgPSAkTnVtYmVyO1xuICByZXF1aXJlKCcuLyQucmVkZWYnKSgkLmcsIE5VTUJFUiwgJE51bWJlcik7XG59IiwidmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGFicyAgID0gTWF0aC5hYnNcbiAgLCBmbG9vciA9IE1hdGguZmxvb3JcbiAgLCBfaXNGaW5pdGUgPSAkLmcuaXNGaW5pdGVcbiAgLCBNQVhfU0FGRV9JTlRFR0VSID0gMHgxZmZmZmZmZmZmZmZmZjsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MTtcbmZ1bmN0aW9uIGlzSW50ZWdlcihpdCl7XG4gIHJldHVybiAhJC5pc09iamVjdChpdCkgJiYgX2lzRmluaXRlKGl0KSAmJiBmbG9vcihpdCkgPT09IGl0O1xufVxuJGRlZigkZGVmLlMsICdOdW1iZXInLCB7XG4gIC8vIDIwLjEuMi4xIE51bWJlci5FUFNJTE9OXG4gIEVQU0lMT046IE1hdGgucG93KDIsIC01MiksXG4gIC8vIDIwLjEuMi4yIE51bWJlci5pc0Zpbml0ZShudW1iZXIpXG4gIGlzRmluaXRlOiBmdW5jdGlvbiBpc0Zpbml0ZShpdCl7XG4gICAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnbnVtYmVyJyAmJiBfaXNGaW5pdGUoaXQpO1xuICB9LFxuICAvLyAyMC4xLjIuMyBOdW1iZXIuaXNJbnRlZ2VyKG51bWJlcilcbiAgaXNJbnRlZ2VyOiBpc0ludGVnZXIsXG4gIC8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXG4gIGlzTmFOOiBmdW5jdGlvbiBpc05hTihudW1iZXIpe1xuICAgIHJldHVybiBudW1iZXIgIT0gbnVtYmVyO1xuICB9LFxuICAvLyAyMC4xLjIuNSBOdW1iZXIuaXNTYWZlSW50ZWdlcihudW1iZXIpXG4gIGlzU2FmZUludGVnZXI6IGZ1bmN0aW9uIGlzU2FmZUludGVnZXIobnVtYmVyKXtcbiAgICByZXR1cm4gaXNJbnRlZ2VyKG51bWJlcikgJiYgYWJzKG51bWJlcikgPD0gTUFYX1NBRkVfSU5URUdFUjtcbiAgfSxcbiAgLy8gMjAuMS4yLjYgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJcbiAgTUFYX1NBRkVfSU5URUdFUjogTUFYX1NBRkVfSU5URUdFUixcbiAgLy8gMjAuMS4yLjEwIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSXG4gIE1JTl9TQUZFX0lOVEVHRVI6IC1NQVhfU0FGRV9JTlRFR0VSLFxuICAvLyAyMC4xLjIuMTIgTnVtYmVyLnBhcnNlRmxvYXQoc3RyaW5nKVxuICBwYXJzZUZsb2F0OiBwYXJzZUZsb2F0LFxuICAvLyAyMC4xLjIuMTMgTnVtYmVyLnBhcnNlSW50KHN0cmluZywgcmFkaXgpXG4gIHBhcnNlSW50OiBwYXJzZUludFxufSk7IiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuLyQuYXNzaWduJyl9KTsiLCIvLyAxOS4xLjMuMTAgT2JqZWN0LmlzKHZhbHVlMSwgdmFsdWUyKVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgaXM6IHJlcXVpcmUoJy4vJC5zYW1lJylcbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0fSk7IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdDtcbiQuZWFjaC5jYWxsKCgnZnJlZXplLHNlYWwscHJldmVudEV4dGVuc2lvbnMsaXNGcm96ZW4saXNTZWFsZWQsaXNFeHRlbnNpYmxlLCcgK1xuICAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLGdldFByb3RvdHlwZU9mLGtleXMsZ2V0T3duUHJvcGVydHlOYW1lcycpLnNwbGl0KCcsJylcbiwgZnVuY3Rpb24oS0VZLCBJRCl7XG4gIHZhciBmbiAgICAgPSAoJC5jb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZm9yY2VkID0gMFxuICAgICwgbWV0aG9kID0ge307XG4gIG1ldGhvZFtLRVldID0gSUQgPT0gMCA/IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMSA/IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDIgPyBmdW5jdGlvbiBwcmV2ZW50RXh0ZW5zaW9ucyhpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xuICB9IDogSUQgPT0gMyA/IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcbiAgfSA6IElEID09IDQgPyBmdW5jdGlvbiBpc1NlYWxlZChpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XG4gIH0gOiBJRCA9PSA1ID8gZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogZmFsc2U7XG4gIH0gOiBJRCA9PSA2ID8gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XG4gIH0gOiBJRCA9PSA3ID8gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xuICB9IDogSUQgPT0gOCA/IGZ1bmN0aW9uIGtleXMoaXQpe1xuICAgIHJldHVybiBmbih0b09iamVjdChpdCkpO1xuICB9IDogcmVxdWlyZSgnLi8kLmdldC1uYW1lcycpLmdldDtcbiAgdHJ5IHtcbiAgICBmbigneicpO1xuICB9IGNhdGNoKGUpe1xuICAgIGZvcmNlZCA9IDE7XG4gIH1cbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmb3JjZWQsICdPYmplY3QnLCBtZXRob2QpO1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgdG1wID0ge307XG50bXBbcmVxdWlyZSgnLi8kLndrcycpKCd0b1N0cmluZ1RhZycpXSA9ICd6JztcbmlmKHJlcXVpcmUoJy4vJCcpLkZXICYmIGNvZih0bXApICE9ICd6Jyl7XG4gIHJlcXVpcmUoJy4vJC5yZWRlZicpKE9iamVjdC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uIHRvU3RyaW5nKCl7XG4gICAgcmV0dXJuICdbb2JqZWN0ICcgKyBjb2YuY2xhc3NvZih0aGlzKSArICddJztcbiAgfSwgdHJ1ZSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjdHggICAgICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGNvZiAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxuICAsIGZvck9mICAgID0gcmVxdWlyZSgnLi8kLmZvci1vZicpXG4gICwgc2V0UHJvdG8gPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0XG4gICwgc2FtZSAgICAgPSByZXF1aXJlKCcuLyQuc2FtZScpXG4gICwgc3BlY2llcyAgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgU1BFQ0lFUyAgPSByZXF1aXJlKCcuLyQud2tzJykoJ3NwZWNpZXMnKVxuICAsIFJFQ09SRCAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ3JlY29yZCcpXG4gICwgUFJPTUlTRSAgPSAnUHJvbWlzZSdcbiAgLCBnbG9iYWwgICA9ICQuZ1xuICAsIHByb2Nlc3MgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBhc2FwICAgICA9IHByb2Nlc3MgJiYgcHJvY2Vzcy5uZXh0VGljayB8fCByZXF1aXJlKCcuLyQudGFzaycpLnNldFxuICAsIFAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgaXNGdW5jdGlvbiAgICAgPSAkLmlzRnVuY3Rpb25cbiAgLCBpc09iamVjdCAgICAgICA9ICQuaXNPYmplY3RcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IGFzc2VydC5mblxuICAsIGFzc2VydE9iamVjdCAgID0gYXNzZXJ0Lm9ialxuICAsIFdyYXBwZXI7XG5cbmZ1bmN0aW9uIHRlc3RSZXNvbHZlKHN1Yil7XG4gIHZhciB0ZXN0ID0gbmV3IFAoZnVuY3Rpb24oKXt9KTtcbiAgaWYoc3ViKXRlc3QuY29uc3RydWN0b3IgPSBPYmplY3Q7XG4gIHJldHVybiBQLnJlc29sdmUodGVzdCkgPT09IHRlc3Q7XG59XG5cbnZhciB1c2VOYXRpdmUgPSBmdW5jdGlvbigpe1xuICB2YXIgd29ya3MgPSBmYWxzZTtcbiAgZnVuY3Rpb24gUDIoeCl7XG4gICAgdmFyIHNlbGYgPSBuZXcgUCh4KTtcbiAgICBzZXRQcm90byhzZWxmLCBQMi5wcm90b3R5cGUpO1xuICAgIHJldHVybiBzZWxmO1xuICB9XG4gIHRyeSB7XG4gICAgd29ya3MgPSBpc0Z1bmN0aW9uKFApICYmIGlzRnVuY3Rpb24oUC5yZXNvbHZlKSAmJiB0ZXN0UmVzb2x2ZSgpO1xuICAgIHNldFByb3RvKFAyLCBQKTtcbiAgICBQMi5wcm90b3R5cGUgPSAkLmNyZWF0ZShQLnByb3RvdHlwZSwge2NvbnN0cnVjdG9yOiB7dmFsdWU6IFAyfX0pO1xuICAgIC8vIGFjdHVhbCBGaXJlZm94IGhhcyBicm9rZW4gc3ViY2xhc3Mgc3VwcG9ydCwgdGVzdCB0aGF0XG4gICAgaWYoIShQMi5yZXNvbHZlKDUpLnRoZW4oZnVuY3Rpb24oKXt9KSBpbnN0YW5jZW9mIFAyKSl7XG4gICAgICB3b3JrcyA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyBhY3R1YWwgVjggYnVnLCBodHRwczovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDE2MlxuICAgIGlmKHdvcmtzICYmICQuREVTQyl7XG4gICAgICB2YXIgdGhlbmFibGVUaGVuR290dGVuID0gZmFsc2U7XG4gICAgICBQLnJlc29sdmUoJC5zZXREZXNjKHt9LCAndGhlbicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyB0aGVuYWJsZVRoZW5Hb3R0ZW4gPSB0cnVlOyB9XG4gICAgICB9KSk7XG4gICAgICB3b3JrcyA9IHRoZW5hYmxlVGhlbkdvdHRlbjtcbiAgICB9XG4gIH0gY2F0Y2goZSl7IHdvcmtzID0gZmFsc2U7IH1cbiAgcmV0dXJuIHdvcmtzO1xufSgpO1xuXG4vLyBoZWxwZXJzXG5mdW5jdGlvbiBpc1Byb21pc2UoaXQpe1xuICByZXR1cm4gaXNPYmplY3QoaXQpICYmICh1c2VOYXRpdmUgPyBjb2YuY2xhc3NvZihpdCkgPT0gJ1Byb21pc2UnIDogUkVDT1JEIGluIGl0KTtcbn1cbmZ1bmN0aW9uIHNhbWVDb25zdHJ1Y3RvcihhLCBiKXtcbiAgLy8gbGlicmFyeSB3cmFwcGVyIHNwZWNpYWwgY2FzZVxuICBpZighJC5GVyAmJiBhID09PSBQICYmIGIgPT09IFdyYXBwZXIpcmV0dXJuIHRydWU7XG4gIHJldHVybiBzYW1lKGEsIGIpO1xufVxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XG4gIHZhciBTID0gYXNzZXJ0T2JqZWN0KEMpW1NQRUNJRVNdO1xuICByZXR1cm4gUyAhPSB1bmRlZmluZWQgPyBTIDogQztcbn1cbmZ1bmN0aW9uIGlzVGhlbmFibGUoaXQpe1xuICB2YXIgdGhlbjtcbiAgaWYoaXNPYmplY3QoaXQpKXRoZW4gPSBpdC50aGVuO1xuICByZXR1cm4gaXNGdW5jdGlvbih0aGVuKSA/IHRoZW4gOiBmYWxzZTtcbn1cbmZ1bmN0aW9uIG5vdGlmeShyZWNvcmQpe1xuICB2YXIgY2hhaW4gPSByZWNvcmQuYztcbiAgaWYoY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSByZWNvcmQudlxuICAgICAgLCBvayAgICA9IHJlY29yZC5zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIGZ1bmN0aW9uIHJ1bihyZWFjdCl7XG4gICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxuICAgICAgICAsIHJldCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGNiKXtcbiAgICAgICAgICBpZighb2spcmVjb3JkLmggPSB0cnVlO1xuICAgICAgICAgIHJldCA9IGNiID09PSB0cnVlID8gdmFsdWUgOiBjYih2YWx1ZSk7XG4gICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcbiAgICAgICAgICAgIHJlYWN0LnJlaihUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJldCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xuICAgICAgICAgIH0gZWxzZSByZWFjdC5yZXMocmV0KTtcbiAgICAgICAgfSBlbHNlIHJlYWN0LnJlaih2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGVycil7XG4gICAgICAgIHJlYWN0LnJlaihlcnIpO1xuICAgICAgfVxuICAgIH1cbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICBjaGFpbi5sZW5ndGggPSAwO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGlzVW5oYW5kbGVkKHByb21pc2Upe1xuICB2YXIgcmVjb3JkID0gcHJvbWlzZVtSRUNPUkRdXG4gICAgLCBjaGFpbiAgPSByZWNvcmQuYSB8fCByZWNvcmQuY1xuICAgICwgaSAgICAgID0gMFxuICAgICwgcmVhY3Q7XG4gIGlmKHJlY29yZC5oKXJldHVybiBmYWxzZTtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3QgPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0LmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0LlApKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uICRyZWplY3QodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgcHJvbWlzZTtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHJlY29yZC52ID0gdmFsdWU7XG4gIHJlY29yZC5zID0gMjtcbiAgcmVjb3JkLmEgPSByZWNvcmQuYy5zbGljZSgpO1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgYXNhcChmdW5jdGlvbigpe1xuICAgICAgaWYoaXNVbmhhbmRsZWQocHJvbWlzZSA9IHJlY29yZC5wKSl7XG4gICAgICAgIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xuICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xuICAgICAgICB9IGVsc2UgaWYoZ2xvYmFsLmNvbnNvbGUgJiYgaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSl7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZWNvcmQuYSA9IHVuZGVmaW5lZDtcbiAgICB9KTtcbiAgfSwgMSk7XG4gIG5vdGlmeShyZWNvcmQpO1xufVxuZnVuY3Rpb24gJHJlc29sdmUodmFsdWUpe1xuICB2YXIgcmVjb3JkID0gdGhpc1xuICAgICwgdGhlbjtcbiAgaWYocmVjb3JkLmQpcmV0dXJuO1xuICByZWNvcmQuZCA9IHRydWU7XG4gIHJlY29yZCA9IHJlY29yZC5yIHx8IHJlY29yZDsgLy8gdW53cmFwXG4gIHRyeSB7XG4gICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcbiAgICAgIGFzYXAoZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSB7cjogcmVjb3JkLCBkOiBmYWxzZX07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgJHJlamVjdC5jYWxsKHdyYXBwZXIsIGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVjb3JkLnYgPSB2YWx1ZTtcbiAgICAgIHJlY29yZC5zID0gMTtcbiAgICAgIG5vdGlmeShyZWNvcmQpO1xuICAgIH1cbiAgfSBjYXRjaChlKXtcbiAgICAkcmVqZWN0LmNhbGwoe3I6IHJlY29yZCwgZDogZmFsc2V9LCBlKTsgLy8gd3JhcFxuICB9XG59XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighdXNlTmF0aXZlKXtcbiAgLy8gMjUuNC4zLjEgUHJvbWlzZShleGVjdXRvcilcbiAgUCA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFzc2VydEZ1bmN0aW9uKGV4ZWN1dG9yKTtcbiAgICB2YXIgcmVjb3JkID0ge1xuICAgICAgcDogYXNzZXJ0Lmluc3QodGhpcywgUCwgUFJPTUlTRSksICAgICAgIC8vIDwtIHByb21pc2VcbiAgICAgIGM6IFtdLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBhd2FpdGluZyByZWFjdGlvbnNcbiAgICAgIGE6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBjaGVja2VkIGluIGlzVW5oYW5kbGVkIHJlYWN0aW9uc1xuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXG4gICAgICBkOiBmYWxzZSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gZG9uZVxuICAgICAgdjogdW5kZWZpbmVkLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHZhbHVlXG4gICAgICBoOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cbiAgICB9O1xuICAgICQuaGlkZSh0aGlzLCBSRUNPUkQsIHJlY29yZCk7XG4gICAgdHJ5IHtcbiAgICAgIGV4ZWN1dG9yKGN0eCgkcmVzb2x2ZSwgcmVjb3JkLCAxKSwgY3R4KCRyZWplY3QsIHJlY29yZCwgMSkpO1xuICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICRyZWplY3QuY2FsbChyZWNvcmQsIGVycik7XG4gICAgfVxuICB9O1xuICByZXF1aXJlKCcuLyQubWl4JykoUC5wcm90b3R5cGUsIHtcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xuICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoYXNzZXJ0T2JqZWN0KHRoaXMpLmNvbnN0cnVjdG9yKVtTUEVDSUVTXTtcbiAgICAgIHZhciByZWFjdCA9IHtcbiAgICAgICAgb2s6ICAgaXNGdW5jdGlvbihvbkZ1bGZpbGxlZCkgPyBvbkZ1bGZpbGxlZCA6IHRydWUsXG4gICAgICAgIGZhaWw6IGlzRnVuY3Rpb24ob25SZWplY3RlZCkgID8gb25SZWplY3RlZCAgOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIHZhciBwcm9taXNlID0gcmVhY3QuUCA9IG5ldyAoUyAhPSB1bmRlZmluZWQgPyBTIDogUCkoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgICByZWFjdC5yZXMgPSBhc3NlcnRGdW5jdGlvbihyZXMpO1xuICAgICAgICByZWFjdC5yZWogPSBhc3NlcnRGdW5jdGlvbihyZWopO1xuICAgICAgfSk7XG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xuICAgICAgcmVjb3JkLmMucHVzaChyZWFjdCk7XG4gICAgICBpZihyZWNvcmQuYSlyZWNvcmQuYS5wdXNoKHJlYWN0KTtcbiAgICAgIGlmKHJlY29yZC5zKW5vdGlmeShyZWNvcmQpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfSxcbiAgICAvLyAyNS40LjUuMSBQcm9taXNlLnByb3RvdHlwZS5jYXRjaChvblJlamVjdGVkKVxuICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0ZWQpe1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIGV4cG9ydFxuJGRlZigkZGVmLkcgKyAkZGVmLlcgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCB7UHJvbWlzZTogUH0pO1xuY29mLnNldChQLCBQUk9NSVNFKTtcbnNwZWNpZXMoUCk7XG5zcGVjaWVzKFdyYXBwZXIgPSAkLmNvcmVbUFJPTUlTRV0pO1xuXG4vLyBzdGF0aWNzXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICF1c2VOYXRpdmUsIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocil7XG4gICAgcmV0dXJuIG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlcywgcmVqKXsgcmVqKHIpOyB9KTtcbiAgfVxufSk7XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICghdXNlTmF0aXZlIHx8IHRlc3RSZXNvbHZlKHRydWUpKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KXtcbiAgICByZXR1cm4gaXNQcm9taXNlKHgpICYmIHNhbWVDb25zdHJ1Y3Rvcih4LmNvbnN0cnVjdG9yLCB0aGlzKVxuICAgICAgPyB4IDogbmV3IHRoaXMoZnVuY3Rpb24ocmVzKXsgcmVzKHgpOyB9KTtcbiAgfVxufSk7XG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICEodXNlTmF0aXZlICYmIHJlcXVpcmUoJy4vJC5pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpe1xuICBQLmFsbChpdGVyKVsnY2F0Y2gnXShmdW5jdGlvbigpe30pO1xufSkpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC4xIFByb21pc2UuYWxsKGl0ZXJhYmxlKVxuICBhbGw6IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSl7XG4gICAgdmFyIEMgICAgICA9IGdldENvbnN0cnVjdG9yKHRoaXMpXG4gICAgICAsIHZhbHVlcyA9IFtdO1xuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIHZhbHVlcy5wdXNoLCB2YWx1ZXMpO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHZhbHVlcy5sZW5ndGhcbiAgICAgICAgLCByZXN1bHRzICAgPSBBcnJheShyZW1haW5pbmcpO1xuICAgICAgaWYocmVtYWluaW5nKSQuZWFjaC5jYWxsKHZhbHVlcywgZnVuY3Rpb24ocHJvbWlzZSwgaW5kZXgpe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXMocmVzdWx0cyk7XG4gICAgICAgIH0sIHJlaik7XG4gICAgICB9KTtcbiAgICAgIGVsc2UgcmVzKHJlc3VsdHMpO1xuICAgIH0pO1xuICB9LFxuICAvLyAyNS40LjQuNCBQcm9taXNlLnJhY2UoaXRlcmFibGUpXG4gIHJhY2U6IGZ1bmN0aW9uIHJhY2UoaXRlcmFibGUpe1xuICAgIHZhciBDID0gZ2V0Q29uc3RydWN0b3IodGhpcyk7XG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKHJlcywgcmVqKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59KTsiLCJ2YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBzZXRQcm90byAgPSByZXF1aXJlKCcuLyQuc2V0LXByb3RvJylcbiAgLCAkaXRlciAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgSVRFUiAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxuICAsIHN0ZXAgICAgICA9ICRpdGVyLnN0ZXBcbiAgLCBhc3NlcnQgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XG4gICwgZ2V0UHJvdG8gID0gJC5nZXRQcm90b1xuICAsICRSZWZsZWN0ICA9ICQuZy5SZWZsZWN0XG4gICwgX2FwcGx5ICAgID0gRnVuY3Rpb24uYXBwbHlcbiAgLCBhc3NlcnRPYmplY3QgPSBhc3NlcnQub2JqXG4gICwgX2lzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCBfcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnNcbiAgLy8gSUUgVFAgaGFzIGJyb2tlbiBSZWZsZWN0LmVudW1lcmF0ZVxuICAsIGJ1Z2d5RW51bWVyYXRlID0gISgkUmVmbGVjdCAmJiAkUmVmbGVjdC5lbnVtZXJhdGUgJiYgSVRFUkFUT1IgaW4gJFJlZmxlY3QuZW51bWVyYXRlKHt9KSk7XG5cbmZ1bmN0aW9uIEVudW1lcmF0ZShpdGVyYXRlZCl7XG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazogdW5kZWZpbmVkLCBpOiAwfSk7XG59XG4kaXRlci5jcmVhdGUoRW51bWVyYXRlLCAnT2JqZWN0JywgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgPSB0aGlzW0lURVJdXG4gICAgLCBrZXlzID0gaXRlci5rXG4gICAgLCBrZXk7XG4gIGlmKGtleXMgPT0gdW5kZWZpbmVkKXtcbiAgICBpdGVyLmsgPSBrZXlzID0gW107XG4gICAgZm9yKGtleSBpbiBpdGVyLm8pa2V5cy5wdXNoKGtleSk7XG4gIH1cbiAgZG8ge1xuICAgIGlmKGl0ZXIuaSA+PSBrZXlzLmxlbmd0aClyZXR1cm4gc3RlcCgxKTtcbiAgfSB3aGlsZSghKChrZXkgPSBrZXlzW2l0ZXIuaSsrXSkgaW4gaXRlci5vKSk7XG4gIHJldHVybiBzdGVwKDAsIGtleSk7XG59KTtcblxudmFyIHJlZmxlY3QgPSB7XG4gIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxuICBhcHBseTogZnVuY3Rpb24gYXBwbHkodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3Qpe1xuICAgIHJldHVybiBfYXBwbHkuY2FsbCh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdCk7XG4gIH0sXG4gIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcbiAgY29uc3RydWN0OiBmdW5jdGlvbiBjb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IC8qLCBuZXdUYXJnZXQqLyl7XG4gICAgdmFyIHByb3RvICAgID0gYXNzZXJ0LmZuKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdKS5wcm90b3R5cGVcbiAgICAgICwgaW5zdGFuY2UgPSAkLmNyZWF0ZShpc09iamVjdChwcm90bykgPyBwcm90byA6IE9iamVjdC5wcm90b3R5cGUpXG4gICAgICAsIHJlc3VsdCAgID0gX2FwcGx5LmNhbGwodGFyZ2V0LCBpbnN0YW5jZSwgYXJndW1lbnRzTGlzdCk7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHJlc3VsdCkgPyByZXN1bHQgOiBpbnN0YW5jZTtcbiAgfSxcbiAgLy8gMjYuMS4zIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpe1xuICAgIGFzc2VydE9iamVjdCh0YXJnZXQpO1xuICAgIHRyeSB7XG4gICAgICAkLnNldERlc2ModGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcyk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgLy8gMjYuMS40IFJlZmxlY3QuZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSlcbiAgZGVsZXRlUHJvcGVydHk6IGZ1bmN0aW9uIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHZhciBkZXNjID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XG4gICAgcmV0dXJuIGRlc2MgJiYgIWRlc2MuY29uZmlndXJhYmxlID8gZmFsc2UgOiBkZWxldGUgdGFyZ2V0W3Byb3BlcnR5S2V5XTtcbiAgfSxcbiAgLy8gMjYuMS42IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlLZXkgWywgcmVjZWl2ZXJdKVxuICBnZXQ6IGZ1bmN0aW9uIGdldCh0YXJnZXQsIHByb3BlcnR5S2V5LyosIHJlY2VpdmVyKi8pe1xuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdXG4gICAgICAsIGRlc2MgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KSwgcHJvdG87XG4gICAgaWYoZGVzYylyZXR1cm4gJC5oYXMoZGVzYywgJ3ZhbHVlJylcbiAgICAgID8gZGVzYy52YWx1ZVxuICAgICAgOiBkZXNjLmdldCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XG4gICAgcmV0dXJuIGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG8odGFyZ2V0KSlcbiAgICAgID8gZ2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXG4gICAgICA6IHVuZGVmaW5lZDtcbiAgfSxcbiAgLy8gMjYuMS43IFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHJldHVybiAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcbiAgfSxcbiAgLy8gMjYuMS44IFJlZmxlY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KVxuICBnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YodGFyZ2V0KXtcbiAgICByZXR1cm4gZ2V0UHJvdG8oYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xuICB9LFxuICAvLyAyNi4xLjkgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wZXJ0eUtleSlcbiAgaGFzOiBmdW5jdGlvbiBoYXModGFyZ2V0LCBwcm9wZXJ0eUtleSl7XG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcbiAgfSxcbiAgLy8gMjYuMS4xMCBSZWZsZWN0LmlzRXh0ZW5zaWJsZSh0YXJnZXQpXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKHRhcmdldCl7XG4gICAgcmV0dXJuIF9pc0V4dGVuc2libGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xuICB9LFxuICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXG4gIG93bktleXM6IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpLFxuICAvLyAyNi4xLjEyIFJlZmxlY3QucHJldmVudEV4dGVuc2lvbnModGFyZ2V0KVxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KXtcbiAgICBhc3NlcnRPYmplY3QodGFyZ2V0KTtcbiAgICB0cnkge1xuICAgICAgaWYoX3ByZXZlbnRFeHRlbnNpb25zKV9wcmV2ZW50RXh0ZW5zaW9ucyh0YXJnZXQpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG4gIC8vIDI2LjEuMTMgUmVmbGVjdC5zZXQodGFyZ2V0LCBwcm9wZXJ0eUtleSwgViBbLCByZWNlaXZlcl0pXG4gIHNldDogZnVuY3Rpb24gc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYvKiwgcmVjZWl2ZXIqLyl7XG4gICAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cbiAgICAgICwgb3duRGVzYyAgPSAkLmdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KVxuICAgICAgLCBleGlzdGluZ0Rlc2NyaXB0b3IsIHByb3RvO1xuICAgIGlmKCFvd25EZXNjKXtcbiAgICAgIGlmKGlzT2JqZWN0KHByb3RvID0gZ2V0UHJvdG8odGFyZ2V0KSkpe1xuICAgICAgICByZXR1cm4gc2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgViwgcmVjZWl2ZXIpO1xuICAgICAgfVxuICAgICAgb3duRGVzYyA9ICQuZGVzYygwKTtcbiAgICB9XG4gICAgaWYoJC5oYXMob3duRGVzYywgJ3ZhbHVlJykpe1xuICAgICAgaWYob3duRGVzYy53cml0YWJsZSA9PT0gZmFsc2UgfHwgIWlzT2JqZWN0KHJlY2VpdmVyKSlyZXR1cm4gZmFsc2U7XG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IgPSAkLmdldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5KSB8fCAkLmRlc2MoMCk7XG4gICAgICBleGlzdGluZ0Rlc2NyaXB0b3IudmFsdWUgPSBWO1xuICAgICAgJC5zZXREZXNjKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSwgZXhpc3RpbmdEZXNjcmlwdG9yKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gb3duRGVzYy5zZXQgPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogKG93bkRlc2Muc2V0LmNhbGwocmVjZWl2ZXIsIFYpLCB0cnVlKTtcbiAgfVxufTtcbi8vIDI2LjEuMTQgUmVmbGVjdC5zZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKVxuaWYoc2V0UHJvdG8pcmVmbGVjdC5zZXRQcm90b3R5cGVPZiA9IGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pe1xuICBzZXRQcm90by5jaGVjayh0YXJnZXQsIHByb3RvKTtcbiAgdHJ5IHtcbiAgICBzZXRQcm90by5zZXQodGFyZ2V0LCBwcm90byk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4kZGVmKCRkZWYuRywge1JlZmxlY3Q6IHt9fSk7XG5cbiRkZWYoJGRlZi5TICsgJGRlZi5GICogYnVnZ3lFbnVtZXJhdGUsICdSZWZsZWN0Jywge1xuICAvLyAyNi4xLjUgUmVmbGVjdC5lbnVtZXJhdGUodGFyZ2V0KVxuICBlbnVtZXJhdGU6IGZ1bmN0aW9uIGVudW1lcmF0ZSh0YXJnZXQpe1xuICAgIHJldHVybiBuZXcgRW51bWVyYXRlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcbiAgfVxufSk7XG5cbiRkZWYoJGRlZi5TLCAnUmVmbGVjdCcsIHJlZmxlY3QpOyIsInZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJFJlZ0V4cCA9ICQuZy5SZWdFeHBcbiAgLCBCYXNlICAgID0gJFJlZ0V4cFxuICAsIHByb3RvICAgPSAkUmVnRXhwLnByb3RvdHlwZVxuICAsIHJlICAgICAgPSAvYS9nXG4gIC8vIFwibmV3XCIgY3JlYXRlcyBhIG5ldyBvYmplY3RcbiAgLCBDT1JSRUNUX05FVyA9IG5ldyAkUmVnRXhwKHJlKSAhPT0gcmVcbiAgLy8gUmVnRXhwIGFsbG93cyBhIHJlZ2V4IHdpdGggZmxhZ3MgYXMgdGhlIHBhdHRlcm5cbiAgLCBBTExPV1NfUkVfV0lUSF9GTEFHUyA9IGZ1bmN0aW9uKCl7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAkUmVnRXhwKHJlLCAnaScpID09ICcvYS9pJztcbiAgICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIH0oKTtcbmlmKCQuRlcgJiYgJC5ERVNDKXtcbiAgaWYoIUNPUlJFQ1RfTkVXIHx8ICFBTExPV1NfUkVfV0lUSF9GTEFHUyl7XG4gICAgJFJlZ0V4cCA9IGZ1bmN0aW9uIFJlZ0V4cChwYXR0ZXJuLCBmbGFncyl7XG4gICAgICB2YXIgcGF0dGVybklzUmVnRXhwICA9IGNvZihwYXR0ZXJuKSA9PSAnUmVnRXhwJ1xuICAgICAgICAsIGZsYWdzSXNVbmRlZmluZWQgPSBmbGFncyA9PT0gdW5kZWZpbmVkO1xuICAgICAgaWYoISh0aGlzIGluc3RhbmNlb2YgJFJlZ0V4cCkgJiYgcGF0dGVybklzUmVnRXhwICYmIGZsYWdzSXNVbmRlZmluZWQpcmV0dXJuIHBhdHRlcm47XG4gICAgICByZXR1cm4gQ09SUkVDVF9ORVdcbiAgICAgICAgPyBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgJiYgIWZsYWdzSXNVbmRlZmluZWQgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm4sIGZsYWdzKVxuICAgICAgICA6IG5ldyBCYXNlKHBhdHRlcm5Jc1JlZ0V4cCA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVyblxuICAgICAgICAgICwgcGF0dGVybklzUmVnRXhwICYmIGZsYWdzSXNVbmRlZmluZWQgPyBwYXR0ZXJuLmZsYWdzIDogZmxhZ3MpO1xuICAgIH07XG4gICAgJC5lYWNoLmNhbGwoJC5nZXROYW1lcyhCYXNlKSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgIGtleSBpbiAkUmVnRXhwIHx8ICQuc2V0RGVzYygkUmVnRXhwLCBrZXksIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiBCYXNlW2tleV07IH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24oaXQpeyBCYXNlW2tleV0gPSBpdDsgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcHJvdG8uY29uc3RydWN0b3IgPSAkUmVnRXhwO1xuICAgICRSZWdFeHAucHJvdG90eXBlID0gcHJvdG87XG4gICAgcmVxdWlyZSgnLi8kLnJlZGVmJykoJC5nLCAnUmVnRXhwJywgJFJlZ0V4cCk7XG4gIH1cbiAgLy8gMjEuMi41LjMgZ2V0IFJlZ0V4cC5wcm90b3R5cGUuZmxhZ3MoKVxuICBpZigvLi9nLmZsYWdzICE9ICdnJykkLnNldERlc2MocHJvdG8sICdmbGFncycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXi4qXFwvKFxcdyopJC8sICckMScpXG4gIH0pO1xufVxucmVxdWlyZSgnLi8kLnNwZWNpZXMnKSgkUmVnRXhwKTsiLCIndXNlIHN0cmljdCc7XG52YXIgc3Ryb25nID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tc3Ryb25nJyk7XG5cbi8vIDIzLjIgU2V0IE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1NldCcsIGZ1bmN0aW9uKGdldCl7XG4gIHJldHVybiBmdW5jdGlvbiBTZXQoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHNbMF0pOyB9O1xufSwge1xuICAvLyAyMy4yLjMuMSBTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcbiAgYWRkOiBmdW5jdGlvbiBhZGQodmFsdWUpe1xuICAgIHJldHVybiBzdHJvbmcuZGVmKHRoaXMsIHZhbHVlID0gdmFsdWUgPT09IDAgPyAwIDogdmFsdWUsIHZhbHVlKTtcbiAgfVxufSwgc3Ryb25nKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykoZmFsc2UpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy4zIFN0cmluZy5wcm90b3R5cGUuY29kZVBvaW50QXQocG9zKVxuICBjb2RlUG9pbnRBdDogZnVuY3Rpb24gY29kZVBvaW50QXQocG9zKXtcbiAgICByZXR1cm4gJGF0KHRoaXMsIHBvcyk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvTGVuZ3RoID0gJC50b0xlbmd0aDtcblxuLy8gc2hvdWxkIHRocm93IGVycm9yIG9uIHJlZ2V4XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgJ3EnLmVuZHNXaXRoKC8uLyk7IH0pLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuNiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKHNlYXJjaFN0cmluZyBbLCBlbmRQb3NpdGlvbl0pXG4gIGVuZHNXaXRoOiBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2hTdHJpbmcgLyosIGVuZFBvc2l0aW9uID0gQGxlbmd0aCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgdmFyIHRoYXQgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxuICAgICAgLCBlbmRQb3NpdGlvbiA9IGFyZ3VtZW50c1sxXVxuICAgICAgLCBsZW4gPSB0b0xlbmd0aCh0aGF0Lmxlbmd0aClcbiAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IE1hdGgubWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XG4gICAgcmV0dXJuIHRoYXQuc2xpY2UoZW5kIC0gc2VhcmNoU3RyaW5nLmxlbmd0aCwgZW5kKSA9PT0gc2VhcmNoU3RyaW5nO1xuICB9XG59KTsiLCJ2YXIgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvSW5kZXggPSByZXF1aXJlKCcuLyQnKS50b0luZGV4XG4gICwgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZVxuICAsICRmcm9tQ29kZVBvaW50ID0gU3RyaW5nLmZyb21Db2RlUG9pbnQ7XG5cbi8vIGxlbmd0aCBzaG91bGQgYmUgMSwgb2xkIEZGIHByb2JsZW1cbiRkZWYoJGRlZi5TICsgJGRlZi5GICogKCEhJGZyb21Db2RlUG9pbnQgJiYgJGZyb21Db2RlUG9pbnQubGVuZ3RoICE9IDEpLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjIuMiBTdHJpbmcuZnJvbUNvZGVQb2ludCguLi5jb2RlUG9pbnRzKVxuICBmcm9tQ29kZVBvaW50OiBmdW5jdGlvbiBmcm9tQ29kZVBvaW50KHgpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgdmFyIHJlcyA9IFtdXG4gICAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgaSAgID0gMFxuICAgICAgLCBjb2RlO1xuICAgIHdoaWxlKGxlbiA+IGkpe1xuICAgICAgY29kZSA9ICthcmd1bWVudHNbaSsrXTtcbiAgICAgIGlmKHRvSW5kZXgoY29kZSwgMHgxMGZmZmYpICE9PSBjb2RlKXRocm93IFJhbmdlRXJyb3IoY29kZSArICcgaXMgbm90IGEgdmFsaWQgY29kZSBwb2ludCcpO1xuICAgICAgcmVzLnB1c2goY29kZSA8IDB4MTAwMDBcbiAgICAgICAgPyBmcm9tQ2hhckNvZGUoY29kZSlcbiAgICAgICAgOiBmcm9tQ2hhckNvZGUoKChjb2RlIC09IDB4MTAwMDApID4+IDEwKSArIDB4ZDgwMCwgY29kZSAlIDB4NDAwICsgMHhkYzAwKVxuICAgICAgKTtcbiAgICB9IHJldHVybiByZXMuam9pbignJyk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy43IFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbiA9IDApXG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgcmV0dXJuICEhflN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTsiLCJ2YXIgc2V0ICAgPSByZXF1aXJlKCcuLyQnKS5zZXRcbiAgLCAkYXQgICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKVxuICAsIElURVIgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIHN0ZXAgID0gJGl0ZXIuc3RlcDtcblxuLy8gMjEuMS4zLjI3IFN0cmluZy5wcm90b3R5cGVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi8kLml0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcbi8vIDIxLjEuNS4yLjEgJVN0cmluZ0l0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cbiAgICAsIE8gICAgID0gaXRlci5vXG4gICAgLCBpbmRleCA9IGl0ZXIuaVxuICAgICwgcG9pbnQ7XG4gIGlmKGluZGV4ID49IE8ubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIGl0ZXIuaSArPSBwb2ludC5sZW5ndGg7XG4gIHJldHVybiBzdGVwKDAsIHBvaW50KTtcbn0pOyIsInZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUywgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4yLjQgU3RyaW5nLnJhdyhjYWxsU2l0ZSwgLi4uc3Vic3RpdHV0aW9ucylcbiAgcmF3OiBmdW5jdGlvbiByYXcoY2FsbFNpdGUpe1xuICAgIHZhciB0cGwgPSAkLnRvT2JqZWN0KGNhbGxTaXRlLnJhdylcbiAgICAgICwgbGVuID0gJC50b0xlbmd0aCh0cGwubGVuZ3RoKVxuICAgICAgLCBzbG4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIHJlcyA9IFtdXG4gICAgICAsIGkgICA9IDA7XG4gICAgd2hpbGUobGVuID4gaSl7XG4gICAgICByZXMucHVzaChTdHJpbmcodHBsW2krK10pKTtcbiAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcbiAgfVxufSk7IiwidmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMTMgU3RyaW5nLnByb3RvdHlwZS5yZXBlYXQoY291bnQpXG4gIHJlcGVhdDogcmVxdWlyZSgnLi8kLnN0cmluZy1yZXBlYXQnKVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4vLyBzaG91bGQgdGhyb3cgZXJyb3Igb24gcmVnZXhcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogIXJlcXVpcmUoJy4vJC50aHJvd3MnKShmdW5jdGlvbigpeyAncScuc3RhcnRzV2l0aCgvLi8pOyB9KSwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcbiAgc3RhcnRzV2l0aDogZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XG4gICAgaWYoY29mKHNlYXJjaFN0cmluZykgPT0gJ1JlZ0V4cCcpdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgdmFyIHRoYXQgID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgaW5kZXggPSAkLnRvTGVuZ3RoKE1hdGgubWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcbiAgICBzZWFyY2hTdHJpbmcgKz0gJyc7XG4gICAgcmV0dXJuIHRoYXQuc2xpY2UoaW5kZXgsIGluZGV4ICsgc2VhcmNoU3RyaW5nLmxlbmd0aCkgPT09IHNlYXJjaFN0cmluZztcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBzZXRUYWcgICA9IHJlcXVpcmUoJy4vJC5jb2YnKS5zZXRcbiAgLCB1aWQgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKVxuICAsIHNoYXJlZCAgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcmVkZWYgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpXG4gICwga2V5T2YgICAgPSByZXF1aXJlKCcuLyQua2V5b2YnKVxuICAsIGVudW1LZXlzID0gcmVxdWlyZSgnLi8kLmVudW0ta2V5cycpXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxuICAsIE9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZVxuICAsIERFU0MgICAgID0gJC5ERVNDXG4gICwgaGFzICAgICAgPSAkLmhhc1xuICAsICRjcmVhdGUgID0gJC5jcmVhdGVcbiAgLCBnZXREZXNjICA9ICQuZ2V0RGVzY1xuICAsIHNldERlc2MgID0gJC5zZXREZXNjXG4gICwgZGVzYyAgICAgPSAkLmRlc2NcbiAgLCAkbmFtZXMgICA9IHJlcXVpcmUoJy4vJC5nZXQtbmFtZXMnKVxuICAsIGdldE5hbWVzID0gJG5hbWVzLmdldFxuICAsIHRvT2JqZWN0ID0gJC50b09iamVjdFxuICAsICRTeW1ib2wgID0gJC5nLlN5bWJvbFxuICAsIHNldHRlciAgID0gZmFsc2VcbiAgLCBUQUcgICAgICA9IHVpZCgndGFnJylcbiAgLCBISURERU4gICA9IHVpZCgnaGlkZGVuJylcbiAgLCBfcHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZVxuICAsIFN5bWJvbFJlZ2lzdHJ5ID0gc2hhcmVkKCdzeW1ib2wtcmVnaXN0cnknKVxuICAsIEFsbFN5bWJvbHMgPSBzaGFyZWQoJ3N5bWJvbHMnKVxuICAsIHVzZU5hdGl2ZSA9ICQuaXNGdW5jdGlvbigkU3ltYm9sKTtcblxudmFyIHNldFN5bWJvbERlc2MgPSBERVNDID8gZnVuY3Rpb24oKXsgLy8gZmFsbGJhY2sgZm9yIG9sZCBBbmRyb2lkXG4gIHRyeSB7XG4gICAgcmV0dXJuICRjcmVhdGUoc2V0RGVzYyh7fSwgSElEREVOLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBzZXREZXNjKHRoaXMsIEhJRERFTiwge3ZhbHVlOiBmYWxzZX0pW0hJRERFTl07XG4gICAgICB9XG4gICAgfSkpW0hJRERFTl0gfHwgc2V0RGVzYztcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gZnVuY3Rpb24oaXQsIGtleSwgRCl7XG4gICAgICB2YXIgcHJvdG9EZXNjID0gZ2V0RGVzYyhPYmplY3RQcm90bywga2V5KTtcbiAgICAgIGlmKHByb3RvRGVzYylkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgICAgIHNldERlc2MoaXQsIGtleSwgRCk7XG4gICAgICBpZihwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKXNldERlc2MoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbiAgICB9O1xuICB9XG59KCkgOiBzZXREZXNjO1xuXG5mdW5jdGlvbiB3cmFwKHRhZyl7XG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSAkLnNldCgkY3JlYXRlKCRTeW1ib2wucHJvdG90eXBlKSwgVEFHLCB0YWcpO1xuICBERVNDICYmIHNldHRlciAmJiBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgZGVzYygxLCB2YWx1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzeW07XG59XG5cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIEQpe1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcbiAgICAgIGlmKCFoYXMoaXQsIEhJRERFTikpc2V0RGVzYyhpdCwgSElEREVOLCBkZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKWl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9ICRjcmVhdGUoRCwge2VudW1lcmFibGU6IGRlc2MoMCwgZmFsc2UpfSk7XG4gICAgfSByZXR1cm4gc2V0U3ltYm9sRGVzYyhpdCwga2V5LCBEKTtcbiAgfSByZXR1cm4gc2V0RGVzYyhpdCwga2V5LCBEKTtcbn1cbmZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApe1xuICBhc3NlcnRPYmplY3QoaXQpO1xuICB2YXIga2V5cyA9IGVudW1LZXlzKFAgPSB0b09iamVjdChQKSlcbiAgICAsIGkgICAgPSAwXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcbiAgICAsIGtleTtcbiAgd2hpbGUobCA+IGkpZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufVxuZnVuY3Rpb24gY3JlYXRlKGl0LCBQKXtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/ICRjcmVhdGUoaXQpIDogZGVmaW5lUHJvcGVydGllcygkY3JlYXRlKGl0KSwgUCk7XG59XG5mdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpe1xuICB2YXIgRSA9IF9wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHRoaXMsIGtleSk7XG4gIHJldHVybiBFIHx8ICFoYXModGhpcywga2V5KSB8fCAhaGFzKEFsbFN5bWJvbHMsIGtleSkgfHwgaGFzKHRoaXMsIEhJRERFTikgJiYgdGhpc1tISURERU5dW2tleV1cbiAgICA/IEUgOiB0cnVlO1xufVxuZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICB2YXIgRCA9IGdldERlc2MoaXQgPSB0b09iamVjdChpdCksIGtleSk7XG4gIGlmKEQgJiYgaGFzKEFsbFN5bWJvbHMsIGtleSkgJiYgIShoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKSlELmVudW1lcmFibGUgPSB0cnVlO1xuICByZXR1cm4gRDtcbn1cbmZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4pcmVzdWx0LnB1c2goa2V5KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnZXROYW1lcyh0b09iamVjdChpdCkpXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgaSAgICAgID0gMFxuICAgICwga2V5O1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSlyZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyAxOS40LjEuMSBTeW1ib2woW2Rlc2NyaXB0aW9uXSlcbmlmKCF1c2VOYXRpdmUpe1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCl7XG4gICAgaWYodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3InKTtcbiAgICByZXR1cm4gd3JhcCh1aWQoYXJndW1lbnRzWzBdKSk7XG4gIH07XG4gICRyZWRlZigkU3ltYm9sLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpc1tUQUddO1xuICB9KTtcblxuICAkLmNyZWF0ZSAgICAgPSBjcmVhdGU7XG4gICQuc2V0RGVzYyAgICA9IGRlZmluZVByb3BlcnR5O1xuICAkLmdldERlc2MgICAgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICQuc2V0RGVzY3MgICA9IGRlZmluZVByb3BlcnRpZXM7XG4gICQuZ2V0TmFtZXMgICA9ICRuYW1lcy5nZXQgPSBnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICAkLmdldFN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbiAgaWYoJC5ERVNDICYmICQuRlcpJHJlZGVmKE9iamVjdFByb3RvLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCBwcm9wZXJ0eUlzRW51bWVyYWJsZSwgdHJ1ZSk7XG59XG5cbnZhciBzeW1ib2xTdGF0aWNzID0ge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihrZXkpe1xuICAgIHJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XG59O1xuLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXG4vLyAxOS40LjIuNCBTeW1ib2wuaXRlcmF0b3Jcbi8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2Vcbi8vIDE5LjQuMi45IFN5bWJvbC5zZWFyY2hcbi8vIDE5LjQuMi4xMCBTeW1ib2wuc3BlY2llc1xuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxuLy8gMTkuNC4yLjEyIFN5bWJvbC50b1ByaW1pdGl2ZVxuLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xuJC5lYWNoLmNhbGwoKFxuICAgICdoYXNJbnN0YW5jZSxpc0NvbmNhdFNwcmVhZGFibGUsaXRlcmF0b3IsbWF0Y2gscmVwbGFjZSxzZWFyY2gsJyArXG4gICAgJ3NwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4gICkuc3BsaXQoJywnKSwgZnVuY3Rpb24oaXQpe1xuICAgIHZhciBzeW0gPSByZXF1aXJlKCcuLyQud2tzJykoaXQpO1xuICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gdXNlTmF0aXZlID8gc3ltIDogd3JhcChzeW0pO1xuICB9XG4pO1xuXG5zZXR0ZXIgPSB0cnVlO1xuXG4kZGVmKCRkZWYuRyArICRkZWYuVywge1N5bWJvbDogJFN5bWJvbH0pO1xuXG4kZGVmKCRkZWYuUywgJ1N5bWJvbCcsIHN5bWJvbFN0YXRpY3MpO1xuXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICF1c2VOYXRpdmUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiBjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogZGVmaW5lUHJvcGVydHksXG4gIC8vIDE5LjEuMi4zIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpXG4gIGRlZmluZVByb3BlcnRpZXM6IGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6IGdldE93blByb3BlcnR5TmFtZXMsXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcbiAgZ2V0T3duUHJvcGVydHlTeW1ib2xzOiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUYWcoJFN5bWJvbCwgJ1N5bWJvbCcpO1xuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKCQuZy5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHdlYWsgICAgICA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXdlYWsnKVxuICAsIGxlYWtTdG9yZSA9IHdlYWsubGVha1N0b3JlXG4gICwgSUQgICAgICAgID0gd2Vhay5JRFxuICAsIFdFQUsgICAgICA9IHdlYWsuV0VBS1xuICAsIGhhcyAgICAgICA9ICQuaGFzXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgaXNPYmplY3RcbiAgLCB0bXAgICAgICAgPSB7fTtcblxuLy8gMjMuMyBXZWFrTWFwIE9iamVjdHNcbnZhciAkV2Vha01hcCA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtNYXAnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gV2Vha01hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50c1swXSk7IH07XG59LCB7XG4gIC8vIDIzLjMuMy4zIFdlYWtNYXAucHJvdG90eXBlLmdldChrZXkpXG4gIGdldDogZnVuY3Rpb24gZ2V0KGtleSl7XG4gICAgaWYoaXNPYmplY3Qoa2V5KSl7XG4gICAgICBpZighaXNFeHRlbnNpYmxlKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5nZXQoa2V5KTtcbiAgICAgIGlmKGhhcyhrZXksIFdFQUspKXJldHVybiBrZXlbV0VBS11bdGhpc1tJRF1dO1xuICAgIH1cbiAgfSxcbiAgLy8gMjMuMy4zLjUgV2Vha01hcC5wcm90b3R5cGUuc2V0KGtleSwgdmFsdWUpXG4gIHNldDogZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpe1xuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCBrZXksIHZhbHVlKTtcbiAgfVxufSwgd2VhaywgdHJ1ZSwgdHJ1ZSk7XG5cbi8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcbmlmKG5ldyAkV2Vha01hcCgpLnNldCgoT2JqZWN0LmZyZWV6ZSB8fCBPYmplY3QpKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xuICAkLmVhY2guY2FsbChbJ2RlbGV0ZScsICdoYXMnLCAnZ2V0JywgJ3NldCddLCBmdW5jdGlvbihrZXkpe1xuICAgIHZhciBwcm90byAgPSAkV2Vha01hcC5wcm90b3R5cGVcbiAgICAgICwgbWV0aG9kID0gcHJvdG9ba2V5XTtcbiAgICByZXF1aXJlKCcuLyQucmVkZWYnKShwcm90bywga2V5LCBmdW5jdGlvbihhLCBiKXtcbiAgICAgIC8vIHN0b3JlIGZyb3plbiBvYmplY3RzIG9uIGxlYWt5IG1hcFxuICAgICAgaWYoaXNPYmplY3QoYSkgJiYgIWlzRXh0ZW5zaWJsZShhKSl7XG4gICAgICAgIHZhciByZXN1bHQgPSBsZWFrU3RvcmUodGhpcylba2V5XShhLCBiKTtcbiAgICAgICAgcmV0dXJuIGtleSA9PSAnc2V0JyA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICAvLyBzdG9yZSBhbGwgdGhlIHJlc3Qgb24gbmF0aXZlIHdlYWttYXBcbiAgICAgIH0gcmV0dXJuIG1ldGhvZC5jYWxsKHRoaXMsIGEsIGIpO1xuICAgIH0pO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG52YXIgd2VhayA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXdlYWsnKTtcblxuLy8gMjMuNCBXZWFrU2V0IE9iamVjdHNcbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtTZXQnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gV2Vha1NldCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50c1swXSk7IH07XG59LCB7XG4gIC8vIDIzLjQuMy4xIFdlYWtTZXQucHJvdG90eXBlLmFkZCh2YWx1ZSlcbiAgYWRkOiBmdW5jdGlvbiBhZGQodmFsdWUpe1xuICAgIHJldHVybiB3ZWFrLmRlZih0aGlzLCB2YWx1ZSwgdHJ1ZSk7XG4gIH1cbn0sIHdlYWssIGZhbHNlLCB0cnVlKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJGluY2x1ZGVzID0gcmVxdWlyZSgnLi8kLmFycmF5LWluY2x1ZGVzJykodHJ1ZSk7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZG9tZW5pYy9BcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcbiAgICByZXR1cm4gJGluY2x1ZGVzKHRoaXMsIGVsLCBhcmd1bWVudHNbMV0pO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2luY2x1ZGVzJyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdNYXAnKTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9XZWJSZWZsZWN0aW9uLzkzNTM3ODFcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgb3duS2V5cyA9IHJlcXVpcmUoJy4vJC5vd24ta2V5cycpO1xuXG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yczogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhvYmplY3Qpe1xuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcbiAgICAgICwgcmVzdWx0ID0ge307XG4gICAgJC5lYWNoLmNhbGwob3duS2V5cyhPKSwgZnVuY3Rpb24oa2V5KXtcbiAgICAgICQuc2V0RGVzYyhyZXN1bHQsIGtleSwgJC5kZXNjKDAsICQuZ2V0RGVzYyhPLCBrZXkpKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwiLy8gaHR0cDovL2dvby5nbC9Ya0JyakRcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xuICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KXtcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXG4gICAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBpICAgICAgPSAwXG4gICAgICAsIHJlc3VsdCA9IEFycmF5KGxlbmd0aClcbiAgICAgICwga2V5O1xuICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XG4gICAgZWxzZSB3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IE9ba2V5c1tpKytdXTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIHZhbHVlczogIGNyZWF0ZU9iamVjdFRvQXJyYXkoZmFsc2UpLFxuICBlbnRyaWVzOiBjcmVhdGVPYmplY3RUb0FycmF5KHRydWUpXG59KTsiLCIvLyBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9rYW5nYXgvOTY5ODEwMFxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ1JlZ0V4cCcsIHtcbiAgZXNjYXBlOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvKFtcXFxcXFwtW1xcXXt9KCkqKz8uLF4kfF0pL2csICdcXFxcJDEnLCB0cnVlKVxufSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL0RhdmlkQnJ1YW50L01hcC1TZXQucHJvdG90eXBlLnRvSlNPTlxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24tdG8tanNvbicpKCdTZXQnKTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0aGlhc2J5bmVucy9TdHJpbmcucHJvdG90eXBlLmF0XG4ndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRhdCAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgYXQ6IGZ1bmN0aW9uIGF0KHBvcyl7XG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRwYWQgPSByZXF1aXJlKCcuLyQuc3RyaW5nLXBhZCcpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIGxwYWQ6IGZ1bmN0aW9uIGxwYWQobil7XG4gICAgcmV0dXJuICRwYWQodGhpcywgbiwgYXJndW1lbnRzWzFdLCB0cnVlKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcGFkID0gcmVxdWlyZSgnLi8kLnN0cmluZy1wYWQnKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICBycGFkOiBmdW5jdGlvbiBycGFkKG4pe1xuICAgIHJldHVybiAkcGFkKHRoaXMsIG4sIGFyZ3VtZW50c1sxXSwgZmFsc2UpO1xuICB9XG59KTsiLCIvLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkQXJyYXkgID0gJC5jb3JlLkFycmF5IHx8IEFycmF5XG4gICwgc3RhdGljcyA9IHt9O1xuZnVuY3Rpb24gc2V0U3RhdGljcyhrZXlzLCBsZW5ndGgpe1xuICAkLmVhY2guY2FsbChrZXlzLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XG4gICAgaWYobGVuZ3RoID09IHVuZGVmaW5lZCAmJiBrZXkgaW4gJEFycmF5KXN0YXRpY3Nba2V5XSA9ICRBcnJheVtrZXldO1xuICAgIGVsc2UgaWYoa2V5IGluIFtdKXN0YXRpY3Nba2V5XSA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBbXVtrZXldLCBsZW5ndGgpO1xuICB9KTtcbn1cbnNldFN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcbnNldFN0YXRpY3MoJ2luZGV4T2YsZXZlcnksc29tZSxmb3JFYWNoLG1hcCxmaWx0ZXIsZmluZCxmaW5kSW5kZXgsaW5jbHVkZXMnLCAzKTtcbnNldFN0YXRpY3MoJ2pvaW4sc2xpY2UsY29uY2F0LHB1c2gsc3BsaWNlLHVuc2hpZnQsc29ydCxsYXN0SW5kZXhPZiwnICtcbiAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xuJGRlZigkZGVmLlMsICdBcnJheScsIHN0YXRpY3MpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgJCAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIEl0ZXJhdG9ycyAgID0gcmVxdWlyZSgnLi8kLml0ZXInKS5JdGVyYXRvcnNcbiAgLCBJVEVSQVRPUiAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5VmFsdWVzID0gSXRlcmF0b3JzLkFycmF5XG4gICwgTkwgICAgICAgICAgPSAkLmcuTm9kZUxpc3RcbiAgLCBIVEMgICAgICAgICA9ICQuZy5IVE1MQ29sbGVjdGlvblxuICAsIE5MUHJvdG8gICAgID0gTkwgJiYgTkwucHJvdG90eXBlXG4gICwgSFRDUHJvdG8gICAgPSBIVEMgJiYgSFRDLnByb3RvdHlwZTtcbmlmKCQuRlcpe1xuICBpZihOTCAmJiAhKElURVJBVE9SIGluIE5MUHJvdG8pKSQuaGlkZShOTFByb3RvLCBJVEVSQVRPUiwgQXJyYXlWYWx1ZXMpO1xuICBpZihIVEMgJiYgIShJVEVSQVRPUiBpbiBIVENQcm90bykpJC5oaWRlKEhUQ1Byb3RvLCBJVEVSQVRPUiwgQXJyYXlWYWx1ZXMpO1xufVxuSXRlcmF0b3JzLk5vZGVMaXN0ID0gSXRlcmF0b3JzLkhUTUxDb2xsZWN0aW9uID0gQXJyYXlWYWx1ZXM7IiwidmFyICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHRhc2sgPSByZXF1aXJlKCcuLyQudGFzaycpO1xuJGRlZigkZGVmLkcgKyAkZGVmLkIsIHtcbiAgc2V0SW1tZWRpYXRlOiAgICR0YXNrLnNldCxcbiAgY2xlYXJJbW1lZGlhdGU6ICR0YXNrLmNsZWFyXG59KTsiLCIvLyBpZTktIHNldFRpbWVvdXQgJiBzZXRJbnRlcnZhbCBhZGRpdGlvbmFsIHBhcmFtZXRlcnMgZml4XG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpbnZva2UgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBwYXJ0aWFsICAgPSByZXF1aXJlKCcuLyQucGFydGlhbCcpXG4gICwgbmF2aWdhdG9yID0gJC5nLm5hdmlnYXRvclxuICAsIE1TSUUgICAgICA9ICEhbmF2aWdhdG9yICYmIC9NU0lFIC5cXC4vLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7IC8vIDwtIGRpcnR5IGllOS0gY2hlY2tcbmZ1bmN0aW9uIHdyYXAoc2V0KXtcbiAgcmV0dXJuIE1TSUUgPyBmdW5jdGlvbihmbiwgdGltZSAvKiwgLi4uYXJncyAqLyl7XG4gICAgcmV0dXJuIHNldChpbnZva2UoXG4gICAgICBwYXJ0aWFsLFxuICAgICAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpLFxuICAgICAgJC5pc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pXG4gICAgKSwgdGltZSk7XG4gIH0gOiBzZXQ7XG59XG4kZGVmKCRkZWYuRyArICRkZWYuQiArICRkZWYuRiAqIE1TSUUsIHtcbiAgc2V0VGltZW91dDogIHdyYXAoJC5nLnNldFRpbWVvdXQpLFxuICBzZXRJbnRlcnZhbDogd3JhcCgkLmcuc2V0SW50ZXJ2YWwpXG59KTsiLCJyZXF1aXJlKCcuL21vZHVsZXMvZXM1Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN5bWJvbCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5pcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmZ1bmN0aW9uLm5hbWUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuZnVuY3Rpb24uaGFzLWluc3RhbmNlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3RvcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuc3RhdGljcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXRoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJhdycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmNvZGUtcG9pbnQtYXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmVuZHMtd2l0aCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuaW5jbHVkZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuc3RhcnRzLXdpdGgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5vZicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbGwnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZ2V4cCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5wcm9taXNlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hcCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zZXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYud2Vhay1tYXAnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYud2Vhay1zZXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVmbGVjdCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zdHJpbmcuYXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcucmVnZXhwLmVzY2FwZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXknKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcubWFwLnRvLWpzb24nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc2V0LnRvLWpzb24nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvd2ViLnRpbWVycycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5pbW1lZGlhdGUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuZG9tLml0ZXJhYmxlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbW9kdWxlcy8kJykuY29yZTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIGh0dHBzOi8vcmF3LmdpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvbWFzdGVyL0xJQ0VOU0UgZmlsZS4gQW5cbiAqIGFkZGl0aW9uYWwgZ3JhbnQgb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpblxuICogdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbiEoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID1cbiAgICB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuXG4gIHZhciBpbk1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCI7XG4gIHZhciBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZTtcbiAgaWYgKHJ1bnRpbWUpIHtcbiAgICBpZiAoaW5Nb2R1bGUpIHtcbiAgICAgIC8vIElmIHJlZ2VuZXJhdG9yUnVudGltZSBpcyBkZWZpbmVkIGdsb2JhbGx5IGFuZCB3ZSdyZSBpbiBhIG1vZHVsZSxcbiAgICAgIC8vIG1ha2UgdGhlIGV4cG9ydHMgb2JqZWN0IGlkZW50aWNhbCB0byByZWdlbmVyYXRvclJ1bnRpbWUuXG4gICAgICBtb2R1bGUuZXhwb3J0cyA9IHJ1bnRpbWU7XG4gICAgfVxuICAgIC8vIERvbid0IGJvdGhlciBldmFsdWF0aW5nIHRoZSByZXN0IG9mIHRoaXMgZmlsZSBpZiB0aGUgcnVudGltZSB3YXNcbiAgICAvLyBhbHJlYWR5IGRlZmluZWQgZ2xvYmFsbHkuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRGVmaW5lIHRoZSBydW50aW1lIGdsb2JhbGx5IChhcyBleHBlY3RlZCBieSBnZW5lcmF0ZWQgY29kZSkgYXMgZWl0aGVyXG4gIC8vIG1vZHVsZS5leHBvcnRzIChpZiB3ZSdyZSBpbiBhIG1vZHVsZSkgb3IgYSBuZXcsIGVtcHR5IG9iamVjdC5cbiAgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWUgPSBpbk1vZHVsZSA/IG1vZHVsZS5leHBvcnRzIDoge307XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUoKG91dGVyRm4gfHwgR2VuZXJhdG9yKS5wcm90b3R5cGUpO1xuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKFxuICAgICAgaW5uZXJGbiwgc2VsZiB8fCBudWxsLFxuICAgICAgbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pXG4gICAgKTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0gR2VuZXJhdG9yLnByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgcHJvdG90eXBlW21ldGhvZF0gPSBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgdmFsdWUgaW5zdGFuY2VvZiBBd2FpdEFyZ3VtZW50YCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC4gU29tZSBtYXkgY29uc2lkZXIgdGhlIG5hbWUgb2YgdGhpcyBtZXRob2QgdG9vXG4gIC8vIGN1dGVzeSwgYnV0IHRoZXkgYXJlIGN1cm11ZGdlb25zLlxuICBydW50aW1lLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIG5ldyBBd2FpdEFyZ3VtZW50KGFyZyk7XG4gIH07XG5cbiAgZnVuY3Rpb24gQXdhaXRBcmd1bWVudChhcmcpIHtcbiAgICB0aGlzLmFyZyA9IGFyZztcbiAgfVxuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yKSB7XG4gICAgLy8gVGhpcyBpbnZva2UgZnVuY3Rpb24gaXMgd3JpdHRlbiBpbiBhIHN0eWxlIHRoYXQgYXNzdW1lcyBzb21lXG4gICAgLy8gY2FsbGluZyBmdW5jdGlvbiAob3IgUHJvbWlzZSkgd2lsbCBoYW5kbGUgZXhjZXB0aW9ucy5cbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSBnZW5lcmF0b3JbbWV0aG9kXShhcmcpO1xuICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgQXdhaXRBcmd1bWVudFxuICAgICAgICA/IFByb21pc2UucmVzb2x2ZSh2YWx1ZS5hcmcpLnRoZW4oaW52b2tlTmV4dCwgaW52b2tlVGhyb3cpXG4gICAgICAgIDogcmVzdWx0O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gXCJvYmplY3RcIiAmJiBwcm9jZXNzLmRvbWFpbikge1xuICAgICAgaW52b2tlID0gcHJvY2Vzcy5kb21haW4uYmluZChpbnZva2UpO1xuICAgIH1cblxuICAgIHZhciBpbnZva2VOZXh0ID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgdmFyIGludm9rZVRocm93ID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInRocm93XCIpO1xuICAgIHZhciBpbnZva2VSZXR1cm4gPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwicmV0dXJuXCIpO1xuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICB2YXIgZW5xdWV1ZVJlc3VsdCA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gaW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgICAgfSkgOiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgcmVzb2x2ZShpbnZva2UobWV0aG9kLCBhcmcpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGVucXVldWVSZXN1bHQgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnlcbiAgICAgIC8vIGxhdGVyIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvciwgYW5kIGNhbGwgZ2VuZXJhdG9yLnJldHVybigpIHRvXG4gICAgICAvLyBhbGxvdyB0aGUgZ2VuZXJhdG9yIGEgY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgcHJldmlvdXNQcm9taXNlID0gZW5xdWV1ZVJlc3VsdC5jYXRjaChpbnZva2VSZXR1cm4pO1xuXG4gICAgICByZXR1cm4gZW5xdWV1ZVJlc3VsdDtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBydW50aW1lLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdClcbiAgICApO1xuXG4gICAgcmV0dXJuIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwicmV0dXJuXCIgfHxcbiAgICAgICAgICAgICAgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiICYmIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIC8vIEEgcmV0dXJuIG9yIHRocm93ICh3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gdGhyb3dcbiAgICAgICAgICAgIC8vIG1ldGhvZCkgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICAgIHZhciByZXR1cm5NZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXTtcbiAgICAgICAgICAgIGlmIChyZXR1cm5NZXRob2QpIHtcbiAgICAgICAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHJldHVybk1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGFyZyk7XG4gICAgICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJldHVybiBtZXRob2QgdGhyZXcgYW4gZXhjZXB0aW9uLCBsZXQgdGhhdFxuICAgICAgICAgICAgICAgIC8vIGV4Y2VwdGlvbiBwcmV2YWlsIG92ZXIgdGhlIG9yaWdpbmFsIHJldHVybiBvciB0aHJvdy5cbiAgICAgICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICAgICAgYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIG91dGVyIHJldHVybiwgbm93IHRoYXQgdGhlIGRlbGVnYXRlXG4gICAgICAgICAgICAgIC8vIGl0ZXJhdG9yIGhhcyBiZWVuIHRlcm1pbmF0ZWQuXG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChcbiAgICAgICAgICAgIGRlbGVnYXRlLml0ZXJhdG9yW21ldGhvZF0sXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvcixcbiAgICAgICAgICAgIGFyZ1xuICAgICAgICAgICk7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgICAgICAgIC8vIExpa2UgcmV0dXJuaW5nIGdlbmVyYXRvci50aHJvdyh1bmNhdWdodCksIGJ1dCB3aXRob3V0IHRoZVxuICAgICAgICAgICAgLy8gb3ZlcmhlYWQgb2YgYW4gZXh0cmEgZnVuY3Rpb24gY2FsbC5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zZW50ID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgY29udGV4dC5zZW50O1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5kZWxlZ2F0ZSAmJiBtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIHJ1bnRpbWUua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBydW50aW1lLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICB0aGlzLnNlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgLy8gUHJlLWluaXRpYWxpemUgYXQgbGVhc3QgMjAgdGVtcG9yYXJ5IHZhcmlhYmxlcyB0byBlbmFibGUgaGlkZGVuXG4gICAgICAvLyBjbGFzcyBvcHRpbWl6YXRpb25zIGZvciBzaW1wbGUgZ2VuZXJhdG9ycy5cbiAgICAgIGZvciAodmFyIHRlbXBJbmRleCA9IDAsIHRlbXBOYW1lO1xuICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCB0ZW1wTmFtZSA9IFwidFwiICsgdGVtcEluZGV4KSB8fCB0ZW1wSW5kZXggPCAyMDtcbiAgICAgICAgICAgKyt0ZW1wSW5kZXgpIHtcbiAgICAgICAgdGhpc1t0ZW1wTmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG4gICAgICAgIHJldHVybiAhIWNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG59KShcbiAgLy8gQW1vbmcgdGhlIHZhcmlvdXMgdHJpY2tzIGZvciBvYnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbFxuICAvLyBvYmplY3QsIHRoaXMgc2VlbXMgdG8gYmUgdGhlIG1vc3QgcmVsaWFibGUgdGVjaG5pcXVlIHRoYXQgZG9lcyBub3RcbiAgLy8gdXNlIGluZGlyZWN0IGV2YWwgKHdoaWNoIHZpb2xhdGVzIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5KS5cbiAgdHlwZW9mIGdsb2JhbCA9PT0gXCJvYmplY3RcIiA/IGdsb2JhbCA6XG4gIHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIgPyB3aW5kb3cgOlxuICB0eXBlb2Ygc2VsZiA9PT0gXCJvYmplY3RcIiA/IHNlbGYgOiB0aGlzXG4pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiLi9saWIvYmFiZWwvcG9seWZpbGxcIik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiYWJlbC1jb3JlL3BvbHlmaWxsXCIpO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBzdGFyZmllbGQuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jb25zdCBNYXhMYXllcnMgPSA4O1xuY29uc3QgTnVtU3BhcmtsaW5nU3RhcnMgPSAzO1xuXG5jbGFzcyBTdGFyZmllbGQge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgbnVtTGF5ZXJzID0gOCwgc3RhcnNFYWNoTGF5ZXIgPSAxMDApIHtcbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLl9udW1MYXllcnMgPSBNYXRoLm1pbihNYXhMYXllcnMsIG51bUxheWVycyk7XG4gICAgICAgIHRoaXMuX3N0YXJzRWFjaExheWVyID0gc3RhcnNFYWNoTGF5ZXI7XG5cbiAgICAgICAgdGhpcy5fc3RhcnMgPSB0aGlzLl9wYXJlbnQuYWRkLmdyb3VwKCk7XG4gICAgICAgIHRoaXMuX3NwYXJrbGluZ1N0YXJzID0gdGhpcy5fcGFyZW50LmFkZC5ncm91cCgpO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZVN0YXJzKCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVNwYXJrbGluZ1N0YXJzKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB2YXIgdyA9IHRoaXMuX3BhcmVudC5nYW1lLndpZHRoO1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLl9wYXJlbnQud29ybGQ7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLl9zdGFycy50b3RhbDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgbGV0IHN0YXIgPSB0aGlzLl9zdGFycy5nZXRBdChpKTtcbiAgICAgICAgICAgIGxldCBkZXB0aCA9IGkgJSB0aGlzLl9udW1MYXllcnM7XG5cbiAgICAgICAgICAgIGxldCBzcGVlZCA9IChkZXB0aCA8IDEgPyAxLjUgOiBkZXB0aCAqIDEuNSk7XG4gICAgICAgICAgICBzdGFyLnggLT0gKHN0YXIuaXNTaG9vdGluZ1N0YXIgPyBzcGVlZCAqIDIgOiBzcGVlZCk7XG5cbiAgICAgICAgICAgIGlmIChzdGFyLnggPCAwKSB7XG4gICAgICAgICAgICAgICAgc3Rhci54ID0gdyArIDMyO1xuICAgICAgICAgICAgICAgIHN0YXIueSA9IHdvcmxkLnJhbmRvbVk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlU3RhcnMoKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMuX3BhcmVudC53b3JsZDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX251bUxheWVycyAqIHRoaXMuX3N0YXJzRWFjaExheWVyOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBzdGFyID0gdGhpcy5fc3RhcnMuY3JlYXRlKHdvcmxkLnJhbmRvbVgsIHdvcmxkLnJhbmRvbVksXG4gICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50LmNhY2hlLmdldEJpdG1hcERhdGEoQ29uc3QuRklMTEVEX1JFQ1QpKTtcbiAgICAgICAgICAgIGxldCBkZXB0aCA9IGkgJSB0aGlzLl9udW1MYXllcnM7XG5cbiAgICAgICAgICAgIHN0YXIuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgICAgICAgc3Rhci53aWR0aCA9IHN0YXIuaGVpZ2h0ID0gMjtcbiAgICAgICAgICAgIHN0YXIuYWxwaGEgPSAoZGVwdGggKyAxKSAvIHRoaXMuX251bUxheWVycztcblxuICAgICAgICAgICAgLy8gc2V0IGEgc2VsZWN0IGZldyBzdGFycyB0byBiZSBzaG9vdGluZyBzdGFyc1xuICAgICAgICAgICAgaWYgKHN0YXIuYWxwaGEgPT09IDEgJiYgUGhhc2VyLk1hdGguY2hhbmNlUm9sbCgxMCkpIHtcbiAgICAgICAgICAgICAgICBzdGFyLndpZHRoID0gMTY7XG4gICAgICAgICAgICAgICAgc3Rhci5pc1Nob290aW5nU3RhciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY3JlYXRlU3BhcmtsaW5nU3RhcnMoKSB7XG4gICAgICAgIHZhciB3b3JsZCA9IHRoaXMuX3BhcmVudC5nYW1lLndvcmxkO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgTnVtU3BhcmtsaW5nU3RhcnM7IGkrKykge1xuICAgICAgICAgICAgbGV0IHN0YXIgPSB0aGlzLl9zcGFya2xpbmdTdGFycy5jcmVhdGUod29ybGQucmFuZG9tWCwgd29ybGQucmFuZG9tWSxcbiAgICAgICAgICAgICAgICBDb25zdC5TUFJJVEVfU0hFRVQsIDMxNCk7XG5cbiAgICAgICAgICAgIHN0YXIuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgICAgICAgc3Rhci5zY2FsZS5zZXQoMik7XG5cbiAgICAgICAgICAgIGxldCBkdXJhdGlvbiA9IHRoaXMuX3BhcmVudC5ybmQuYmV0d2Vlbig1MDAsIDg1MCk7XG4gICAgICAgICAgICBsZXQgZGVsYXkgPSB0aGlzLl9wYXJlbnQucm5kLmJldHdlZW4oMjUwLCA1MDApO1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LmFkZC50d2VlbihzdGFyLnNjYWxlKVxuICAgICAgICAgICAgICAgIC50byh7IHg6IDAsIHk6IDAgfSwgZHVyYXRpb24sIFBoYXNlci5FYXNpbmcuU2ludXNvaWRhbC5PdXQsXG4gICAgICAgICAgICAgICAgICAgIHRydWUsIGRlbGF5LCAtMSwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAub25Mb29wLmFkZCgocywgdCkgPT4gdGhpcy5fb25TcGFya2xpbmdTdGFyVXBkYXRlKHN0YXIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vblNwYXJrbGluZ1N0YXJVcGRhdGUoc3Rhcikge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLl9wYXJlbnQud29ybGQ7XG5cbiAgICAgICAgc3Rhci54ID0gd29ybGQucmFuZG9tWDtcbiAgICAgICAgc3Rhci55ID0gd29ybGQucmFuZG9tWTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXJmaWVsZDtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGVudGl0eS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmNsYXNzIEVudGl0eSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIHgsIHksIGtleSwgZnJhbWUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgeCwgeSwga2V5LCBmcmFtZSk7XG5cbiAgICAgICAgdGhpcy5mYWNpbmcgPSBQaGFzZXIuTEVGVDtcbiAgICB9XG5cbiAgICBzZXR1cChsZXZlbCkge1xuICAgICAgICBsZXZlbC5waHlzaWNzLmVuYWJsZSh0aGlzLCBQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgICB0aGlzLmFuY2hvci5zZXQoMC41LCAxKTtcbiAgICAgICAgdGhpcy5ib2R5LmZpeGVkUm90YXRpb24gPSB0cnVlO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbnMuY3VycmVudEFuaW0ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ib2R5LmVuYWJsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmN1cnJlbnRBbmltLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJvZHkuZW5hYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmbGlwKCkge1xuICAgICAgICB2YXIgZGlyID0gKHRoaXMuZmFjaW5nID09PSAxID8gLTIgOiAyKTtcbiAgICAgICAgdGhpcy5zY2FsZS54ID0gZGlyO1xuICAgIH1cblxuICAgIF9hZGRBbmltYXRpb25zKGFuaW1zLCBmcmFtZVJhdGUgPSA2MCwgbG9vcCA9IGZhbHNlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYW5pbXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBsZXQgYW5pbSA9IGFuaW1zW2ldO1xuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25zLmFkZChhbmltLm5hbWUsIGFuaW0uZnJhbWVzLCBmcmFtZVJhdGUsIGxvb3ApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFbnRpdHk7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBnYXRlLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcblxuY2xhc3MgR2F0ZSBleHRlbmRzIFBoYXNlci5TcHJpdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIHgsIHksIGJsb2NrVywgYmxvY2tILCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgeCwgeSwgZ2FtZS5jYWNoZS5nZXRCaXRtYXBEYXRhKENvbnN0LkZJTExFRF9SRUNUKSk7XG5cbiAgICAgICAgdGhpcy5hbmNob3Iuc2V0KDAuNSk7XG4gICAgICAgIHRoaXMud2lkdGggPSBDb25zdC5CTE9DS19TSVpFICogYmxvY2tXO1xuICAgICAgICB0aGlzLmhlaWdodCA9IENvbnN0LkJMT0NLX1NJWkUgKiBibG9ja0g7XG4gICAgICAgIHRoaXMudGludCA9IDB4MDAwMEZGO1xuXG4gICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMpXG4gICAgICAgICAgICAudG8oeyBhbHBoYTogMC4yNSB9LCA1MDAsIFBoYXNlci5FYXNpbmcuU2ludXNvaWRhbC5PdXQsXG4gICAgICAgICAgICAgICAgdHJ1ZSwgMCwgLTEsIHRydWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2F0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHBsYXllci5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBFbnRpdHkgZnJvbSAnY2xpZW50L2VudGl0aWVzL2VudGl0eSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5sZXQgUGxheWVyU3RhdGVzID0ge1xuICAgIElkbGU6IDAsXG4gICAgV2Fsa2luZzogMSxcbiAgICBKdW1waW5nOiAyLFxuICAgIEZhbGxpbmc6IDRcbn07XG5cbmNsYXNzIFBsYXllciBleHRlbmRzIEVudGl0eSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSkge1xuICAgICAgICBzdXBlcihnYW1lLCB4LCB5LCBDb25zdC5TUFJJVEVfU0hFRVQsIDApO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5GYWxsaW5nO1xuICAgICAgICB0aGlzLmp1bXBSZWxlYXNlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbW92aW5nID0gW107XG4gICAgICAgIHRoaXMuX2FkZEFuaW1hdGlvbnMoW3sgbmFtZTogJ3dhbGsnLCBmcmFtZXM6IFsxLCAyLCAzLCA0LCA1XSB9XSxcbiAgICAgICAgICAgIDIwLCB0cnVlKTtcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoMiwgMik7XG4gICAgfVxuXG4gICAgc2V0dXAobGV2ZWwpIHtcbiAgICAgICAgc3VwZXIuc2V0dXAobGV2ZWwpO1xuXG4gICAgICAgIHRoaXMuX3ZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xuICAgICAgICB0aGlzLl9hY2NlbGVyYXRpb24gPSB0aGlzLmJvZHkuYWNjZWxlcmF0aW9uO1xuICAgICAgICB0aGlzLmJvZHkuc2V0U2l6ZSg4LCA2KTtcbiAgICAgICAgdGhpcy5ib2R5Lm1heFZlbG9jaXR5LnggPSBDb25zdC5QTEFZRVJfTUFYX1ZFTDtcbiAgICAgICAgdGhpcy5ib2R5LmRyYWcuc2V0KENvbnN0LlBMQVlFUl9EUkFHLCAwKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUFuaW1hdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZ3JvdW5kZWQgPSB0aGlzLmJvZHkub25GbG9vcigpIHx8IHRoaXMuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc0N1cnJlbnRTdGF0ZShQbGF5ZXJTdGF0ZXMuRmFsbGluZykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ncm91bmRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5oaXRHcm91bmRTb3VuZC5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbW92aW5nW1BoYXNlci5MRUZUXSkge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSAtQ29uc3QuUExBWUVSX0FDQ0VMO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuV2Fsa2luZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9tb3ZpbmdbUGhhc2VyLlJJR0hUXSkge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSBDb25zdC5QTEFZRVJfQUNDRUw7XG4gICAgICAgICAgICBpZiAodGhpcy5fZ3JvdW5kZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5XYWxraW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuSWRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBlcmZvcm0gdmFyaWFibGUganVtcCBoZWlnaHQgY2hlY2tcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudFN0YXRlKFBsYXllclN0YXRlcy5KdW1waW5nKSAmJiB0aGlzLmp1bXBSZWxlYXNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlbG9jaXR5LnkgPCBDb25zdC5QTEFZRVJfSlVNUF9TUEVFRC80KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmVsb2NpdHkueSA9IENvbnN0LlBMQVlFUl9KVU1QX1NQRUVELzQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNDdXJyZW50U3RhdGUoUGxheWVyU3RhdGVzLkp1bXBpbmcpICYmXG4gICAgICAgICAgICB0aGlzLl92ZWxvY2l0eS55ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuRmFsbGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhcCBwbGF5ZXIgZmFsbCBzcGVlZFxuICAgICAgICB0aGlzLl92ZWxvY2l0eS55ID0gTWF0aC5taW4odGhpcy5fdmVsb2NpdHkueSxcbiAgICAgICAgICAgIENvbnN0LlBMQVlFUl9NQVhfRkFMTF9TUEVFRCk7XG4gICAgfVxuXG4gICAganVtcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkICYmICF0aGlzLl9pc0N1cnJlbnRTdGF0ZShQbGF5ZXJTdGF0ZXMuSnVtcGluZykgJiZcbiAgICAgICAgICAgIHRoaXMuanVtcFJlbGVhc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBSZWxlYXNlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBzZXQgdGhlIGFwcHJvcHJpYXRlIHN0YXRlXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5KdW1waW5nO1xuICAgICAgICAgICAgdGhpcy5fdmVsb2NpdHkueSA9IENvbnN0LlBMQVlFUl9KVU1QX1NQRUVEO1xuICAgICAgICAgICAgdGhpcy5nYW1lLmp1bXBTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlKGRpcmVjdGlvbiwgYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuX21vdmluZ1tkaXJlY3Rpb25dID0gYWN0aXZlO1xuICAgICAgICB0aGlzLmZhY2luZyA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICBfdXBkYXRlQW5pbWF0aW9ucygpIHtcbiAgICAgICAgdGhpcy5mbGlwKCk7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLmN1cnJlbnRTdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBQbGF5ZXJTdGF0ZXMuV2Fsa2luZzpcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheSgnd2FsaycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQbGF5ZXJTdGF0ZXMuSnVtcGluZzpcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMjY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBsYXllclN0YXRlcy5GYWxsaW5nOlxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAyNztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUGxheWVyU3RhdGVzLklkbGU6IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pc0N1cnJlbnRTdGF0ZShzdGF0ZSkge1xuICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFN0YXRlID09PSBzdGF0ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBnYW1lLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxudmFyIHdvcmxkcyA9IHJlcXVpcmUoJ2NsaWVudC9sZXZlbHMvd29ybGRzJyk7XG5cbmltcG9ydCBCb290U3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9ib290JztcbmltcG9ydCBQcmVsb2FkU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9wcmVsb2FkJztcbmltcG9ydCBTcGxhc2hTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3NwbGFzaCc7XG5pbXBvcnQgTWVudVN0YXRlIGZyb20gJ2NsaWVudC9zdGF0ZXMvbWVudSc7XG5pbXBvcnQgTGVhZGVyYm9hcmRTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL2xlYWRlcmJvYXJkJztcbmltcG9ydCBQbGF5U3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9wbGF5JztcblxuY2xhc3MgR2FtZSBleHRlbmRzIFBoYXNlci5HYW1lIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoNDAwLCAyNDAsIFBoYXNlci5BVVRPLCAnZ2FtZScsIG51bGwsIGZhbHNlLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnN0YXRlLmFkZCgnYm9vdCcsIEJvb3RTdGF0ZSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuc3RhdGUuYWRkKCdwcmVsb2FkJywgUHJlbG9hZFN0YXRlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdGUuYWRkKCdzcGxhc2gnLCBTcGxhc2hTdGF0ZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZCgnbWFpbm1lbnUnLCBNZW51U3RhdGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5hZGQoJ2xlYWRlcmJvYXJkJywgTGVhZGVyYm9hcmRTdGF0ZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZCgncGxheScsIFBsYXlTdGF0ZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9hZGRXb3JsZHMod29ybGRzKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBfYWRkV29ybGRzKHdvcmxkcykge1xuICAgICAgICB2YXIgaSA9IDE7XG4gICAgICAgIF8uZWFjaCh3b3JsZHMsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9hZGRMZXZlbCh2LCBpKyspO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfYWRkTGV2ZWwobGV2ZWxzLCB3b3JsZElkeCkge1xuICAgICAgICB2YXIgbGV2ZWxJZHggPSAxO1xuICAgICAgICBfLmVhY2gobGV2ZWxzLCAodiwgaykgPT4ge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hZGQoYGxldmVsXyR7d29ybGRJZHh9XyR7bGV2ZWxJZHh9YCwgdiwgZmFsc2UpO1xuICAgICAgICAgICAgbGV2ZWxJZHgrKztcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogZGlhbG9nLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IFRleHRMYWJlbCBmcm9tICdjbGllbnQvZ3VpL3RleHRfbGFiZWwnO1xuaW1wb3J0IFRleHRCdXR0b24gZnJvbSAnY2xpZW50L2d1aS90ZXh0X2J1dHRvbic7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBEaWFsb2cgZXh0ZW5kcyBQaGFzZXIuR3JvdXAge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIHBhcmVudCwgdGl0bGUsIG9uQ2xvc2UgPSBudWxsLCBhdXRvU2hvdyA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKGdhbWUpO1xuXG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5fdGl0bGUgPSB0aXRsZTtcbiAgICAgICAgdGhpcy5fb25DbG9zZSA9IG9uQ2xvc2U7XG4gICAgICAgIHRoaXMuX2F1dG9TaG93ID0gYXV0b1Nob3c7XG5cbiAgICAgICAgdGhpcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzZXR1cChib2R5VGV4dEl0ZW1zLCBjbG9zZSkge1xuICAgICAgICBib2R5VGV4dEl0ZW1zLnVuc2hpZnQoeyB0eXBlOiAnbGFiZWwnLCBwb3M6ICdjZW50ZXInLFxuICAgICAgICAgICAgdGV4dDogdGhpcy5fdGl0bGUsIG5ld0xpbmU6IHRydWUgfSk7XG5cbiAgICAgICAgaWYgKGNsb3NlKSB7XG4gICAgICAgICAgICBib2R5VGV4dEl0ZW1zLnB1c2goeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICB0ZXh0OiAnQ2xvc2UnLCBuZXdMaW5lOiB0cnVlLCBmbjogdGhpcy5oaWRlLCBjdHg6IHRoaXMgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ib2R5VGV4dEl0ZW1zID0gYm9keVRleHRJdGVtcztcbiAgICAgICAgdGhpcy5faW5pdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9hdXRvU2hvdykge1xuICAgICAgICAgICAgdGhpcy5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl90ZXh0SXRlbXNHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3N0YXJ0T3BlblR3ZWVuKCk7XG4gICAgfVxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5fdGV4dEl0ZW1zR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9zdGFydENsb3NlVHdlZW4oKTtcbiAgICB9XG5cbiAgICBfaW5pdCgpIHtcbiAgICAgICAgLy8gc2V0dXAgdGhlIGRpYWxvZyBiYWNrZ3JvdW5kIHNwcml0ZVxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fZGlhbG9nU3ByaXRlID0gdGhpcy5jcmVhdGUodGhpcy5nYW1lLndpZHRoLzIsXG4gICAgICAgICAgICB0aGlzLmdhbWUuaGVpZ2h0KjAuNzUsIHRoaXMuZ2FtZS5jYWNoZS5nZXRCaXRtYXBEYXRhKENvbnN0LlJFQ1QpKTtcbiAgICAgICAgdGhpcy5fZGlhbG9nU3ByaXRlLmFuY2hvci5zZXQoMC41KTtcbiAgICAgICAgdGhpcy5fZGlhbG9nU3ByaXRlLmFscGhhID0gMC44O1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUud2lkdGggPSB0aGlzLmdhbWUud2lkdGggKyA2NDtcbiAgICAgICAgdGhpcy5fZGlhbG9nU3ByaXRlLmhlaWdodCA9IF8uc2l6ZSh0aGlzLl9ib2R5VGV4dEl0ZW1zKSAqIDEyO1xuXG4gICAgICAgIC8vIHNldHVwIGFsbCB0aGUgdGV4dCBpdGVtc1xuICAgICAgICB2YXIgY2VudGVyWCA9IHRoaXMuX2RpYWxvZ1Nwcml0ZS54O1xuICAgICAgICB2YXIgY2VudGVyWSA9IHRoaXMuX2RpYWxvZ1Nwcml0ZS55O1xuICAgICAgICB0aGlzLl90ZXh0SXRlbXNHcm91cCA9IG5ldyBQaGFzZXIuR3JvdXAodGhpcy5nYW1lLCB0aGlzKTtcbiAgICAgICAgdGhpcy5faW5pdEJvZHlUZXh0KGNlbnRlclgsIGNlbnRlclkpO1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUuaGVpZ2h0ID0gMDtcbiAgICB9XG5cbiAgICBfaW5pdEJvZHlUZXh0KGNlbnRlclgsIGNlbnRlclkpIHtcbiAgICAgICAgdmFyIHNpemUgPSBfLnNpemUodGhpcy5fYm9keVRleHRJdGVtcyk7XG4gICAgICAgIHZhciB5UG9zID0gKHNpemUgPiAxID8gY2VudGVyWSArIHRoaXMuX2RpYWxvZ1Nwcml0ZS5oZWlnaHQvMiAtXG4gICAgICAgICAgICAxMiAtIHNpemUgKiA4IDogY2VudGVyWSk7XG5cbiAgICAgICAgXy5lYWNoKHRoaXMuX2JvZHlUZXh0SXRlbXMsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICBsZXQgeFBvcyA9IGNlbnRlclg7XG5cbiAgICAgICAgICAgIGlmICh2LnBvcyA9PT0gJ2xlZnQnKSB7XG4gICAgICAgICAgICAgICAgeFBvcyA9IGNlbnRlclggLSB0aGlzLl9kaWFsb2dTcHJpdGUud2lkdGgvNjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodi5wb3MgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICB4UG9zID0gY2VudGVyWCArIHRoaXMuX2RpYWxvZ1Nwcml0ZS53aWR0aC82O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgaXRlbSA9ICh2LnR5cGUgPT09ICdsYWJlbCcgP1xuICAgICAgICAgICAgICAgIG5ldyBUZXh0TGFiZWwodGhpcy5nYW1lLCB4UG9zLCB5UG9zLCB2LnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHRJdGVtc0dyb3VwKSA6XG4gICAgICAgICAgICAgICAgbmV3IFRleHRCdXR0b24odGhpcy5nYW1lLCB4UG9zLCB5UG9zLCB2LnRleHQsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RleHRJdGVtc0dyb3VwLCBmYWxzZSwgeyBmbjogdi5mbiwgY3R4OiB2LmN0eCB9KSk7XG5cbiAgICAgICAgICAgIGlmICh2Lm5ld0xpbmUpIHtcbiAgICAgICAgICAgICAgICB5UG9zICs9IGl0ZW0uaGVpZ2h0KjI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9zdGFydE9wZW5Ud2VlbigpIHtcbiAgICAgICAgdmFyIGggPSB0aGlzLmdhbWUuaGVpZ2h0IC8gMztcbiAgICAgICAgdmFyIHR3ZWVuID0gdGhpcy5fY3JlYXRlVHdlZW4oaCk7XG5cbiAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZiA9PiB0aGlzLl90ZXh0SXRlbXNHcm91cC52aXNpYmxlID0gdHJ1ZSk7XG4gICAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgX3N0YXJ0Q2xvc2VUd2VlbigpIHtcbiAgICAgICAgdmFyIHR3ZWVuID0gdGhpcy5fY3JlYXRlVHdlZW4oMCk7XG5cbiAgICAgICAgdHdlZW4ub25Db21wbGV0ZS5hZGQoZiA9PiB7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy8gaWYgdXNlciBkZWZpbmVkIGEgb25jbG9zZSBjYWxsYmFjaywgaW52b2tlIGl0XG4gICAgICAgICAgICBpZiAodGhpcy5fb25DbG9zZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uQ2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHR3ZWVuLnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZVR3ZWVuKGhlaWdodCkge1xuICAgICAgICB2YXIgdHdlZW4gPSB0aGlzLl9wYXJlbnQuYWRkLnR3ZWVuKHRoaXMuX2RpYWxvZ1Nwcml0ZSlcbiAgICAgICAgICAgIC50byh7IGhlaWdodDogaGVpZ2h0IH0sIDUwMCxcbiAgICAgICAgICAgICAgICBQaGFzZXIuRWFzaW5nLlF1aW50aWMuT3V0KTtcblxuICAgICAgICByZXR1cm4gdHdlZW47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEaWFsb2c7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBvcHRpb25zX2RpYWxvZy5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBEaWFsb2cgZnJvbSAnY2xpZW50L2d1aS9kaWFsb2cnO1xuXG5jbGFzcyBNYWluTWVudURpYWxvZyBleHRlbmRzIERpYWxvZyB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgcGFyZW50LCBvbkNsb3NlLCBhdXRvU3RhcnQpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgcGFyZW50LCAnU3Rhcmd1YXJkJywgb25DbG9zZSwgYXV0b1N0YXJ0KTtcblxuICAgICAgICB0aGlzLnNldHVwKCk7XG4gICAgfVxuXG4gICAgc2V0dXAoKSB7XG4gICAgICAgIHN1cGVyLnNldHVwKFtcbiAgICAgICAgICAgIHsgdHlwZTogJ2J1dHRvbicsIHBvczogJ2NlbnRlcicsIHRleHQ6ICdTdGFydCcsXG4gICAgICAgICAgICAgICAgbmV3TGluZTogdHJ1ZSwgZm46IHRoaXMuX29uU3RhcnRTZWxlY3RlZCwgY3R4OiB0aGlzIH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdidXR0b24nLCBwb3M6ICdjZW50ZXInLCB0ZXh0OiAnTGVhZGVyYm9hcmQnLFxuICAgICAgICAgICAgICAgIG5ld0xpbmU6IHRydWUsIGZuOiB0aGlzLl9vbkxlYWRlcmJvYXJkU2VsZWN0ZWQsIGN0eDogdGhpcyB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAnY2VudGVyJywgdGV4dDogJ09wdGlvbnMnLFxuICAgICAgICAgICAgICAgIG5ld0xpbmU6IHRydWUsIGZuOiB0aGlzLl9vbk9wdGlvbnNTZWxlY3RlZCwgY3R4OiB0aGlzIH1cbiAgICAgICAgXSk7XG4gICAgfVxuXG4gICAgX29uU3RhcnRTZWxlY3RlZCgpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50LnN0YXRlLnN0YXJ0KCdwbGF5Jyk7XG4gICAgfVxuXG4gICAgX29uTGVhZGVyYm9hcmRTZWxlY3RlZCgpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50LnN0YXRlLnN0YXJ0KCdsZWFkZXJib2FyZCcpO1xuICAgIH1cblxuICAgIF9vbk9wdGlvbnNTZWxlY3RlZCgpIHtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNYWluTWVudURpYWxvZztcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IG9wdGlvbnNfZGlhbG9nLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IERpYWxvZyBmcm9tICdjbGllbnQvZ3VpL2RpYWxvZyc7XG5cbmNsYXNzIE9wdGlvbnNEaWFsb2cgZXh0ZW5kcyBEaWFsb2cge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIHBhcmVudCwgb25DbG9zZSwgcmV0dXJuVG9NZW51ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgcGFyZW50LCAnT3B0aW9ucycsIG9uQ2xvc2UsIGZhbHNlKTtcblxuICAgICAgICB0aGlzLnNldHVwKHJldHVyblRvTWVudSk7XG4gICAgfVxuXG4gICAgc2V0dXAocmV0dXJuVG9NZW51KSB7XG4gICAgICAgIHZhciBpdGVtcyA9IFtcbiAgICAgICAgICAgIHsgdHlwZTogJ2xhYmVsJywgcG9zOiAnbGVmdCcsIHRleHQ6ICdmdWxsc2NyZWVuJywgbmV3TGluZTogZmFsc2UgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ2J1dHRvbicsIHBvczogJ3JpZ2h0JywgdGV4dDogJ29mZicsXG4gICAgICAgICAgICAgICAgZm46IHRoaXMuX29uRnVsbHNjcmVlblRvZ2dsZSwgY3R4OiB0aGlzLCBuZXdMaW5lOiB0cnVlIH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdsYWJlbCcsIHBvczogJ2xlZnQnLCB0ZXh0OiAnYXVkaW8nLCBuZXdMaW5lOiBmYWxzZSB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAncmlnaHQnLCB0ZXh0OiAnb24nLFxuICAgICAgICAgICAgICAgIGZuOiB0aGlzLl9vbkF1ZGlvVG9nZ2xlLCBjdHg6IHRoaXMsIG5ld0xpbmU6IHRydWUgfSxcbiAgICAgICAgXTtcblxuICAgICAgICBpZiAocmV0dXJuVG9NZW51KSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHsgdHlwZTogJ2J1dHRvbicsIHBvczogJ2NlbnRlcicsIHRleHQ6ICdNYWluTWVudScsXG4gICAgICAgICAgICAgICAgZm46IHRoaXMuX29uTWFpbk1lbnUsIGN0eDogdGhpcywgbmV3TGluZTogdHJ1ZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLnNldHVwKGl0ZW1zLCB0cnVlKTtcbiAgICB9XG5cbiAgICBfb25GdWxsc2NyZWVuVG9nZ2xlKGJ1dHRvbikge1xuICAgICAgICBpZiAodGhpcy5fcGFyZW50LnNjYWxlLmlzRnVsbFNjcmVlbikge1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LnNjYWxlLnN0b3BGdWxsU2NyZWVuKCk7XG4gICAgICAgICAgICBidXR0b24uc2V0VGV4dCgnb2ZmJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuc2NhbGUuc3RhcnRGdWxsU2NyZWVuKGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5zY2FsZS5zZXRTY3JlZW5TaXplKCk7XG4gICAgICAgICAgICBidXR0b24uc2V0VGV4dCgnb24nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbkF1ZGlvVG9nZ2xlKGJ1dHRvbikge1xuICAgICAgICB2YXIgaXNNdXRlZCA9IHRoaXMuX3BhcmVudC5zb3VuZC5tdXRlO1xuICAgICAgICB2YXIgc3RhdHVzID0gKGlzTXV0ZWQgPyAnb24nIDogJ29mZicpO1xuXG4gICAgICAgIHRoaXMuX3BhcmVudC5zb3VuZC5tdXRlID0gIXRoaXMuX3BhcmVudC5zb3VuZC5tdXRlO1xuICAgICAgICBidXR0b24uc2V0VGV4dChzdGF0dXMpO1xuICAgIH1cblxuICAgIF9vbk1haW5NZW51KCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQucmVzdW1lKCk7XG4gICAgICAgIHRoaXMuX3BhcmVudC5zdGF0ZS5zdGFydCgnbWFpbm1lbnUnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9wdGlvbnNEaWFsb2c7XG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHRleHRfYnV0dG9uLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcbmltcG9ydCBUZXh0TGFiZWwgZnJvbSAnY2xpZW50L2d1aS90ZXh0X2xhYmVsJztcblxuY2xhc3MgVGV4dEJ1dHRvbiBleHRlbmRzIFRleHRMYWJlbCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSwgdGV4dCwgcGFyZW50LCBmaXhlZFRvQ2FtLCBjYWxsYmFja09iaixcbiAgICAgICAgY2VudGVyVGV4dCwgYWxpZ24sIHNpemUsIG92ZXJUaW50ID0gMHhGRjAwMDAsIG91dFRpbnQgPSAweEZGRkZGRikge1xuICAgICAgICBzdXBlcihnYW1lLCB4LCB5LCB0ZXh0LCBwYXJlbnQsIGZpeGVkVG9DYW0sIGNlbnRlclRleHQsIGFsaWduLCBzaXplKTtcblxuICAgICAgICAvLyBlbmFibGUgaW5wdXQgYW5kIHNldHVwIGNhbGxiYWNrIGV2ZW50c1xuICAgICAgICB0aGlzLmlucHV0RW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZXZlbnRzLm9uSW5wdXRPdmVyLmFkZChmID0+IHRoaXMudGludCA9IG92ZXJUaW50KTtcbiAgICAgICAgdGhpcy5ldmVudHMub25JbnB1dE91dC5hZGQoZiA9PiB0aGlzLnRpbnQgPSBvdXRUaW50KTtcbiAgICAgICAgdGhpcy5ldmVudHMub25JbnB1dERvd24uYWRkKGNhbGxiYWNrT2JqLmZuLCBjYWxsYmFja09iai5jdHgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dEJ1dHRvbjtcblxuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogdGV4dF9sYWJlbC5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIFRleHRMYWJlbCBleHRlbmRzIFBoYXNlci5CaXRtYXBUZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lLCB4LCB5LCB0ZXh0LCBwYXJlbnQgPSBudWxsLCBmaXhlZFRvQ2FtID0gZmFsc2UsXG4gICAgICAgIGNlbnRlclRleHQgPSB0cnVlLCBhbGlnbiA9ICdjZW50ZXInLCBzaXplID0gOCkge1xuICAgICAgICBzdXBlcihnYW1lLCB4LCB5LCBDb25zdC5HQU1FX0ZPTlQsIHRleHQsIHNpemUpO1xuXG4gICAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgICAgIHBhcmVudC5hZGQodGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFsaWduID0gYWxpZ247XG4gICAgICAgIHRoaXMuZml4ZWRUb0NhbWVyYSA9IGZpeGVkVG9DYW07XG5cbiAgICAgICAgaWYgKGNlbnRlclRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yLnggPSBNYXRoLnJvdW5kKHRoaXMud2lkdGggKiAwLjUpIC8gdGhpcy53aWR0aDtcbiAgICAgICAgICAgIHRoaXMuYW5jaG9yLnkgPSBNYXRoLnJvdW5kKHRoaXMuaGVpZ2h0ICogMC41KSAvIHRoaXMuaGVpZ2h0O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZXh0TGFiZWw7XG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGNsaWVudF9nYW1lX21hbmFnZXIuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5yZXF1aXJlKCdiYWJlbC9wb2x5ZmlsbCcpO1xuXG5pbXBvcnQgR2FtZSBmcm9tICdjbGllbnQvZ2FtZSc7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpLnN0YXJ0KCk7XG59O1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogaW5wdXRfaGFuZGxlci5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmNsYXNzIElucHV0SGFuZGxlciB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX2lucHV0TWFwID0gIHt9O1xuICAgICAgICB0aGlzLl9saXN0ZW5lck1hcCA9IHt9O1xuICAgIH1cblxuICAgIHNldElucHV0TWFwKGlucHV0TWFwID0ge30pIHtcbiAgICAgICAgdGhpcy5faW5wdXRNYXAgPSBpbnB1dE1hcDtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihrZXksIGN0eCA9IG51bGwsIGhhbmRsZXIgPSBudWxsLCBvbkRvd24gPSBudWxsLCBvblVwID0gbnVsbCkge1xuICAgICAgICBpZiAoXy5oYXModGhpcy5faW5wdXRNYXAsIGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVyTWFwW2tleV0gPSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcjogaGFuZGxlcixcbiAgICAgICAgICAgICAgICBjdHg6IGN0eCxcbiAgICAgICAgICAgICAgICBvbkRvd246IG9uRG93bixcbiAgICAgICAgICAgICAgICBvblVwOiBvblVwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYEVycm9yOiAke2tleX0gbm90IGZvdW5kIGluIGlucHV0IG1hcGApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldExpc3RlbmVyQnlJbnB1dENvZGUoY29kZSkge1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSBudWxsO1xuXG4gICAgICAgIC8vIGdldCB0aGUgaW5wdXRNYXAga2V5IHZpYSBhIHBoYXNlciBpbnB1dCBjb2RlIChpLmUgUGhhc2VyLktleWJvYXJkLlVQKVxuICAgICAgICBfLmVhY2godGhpcy5faW5wdXRNYXAsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gY29kZSkge1xuICAgICAgICAgICAgICAgIGtleSA9IGs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHVzZSB0aGlzIGtleSB0byByZXRyaWV2ZSB0aGUgbGlzdGVuZXJcbiAgICAgICAgaWYgKF8uaGFzKHRoaXMuX2xpc3RlbmVyTWFwLCBrZXkpKSB7XG4gICAgICAgICAgICBsaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVyTWFwW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnB1dEhhbmRsZXI7XG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGtleWJvYXJkX2hhbmRsZXIuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgSW5wdXRIYW5kbGVyIGZyb20gJ2NsaWVudC9pbnB1dC9pbnB1dF9oYW5kbGVyJztcblxuY2xhc3MgS2V5Ym9hcmRIYW5kbGVyIGV4dGVuZHMgSW5wdXRIYW5kbGVyIHtcbiAgICBjcmVhdGUoaW5wdXQpIHtcbiAgICAgICAgaW5wdXQua2V5Ym9hcmQuYWRkQ2FsbGJhY2tzKHRoaXMsIHRoaXMuX29uS2V5RG93biwgdGhpcy5fb25LZXlVcCk7XG4gICAgfVxuXG4gICAgc2V0SW5wdXRNYXAoaW5wdXRNYXApIHtcbiAgICAgICAgc3VwZXIuc2V0SW5wdXRNYXAoaW5wdXRNYXApO1xuXG4gICAgICAgIC8vIGV4dGVuZCB0aGUgaW5wdXRNYXAgd2l0aCBzb21lIGRlZmF1bHQga2V5c1xuICAgICAgICAvLyB0aGF0IHdpbGwgZ2VuZXJhbGx5IGJlIHVzZWQgaW4gYWxsIHN0YXRlc1xuICAgICAgICBfLmV4dGVuZCh0aGlzLl9pbnB1dE1hcCwge1xuICAgICAgICAgICAgdXA6IFBoYXNlci5LZXlib2FyZC5VUCxcbiAgICAgICAgICAgIGRvd246IFBoYXNlci5LZXlib2FyZC5ET1dOLFxuICAgICAgICAgICAgbGVmdDogUGhhc2VyLktleWJvYXJkLkxFRlQsXG4gICAgICAgICAgICByaWdodDogUGhhc2VyLktleWJvYXJkLlJJR0hUXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9vbktleURvd24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9nZXRMaXN0ZW5lckJ5SW5wdXRDb2RlKGtleUNvZGUpO1xuXG4gICAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uRG93bikge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLm9uRG93bi5jYWxsKGxpc3RlbmVyLmN0eCwga2V5Q29kZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lci5oYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuaGFuZGxlci5jYWxsKGxpc3RlbmVyLmN0eCwga2V5Q29kZSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25LZXlVcChldmVudCkge1xuICAgICAgICB2YXIga2V5Q29kZSA9IGV2ZW50LmtleUNvZGU7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IHRoaXMuX2dldExpc3RlbmVyQnlJbnB1dENvZGUoa2V5Q29kZSk7XG5cbiAgICAgICAgaWYgKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXIub25VcCkge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLm9uVXAuY2FsbChsaXN0ZW5lci5jdHgsIGtleUNvZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGlzdGVuZXIuaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmhhbmRsZXIuY2FsbChsaXN0ZW5lci5jdHgsIGtleUNvZGUsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgS2V5Ym9hcmRIYW5kbGVyO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBsZXZlbC5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3N0YXRlJztcbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5pbXBvcnQgTGV2ZWxNYW5hZ2VyIGZyb20gJ2NsaWVudC9sZXZlbHMvbGV2ZWxfbWFuYWdlcic7XG5pbXBvcnQgT3B0aW9uc0RpYWxvZyBmcm9tICdjbGllbnQvZ3VpL29wdGlvbnNfZGlhbG9nJztcblxuY2xhc3MgTGV2ZWwgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgZ3Jhdml0eSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcblxuICAgICAgICB0aGlzLmdyYXZpdHkgPSBncmF2aXR5O1xuICAgICAgICB0aGlzLm1hcEtleSA9ICcnO1xuICAgICAgICB0aGlzLmxldmVsTWFuYWdlciA9IG51bGw7XG4gICAgICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnBsYXllciA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJlbG9hZCgpIHtcbiAgICAgICAgc3VwZXIucHJlbG9hZCgpO1xuXG4gICAgICAgIC8vIFRPRE86IGdldCB0aWxlbWFwIGZyb20gY2FjaGUsIHRoaXMgc2hvdWxkIGJlIGxvYWRlZCBpbiB0aGVcbiAgICAgICAgLy8gcHJlbG9hZCBzdGF0ZVxuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgc3VwZXIuY3JlYXRlKCk7XG5cbiAgICAgICAgdGhpcy50aW1lciA9IG5ldyBQaGFzZXIuVGltZXIodGhpcy5nYW1lLCBmYWxzZSk7XG4gICAgICAgIHRoaXMudGltZS5hZGQodGhpcy50aW1lcik7XG4gICAgICAgIHRoaXMuX2luaXRJbnB1dEhhbmRsZXIoKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSB0aGlzLmdhbWUucGxheWVyO1xuICAgICAgICB0aGlzLmxldmVsTWFuYWdlciA9IG5ldyBMZXZlbE1hbmFnZXIodGhpcyk7XG5cbiAgICAgICAgdGhpcy5sZXZlbE1hbmFnZXIuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMuX29wdGlvbnNEaWFsb2cgPSBuZXcgT3B0aW9uc0RpYWxvZyh0aGlzLmdhbWUsIHRoaXMsXG4gICAgICAgICAgICBmID0+IHRoaXMucmVzdW1lKCksIHRydWUpO1xuICAgICAgICB0aGlzLmdhbWUuc3RhcnRTb3VuZC5wbGF5KCk7XG4gICAgfVxuXG4gICAgc2h1dGRvd24oKSB7XG4gICAgICAgIHN1cGVyLnNodXRkb3duKCk7XG4gICAgICAgIHRoaXMubGV2ZWxNYW5hZ2VyLnNodXRkb3duKCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLmxldmVsTWFuYWdlci51cGRhdGUoKTtcbiAgICB9XG5cbiAgICAvL3JlbmRlcigpIHtcbiAgICAgICAgLy90aGlzLmdhbWUuZGVidWcuYm9keSh0aGlzLnBsYXllciwgJyNGRjAwMDAnLCBmYWxzZSk7XG4gICAgLy99XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmdhbWUuaXNQYXVzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnNEaWFsb2cuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5sZXZlbE1hbmFnZXIucGF1c2UoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5pc1BhdXNlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXN1bWUoKSB7XG4gICAgICAgIGlmICh0aGlzLmdhbWUuaXNQYXVzZWQpIHtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxNYW5hZ2VyLnJlc3VtZSgpO1xuICAgICAgICAgICAgdGhpcy5nYW1lLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdElucHV0SGFuZGxlcigpIHtcbiAgICAgICAgdGhpcy5pbnB1dEhhbmRsZXIuc2V0SW5wdXRNYXAoe1xuICAgICAgICAgICAganVtcDogUGhhc2VyLktleWJvYXJkLlosXG4gICAgICAgICAgICBzaG9vdDogUGhhc2VyLktleWJvYXJkLlgsXG4gICAgICAgICAgICBwYXVzZTogUGhhc2VyLktleWJvYXJkLkVOVEVSXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW5wdXRIYW5kbGVyLmFkZExpc3RlbmVyKCdsZWZ0JywgdGhpcywgdGhpcy5fb25Nb3ZlKTtcbiAgICAgICAgdGhpcy5pbnB1dEhhbmRsZXIuYWRkTGlzdGVuZXIoJ3JpZ2h0JywgdGhpcywgdGhpcy5fb25Nb3ZlKTtcbiAgICAgICAgdGhpcy5pbnB1dEhhbmRsZXIuYWRkTGlzdGVuZXIoJ2p1bXAnLCB0aGlzLCBudWxsLCB0aGlzLl9vbkp1bXAsXG4gICAgICAgICAgICB0aGlzLl9vbkp1bXBSZWxlYXNlZCk7XG4gICAgICAgIHRoaXMuaW5wdXRIYW5kbGVyLmFkZExpc3RlbmVyKCdwYXVzZScsIHRoaXMsIHRoaXMuX29uUGF1c2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlucHV0IGxpc3RlbmVyc1xuICAgICAqL1xuICAgIF9vbk1vdmUoa2V5Y29kZSwgYWN0aXZlKSB7XG4gICAgICAgIHZhciBkaXIgPSAoa2V5Y29kZSA9PT0gUGhhc2VyLktleWJvYXJkLkxFRlQgPyBQaGFzZXIuTEVGVCA6XG4gICAgICAgICAgICBQaGFzZXIuUklHSFQpO1xuICAgICAgICB0aGlzLnBsYXllci5tb3ZlKGRpciwgYWN0aXZlKTtcbiAgICB9XG5cbiAgICBfb25KdW1wKGtleWNvZGUpIHtcbiAgICAgICAgdGhpcy5wbGF5ZXIuanVtcCgpO1xuICAgIH1cblxuICAgIF9vbkp1bXBSZWxlYXNlZChrZXljb2RlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmp1bXBSZWxlYXNlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgX29uUGF1c2Uoa2V5Y29kZSkge1xuICAgICAgICB0aGlzLnBhdXNlKCk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZXZlbDtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGxldmVsX21hbmFnZXIuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgR2F0ZSBmcm9tICdjbGllbnQvZW50aXRpZXMvZ2F0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBMZXZlbE1hbmFnZXIge1xuICAgIGNvbnN0cnVjdG9yKGxldmVsKSB7XG4gICAgICAgIHRoaXMubWFwID0gbnVsbDtcblxuICAgICAgICB0aGlzLl9wbGF5ZXIgPSBsZXZlbC5wbGF5ZXI7XG4gICAgICAgIHRoaXMuX2xldmVsID0gbGV2ZWw7XG4gICAgICAgIHRoaXMuX2dhbWUgPSBsZXZlbC5nYW1lO1xuICAgICAgICB0aGlzLl9waHlzaWNzID0gbGV2ZWwucGh5c2ljcztcbiAgICAgICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbGV2ZWwuaW5wdXRIYW5kbGVyO1xuICAgICAgICB0aGlzLl90aW1lciA9IGxldmVsLnRpbWVyO1xuICAgICAgICB0aGlzLl9tYWluR3JvdXAgPSBudWxsO1xuICAgICAgICB0aGlzLl9lbnRpdGllc0dyb3VwID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY29sbGlzaW9uTGF5ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLl9zdGF0aWNMYXllciA9IG51bGw7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICB0aGlzLl9tYWluR3JvdXAgPSB0aGlzLl9sZXZlbC5hZGQuZ3JvdXAoKTtcbiAgICAgICAgdGhpcy5fZW50aXRpZXNHcm91cCA9IHRoaXMuX2xldmVsLmFkZC5ncm91cCgpO1xuICAgICAgICB0aGlzLl9tYWluR3JvdXAuYWRkKHRoaXMuX2VudGl0aWVzR3JvdXApO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZVdvcmxkKCk7XG4gICAgICAgIHRoaXMuX3BsYXllci5zZXR1cCh0aGlzLl9sZXZlbCk7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAuYWRkKHRoaXMuX3BsYXllcik7XG5cbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBlbnRpdGllcyBncm91cCBpcyByZW5kZXJlZCBvbiB0b3BcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwLmJyaW5nVG9Ub3AodGhpcy5fZW50aXRpZXNHcm91cCk7XG5cbiAgICAgICAgdGhpcy5fbGV2ZWwuY2FtZXJhLmNoZWNrQm91bmRzKCk7XG4gICAgICAgIHRoaXMuX2xldmVsLmNhbWVyYS5mb2xsb3codGhpcy5fcGxheWVyLCBQaGFzZXIuRk9MTE9XX1BMQVRGT1JNRVIpO1xuICAgICAgICB0aGlzLl9waHlzaWNzLmFyY2FkZS5ncmF2aXR5LnkgPSB0aGlzLl9sZXZlbC5ncmF2aXR5O1xuICAgIH1cblxuICAgIHNodXRkb3duKCkge1xuICAgICAgICB0aGlzLl9sZXZlbC5jYW1lcmEucmVzZXQoKTtcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUNvbGxpc2lvbigpO1xuICAgICAgICB0aGlzLl91cGRhdGVFbnRpdGllcygpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2dhbWUuaW5NdWx0aXBsYXllck1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWUuaW5wdXQua2V5Ym9hcmQuZW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5fZW50aXRpZXNHcm91cC5jYWxsQWxsKCdwYXVzZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdW1lKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2dhbWUuaW5NdWx0aXBsYXllck1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2dhbWUuaW5wdXQua2V5Ym9hcmQuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLl9lbnRpdGllc0dyb3VwLmNhbGxBbGwoJ3Jlc3VtZScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZVdvcmxkKCkge1xuICAgICAgICB0aGlzLl9jcmVhdGVNYXAoKTtcbiAgICAgICAgdGhpcy5fY3JlYXRlTWFwT2JqZWN0cygpO1xuICAgIH1cblxuICAgIF9jcmVhdGVNYXAoKSB7XG4gICAgICAgIHRoaXMubWFwID0gdGhpcy5fbGV2ZWwuYWRkLnRpbGVtYXAodGhpcy5fbGV2ZWwubWFwS2V5KTtcbiAgICAgICAgdGhpcy5tYXAuYWRkVGlsZXNldEltYWdlKENvbnN0LlRJTEVTRVRfSU1HLCBDb25zdC5USUxFU0VUX0lNRyk7XG5cbiAgICAgICAgdGhpcy5fY29sbGlzaW9uTGF5ZXIgPSB0aGlzLm1hcC5jcmVhdGVMYXllcignY29sbGlzaW9uX2xheWVyJyk7XG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbkxheWVyLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3RhdGljTGF5ZXIgPSB0aGlzLm1hcC5jcmVhdGVMYXllcignc3RhdGljX2xheWVyJyk7XG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbkxheWVyLnJlc2l6ZVdvcmxkKCk7XG5cbiAgICAgICAgdGhpcy5tYXAuc2V0Q29sbGlzaW9uKDksIHRydWUsIHRoaXMuX2NvbGxpc2lvbkxheWVyKTtcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwLmFkZCh0aGlzLl9zdGF0aWNMYXllcik7XG4gICAgfVxuXG4gICAgX2NyZWF0ZU1hcE9iamVjdHMoKSB7XG4gICAgICAgIHZhciBvYmpMYXllciA9IHRoaXMubWFwLm9iamVjdHMub2JqZWN0X2xheWVyO1xuXG4gICAgICAgIC8vIHNldCBwbGF5ZXIgc3Bhd24gcG9pbnRcbiAgICAgICAgZm9yICh2YXIgb2JqIG9mIG9iakxheWVyKSB7XG4gICAgICAgICAgICBsZXQgcHJvcHMgPSBvYmoucHJvcGVydGllcztcblxuICAgICAgICAgICAgc3dpdGNoKG9iai5uYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3Bhd24nOlxuICAgICAgICAgICAgICAgICAgICBsZXQgZ2F0ZSA9IG5ldyBHYXRlKHRoaXMuX2dhbWUsIG9iai54LCBvYmoueSwgcHJvcHMud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbnRpdGllc0dyb3VwLmFkZChnYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGxheWVyLnBvc2l0aW9uLnNldChvYmoueCwgb2JqLnkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdleGl0JzpcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4aXQgPSBuZXcgR2F0ZSh0aGlzLl9nYW1lLCBvYmoueCwgb2JqLnksIHByb3BzLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZW50aXRpZXNHcm91cC5hZGQoZXhpdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZUNvbGxpc2lvbigpIHtcbiAgICAgICAgdGhpcy5fcGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLl9wbGF5ZXIsIHRoaXMuX2NvbGxpc2lvbkxheWVyKTtcbiAgICB9XG5cbiAgICBfdXBkYXRlRW50aXRpZXMoKSB7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAuY2FsbEFsbCgndXBkYXRlJyk7XG4gICAgfVxuXG4gICAgX2FkZEVudGl0eShlbnRpdHkpIHtcblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGV2ZWxNYW5hZ2VyO1xuXG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGluZGV4LmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuZXhwb3J0cy53b3JsZF8xID0gcmVxdWlyZSgnY2xpZW50L2xldmVscy93b3JsZHMvd29ybGRfMScpO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogd29ybGRfMS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBMZXZlbCBmcm9tICdjbGllbnQvbGV2ZWxzL2xldmVsJztcbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIFRlc3RMZXZlbCBleHRlbmRzIExldmVsIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgICAgIHN1cGVyKGdhbWUsIENvbnN0Lk5PUk1BTF9HUkFWSVRZKTtcblxuICAgICAgICB0aGlzLm1hcEtleSA9ICd0ZXN0bWFwJztcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XG4gICAgfVxufVxuXG5leHBvcnRzLlRlc3RMZXZlbCA9IFRlc3RMZXZlbDtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGJvb3QuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBCb290U3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ3VyZVNjYWxlKCk7XG4gICAgICAgIHRoaXMuX2NvbmZpZ3VyZUlucHV0KCk7XG5cbiAgICAgICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YWdlLnNtb290aGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgICB0aGlzLmdhbWUuYWRkLnBsdWdpbihQaGFzZXIuUGx1Z2luLkRlYnVnKTtcblxuICAgICAgICB0aGlzLl9wcmVyZW5kZXIoKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zdGFydCgncHJlbG9hZCcpO1xuICAgIH1cblxuICAgIF9wcmVyZW5kZXIoKSB7XG4gICAgICAgIC8vIHByZS1yZW5kZXIgc29tZSBzaW1wbGUgYXNzZXRzIHRoYXQgSSBjYW5ub3QgYmUgYm90aGVyZWRcbiAgICAgICAgLy8gY3JlYXRpbmcgaW4gR0lNUFxuICAgICAgICB2YXIgYm1kID0gdGhpcy5hZGQuYml0bWFwRGF0YSgxLCAxKTtcbiAgICAgICAgYm1kLmNvbnRleHQuZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xuICAgICAgICBibWQuY29udGV4dC5maWxsUmVjdCgwLCAwLCAxLCAxKTtcbiAgICAgICAgdGhpcy5jYWNoZS5hZGRCaXRtYXBEYXRhKENvbnN0LkZJTExFRF9SRUNULCBibWQpO1xuXG4gICAgICAgIGJtZCA9IHRoaXMuYWRkLmJpdG1hcERhdGEoMTYsIDE2KTtcbiAgICAgICAgYm1kLmNvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuICAgICAgICBibWQuY29udGV4dC5maWxsUmVjdCgwLCAwLCAxNiwgMTYpO1xuICAgICAgICBibWQuY29udGV4dC5zdHJva2VTdHlsZSA9ICcjRkZGRkZGJztcbiAgICAgICAgYm1kLmNvbnRleHQucmVjdCgwLCAwLCAxNiwgMTYpO1xuICAgICAgICBibWQuY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5jYWNoZS5hZGRCaXRtYXBEYXRhKENvbnN0LlJFQ1QsIGJtZCk7XG4gICAgfVxuXG4gICAgX2NvbmZpZ3VyZVNjYWxlKCkge1xuICAgICAgICB0aGlzLnNjYWxlLm1pbldpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5zY2FsZS5taW5IZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2NhbGUuc2NhbGVNb2RlID0gdGhpcy5zY2FsZS5mdWxsU2NyZWVuU2NhbGVNb2RlID1cbiAgICAgICAgICAgIFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICAgIHRoaXMuc2NhbGUuc2V0U2NyZWVuU2l6ZSgpO1xuICAgIH1cblxuICAgIF9jb25maWd1cmVJbnB1dCgpIHtcbiAgICAgICAgLy8gY2FwdHVyZSBjZXJ0YWluIGtleXMgdG8gcHJldmVudCB0aGVpciBkZWZhdWx0IGFjdGlvbnMgaW4gdGhlIGJyb3dzZXIuXG4gICAgICAgIC8vIHRoaXMgaXMgb25seSBuZWNlc3NhcnkgYmVjYXVzZSB0aGlzIGlzIGFuIEhUTUw1IGdhbWUuXG4gICAgICAgIHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5Q2FwdHVyZShbXG4gICAgICAgICAgICBQaGFzZXIuS2V5Ym9hcmQuTEVGVCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5SSUdIVCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5VUCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5ET1dOXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMuaW5wdXQubWF4UG9pbnRlcnMgPSAxO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm9vdFN0YXRlO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogbGVhZGVyYm9hcmQuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgVGV4dExhYmVsIGZyb20gJ2NsaWVudC9ndWkvdGV4dF9sYWJlbCc7XG5pbXBvcnQgVGV4dEJ1dHRvbiBmcm9tICdjbGllbnQvZ3VpL3RleHRfYnV0dG9uJztcblxuY2xhc3MgTGVhZGVyYm9hcmRTdGF0ZSBleHRlbmRzIFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgICAgIHN1cGVyKGdhbWUpO1xuICAgIH1cblxuICAgIHByZWxvYWQoKSB7XG4gICAgICAgIHRoaXMubG9hZC5qc29uKCdsZWFkZXJib2FyZCcsIGAvbGVhZGVyYm9hcmRgKTtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHZhciB0aXRsZSA9IG5ldyBUZXh0TGFiZWwodGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGgvMiwgMjAsICdsZWFkZXJib2FyZCcsIG51bGwsXG4gICAgICAgICAgICB0cnVlLCB0cnVlLCAnY2VudGVyJywgMTApO1xuICAgICAgICB2YXIgZXhpdCA9IG5ldyBUZXh0QnV0dG9uKHRoaXMuZ2FtZSwgdGhpcy5nYW1lLndpZHRoLzIsIHRoaXMuZ2FtZS5oZWlnaHQgLSAzMCwgJ21haW5tZW51JywgbnVsbCxcbiAgICAgICAgICAgIHRydWUsIHsgZm46IHRoaXMuX29uTWFpbk1lbnVTZWxlY3RlZCwgY3R4OiB0aGlzIH0sIHRydWUsICdjZW50ZXInLCAxMCk7XG4gICAgICAgIHRoaXMuYWRkLmV4aXN0aW5nKHRpdGxlKTtcbiAgICAgICAgdGhpcy5hZGQuZXhpc3RpbmcoZXhpdCk7XG5cbiAgICAgICAgdGhpcy5faW5pdExlYWRlcmJvYXJkKCk7XG4gICAgfVxuXG4gICAgX2luaXRMZWFkZXJib2FyZCgpIHtcbiAgICAgICAgdmFyIGJvYXJkID0gdGhpcy5jYWNoZS5nZXRKU09OKCdsZWFkZXJib2FyZCcpO1xuXG4gICAgICAgIHZhciB5UG9zID0gNDA7XG4gICAgICAgIGZvciAodmFyIGVudHJ5IG9mIGJvYXJkKSB7XG4gICAgICAgICAgICBsZXQgZW50cnlMYWJlbCA9IG5ldyBUZXh0TGFiZWwodGhpcy5nYW1lLCB0aGlzLmdhbWUud2lkdGgvMiwgeVBvcyxcbiAgICAgICAgICAgICAgICBgJHtlbnRyeS5uYW1lfSAgICAgJHtlbnRyeS5zY29yZX1gKTtcblxuICAgICAgICAgICAgdGhpcy5hZGQuZXhpc3RpbmcoZW50cnlMYWJlbCk7XG4gICAgICAgICAgICB5UG9zICs9IGVudHJ5TGFiZWwuaGVpZ2h0ICogMjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9vbk1haW5NZW51U2VsZWN0ZWQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuc3RhcnQoJ21haW5tZW51Jyk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZWFkZXJib2FyZFN0YXRlO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogbWVudS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3N0YXRlJztcbmltcG9ydCBTdGFyZmllbGQgZnJvbSAnY2xpZW50L2VmZmVjdHMvc3RhcmZpZWxkJztcbmltcG9ydCBPcHRpb25zRGlhbG9nIGZyb20gJ2NsaWVudC9ndWkvb3B0aW9uc19kaWFsb2cnO1xuaW1wb3J0IE1haW5NZW51RGlhbG9nIGZyb20gJ2NsaWVudC9ndWkvbWFpbl9tZW51X2RpYWxvZyc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBNZW51U3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcblxuICAgICAgICB0aGlzLm9wdGlvbnNEaWFsb2cgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3N0YXJmaWVsZCA9IG51bGw7XG4gICAgICAgIHRoaXMuX21haW5NZW51RGlhbG9nID0gbnVsbDtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMud29ybGQucmVzaXplKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgICAgIHRoaXMuX3N0YXJmaWVsZCA9IG5ldyBTdGFyZmllbGQodGhpcywgNCwgMzIpO1xuICAgICAgICB0aGlzLl9jcmVhdGVMb2dvKCk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zRGlhbG9nID0gbmV3IE9wdGlvbnNEaWFsb2codGhpcy5nYW1lLCB0aGlzLFxuICAgICAgICAgICAgZiA9PiB0aGlzLl9vbk9wdGlvbnNDbG9zZSgpKTtcbiAgICAgICAgdGhpcy5fbWFpbk1lbnVEaWFsb2cgPSBuZXcgTWFpbk1lbnVEaWFsb2codGhpcy5nYW1lLCB0aGlzLFxuICAgICAgICAgICAgZiA9PiB0aGlzLl9vbk1haW5NZW51Q2xvc2UoKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLl9zdGFyZmllbGQudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUxvZ28oKSB7XG4gICAgICAgIHZhciB0b3BIYWxmID0gdGhpcy5hZGQuc3ByaXRlKC0zNiwgdGhpcy5nYW1lLmhlaWdodC8yIC0gNTQsXG4gICAgICAgICAgICBDb25zdC5HQU1FX0xPR08sIDApO1xuICAgICAgICB2YXIgYm90dG9tSGFsZiA9IHRoaXMuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggKyAzNixcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQvMiAtIDE4LCBDb25zdC5HQU1FX0xPR08sIDEpO1xuXG4gICAgICAgIHRvcEhhbGYuYW5jaG9yLnggPSB0b3BIYWxmLmFuY2hvci55ID0gYm90dG9tSGFsZi5hbmNob3IueCA9XG4gICAgICAgICAgICBib3R0b21IYWxmLmFuY2hvci55ID0gMC41O1xuICAgICAgICB0b3BIYWxmLnNjYWxlLnggPSB0b3BIYWxmLnNjYWxlLnkgPSBib3R0b21IYWxmLnNjYWxlLnggPVxuICAgICAgICAgICAgYm90dG9tSGFsZi5zY2FsZS55ID0gMztcbiAgICAgICAgdGhpcy5hZGQudHdlZW4odG9wSGFsZilcbiAgICAgICAgICAgIC50byh7IHg6IHRoaXMuZ2FtZS53aWR0aC8yIH0sIDEwMDAsIFBoYXNlci5FYXNpbmcuRXhwb25lbnRpYWwuT3V0LFxuICAgICAgICAgICAgICAgIHRydWUpO1xuICAgICAgICB0aGlzLmFkZC50d2Vlbihib3R0b21IYWxmKVxuICAgICAgICAgICAgLnRvKHsgeDogdGhpcy5nYW1lLndpZHRoLzIgfSwgMTAwMCwgUGhhc2VyLkVhc2luZy5FeHBvbmVudGlhbC5PdXQsXG4gICAgICAgICAgICAgICAgdHJ1ZSlcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlLmFkZChmID0+IHRoaXMuX21haW5NZW51RGlhbG9nLnNob3coKSk7XG4gICAgfVxuXG4gICAgX29uT3B0aW9uc0Nsb3NlKCkge1xuICAgICAgICB0aGlzLl9tYWluTWVudURpYWxvZy5zaG93KCk7XG4gICAgfVxuXG4gICAgX29uTWFpbk1lbnVDbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zRGlhbG9nLnNob3coKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lbnVTdGF0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHBsYXkuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgUGxheWVyIGZyb20gJ2NsaWVudC9lbnRpdGllcy9wbGF5ZXInO1xuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcblxuY2xhc3MgUGxheVN0YXRlIGV4dGVuZHMgU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICBzdXBlci5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLmdhbWUucGxheWVyID0gbmV3IFBsYXllcih0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgICB0aGlzLmdhbWUuc3RhcnRTb3VuZCA9IHRoaXMuZ2FtZS5hZGQuYXVkaW8oQ29uc3QuU1RBUlRfU09VTkQpO1xuICAgICAgICB0aGlzLmdhbWUuaGl0R3JvdW5kU291bmQgPSB0aGlzLmdhbWUuYWRkLmF1ZGlvKENvbnN0LkZBTExfU09VTkQpO1xuICAgICAgICB0aGlzLmdhbWUuanVtcFNvdW5kID0gdGhpcy5nYW1lLmFkZC5hdWRpbyhDb25zdC5KVU1QX1NPVU5EKTtcblxuICAgICAgICB0aGlzLnN0YXRlLnN0YXJ0KCdsZXZlbF8xXzEnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlTdGF0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHByZWxvYWQuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBQcmVsb2FkU3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcbiAgICB9XG5cbiAgICBwcmVsb2FkKCkge1xuICAgICAgICBzdXBlci5wcmVsb2FkKCk7XG5cbiAgICAgICAgdmFyIGxvYWRpbmdCYXIgPSB0aGlzLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoLzIsIHRoaXMuZ2FtZS5oZWlnaHQvMixcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuZ2V0Qml0bWFwRGF0YShDb25zdC5GSUxMRURfUkVDVCkpO1xuICAgICAgICBsb2FkaW5nQmFyLmFuY2hvci5zZXQoMC41KTtcbiAgICAgICAgbG9hZGluZ0Jhci53aWR0aCA9IDEyODtcbiAgICAgICAgbG9hZGluZ0Jhci5oZWlnaHQgPSAxNjtcbiAgICAgICAgdGhpcy5sb2FkLnNldFByZWxvYWRTcHJpdGUobG9hZGluZ0Jhcik7XG5cbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KENvbnN0LlNQUklURV9TSEVFVCwgJ3Jlcy9pbWcvc2hlZXQucG5nJywgMTIsIDEyKTtcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KENvbnN0LkdBTUVfTE9HTywgJ3Jlcy9pbWcvbG9nby5wbmcnLCAyNCwgMTIpO1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoQ29uc3QuSFRNTF9MT0dPLCAncmVzL2ltZy9odG1sLnBuZycpO1xuICAgICAgICB0aGlzLmxvYWQuYml0bWFwRm9udChDb25zdC5HQU1FX0ZPTlQsICdyZXMvZm9udHMvZm9udC5wbmcnLFxuICAgICAgICAgICAgJ3Jlcy9mb250cy9mb250LnhtbCcpO1xuXG4gICAgICAgIHRoaXMubG9hZC50aWxlbWFwKCd0ZXN0bWFwJywgJ3Jlcy90aWxlbWFwcy90ZXN0bWFwLmpzb24nLFxuICAgICAgICAgICAgbnVsbCwgUGhhc2VyLlRpbGVtYXAuVElMRURfSlNPTik7XG4gICAgICAgIHRoaXMubG9hZC5pbWFnZShDb25zdC5USUxFU0VUX0lNRywgJ3Jlcy90aWxlbWFwcy90aWxlcy5wbmcnKTtcblxuICAgICAgICB0aGlzLmxvYWQuYXVkaW8oQ29uc3QuU1RBUlRfU09VTkQsICdyZXMvc291bmRzL3N0YXJ0Lm1wMycpO1xuICAgICAgICB0aGlzLmxvYWQuYXVkaW8oQ29uc3QuSlVNUF9TT1VORCwgJ3Jlcy9zb3VuZHMvanVtcC5tcDMnKTtcbiAgICAgICAgdGhpcy5sb2FkLmF1ZGlvKENvbnN0LkZBTExfU09VTkQsICdyZXMvc291bmRzL2hpdF9ncm91bmQubXAzJyk7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICBzdXBlci5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLnN0YXRlLnN0YXJ0KCdzcGxhc2gnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFByZWxvYWRTdGF0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHNwbGFzaC5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3N0YXRlJztcbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIFNwbGFzaFN0YXRlIGV4dGVuZHMgU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICBzdXBlci5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5faHRtbExvZ28gPSB0aGlzLmFkZC5zcHJpdGUodGhpcy53b3JsZC5jZW50ZXJYLCB0aGlzLndvcmxkLmNlbnRlclksXG4gICAgICAgICAgICBDb25zdC5IVE1MX0xPR08pO1xuICAgICAgICB0aGlzLl9odG1sTG9nby5zbW9vdGhlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2h0bWxMb2dvLmFuY2hvci5zZXQoMC41LCAwLjUpO1xuICAgICAgICB0aGlzLl9odG1sTG9nby5zY2FsZS5zZXQoMC41KTtcbiAgICAgICAgdGhpcy5faHRtbExvZ28uYWxwaGEgPSAwO1xuXG4gICAgICAgIHRoaXMuX2NyZWF0ZUh0bWxUd2VlbigpO1xuICAgIH1cblxuICAgIF9jcmVhdGVIdG1sVHdlZW4oKSB7XG4gICAgICAgIHZhciBodG1sVHdlZW4gPSB0aGlzLmFkZC50d2Vlbih0aGlzLl9odG1sTG9nbykudG8oe2FscGhhOiAxfSwgMTAwMCxcbiAgICAgICAgICAgIFBoYXNlci5FYXNpbmcuQ3ViaWMuSW4sIHRydWUsIDAsIDAsIHRydWUpO1xuICAgICAgICBodG1sVHdlZW4ub25Db21wbGV0ZS5hZGQoKCkgPT4geyB0aGlzLnN0YXRlLnN0YXJ0KCdtYWlubWVudScpOyB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNwbGFzaFN0YXRlO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBzdGF0ZS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBLZXlib2FyZEhhbmRsZXIgZnJvbSAnY2xpZW50L2lucHV0L2tleWJvYXJkX2hhbmRsZXInO1xuXG5jbGFzcyBTdGF0ZSBleHRlbmRzIFBoYXNlci5TdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcblxuICAgICAgICB0aGlzLmlucHV0SGFuZGxlciA9IG5ldyBLZXlib2FyZEhhbmRsZXIoKTtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLnN0YWdlLmJhY2tncm91bmRDb2xvciA9IDB4MDAwMDAwO1xuICAgICAgICB0aGlzLmlucHV0SGFuZGxlci5jcmVhdGUodGhpcy5pbnB1dCk7XG4gICAgfVxuXG4gICAgc2h1dGRvd24oKSB7XG4gICAgICAgIHRoaXMuc291bmQuc3RvcEFsbCgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3RhdGU7XG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGNvbnN0YW50cy5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIC8qKlxuICAgICAqIGNvbG9yIGNvbnN0YW50c1xuICAgICAqL1xuICAgIFNLWV9CTFVFOiAweDZEOTNGQyxcbiAgICBHT0xEOiAweEZGRDcwMCxcblxuICAgIC8qKlxuICAgICAqIHBoeXNpY3MgY29uc3RhbnRzXG4gICAgICovXG4gICAgTk9STUFMX0dSQVZJVFk6IDUyMC4wLFxuICAgIFBMQVlFUl9BQ0NFTDogNDgwLjAsXG4gICAgUExBWUVSX01BWF9WRUw6IDEyMC4wLFxuICAgIFBMQVlFUl9EUkFHOiA1MjAuMCxcbiAgICBQTEFZRVJfSlVNUF9TUEVFRDogLTI1Ni4wLFxuICAgIFBMQVlFUl9NQVhfRkFMTF9TUEVFRDogMzIwLFxuXG4gICAgLyoqXG4gICAgICogYXNzZXQgY29uc3RhbnRzXG4gICAgICovXG4gICAgSFRNTF9MT0dPOiAnaHRtbF9sb2dvJyxcbiAgICBHQU1FX0xPR086ICdnYW1lX2xvZ28nLFxuICAgIFNQUklURV9TSEVFVDogJ3Nwcml0ZXNoZWV0JyxcbiAgICBGSUxMRURfUkVDVDogJ2ZpbGxlZF9yZWN0JyxcbiAgICBSRUNUOiAncmVjdCcsXG4gICAgVElMRVNFVF9JTUc6ICd0aWxlcycsXG4gICAgR0FNRV9GT05UOiAncmV0cm9fZm50JyxcbiAgICBTVEFSVF9TT1VORDogJ3N0YXJ0JyxcbiAgICBKVU1QX1NPVU5EOiAnanVtcCcsXG4gICAgRkFMTF9TT1VORDogJ2ZhbGwnLFxuXG4gICAgLyoqXG4gICAgICogc2l6ZSBjb25zdGFudHNcbiAgICAgKi9cbiAgICBCTE9DS19TSVpFOiAxMlxufTtcbiJdfQ==