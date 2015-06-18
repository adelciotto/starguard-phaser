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

},{"const":118}],96:[function(require,module,exports){
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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _const = require('const');

var _const2 = _interopRequireDefault(_const);

var Gate = (function (_Phaser$Sprite) {
    function Gate(game, x, y) {
        _classCallCheck(this, Gate);

        _get(Object.getPrototypeOf(Gate.prototype), 'constructor', this).call(this, game, x, y, game.cache.getBitmapData(_const2['default'].FILLED_RECT));

        this.anchor.set(0.5);
        this.width = _const2['default'].BLOCK_SIZE * 6;
        this.height = _const2['default'].BLOCK_SIZE * 6;
        this.tint = 255;

        game.add.tween(this).to({ alpha: 0.25 }, 500, Phaser.Easing.Sinusoidal.Out, true, 0, -1, true);
    }

    _inherits(Gate, _Phaser$Sprite);

    return Gate;
})(Phaser.Sprite);

exports['default'] = Gate;
module.exports = exports['default'];

},{"const":118}],98:[function(require,module,exports){
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

},{"client/entities/entity":96,"const":118}],99:[function(require,module,exports){
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
            this.state.add('play', _clientStatesPlay2['default'], false);
            console.log(worlds);
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

},{"client/levels/worlds":110,"client/states/boot":112,"client/states/menu":113,"client/states/play":114,"client/states/preload":115,"client/states/splash":116}],100:[function(require,module,exports){
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

},{"client/gui/text_button":103,"client/gui/text_label":104,"const":118}],101:[function(require,module,exports){
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
                newLine: true, fn: this._onStartSelected, ctx: this }, { type: 'button', pos: 'center', text: 'Trial',
                newLine: true, fn: this._onTrialSelected, ctx: this }, { type: 'button', pos: 'center', text: 'Options',
                newLine: true, fn: this._onOptionsSelected, ctx: this }]);
        }
    }, {
        key: '_onStartSelected',
        value: function _onStartSelected() {
            this._parent.state.start('play');
        }
    }, {
        key: '_onTrialSelected',
        value: function _onTrialSelected() {}
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
                items.push({ type: 'button', pos: 'center', text: 'Main0-Menu',
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

},{"client/gui/text_label":104,"const":118}],104:[function(require,module,exports){
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

},{"const":118}],105:[function(require,module,exports){
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

},{"client/gui/options_dialog":102,"client/levels/level_manager":109,"client/states/state":117,"const":118}],109:[function(require,module,exports){
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

                    switch (obj.name) {
                        case 'spawn':
                            var gate = new _clientEntitiesGate2['default'](this._game, obj.x, obj.y);
                            this._entitiesGroup.add(gate);
                            this._player.position.set(obj.x, obj.y);
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

},{"client/entities/gate":97,"const":118}],110:[function(require,module,exports){
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

},{"client/levels/level":108,"const":118}],112:[function(require,module,exports){
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

},{"client/states/state":117,"const":118}],113:[function(require,module,exports){
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

},{"client/effects/starfield":95,"client/gui/main_menu_dialog":101,"client/gui/options_dialog":102,"client/states/state":117,"const":118}],114:[function(require,module,exports){
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

},{"client/entities/player":98,"client/states/state":117,"const":118}],115:[function(require,module,exports){
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
            this.load.bitmapFont(_const2['default'].GAME_FONT, 'res/fonts/plumber_bros.png', 'res/fonts/plumber_bros.xml');

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

},{"client/states/state":117,"const":118}],116:[function(require,module,exports){
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

},{"client/states/state":117,"const":118}],117:[function(require,module,exports){
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

},{"client/input/keyboard_handler":107}],118:[function(require,module,exports){
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24tdG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi13ZWFrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jb2xsZWN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5jdHguanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmRlZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZG9tLWNyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuZW51bS1rZXlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5mb3Itb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5nZXQtbmFtZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmludm9rZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1jYWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pdGVyLWRlZmluZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuaXRlci1kZXRlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5rZXlvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQubWl4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5vd24ta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQucmVkZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlcGxhY2VyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zYW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuc3RyaW5nLWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcGFkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zdHJpbmctcmVwZWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50YXNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC50aHJvd3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnVpZC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudW5zY29wZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQud2tzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM1LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkub2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5mdW5jdGlvbi5oYXMtaW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWF0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5vYmplY3QuaXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnN0YXRpY3MtYWNjZXB0LXByaW1pdGl2ZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZmxlY3QuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucmVnZXhwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuY29kZS1wb2ludC1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmF3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLW1hcC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi53ZWFrLXNldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5hcnJheS5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5tYXAudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcucmVnZXhwLmVzY2FwZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zZXQudG8tanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNy5zdHJpbmcuYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmxwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLnJwYWQuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9qcy5hcnJheS5zdGF0aWNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5pbW1lZGlhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIudGltZXJzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsL25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL3NoaW0uanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL3JlZ2VuZXJhdG9yL3J1bnRpbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvYmFiZWwvcG9seWZpbGwuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwic3JjL2NsaWVudC9lZmZlY3RzL3N0YXJmaWVsZC5qcyIsInNyYy9jbGllbnQvZW50aXRpZXMvZW50aXR5LmpzIiwic3JjL2NsaWVudC9lbnRpdGllcy9nYXRlLmpzIiwic3JjL2NsaWVudC9lbnRpdGllcy9wbGF5ZXIuanMiLCJzcmMvY2xpZW50L2dhbWUuanMiLCJzcmMvY2xpZW50L2d1aS9kaWFsb2cuanMiLCJzcmMvY2xpZW50L2d1aS9tYWluX21lbnVfZGlhbG9nLmpzIiwic3JjL2NsaWVudC9ndWkvb3B0aW9uc19kaWFsb2cuanMiLCJzcmMvY2xpZW50L2d1aS90ZXh0X2J1dHRvbi5qcyIsInNyYy9jbGllbnQvZ3VpL3RleHRfbGFiZWwuanMiLCJzcmMvY2xpZW50L2luZGV4LmpzIiwic3JjL2NsaWVudC9pbnB1dC9pbnB1dF9oYW5kbGVyLmpzIiwic3JjL2NsaWVudC9pbnB1dC9rZXlib2FyZF9oYW5kbGVyLmpzIiwic3JjL2NsaWVudC9sZXZlbHMvbGV2ZWwuanMiLCJzcmMvY2xpZW50L2xldmVscy9sZXZlbF9tYW5hZ2VyLmpzIiwic3JjL2NsaWVudC9sZXZlbHMvd29ybGRzL2luZGV4LmpzIiwic3JjL2NsaWVudC9sZXZlbHMvd29ybGRzL3dvcmxkXzEuanMiLCJzcmMvY2xpZW50L3N0YXRlcy9ib290LmpzIiwic3JjL2NsaWVudC9zdGF0ZXMvbWVudS5qcyIsInNyYy9jbGllbnQvc3RhdGVzL3BsYXkuanMiLCJzcmMvY2xpZW50L3N0YXRlcy9wcmVsb2FkLmpzIiwic3JjL2NsaWVudC9zdGF0ZXMvc3BsYXNoLmpzIiwic3JjL2NsaWVudC9zdGF0ZXMvc3RhdGUuanMiLCJzcmMvY29uc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9UQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbm5CQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFD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QUFBLE9BQUEsZUFSRixNQUFLLFlBQUEsVUFBQSxNQUFBLEtBQUE7WUFTSCxLQUFLLE1BQU0sa0JBQWtCO1lBQzdCLEtBQUssYUFBYSxPQUFPLEtBQUs7O09BMEIvQjtRQUNDLEtBQUs7UUFDTCxPQXpCSSxTQUFBLFdBQUc7WUFDUCxLQUFLLE1BQU07Ozs7SUE2QmYsT0EzQ0U7R0FBYyxPQUFPOztBQThDM0IsUUFBUSxhQTVCTztBQTZCZixPQUFPLFVBQVUsUUFBUTtzeURBQzZ3RDs7QUMxRHR5RDs7Ozs7Ozs7QUFRQTs7QUFBQSxPQUFPLFVBQVU7Ozs7RUFJYixVQUFVO0VBQ1YsTUFBTTs7Ozs7RUFLTixnQkFBZ0I7RUFDaEIsY0FBYztFQUNkLGdCQUFnQjtFQUNoQixhQUFhO0VBQ2IsbUJBQW1CLENBQUM7RUFDcEIsdUJBQXVCOzs7OztFQUt2QixXQUFXO0VBQ1gsV0FBVztFQUNYLGNBQWM7RUFDZCxhQUFhO0VBQ2IsTUFBTTtFQUNOLGFBQWE7RUFDYixXQUFXO0VBQ1gsYUFBYTtFQUNiLFlBQVk7RUFDWixZQUFZOzs7OztFQUtaLFlBQVk7OzhvRUFJOG5FIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCJjb3JlLWpzL3NoaW1cIik7XG5cbnJlcXVpcmUoXCJyZWdlbmVyYXRvci9ydW50aW1lXCIpO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlOyIsIi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2Zcbi8vIHRydWUgIC0+IEFycmF5I2luY2x1ZGVzXG52YXIgJCA9IHJlcXVpcmUoJy4vJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XG4gIHJldHVybiBmdW5jdGlvbigkdGhpcywgZWwsIGZyb21JbmRleCl7XG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9ICQudG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9ICQudG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoSVNfSU5DTFVERVMgfHwgaW5kZXggaW4gTyl7XG4gICAgICBpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4O1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gMCAtPiBBcnJheSNmb3JFYWNoXG4vLyAxIC0+IEFycmF5I21hcFxuLy8gMiAtPiBBcnJheSNmaWx0ZXJcbi8vIDMgLT4gQXJyYXkjc29tZVxuLy8gNCAtPiBBcnJheSNldmVyeVxuLy8gNSAtPiBBcnJheSNmaW5kXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxudmFyICQgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ID0gcmVxdWlyZSgnLi8kLmN0eCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUWVBFKXtcbiAgdmFyIElTX01BUCAgICAgICAgPSBUWVBFID09IDFcbiAgICAsIElTX0ZJTFRFUiAgICAgPSBUWVBFID09IDJcbiAgICAsIElTX1NPTUUgICAgICAgPSBUWVBFID09IDNcbiAgICAsIElTX0VWRVJZICAgICAgPSBUWVBFID09IDRcbiAgICAsIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDZcbiAgICAsIE5PX0hPTEVTICAgICAgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0KXtcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCgkdGhpcykpXG4gICAgICAsIHNlbGYgICA9ICQuRVM1T2JqZWN0KE8pXG4gICAgICAsIGYgICAgICA9IGN0eChjYWxsYmFja2ZuLCB0aGF0LCAzKVxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSAwXG4gICAgICAsIHJlc3VsdCA9IElTX01BUCA/IEFycmF5KGxlbmd0aCkgOiBJU19GSUxURVIgPyBbXSA6IHVuZGVmaW5lZFxuICAgICAgLCB2YWwsIHJlcztcbiAgICBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpe1xuICAgICAgdmFsID0gc2VsZltpbmRleF07XG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xuICAgICAgaWYoVFlQRSl7XG4gICAgICAgIGlmKElTX01BUClyZXN1bHRbaW5kZXhdID0gcmVzOyAgICAgICAgICAgIC8vIG1hcFxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWw7ICAgICAgICAgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHJlc3VsdC5wdXNoKHZhbCk7ICAgICAgICAgICAgICAgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZihJU19FVkVSWSlyZXR1cm4gZmFsc2U7ICAgICAgICAgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiByZXN1bHQ7XG4gIH07XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5mdW5jdGlvbiBhc3NlcnQoY29uZGl0aW9uLCBtc2cxLCBtc2cyKXtcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XG59XG5hc3NlcnQuZGVmID0gJC5hc3NlcnREZWZpbmVkO1xuYXNzZXJ0LmZuID0gZnVuY3Rpb24oaXQpe1xuICBpZighJC5pc0Z1bmN0aW9uKGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59O1xuYXNzZXJ0Lm9iaiA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoISQuaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTtcbmFzc2VydC5pbnN0ID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcbiAgcmV0dXJuIGl0O1xufTtcbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgZW51bUtleXMgPSByZXF1aXJlKCcuLyQuZW51bS1rZXlzJyk7XG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7XG4vKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC12YXJzICovXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxuICAgICwgbCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGkgPSAxO1xuICB3aGlsZShsID4gaSl7XG4gICAgdmFyIFMgICAgICA9ICQuRVM1T2JqZWN0KGFyZ3VtZW50c1tpKytdKVxuICAgICAgLCBrZXlzICAgPSBlbnVtS2V5cyhTKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBqICAgICAgPSAwXG4gICAgICAsIGtleTtcbiAgICB3aGlsZShsZW5ndGggPiBqKVRba2V5ID0ga2V5c1tqKytdXSA9IFNba2V5XTtcbiAgfVxuICByZXR1cm4gVDtcbn07IiwidmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBUQUcgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxuICAsIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5mdW5jdGlvbiBjb2YoaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufVxuY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XG4gIHZhciBPLCBUO1xuICByZXR1cm4gaXQgPT0gdW5kZWZpbmVkID8gaXQgPT09IHVuZGVmaW5lZCA/ICdVbmRlZmluZWQnIDogJ051bGwnXG4gICAgOiB0eXBlb2YgKFQgPSAoTyA9IE9iamVjdChpdCkpW1RBR10pID09ICdzdHJpbmcnID8gVCA6IGNvZihPKTtcbn07XG5jb2Yuc2V0ID0gZnVuY3Rpb24oaXQsIHRhZywgc3RhdCl7XG4gIGlmKGl0ICYmICEkLmhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSkkLmhpZGUoaXQsIFRBRywgdGFnKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IGNvZjsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGN0eCAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgc2FmZSAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZVxuICAsIGFzc2VydCAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgZm9yT2YgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCBzdGVwICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuc3RlcFxuICAsICRoYXMgICAgID0gJC5oYXNcbiAgLCBzZXQgICAgICA9ICQuc2V0XG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XG4gICwgaGlkZSAgICAgPSAkLmhpZGVcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgSUQgICAgICAgPSBzYWZlKCdpZCcpXG4gICwgTzEgICAgICAgPSBzYWZlKCdPMScpXG4gICwgTEFTVCAgICAgPSBzYWZlKCdsYXN0JylcbiAgLCBGSVJTVCAgICA9IHNhZmUoJ2ZpcnN0JylcbiAgLCBJVEVSICAgICA9IHNhZmUoJ2l0ZXInKVxuICAsIFNJWkUgICAgID0gJC5ERVNDID8gc2FmZSgnc2l6ZScpIDogJ3NpemUnXG4gICwgaWQgICAgICAgPSAwO1xuXG5mdW5jdGlvbiBmYXN0S2V5KGl0LCBjcmVhdGUpe1xuICAvLyByZXR1cm4gcHJpbWl0aXZlIHdpdGggcHJlZml4XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJyA/IGl0IDogKHR5cGVvZiBpdCA9PSAnc3RyaW5nJyA/ICdTJyA6ICdQJykgKyBpdDtcbiAgaWYoISRoYXMoaXQsIElEKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIGlkXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxuICAgIGhpZGUoaXQsIElELCArK2lkKTtcbiAgLy8gcmV0dXJuIG9iamVjdCBpZCB3aXRoIHByZWZpeFxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XG59XG5cbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XG4gIC8vIGZhc3QgY2FzZVxuICB2YXIgaW5kZXggPSBmYXN0S2V5KGtleSksIGVudHJ5O1xuICBpZihpbmRleCAhPT0gJ0YnKXJldHVybiB0aGF0W08xXVtpbmRleF07XG4gIC8vIGZyb3plbiBvYmplY3QgY2FzZVxuICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgaWYoZW50cnkuayA9PSBrZXkpcmV0dXJuIGVudHJ5O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24od3JhcHBlciwgTkFNRSwgSVNfTUFQLCBBRERFUil7XG4gICAgdmFyIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRoYXQsIGl0ZXJhYmxlKXtcbiAgICAgIGFzc2VydC5pbnN0KHRoYXQsIEMsIE5BTUUpO1xuICAgICAgc2V0KHRoYXQsIE8xLCAkLmNyZWF0ZShudWxsKSk7XG4gICAgICBzZXQodGhhdCwgU0laRSwgMCk7XG4gICAgICBzZXQodGhhdCwgTEFTVCwgdW5kZWZpbmVkKTtcbiAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfSk7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4xLjMuMSBNYXAucHJvdG90eXBlLmNsZWFyKClcbiAgICAgIC8vIDIzLjIuMy4yIFNldC5wcm90b3R5cGUuY2xlYXIoKVxuICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCl7XG4gICAgICAgIGZvcih2YXIgdGhhdCA9IHRoaXMsIGRhdGEgPSB0aGF0W08xXSwgZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XG4gICAgICAgICAgZW50cnkuciA9IHRydWU7XG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhW2VudHJ5LmldO1xuICAgICAgICB9XG4gICAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhhdFtTSVpFXSA9IDA7XG4gICAgICB9LFxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuMi4zLjQgU2V0LnByb3RvdHlwZS5kZWxldGUodmFsdWUpXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xuICAgICAgICAgICwgZW50cnkgPSBnZXRFbnRyeSh0aGF0LCBrZXkpO1xuICAgICAgICBpZihlbnRyeSl7XG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXG4gICAgICAgICAgICAsIHByZXYgPSBlbnRyeS5wO1xuICAgICAgICAgIGRlbGV0ZSB0aGF0W08xXVtlbnRyeS5pXTtcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcbiAgICAgICAgICBpZihwcmV2KXByZXYubiA9IG5leHQ7XG4gICAgICAgICAgaWYobmV4dCluZXh0LnAgPSBwcmV2O1xuICAgICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcbiAgICAgICAgICBpZih0aGF0W0xBU1RdID09IGVudHJ5KXRoYXRbTEFTVF0gPSBwcmV2O1xuICAgICAgICAgIHRoYXRbU0laRV0tLTtcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4yLjMuNiBTZXQucHJvdG90eXBlLmZvckVhY2goY2FsbGJhY2tmbiwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICAgICAgZm9yRWFjaDogZnVuY3Rpb24gZm9yRWFjaChjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICAgICAgdmFyIGYgPSBjdHgoY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdLCAzKVxuICAgICAgICAgICwgZW50cnk7XG4gICAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpc1tGSVJTVF0pe1xuICAgICAgICAgIGYoZW50cnkudiwgZW50cnkuaywgdGhpcyk7XG4gICAgICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXG4gICAgICAvLyAyMy4yLjMuNyBTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcbiAgICAgIGhhczogZnVuY3Rpb24gaGFzKGtleSl7XG4gICAgICAgIHJldHVybiAhIWdldEVudHJ5KHRoaXMsIGtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYoJC5ERVNDKSQuc2V0RGVzYyhDLnByb3RvdHlwZSwgJ3NpemUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBhc3NlcnQuZGVmKHRoaXNbU0laRV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcbiAgICAgICwgcHJldiwgaW5kZXg7XG4gICAgLy8gY2hhbmdlIGV4aXN0aW5nIGVudHJ5XG4gICAgaWYoZW50cnkpe1xuICAgICAgZW50cnkudiA9IHZhbHVlO1xuICAgIC8vIGNyZWF0ZSBuZXcgZW50cnlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhhdFtMQVNUXSA9IGVudHJ5ID0ge1xuICAgICAgICBpOiBpbmRleCA9IGZhc3RLZXkoa2V5LCB0cnVlKSwgLy8gPC0gaW5kZXhcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxuICAgICAgICB2OiB2YWx1ZSwgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gdmFsdWVcbiAgICAgICAgcDogcHJldiA9IHRoYXRbTEFTVF0sICAgICAgICAgIC8vIDwtIHByZXZpb3VzIGVudHJ5XG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XG4gICAgICAgIHI6IGZhbHNlICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSByZW1vdmVkXG4gICAgICB9O1xuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XG4gICAgICBpZihwcmV2KXByZXYubiA9IGVudHJ5O1xuICAgICAgdGhhdFtTSVpFXSsrO1xuICAgICAgLy8gYWRkIHRvIGluZGV4XG4gICAgICBpZihpbmRleCAhPT0gJ0YnKXRoYXRbTzFdW2luZGV4XSA9IGVudHJ5O1xuICAgIH0gcmV0dXJuIHRoYXQ7XG4gIH0sXG4gIGdldEVudHJ5OiBnZXRFbnRyeSxcbiAgLy8gYWRkIC5rZXlzLCAudmFsdWVzLCAuZW50cmllcywgW0BAaXRlcmF0b3JdXG4gIC8vIDIzLjEuMy40LCAyMy4xLjMuOCwgMjMuMS4zLjExLCAyMy4xLjMuMTIsIDIzLjIuMy41LCAyMy4yLjMuOCwgMjMuMi4zLjEwLCAyMy4yLjMuMTFcbiAgc2V0SXRlcjogZnVuY3Rpb24oQywgTkFNRSwgSVNfTUFQKXtcbiAgICByZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShDLCBOQU1FLCBmdW5jdGlvbihpdGVyYXRlZCwga2luZCl7XG4gICAgICBzZXQodGhpcywgSVRFUiwge286IGl0ZXJhdGVkLCBrOiBraW5kfSk7XG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cbiAgICAgICAgLCBraW5kICA9IGl0ZXIua1xuICAgICAgICAsIGVudHJ5ID0gaXRlci5sO1xuICAgICAgLy8gcmV2ZXJ0IHRvIHRoZSBsYXN0IGV4aXN0aW5nIGVudHJ5XG4gICAgICB3aGlsZShlbnRyeSAmJiBlbnRyeS5yKWVudHJ5ID0gZW50cnkucDtcbiAgICAgIC8vIGdldCBuZXh0IGVudHJ5XG4gICAgICBpZighaXRlci5vIHx8ICEoaXRlci5sID0gZW50cnkgPSBlbnRyeSA/IGVudHJ5Lm4gOiBpdGVyLm9bRklSU1RdKSl7XG4gICAgICAgIC8vIG9yIGZpbmlzaCB0aGUgaXRlcmF0aW9uXG4gICAgICAgIGl0ZXIubyA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIHN0ZXAoMSk7XG4gICAgICB9XG4gICAgICAvLyByZXR1cm4gc3RlcCBieSBraW5kXG4gICAgICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xuICAgICAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBlbnRyeS52KTtcbiAgICAgIHJldHVybiBzdGVwKDAsIFtlbnRyeS5rLCBlbnRyeS52XSk7XG4gICAgfSwgSVNfTUFQID8gJ2VudHJpZXMnIDogJ3ZhbHVlcycgLCAhSVNfTUFQLCB0cnVlKTtcbiAgfVxufTsiLCIvLyBodHRwczovL2dpdGh1Yi5jb20vRGF2aWRCcnVhbnQvTWFwLVNldC5wcm90b3R5cGUudG9KU09OXG52YXIgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JPZiA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTkFNRSl7XG4gICRkZWYoJGRlZi5QLCBOQU1FLCB7XG4gICAgdG9KU09OOiBmdW5jdGlvbiB0b0pTT04oKXtcbiAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgIGZvck9mKHRoaXMsIGZhbHNlLCBhcnIucHVzaCwgYXJyKTtcbiAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuICB9KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgc2FmZSAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmVcbiAgLCBhc3NlcnQgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBmb3JPZiAgICAgPSByZXF1aXJlKCcuLyQuZm9yLW9mJylcbiAgLCAkaGFzICAgICAgPSAkLmhhc1xuICAsIGlzT2JqZWN0ICA9ICQuaXNPYmplY3RcbiAgLCBoaWRlICAgICAgPSAkLmhpZGVcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgaWQgICAgICAgID0gMFxuICAsIElEICAgICAgICA9IHNhZmUoJ2lkJylcbiAgLCBXRUFLICAgICAgPSBzYWZlKCd3ZWFrJylcbiAgLCBMRUFLICAgICAgPSBzYWZlKCdsZWFrJylcbiAgLCBtZXRob2QgICAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpXG4gICwgZmluZCAgICAgID0gbWV0aG9kKDUpXG4gICwgZmluZEluZGV4ID0gbWV0aG9kKDYpO1xuZnVuY3Rpb24gZmluZEZyb3plbihzdG9yZSwga2V5KXtcbiAgcmV0dXJuIGZpbmQoc3RvcmUuYXJyYXksIGZ1bmN0aW9uKGl0KXtcbiAgICByZXR1cm4gaXRbMF0gPT09IGtleTtcbiAgfSk7XG59XG4vLyBmYWxsYmFjayBmb3IgZnJvemVuIGtleXNcbmZ1bmN0aW9uIGxlYWtTdG9yZSh0aGF0KXtcbiAgcmV0dXJuIHRoYXRbTEVBS10gfHwgaGlkZSh0aGF0LCBMRUFLLCB7XG4gICAgYXJyYXk6IFtdLFxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcbiAgICAgIHZhciBlbnRyeSA9IGZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICAgIGlmKGVudHJ5KXJldHVybiBlbnRyeVsxXTtcbiAgICB9LFxuICAgIGhhczogZnVuY3Rpb24oa2V5KXtcbiAgICAgIHJldHVybiAhIWZpbmRGcm96ZW4odGhpcywga2V5KTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XG4gICAgICB2YXIgZW50cnkgPSBmaW5kRnJvemVuKHRoaXMsIGtleSk7XG4gICAgICBpZihlbnRyeSllbnRyeVsxXSA9IHZhbHVlO1xuICAgICAgZWxzZSB0aGlzLmFycmF5LnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICB9LFxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xuICAgICAgdmFyIGluZGV4ID0gZmluZEluZGV4KHRoaXMuYXJyYXksIGZ1bmN0aW9uKGl0KXtcbiAgICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XG4gICAgICB9KTtcbiAgICAgIGlmKH5pbmRleCl0aGlzLmFycmF5LnNwbGljZShpbmRleCwgMSk7XG4gICAgICByZXR1cm4gISF+aW5kZXg7XG4gICAgfVxuICB9KVtMRUFLXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbih3cmFwcGVyLCBOQU1FLCBJU19NQVAsIEFEREVSKXtcbiAgICB2YXIgQyA9IHdyYXBwZXIoZnVuY3Rpb24odGhhdCwgaXRlcmFibGUpe1xuICAgICAgJC5zZXQoYXNzZXJ0Lmluc3QodGhhdCwgQywgTkFNRSksIElELCBpZCsrKTtcbiAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZClmb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XG4gICAgfSk7XG4gICAgcmVxdWlyZSgnLi8kLm1peCcpKEMucHJvdG90eXBlLCB7XG4gICAgICAvLyAyMy4zLjMuMiBXZWFrTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcbiAgICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcylbJ2RlbGV0ZSddKGtleSk7XG4gICAgICAgIHJldHVybiAkaGFzKGtleSwgV0VBSykgJiYgJGhhcyhrZXlbV0VBS10sIHRoaXNbSURdKSAmJiBkZWxldGUga2V5W1dFQUtdW3RoaXNbSURdXTtcbiAgICAgIH0sXG4gICAgICAvLyAyMy4zLjMuNCBXZWFrTWFwLnByb3RvdHlwZS5oYXMoa2V5KVxuICAgICAgLy8gMjMuNC4zLjQgV2Vha1NldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxuICAgICAgaGFzOiBmdW5jdGlvbiBoYXMoa2V5KXtcbiAgICAgICAgaWYoIWlzT2JqZWN0KGtleSkpcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZighaXNFeHRlbnNpYmxlKGtleSkpcmV0dXJuIGxlYWtTdG9yZSh0aGlzKS5oYXMoa2V5KTtcbiAgICAgICAgcmV0dXJuICRoYXMoa2V5LCBXRUFLKSAmJiAkaGFzKGtleVtXRUFLXSwgdGhpc1tJRF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBDO1xuICB9LFxuICBkZWY6IGZ1bmN0aW9uKHRoYXQsIGtleSwgdmFsdWUpe1xuICAgIGlmKCFpc0V4dGVuc2libGUoYXNzZXJ0Lm9iaihrZXkpKSl7XG4gICAgICBsZWFrU3RvcmUodGhhdCkuc2V0KGtleSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkaGFzKGtleSwgV0VBSykgfHwgaGlkZShrZXksIFdFQUssIHt9KTtcbiAgICAgIGtleVtXRUFLXVt0aGF0W0lEXV0gPSB2YWx1ZTtcbiAgICB9IHJldHVybiB0aGF0O1xuICB9LFxuICBsZWFrU3RvcmU6IGxlYWtTdG9yZSxcbiAgV0VBSzogV0VBSyxcbiAgSUQ6IElEXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBCVUdHWSA9IHJlcXVpcmUoJy4vJC5pdGVyJykuQlVHR1lcbiAgLCBmb3JPZiA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNwZWNpZXMgPSByZXF1aXJlKCcuLyQuc3BlY2llcycpXG4gICwgYXNzZXJ0SW5zdGFuY2UgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuaW5zdDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOQU1FLCB3cmFwcGVyLCBtZXRob2RzLCBjb21tb24sIElTX01BUCwgSVNfV0VBSyl7XG4gIHZhciBCYXNlICA9ICQuZ1tOQU1FXVxuICAgICwgQyAgICAgPSBCYXNlXG4gICAgLCBBRERFUiA9IElTX01BUCA/ICdzZXQnIDogJ2FkZCdcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxuICAgICwgTyAgICAgPSB7fTtcbiAgZnVuY3Rpb24gZml4TWV0aG9kKEtFWSl7XG4gICAgdmFyIGZuID0gcHJvdG9bS0VZXTtcbiAgICByZXF1aXJlKCcuLyQucmVkZWYnKShwcm90bywgS0VZLFxuICAgICAgS0VZID09ICdkZWxldGUnID8gZnVuY3Rpb24oYSl7IHJldHVybiBmbi5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSk7IH1cbiAgICAgIDogS0VZID09ICdoYXMnID8gZnVuY3Rpb24gaGFzKGEpeyByZXR1cm4gZm4uY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEpOyB9XG4gICAgICA6IEtFWSA9PSAnZ2V0JyA/IGZ1bmN0aW9uIGdldChhKXsgcmV0dXJuIGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhKTsgfVxuICAgICAgOiBLRVkgPT0gJ2FkZCcgPyBmdW5jdGlvbiBhZGQoYSl7IGZuLmNhbGwodGhpcywgYSA9PT0gMCA/IDAgOiBhKTsgcmV0dXJuIHRoaXM7IH1cbiAgICAgIDogZnVuY3Rpb24gc2V0KGEsIGIpeyBmbi5jYWxsKHRoaXMsIGEgPT09IDAgPyAwIDogYSwgYik7IHJldHVybiB0aGlzOyB9XG4gICAgKTtcbiAgfVxuICBpZighJC5pc0Z1bmN0aW9uKEMpIHx8ICEoSVNfV0VBSyB8fCAhQlVHR1kgJiYgcHJvdG8uZm9yRWFjaCAmJiBwcm90by5lbnRyaWVzKSl7XG4gICAgLy8gY3JlYXRlIGNvbGxlY3Rpb24gY29uc3RydWN0b3JcbiAgICBDID0gY29tbW9uLmdldENvbnN0cnVjdG9yKHdyYXBwZXIsIE5BTUUsIElTX01BUCwgQURERVIpO1xuICAgIHJlcXVpcmUoJy4vJC5taXgnKShDLnByb3RvdHlwZSwgbWV0aG9kcyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGluc3QgID0gbmV3IENcbiAgICAgICwgY2hhaW4gPSBpbnN0W0FEREVSXShJU19XRUFLID8ge30gOiAtMCwgMSlcbiAgICAgICwgYnVnZ3laZXJvO1xuICAgIC8vIHdyYXAgZm9yIGluaXQgY29sbGVjdGlvbnMgZnJvbSBpdGVyYWJsZVxuICAgIGlmKCFyZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgbmV3IEMoaXRlcik7IH0pKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgICAgIEMgPSB3cmFwcGVyKGZ1bmN0aW9uKHRhcmdldCwgaXRlcmFibGUpe1xuICAgICAgICBhc3NlcnRJbnN0YW5jZSh0YXJnZXQsIEMsIE5BTUUpO1xuICAgICAgICB2YXIgdGhhdCA9IG5ldyBCYXNlO1xuICAgICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhhdFtBRERFUl0sIHRoYXQpO1xuICAgICAgICByZXR1cm4gdGhhdDtcbiAgICAgIH0pO1xuICAgICAgQy5wcm90b3R5cGUgPSBwcm90bztcbiAgICAgIHByb3RvLmNvbnN0cnVjdG9yID0gQztcbiAgICB9XG4gICAgSVNfV0VBSyB8fCBpbnN0LmZvckVhY2goZnVuY3Rpb24odmFsLCBrZXkpe1xuICAgICAgYnVnZ3laZXJvID0gMSAvIGtleSA9PT0gLUluZmluaXR5O1xuICAgIH0pO1xuICAgIC8vIGZpeCBjb252ZXJ0aW5nIC0wIGtleSB0byArMFxuICAgIGlmKGJ1Z2d5WmVybyl7XG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xuICAgICAgZml4TWV0aG9kKCdoYXMnKTtcbiAgICAgIElTX01BUCAmJiBmaXhNZXRob2QoJ2dldCcpO1xuICAgIH1cbiAgICAvLyArIGZpeCAuYWRkICYgLnNldCBmb3IgY2hhaW5pbmdcbiAgICBpZihidWdneVplcm8gfHwgY2hhaW4gIT09IGluc3QpZml4TWV0aG9kKEFEREVSKTtcbiAgfVxuXG4gIHJlcXVpcmUoJy4vJC5jb2YnKS5zZXQoQywgTkFNRSk7XG5cbiAgT1tOQU1FXSA9IEM7XG4gICRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogKEMgIT0gQmFzZSksIE8pO1xuICBzcGVjaWVzKEMpO1xuICBzcGVjaWVzKCQuY29yZVtOQU1FXSk7IC8vIGZvciB3cmFwcGVyXG5cbiAgaWYoIUlTX1dFQUspY29tbW9uLnNldEl0ZXIoQywgTkFNRSwgSVNfTUFQKTtcblxuICByZXR1cm4gQztcbn07IiwiLy8gT3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xuICBhc3NlcnRGdW5jdGlvbihmbik7XG4gIGlmKH5sZW5ndGggJiYgdGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH0gcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn07IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGdsb2JhbCAgICAgPSAkLmdcbiAgLCBjb3JlICAgICAgID0gJC5jb3JlXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvblxuICAsICRyZWRlZiAgICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKTtcbmZ1bmN0aW9uIGN0eChmbiwgdGhhdCl7XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuZ2xvYmFsLmNvcmUgPSBjb3JlO1xuLy8gdHlwZSBiaXRtYXBcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcbiRkZWYuRyA9IDI7ICAvLyBnbG9iYWxcbiRkZWYuUyA9IDQ7ICAvLyBzdGF0aWNcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xuJGRlZi5CID0gMTY7IC8vIGJpbmRcbiRkZWYuVyA9IDMyOyAvLyB3cmFwXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XG4gIHZhciBrZXksIG93biwgb3V0LCBleHBcbiAgICAsIGlzR2xvYmFsID0gdHlwZSAmICRkZWYuR1xuICAgICwgaXNQcm90byAgPSB0eXBlICYgJGRlZi5QXG4gICAgLCB0YXJnZXQgICA9IGlzR2xvYmFsID8gZ2xvYmFsIDogdHlwZSAmICRkZWYuU1xuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pLnByb3RvdHlwZVxuICAgICwgZXhwb3J0cyAgPSBpc0dsb2JhbCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pO1xuICBpZihpc0dsb2JhbClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gISh0eXBlICYgJGRlZi5GKSAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IChvd24gPyB0YXJnZXQgOiBzb3VyY2UpW2tleV07XG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xuICAgIGVsc2UgZXhwID0gaXNQcm90byAmJiBpc0Z1bmN0aW9uKG91dCkgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgaWYodGFyZ2V0ICYmICFvd24pJHJlZGVmKHRhcmdldCwga2V5LCBvdXQpO1xuICAgIC8vIGV4cG9ydFxuICAgIGlmKGV4cG9ydHNba2V5XSAhPSBvdXQpJC5oaWRlKGV4cG9ydHMsIGtleSwgZXhwKTtcbiAgICBpZihpc1Byb3RvKShleHBvcnRzLnByb3RvdHlwZSB8fCAoZXhwb3J0cy5wcm90b3R5cGUgPSB7fSkpW2tleV0gPSBvdXQ7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGRvY3VtZW50ID0gJC5nLmRvY3VtZW50XG4gICwgaXNPYmplY3QgPSAkLmlzT2JqZWN0XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldEtleXMoaXQpXG4gICAgLCBnZXREZXNjICAgID0gJC5nZXREZXNjXG4gICAgLCBnZXRTeW1ib2xzID0gJC5nZXRTeW1ib2xzO1xuICBpZihnZXRTeW1ib2xzKSQuZWFjaC5jYWxsKGdldFN5bWJvbHMoaXQpLCBmdW5jdGlvbihrZXkpe1xuICAgIGlmKGdldERlc2MoaXQsIGtleSkuZW51bWVyYWJsZSlrZXlzLnB1c2goa2V5KTtcbiAgfSk7XG4gIHJldHVybiBrZXlzO1xufTsiLCJ2YXIgY3R4ICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxuICAsIGdldCAgPSByZXF1aXJlKCcuLyQuaXRlcicpLmdldFxuICAsIGNhbGwgPSByZXF1aXJlKCcuLyQuaXRlci1jYWxsJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhYmxlLCBlbnRyaWVzLCBmbiwgdGhhdCl7XG4gIHZhciBpdGVyYXRvciA9IGdldChpdGVyYWJsZSlcbiAgICAsIGYgICAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBzdGVwO1xuICB3aGlsZSghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpe1xuICAgIGlmKGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpID09PSBmYWxzZSl7XG4gICAgICByZXR1cm4gY2FsbC5jbG9zZShpdGVyYXRvcik7XG4gICAgfVxuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oJCl7XG4gICQuRlcgICA9IHRydWU7XG4gICQucGF0aCA9ICQuZztcbiAgcmV0dXJuICQ7XG59OyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgdG9TdHJpbmcgPSB7fS50b1N0cmluZ1xyXG4gICwgZ2V0TmFtZXMgPSAkLmdldE5hbWVzO1xyXG5cclxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc1xyXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xyXG5cclxuZnVuY3Rpb24gZ2V0V2luZG93TmFtZXMoaXQpe1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZ2V0TmFtZXMoaXQpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICByZXR1cm4gd2luZG93TmFtZXMuc2xpY2UoKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xyXG4gIGlmKHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nKXJldHVybiBnZXRXaW5kb3dOYW1lcyhpdCk7XHJcbiAgcmV0dXJuIGdldE5hbWVzKCQudG9PYmplY3QoaXQpKTtcclxufTsiLCIvLyBGYXN0IGFwcGx5XG4vLyBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gICAgY2FzZSA1OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdKTtcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTsiLCJ2YXIgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcbmZ1bmN0aW9uIGNsb3NlKGl0ZXJhdG9yKXtcbiAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgaWYocmV0ICE9PSB1bmRlZmluZWQpYXNzZXJ0T2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XG59XG5mdW5jdGlvbiBjYWxsKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYXNzZXJ0T2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICB9IGNhdGNoKGUpe1xuICAgIGNsb3NlKGl0ZXJhdG9yKTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5jYWxsLmNsb3NlID0gY2xvc2U7XG5tb2R1bGUuZXhwb3J0cyA9IGNhbGw7IiwidmFyICRkZWYgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRyZWRlZiAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5yZWRlZicpXG4gICwgJCAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcbiAgLCAkaXRlciAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgRkZfSVRFUkFUT1IgICAgID0gJ0BAaXRlcmF0b3InXG4gICwgS0VZUyAgICAgICAgICAgID0gJ2tleXMnXG4gICwgVkFMVUVTICAgICAgICAgID0gJ3ZhbHVlcydcbiAgLCBJdGVyYXRvcnMgICAgICAgPSAkaXRlci5JdGVyYXRvcnM7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFKXtcbiAgJGl0ZXIuY3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgZnVuY3Rpb24gY3JlYXRlTWV0aG9kKGtpbmQpe1xuICAgIGZ1bmN0aW9uICQkKHRoYXQpe1xuICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGF0LCBraW5kKTtcbiAgICB9XG4gICAgc3dpdGNoKGtpbmQpe1xuICAgICAgY2FzZSBLRVlTOiByZXR1cm4gZnVuY3Rpb24ga2V5cygpeyByZXR1cm4gJCQodGhpcyk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJCQodGhpcyk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gJCQodGhpcyk7IH07XG4gIH1cbiAgdmFyIFRBRyAgICAgID0gTkFNRSArICcgSXRlcmF0b3InXG4gICAgLCBwcm90byAgICA9IEJhc2UucHJvdG90eXBlXG4gICAgLCBfbmF0aXZlICA9IHByb3RvW1NZTUJPTF9JVEVSQVRPUl0gfHwgcHJvdG9bRkZfSVRFUkFUT1JdIHx8IERFRkFVTFQgJiYgcHJvdG9bREVGQVVMVF1cbiAgICAsIF9kZWZhdWx0ID0gX25hdGl2ZSB8fCBjcmVhdGVNZXRob2QoREVGQVVMVClcbiAgICAsIG1ldGhvZHMsIGtleTtcbiAgLy8gRml4IG5hdGl2ZVxuICBpZihfbmF0aXZlKXtcbiAgICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSAkLmdldFByb3RvKF9kZWZhdWx0LmNhbGwobmV3IEJhc2UpKTtcbiAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgY29mLnNldChJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAvLyBGRiBmaXhcbiAgICBpZigkLkZXICYmICQuaGFzKHByb3RvLCBGRl9JVEVSQVRPUikpJGl0ZXIuc2V0KEl0ZXJhdG9yUHJvdG90eXBlLCAkLnRoYXQpO1xuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigkLkZXIHx8IEZPUkNFKSRpdGVyLnNldChwcm90bywgX2RlZmF1bHQpO1xuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IF9kZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSAkLnRoYXQ7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICBrZXlzOiAgICBJU19TRVQgICAgICAgICAgICA/IF9kZWZhdWx0IDogY3JlYXRlTWV0aG9kKEtFWVMpLFxuICAgICAgdmFsdWVzOiAgREVGQVVMVCA9PSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZChWQUxVRVMpLFxuICAgICAgZW50cmllczogREVGQVVMVCAhPSBWQUxVRVMgPyBfZGVmYXVsdCA6IGNyZWF0ZU1ldGhvZCgnZW50cmllcycpXG4gICAgfTtcbiAgICBpZihGT1JDRSlmb3Ioa2V5IGluIG1ldGhvZHMpe1xuICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKSRyZWRlZihwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZGVmKCRkZWYuUCArICRkZWYuRiAqICRpdGVyLkJVR0dZLCBOQU1FLCBtZXRob2RzKTtcbiAgfVxufTsiLCJ2YXIgU1lNQk9MX0lURVJBVE9SID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXG4gICwgU0FGRV9DTE9TSU5HICAgID0gZmFsc2U7XG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bU1lNQk9MX0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbigpeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIGlmKCFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uKCl7IHNhZmUgPSB0cnVlOyB9O1xuICAgIGFycltTWU1CT0xfSVRFUkFUT1JdID0gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXI7IH07XG4gICAgZXhlYyhhcnIpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBzYWZlO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIGNvZiAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgY2xhc3NvZiAgICAgICAgICAgPSBjb2YuY2xhc3NvZlxuICAsIGFzc2VydCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgYXNzZXJ0T2JqZWN0ICAgICAgPSBhc3NlcnQub2JqXG4gICwgU1lNQk9MX0lURVJBVE9SICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBGRl9JVEVSQVRPUiAgICAgICA9ICdAQGl0ZXJhdG9yJ1xuICAsIEl0ZXJhdG9ycyAgICAgICAgID0gcmVxdWlyZSgnLi8kLnNoYXJlZCcpKCdpdGVyYXRvcnMnKVxuICAsIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxuc2V0SXRlcmF0b3IoSXRlcmF0b3JQcm90b3R5cGUsICQudGhhdCk7XG5mdW5jdGlvbiBzZXRJdGVyYXRvcihPLCB2YWx1ZSl7XG4gICQuaGlkZShPLCBTWU1CT0xfSVRFUkFUT1IsIHZhbHVlKTtcbiAgLy8gQWRkIGl0ZXJhdG9yIGZvciBGRiBpdGVyYXRvciBwcm90b2NvbFxuICBpZihGRl9JVEVSQVRPUiBpbiBbXSkkLmhpZGUoTywgRkZfSVRFUkFUT1IsIHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIFNhZmFyaSBoYXMgYnVnZ3kgaXRlcmF0b3JzIHcvbyBgbmV4dGBcbiAgQlVHR1k6ICdrZXlzJyBpbiBbXSAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpLFxuICBJdGVyYXRvcnM6IEl0ZXJhdG9ycyxcbiAgc3RlcDogZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICAgIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xuICB9LFxuICBpczogZnVuY3Rpb24oaXQpe1xuICAgIHZhciBPICAgICAgPSBPYmplY3QoaXQpXG4gICAgICAsIFN5bWJvbCA9ICQuZy5TeW1ib2w7XG4gICAgcmV0dXJuIChTeW1ib2wgJiYgU3ltYm9sLml0ZXJhdG9yIHx8IEZGX0lURVJBVE9SKSBpbiBPXG4gICAgICB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gT1xuICAgICAgfHwgJC5oYXMoSXRlcmF0b3JzLCBjbGFzc29mKE8pKTtcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihpdCl7XG4gICAgdmFyIFN5bWJvbCA9ICQuZy5TeW1ib2xcbiAgICAgICwgZ2V0SXRlcjtcbiAgICBpZihpdCAhPSB1bmRlZmluZWQpe1xuICAgICAgZ2V0SXRlciA9IGl0W1N5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgRkZfSVRFUkFUT1JdXG4gICAgICAgIHx8IGl0W1NZTUJPTF9JVEVSQVRPUl1cbiAgICAgICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbiAgICB9XG4gICAgYXNzZXJ0KCQuaXNGdW5jdGlvbihnZXRJdGVyKSwgaXQsICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAgIHJldHVybiBhc3NlcnRPYmplY3QoZ2V0SXRlci5jYWxsKGl0KSk7XG4gIH0sXG4gIHNldDogc2V0SXRlcmF0b3IsXG4gIGNyZWF0ZTogZnVuY3Rpb24oQ29uc3RydWN0b3IsIE5BTUUsIG5leHQsIHByb3RvKXtcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShwcm90byB8fCBJdGVyYXRvclByb3RvdHlwZSwge25leHQ6ICQuZGVzYygxLCBuZXh0KX0pO1xuICAgIGNvZi5zZXQoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClcbiAgLCBjb3JlICAgPSB7fVxuICAsIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5XG4gICwgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eVxuICAsIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXG4gICwgbWF4ICAgPSBNYXRoLm1heFxuICAsIG1pbiAgID0gTWF0aC5taW47XG4vLyBUaGUgZW5naW5lIHdvcmtzIGZpbmUgd2l0aCBkZXNjcmlwdG9ycz8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eS5cbnZhciBERVNDID0gISFmdW5jdGlvbigpe1xuICB0cnkge1xuICAgIHJldHVybiBkZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7Z2V0OiBmdW5jdGlvbigpeyByZXR1cm4gMjsgfX0pLmEgPT0gMjtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufSgpO1xudmFyIGhpZGUgPSBjcmVhdGVEZWZpbmVyKDEpO1xuLy8gNy4xLjQgVG9JbnRlZ2VyXG5mdW5jdGlvbiB0b0ludGVnZXIoaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn1cbmZ1bmN0aW9uIGRlc2MoYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufVxuZnVuY3Rpb24gc2ltcGxlU2V0KG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59XG5mdW5jdGlvbiBjcmVhdGVEZWZpbmVyKGJpdG1hcCl7XG4gIHJldHVybiBERVNDID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBkZXNjKGJpdG1hcCwgdmFsdWUpKTtcbiAgfSA6IHNpbXBsZVNldDtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoaXQpe1xuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XG59XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYXNzZXJ0RGVmaW5lZChpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn1cblxudmFyICQgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vJC5mdycpKHtcbiAgZzogZ2xvYmFsLFxuICBjb3JlOiBjb3JlLFxuICBodG1sOiBnbG9iYWwuZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb3JlLWpzLWlzb2JqZWN0XG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxuICBpc0Z1bmN0aW9uOiBpc0Z1bmN0aW9uLFxuICB0aGF0OiBmdW5jdGlvbigpe1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICAvLyA3LjEuNCBUb0ludGVnZXJcbiAgdG9JbnRlZ2VyOiB0b0ludGVnZXIsXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxuICB0b0xlbmd0aDogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG4gIH0sXG4gIHRvSW5kZXg6IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICAgIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcbiAgfSxcbiAgaGFzOiBmdW5jdGlvbihpdCwga2V5KXtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbiAgfSxcbiAgY3JlYXRlOiAgICAgT2JqZWN0LmNyZWF0ZSxcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBERVNDOiAgICAgICBERVNDLFxuICBkZXNjOiAgICAgICBkZXNjLFxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICBzZXREZXNjOiAgICBkZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMsXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyxcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXG4gIEVTNU9iamVjdDogT2JqZWN0LFxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiAkLkVTNU9iamVjdChhc3NlcnREZWZpbmVkKGl0KSk7XG4gIH0sXG4gIGhpZGU6IGhpZGUsXG4gIGRlZjogY3JlYXRlRGVmaW5lcigwKSxcbiAgc2V0OiBnbG9iYWwuU3ltYm9sID8gc2ltcGxlU2V0IDogaGlkZSxcbiAgZWFjaDogW10uZm9yRWFjaFxufSk7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuaWYodHlwZW9mIF9fZSAhPSAndW5kZWZpbmVkJylfX2UgPSBjb3JlO1xuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KG9iamVjdClcbiAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcbn07IiwidmFyICRyZWRlZiA9IHJlcXVpcmUoJy4vJC5yZWRlZicpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc3JjKXtcclxuICBmb3IodmFyIGtleSBpbiBzcmMpJHJlZGVmKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XHJcbiAgcmV0dXJuIHRhcmdldDtcclxufTsiLCJ2YXIgJCAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBhc3NlcnRPYmplY3QgPSByZXF1aXJlKCcuLyQuYXNzZXJ0Jykub2JqO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBvd25LZXlzKGl0KXtcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgICAgICAgPSAkLmdldE5hbWVzKGl0KVxuICAgICwgZ2V0U3ltYm9scyA9ICQuZ2V0U3ltYm9scztcbiAgcmV0dXJuIGdldFN5bWJvbHMgPyBrZXlzLmNvbmNhdChnZXRTeW1ib2xzKGl0KSkgOiBrZXlzO1xufTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBpbnZva2UgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBhc3NlcnRGdW5jdGlvbiA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5mbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oLyogLi4ucGFyZ3MgKi8pe1xuICB2YXIgZm4gICAgID0gYXNzZXJ0RnVuY3Rpb24odGhpcylcbiAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIF8gICAgICA9ICQucGF0aC5fXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcbiAgd2hpbGUobGVuZ3RoID4gaSlpZigocGFyZ3NbaV0gPSBhcmd1bWVudHNbaSsrXSkgPT09IF8paG9sZGVyID0gdHJ1ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHZhciB0aGF0ICAgID0gdGhpc1xuICAgICAgLCBfbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBqID0gMCwgayA9IDAsIGFyZ3M7XG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBwYXJncywgdGhhdCk7XG4gICAgYXJncyA9IHBhcmdzLnNsaWNlKCk7XG4gICAgaWYoaG9sZGVyKWZvcig7bGVuZ3RoID4gajsgaisrKWlmKGFyZ3Nbal0gPT09IF8pYXJnc1tqXSA9IGFyZ3VtZW50c1trKytdO1xuICAgIHdoaWxlKF9sZW5ndGggPiBrKWFyZ3MucHVzaChhcmd1bWVudHNbaysrXSk7XG4gICAgcmV0dXJuIGludm9rZShmbiwgYXJncywgdGhhdCk7XG4gIH07XG59OyIsInZhciAkICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgdHBsID0gU3RyaW5nKHt9Lmhhc093blByb3BlcnR5KVxyXG4gICwgU1JDID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ3NyYycpXHJcbiAgLCBfdG9TdHJpbmcgPSBGdW5jdGlvbi50b1N0cmluZztcclxuXHJcbmZ1bmN0aW9uICRyZWRlZihPLCBrZXksIHZhbCwgc2FmZSl7XHJcbiAgaWYoJC5pc0Z1bmN0aW9uKHZhbCkpe1xyXG4gICAgdmFyIGJhc2UgPSBPW2tleV07XHJcbiAgICAkLmhpZGUodmFsLCBTUkMsIGJhc2UgPyBTdHJpbmcoYmFzZSkgOiB0cGwucmVwbGFjZSgvaGFzT3duUHJvcGVydHkvLCBTdHJpbmcoa2V5KSkpO1xyXG4gICAgaWYoISgnbmFtZScgaW4gdmFsKSl2YWwubmFtZSA9IGtleTtcclxuICB9XHJcbiAgaWYoTyA9PT0gJC5nKXtcclxuICAgIE9ba2V5XSA9IHZhbDtcclxuICB9IGVsc2Uge1xyXG4gICAgaWYoIXNhZmUpZGVsZXRlIE9ba2V5XTtcclxuICAgICQuaGlkZShPLCBrZXksIHZhbCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9yc1xyXG4vLyB3aXRoIG1ldGhvZHMgc2ltaWxhciB0byBMb0Rhc2ggaXNOYXRpdmVcclxuJHJlZGVmKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcclxuICByZXR1cm4gJC5oYXModGhpcywgU1JDKSA/IHRoaXNbU1JDXSA6IF90b1N0cmluZy5jYWxsKHRoaXMpO1xyXG59KTtcclxuXHJcbiQuY29yZS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24oaXQpe1xyXG4gIHJldHVybiBfdG9TdHJpbmcuY2FsbChpdCk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9ICRyZWRlZjsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHJlZ0V4cCwgcmVwbGFjZSwgaXNTdGF0aWMpe1xuICB2YXIgcmVwbGFjZXIgPSByZXBsYWNlID09PSBPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcbiAgICByZXR1cm4gcmVwbGFjZVtwYXJ0XTtcbiAgfSA6IHJlcGxhY2U7XG4gIHJldHVybiBmdW5jdGlvbihpdCl7XG4gICAgcmV0dXJuIFN0cmluZyhpc1N0YXRpYyA/IGl0IDogdGhpcykucmVwbGFjZShyZWdFeHAsIHJlcGxhY2VyKTtcbiAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuaXMgfHwgZnVuY3Rpb24gaXMoeCwgeSl7XHJcbiAgcmV0dXJuIHggPT09IHkgPyB4ICE9PSAwIHx8IDEgLyB4ID09PSAxIC8geSA6IHggIT0geCAmJiB5ICE9IHk7XHJcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpO1xuZnVuY3Rpb24gY2hlY2soTywgcHJvdG8pe1xuICBhc3NlcnQub2JqKE8pO1xuICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgJC5pc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICA/IGZ1bmN0aW9uKGJ1Z2d5LCBzZXQpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHNldCA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCAkLmdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgICAgc2V0KHt9LCBbXSk7XG4gICAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgICByZXR1cm4gTztcbiAgICAgICAgfTtcbiAgICAgIH0oKVxuICAgIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59OyIsInZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcclxuICAsIHN0b3JlICA9ICQuZ1tTSEFSRURdIHx8ICQuaGlkZSgkLmcsIFNIQVJFRCwge30pW1NIQVJFRF07XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcclxuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcclxufTsiLCJ2YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgU1BFQ0lFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgnc3BlY2llcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDKXtcbiAgaWYoJC5ERVNDICYmICEoU1BFQ0lFUyBpbiBDKSkkLnNldERlc2MoQywgU1BFQ0lFUywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6ICQudGhhdFxuICB9KTtcbn07IiwiLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKFRPX1NUUklORyl7XG4gIHJldHVybiBmdW5jdGlvbih0aGF0LCBwb3Mpe1xuICAgIHZhciBzID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9ICQudG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGxcbiAgICAgIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcbiAgfTtcbn07IiwiLy8gaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9c3RyYXdtYW46c3RyaW5nX3BhZGRpbmdcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIHJlcGVhdCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcmVwZWF0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGhhdCwgbWluTGVuZ3RoLCBmaWxsQ2hhciwgbGVmdCl7XG4gIC8vIDEuIExldCBPIGJlIENoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMgdmFsdWUpLlxuICAvLyAyLiBMZXQgUyBiZSBUb1N0cmluZyhPKS5cbiAgdmFyIFMgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoYXQpKTtcbiAgLy8gNC4gSWYgaW50TWluTGVuZ3RoIGlzIHVuZGVmaW5lZCwgcmV0dXJuIFMuXG4gIGlmKG1pbkxlbmd0aCA9PT0gdW5kZWZpbmVkKXJldHVybiBTO1xuICAvLyA0LiBMZXQgaW50TWluTGVuZ3RoIGJlIFRvSW50ZWdlcihtaW5MZW5ndGgpLlxuICB2YXIgaW50TWluTGVuZ3RoID0gJC50b0ludGVnZXIobWluTGVuZ3RoKTtcbiAgLy8gNS4gTGV0IGZpbGxMZW4gYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIFMgbWludXMgaW50TWluTGVuZ3RoLlxuICB2YXIgZmlsbExlbiA9IGludE1pbkxlbmd0aCAtIFMubGVuZ3RoO1xuICAvLyA2LiBJZiBmaWxsTGVuIDwgMCwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICAvLyA3LiBJZiBmaWxsTGVuIGlzICviiJ4sIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgaWYoZmlsbExlbiA8IDAgfHwgZmlsbExlbiA9PT0gSW5maW5pdHkpe1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdDYW5ub3Qgc2F0aXNmeSBzdHJpbmcgbGVuZ3RoICcgKyBtaW5MZW5ndGggKyAnIGZvciBzdHJpbmc6ICcgKyBTKTtcbiAgfVxuICAvLyA4LiBMZXQgc0ZpbGxTdHIgYmUgdGhlIHN0cmluZyByZXByZXNlbnRlZCBieSBmaWxsU3RyLlxuICAvLyA5LiBJZiBzRmlsbFN0ciBpcyB1bmRlZmluZWQsIGxldCBzRmlsbFN0ciBiZSBhIHNwYWNlIGNoYXJhY3Rlci5cbiAgdmFyIHNGaWxsU3RyID0gZmlsbENoYXIgPT09IHVuZGVmaW5lZCA/ICcgJyA6IFN0cmluZyhmaWxsQ2hhcik7XG4gIC8vIDEwLiBMZXQgc0ZpbGxWYWwgYmUgYSBTdHJpbmcgbWFkZSBvZiBzRmlsbFN0ciwgcmVwZWF0ZWQgdW50aWwgZmlsbExlbiBpcyBtZXQuXG4gIHZhciBzRmlsbFZhbCA9IHJlcGVhdC5jYWxsKHNGaWxsU3RyLCBNYXRoLmNlaWwoZmlsbExlbiAvIHNGaWxsU3RyLmxlbmd0aCkpO1xuICAvLyB0cnVuY2F0ZSBpZiB3ZSBvdmVyZmxvd2VkXG4gIGlmKHNGaWxsVmFsLmxlbmd0aCA+IGZpbGxMZW4pc0ZpbGxWYWwgPSBsZWZ0XG4gICAgPyBzRmlsbFZhbC5zbGljZShzRmlsbFZhbC5sZW5ndGggLSBmaWxsTGVuKVxuICAgIDogc0ZpbGxWYWwuc2xpY2UoMCwgZmlsbExlbik7XG4gIC8vIDExLiBSZXR1cm4gYSBzdHJpbmcgbWFkZSBmcm9tIHNGaWxsVmFsLCBmb2xsb3dlZCBieSBTLlxuICAvLyAxMS4gUmV0dXJuIGEgU3RyaW5nIG1hZGUgZnJvbSBTLCBmb2xsb3dlZCBieSBzRmlsbFZhbC5cbiAgcmV0dXJuIGxlZnQgPyBzRmlsbFZhbC5jb25jYXQoUykgOiBTLmNvbmNhdChzRmlsbFZhbCk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVwZWF0KGNvdW50KXtcbiAgdmFyIHN0ciA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgLCByZXMgPSAnJ1xuICAgICwgbiAgID0gJC50b0ludGVnZXIoY291bnQpO1xuICBpZihuIDwgMCB8fCBuID09IEluZmluaXR5KXRocm93IFJhbmdlRXJyb3IoXCJDb3VudCBjYW4ndCBiZSBuZWdhdGl2ZVwiKTtcbiAgZm9yKDtuID4gMDsgKG4gPj4+PSAxKSAmJiAoc3RyICs9IHN0cikpaWYobiAmIDEpcmVzICs9IHN0cjtcbiAgcmV0dXJuIHJlcztcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgY29mICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgY2VsICAgID0gcmVxdWlyZSgnLi8kLmRvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9ICQuZ1xuICAsIGlzRnVuY3Rpb24gICAgICAgICA9ICQuaXNGdW5jdGlvblxuICAsIGh0bWwgICAgICAgICAgICAgICA9ICQuaHRtbFxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxuICAsIGNsZWFyVGFzayAgICAgICAgICA9IGdsb2JhbC5jbGVhckltbWVkaWF0ZVxuICAsIHBvc3RNZXNzYWdlICAgICAgICA9IGdsb2JhbC5wb3N0TWVzc2FnZVxuICAsIGFkZEV2ZW50TGlzdGVuZXIgICA9IGdsb2JhbC5hZGRFdmVudExpc3RlbmVyXG4gICwgTWVzc2FnZUNoYW5uZWwgICAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXG4gICwgY291bnRlciAgICAgICAgICAgID0gMFxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XG4gICwgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSdcbiAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbmZ1bmN0aW9uIHJ1bigpe1xuICB2YXIgaWQgPSArdGhpcztcbiAgaWYoJC5oYXMocXVldWUsIGlkKSl7XG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XG4gICAgZm4oKTtcbiAgfVxufVxuZnVuY3Rpb24gbGlzdG5lcihldmVudCl7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufVxuLy8gTm9kZS5qcyAwLjkrICYgSUUxMCsgaGFzIHNldEltbWVkaWF0ZSwgb3RoZXJ3aXNlOlxuaWYoIWlzRnVuY3Rpb24oc2V0VGFzaykgfHwgIWlzRnVuY3Rpb24oY2xlYXJUYXNrKSl7XG4gIHNldFRhc2sgPSBmdW5jdGlvbihmbil7XG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcbiAgICAgIGludm9rZShpc0Z1bmN0aW9uKGZuKSA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhclRhc2sgPSBmdW5jdGlvbihpZCl7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjdHgocnVuLCBpZCwgMSkpO1xuICAgIH07XG4gIC8vIE1vZGVybiBicm93c2Vycywgc2tpcCBpbXBsZW1lbnRhdGlvbiBmb3IgV2ViV29ya2Vyc1xuICAvLyBJRTggaGFzIHBvc3RNZXNzYWdlLCBidXQgaXQncyBzeW5jICYgdHlwZW9mIGl0cyBwb3N0TWVzc2FnZSBpcyBvYmplY3RcbiAgfSBlbHNlIGlmKGFkZEV2ZW50TGlzdGVuZXIgJiYgaXNGdW5jdGlvbihwb3N0TWVzc2FnZSkgJiYgIWdsb2JhbC5pbXBvcnRTY3JpcHRzKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHBvc3RNZXNzYWdlKGlkLCAnKicpO1xuICAgIH07XG4gICAgYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RuZXIsIGZhbHNlKTtcbiAgLy8gV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYoaXNGdW5jdGlvbihNZXNzYWdlQ2hhbm5lbCkpe1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xuICAvLyBJRTgtXG4gIH0gZWxzZSBpZihPTlJFQURZU1RBVEVDSEFOR0UgaW4gY2VsKCdzY3JpcHQnKSl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBodG1sLmFwcGVuZENoaWxkKGNlbCgnc2NyaXB0JykpW09OUkVBRFlTVEFURUNIQU5HRV0gPSBmdW5jdGlvbigpe1xuICAgICAgICBodG1sLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICBydW4uY2FsbChpZCk7XG4gICAgICB9O1xuICAgIH07XG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXG4gIH0gZWxzZSB7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XG4gICAgfTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogICBzZXRUYXNrLFxuICBjbGVhcjogY2xlYXJUYXNrXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgZXhlYygpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTsiLCJ2YXIgc2lkID0gMDtcbmZ1bmN0aW9uIHVpZChrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytzaWQgKyBNYXRoLnJhbmRvbSgpKS50b1N0cmluZygzNikpO1xufVxudWlkLnNhZmUgPSByZXF1aXJlKCcuLyQnKS5nLlN5bWJvbCB8fCB1aWQ7XG5tb2R1bGUuZXhwb3J0cyA9IHVpZDsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXG52YXIgVU5TQ09QQUJMRVMgPSByZXF1aXJlKCcuLyQud2tzJykoJ3Vuc2NvcGFibGVzJyk7XG5pZighKFVOU0NPUEFCTEVTIGluIFtdKSlyZXF1aXJlKCcuLyQnKS5oaWRlKEFycmF5LnByb3RvdHlwZSwgVU5TQ09QQUJMRVMsIHt9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgW11bVU5TQ09QQUJMRVNdW2tleV0gPSB0cnVlO1xufTsiLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi8kJykuZ1xuICAsIHN0b3JlICA9IHJlcXVpcmUoJy4vJC5zaGFyZWQnKSgnd2tzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xuICByZXR1cm4gc3RvcmVbbmFtZV0gfHwgKHN0b3JlW25hbWVdID1cbiAgICBnbG9iYWwuU3ltYm9sICYmIGdsb2JhbC5TeW1ib2xbbmFtZV0gfHwgcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ1N5bWJvbC4nICsgbmFtZSkpO1xufTsiLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY2VsICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kb20tY3JlYXRlJylcbiAgLCBjb2YgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGludm9rZSAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuaW52b2tlJylcbiAgLCBhcnJheU1ldGhvZCAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxuICAsIElFX1BST1RPICAgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnX19wcm90b19fJylcbiAgLCBhc3NlcnQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgYXNzZXJ0T2JqZWN0ICAgICA9IGFzc2VydC5vYmpcbiAgLCBPYmplY3RQcm90byAgICAgID0gT2JqZWN0LnByb3RvdHlwZVxuICAsIGh0bWwgICAgICAgICAgICAgPSAkLmh0bWxcbiAgLCBBICAgICAgICAgICAgICAgID0gW11cbiAgLCBfc2xpY2UgICAgICAgICAgID0gQS5zbGljZVxuICAsIF9qb2luICAgICAgICAgICAgPSBBLmpvaW5cbiAgLCBjbGFzc29mICAgICAgICAgID0gY29mLmNsYXNzb2ZcbiAgLCBoYXMgICAgICAgICAgICAgID0gJC5oYXNcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gJC5zZXREZXNjXG4gICwgZ2V0T3duRGVzY3JpcHRvciA9ICQuZ2V0RGVzY1xuICAsIGRlZmluZVByb3BlcnRpZXMgPSAkLnNldERlc2NzXG4gICwgaXNGdW5jdGlvbiAgICAgICA9ICQuaXNGdW5jdGlvblxuICAsIGlzT2JqZWN0ICAgICAgICAgPSAkLmlzT2JqZWN0XG4gICwgdG9PYmplY3QgICAgICAgICA9ICQudG9PYmplY3RcbiAgLCB0b0xlbmd0aCAgICAgICAgID0gJC50b0xlbmd0aFxuICAsIHRvSW5kZXggICAgICAgICAgPSAkLnRvSW5kZXhcbiAgLCBJRThfRE9NX0RFRklORSAgID0gZmFsc2VcbiAgLCAkaW5kZXhPZiAgICAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LWluY2x1ZGVzJykoZmFsc2UpXG4gICwgJGZvckVhY2ggICAgICAgICA9IGFycmF5TWV0aG9kKDApXG4gICwgJG1hcCAgICAgICAgICAgICA9IGFycmF5TWV0aG9kKDEpXG4gICwgJGZpbHRlciAgICAgICAgICA9IGFycmF5TWV0aG9kKDIpXG4gICwgJHNvbWUgICAgICAgICAgICA9IGFycmF5TWV0aG9kKDMpXG4gICwgJGV2ZXJ5ICAgICAgICAgICA9IGFycmF5TWV0aG9kKDQpO1xuXG5pZighJC5ERVNDKXtcbiAgdHJ5IHtcbiAgICBJRThfRE9NX0RFRklORSA9IGRlZmluZVByb3BlcnR5KGNlbCgnZGl2JyksICd4JyxcbiAgICAgIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA4OyB9fVxuICAgICkueCA9PSA4O1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gICQuc2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFAsIEF0dHJpYnV0ZXMpe1xuICAgIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICAgIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICAgIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylhc3NlcnRPYmplY3QoTylbUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICAgIHJldHVybiBPO1xuICB9O1xuICAkLmdldERlc2MgPSBmdW5jdGlvbihPLCBQKXtcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xuICAgICAgcmV0dXJuIGdldE93bkRlc2NyaXB0b3IoTywgUCk7XG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICAgIGlmKGhhcyhPLCBQKSlyZXR1cm4gJC5kZXNjKCFPYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKE8sIFApLCBPW1BdKTtcbiAgfTtcbiAgJC5zZXREZXNjcyA9IGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbihPLCBQcm9wZXJ0aWVzKXtcbiAgICBhc3NlcnRPYmplY3QoTyk7XG4gICAgdmFyIGtleXMgICA9ICQuZ2V0S2V5cyhQcm9wZXJ0aWVzKVxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICAgLCBpID0gMFxuICAgICAgLCBQO1xuICAgIHdoaWxlKGxlbmd0aCA+IGkpJC5zZXREZXNjKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xuICAgIHJldHVybiBPO1xuICB9O1xufVxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhJC5ERVNDLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuNiAvIDE1LjIuMy4zIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkLmdldERlc2MsXG4gIC8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiAkLnNldERlc2MsXG4gIC8vIDE5LjEuMi4zIC8gMTUuMi4zLjcgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogZGVmaW5lUHJvcGVydGllc1xufSk7XG5cbiAgLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xudmFyIGtleXMxID0gKCdjb25zdHJ1Y3RvcixoYXNPd25Qcm9wZXJ0eSxpc1Byb3RvdHlwZU9mLHByb3BlcnR5SXNFbnVtZXJhYmxlLCcgK1xuICAgICAgICAgICAgJ3RvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnKS5zcGxpdCgnLCcpXG4gIC8vIEFkZGl0aW9uYWwga2V5cyBmb3IgZ2V0T3duUHJvcGVydHlOYW1lc1xuICAsIGtleXMyID0ga2V5czEuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJylcbiAgLCBrZXlzTGVuMSA9IGtleXMxLmxlbmd0aDtcblxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IGNlbCgnaWZyYW1lJylcbiAgICAsIGkgICAgICA9IGtleXNMZW4xXG4gICAgLCBndCAgICAgPSAnPidcbiAgICAsIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgaHRtbC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXG4gIC8vIGNyZWF0ZURpY3QgPSBpZnJhbWUuY29udGVudFdpbmRvdy5PYmplY3Q7XG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZSgnPHNjcmlwdD5kb2N1bWVudC5GPU9iamVjdDwvc2NyaXB0JyArIGd0KTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgY3JlYXRlRGljdCA9IGlmcmFtZURvY3VtZW50LkY7XG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdC5wcm90b3R5cGVba2V5czFbaV1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcbmZ1bmN0aW9uIGNyZWF0ZUdldEtleXMobmFtZXMsIGxlbmd0aCl7XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xuICAgIHZhciBPICAgICAgPSB0b09iamVjdChvYmplY3QpXG4gICAgICAsIGkgICAgICA9IDBcbiAgICAgICwgcmVzdWx0ID0gW11cbiAgICAgICwga2V5O1xuICAgIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gICAgd2hpbGUobGVuZ3RoID4gaSlpZihoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpe1xuICAgICAgfiRpbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuZnVuY3Rpb24gRW1wdHkoKXt9XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcbiAgZ2V0UHJvdG90eXBlT2Y6ICQuZ2V0UHJvdG8gPSAkLmdldFByb3RvIHx8IGZ1bmN0aW9uKE8pe1xuICAgIE8gPSBPYmplY3QoYXNzZXJ0LmRlZihPKSk7XG4gICAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XG4gICAgaWYoaXNGdW5jdGlvbihPLmNvbnN0cnVjdG9yKSAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XG4gICAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG4gICAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcbiAgfSxcbiAgLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkLmdldE5hbWVzID0gJC5nZXROYW1lcyB8fCBjcmVhdGVHZXRLZXlzKGtleXMyLCBrZXlzMi5sZW5ndGgsIHRydWUpLFxuICAvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkLmNyZWF0ZSA9ICQuY3JlYXRlIHx8IGZ1bmN0aW9uKE8sIC8qPyovUHJvcGVydGllcyl7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZihPICE9PSBudWxsKXtcbiAgICAgIEVtcHR5LnByb3RvdHlwZSA9IGFzc2VydE9iamVjdChPKTtcbiAgICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgICAgRW1wdHkucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2Ygc2hpbVxuICAgICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XG4gICAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZGVmaW5lUHJvcGVydGllcyhyZXN1bHQsIFByb3BlcnRpZXMpO1xuICB9LFxuICAvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcbiAga2V5czogJC5nZXRLZXlzID0gJC5nZXRLZXlzIHx8IGNyZWF0ZUdldEtleXMoa2V5czEsIGtleXNMZW4xLCBmYWxzZSksXG4gIC8vIDE5LjEuMi4xNyAvIDE1LjIuMy44IE9iamVjdC5zZWFsKE8pXG4gIHNlYWw6IGZ1bmN0aW9uIHNlYWwoaXQpe1xuICAgIHJldHVybiBpdDsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi41IC8gMTUuMi4zLjkgT2JqZWN0LmZyZWV6ZShPKVxuICBmcmVlemU6IGZ1bmN0aW9uIGZyZWV6ZShpdCl7XG4gICAgcmV0dXJuIGl0OyAvLyA8LSBjYXBcbiAgfSxcbiAgLy8gMTkuMS4yLjE1IC8gMTUuMi4zLjEwIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhPKVxuICBwcmV2ZW50RXh0ZW5zaW9uczogZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnMoaXQpe1xuICAgIHJldHVybiBpdDsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMyAvIDE1LjIuMy4xMSBPYmplY3QuaXNTZWFsZWQoTylcbiAgaXNTZWFsZWQ6IGZ1bmN0aW9uIGlzU2VhbGVkKGl0KXtcbiAgICByZXR1cm4gIWlzT2JqZWN0KGl0KTsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMiAvIDE1LjIuMy4xMiBPYmplY3QuaXNGcm96ZW4oTylcbiAgaXNGcm96ZW46IGZ1bmN0aW9uIGlzRnJvemVuKGl0KXtcbiAgICByZXR1cm4gIWlzT2JqZWN0KGl0KTsgLy8gPC0gY2FwXG4gIH0sXG4gIC8vIDE5LjEuMi4xMSAvIDE1LjIuMy4xMyBPYmplY3QuaXNFeHRlbnNpYmxlKE8pXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24gaXNFeHRlbnNpYmxlKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpOyAvLyA8LSBjYXBcbiAgfVxufSk7XG5cbi8vIDE5LjIuMy4yIC8gMTUuMy40LjUgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQodGhpc0FyZywgYXJncy4uLilcbiRkZWYoJGRlZi5QLCAnRnVuY3Rpb24nLCB7XG4gIGJpbmQ6IGZ1bmN0aW9uKHRoYXQgLyosIGFyZ3MuLi4gKi8pe1xuICAgIHZhciBmbiAgICAgICA9IGFzc2VydC5mbih0aGlzKVxuICAgICAgLCBwYXJ0QXJncyA9IF9zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgZnVuY3Rpb24gYm91bmQoLyogYXJncy4uLiAqLyl7XG4gICAgICB2YXIgYXJncyAgID0gcGFydEFyZ3MuY29uY2F0KF9zbGljZS5jYWxsKGFyZ3VtZW50cykpXG4gICAgICAgICwgY29uc3RyID0gdGhpcyBpbnN0YW5jZW9mIGJvdW5kXG4gICAgICAgICwgY3R4ICAgID0gY29uc3RyID8gJC5jcmVhdGUoZm4ucHJvdG90eXBlKSA6IHRoYXRcbiAgICAgICAgLCByZXN1bHQgPSBpbnZva2UoZm4sIGFyZ3MsIGN0eCk7XG4gICAgICByZXR1cm4gY29uc3RyID8gY3R4IDogcmVzdWx0O1xuICAgIH1cbiAgICBpZihmbi5wcm90b3R5cGUpYm91bmQucHJvdG90eXBlID0gZm4ucHJvdG90eXBlO1xuICAgIHJldHVybiBib3VuZDtcbiAgfVxufSk7XG5cbi8vIEZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBhbmQgRE9NIG9iamVjdHNcbmlmKCEoMCBpbiBPYmplY3QoJ3onKSAmJiAneidbMF0gPT0gJ3onKSl7XG4gICQuRVM1T2JqZWN0ID0gZnVuY3Rpb24oaXQpe1xuICAgIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbiAgfTtcbn1cblxudmFyIGJ1Z2d5U2xpY2UgPSB0cnVlO1xudHJ5IHtcbiAgaWYoaHRtbClfc2xpY2UuY2FsbChodG1sKTtcbiAgYnVnZ3lTbGljZSA9IGZhbHNlO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGJ1Z2d5U2xpY2UsICdBcnJheScsIHtcbiAgc2xpY2U6IGZ1bmN0aW9uIHNsaWNlKGJlZ2luLCBlbmQpe1xuICAgIHZhciBsZW4gICA9IHRvTGVuZ3RoKHRoaXMubGVuZ3RoKVxuICAgICAgLCBrbGFzcyA9IGNvZih0aGlzKTtcbiAgICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IGVuZDtcbiAgICBpZihrbGFzcyA9PSAnQXJyYXknKXJldHVybiBfc2xpY2UuY2FsbCh0aGlzLCBiZWdpbiwgZW5kKTtcbiAgICB2YXIgc3RhcnQgID0gdG9JbmRleChiZWdpbiwgbGVuKVxuICAgICAgLCB1cFRvICAgPSB0b0luZGV4KGVuZCwgbGVuKVxuICAgICAgLCBzaXplICAgPSB0b0xlbmd0aCh1cFRvIC0gc3RhcnQpXG4gICAgICAsIGNsb25lZCA9IEFycmF5KHNpemUpXG4gICAgICAsIGkgICAgICA9IDA7XG4gICAgZm9yKDsgaSA8IHNpemU7IGkrKyljbG9uZWRbaV0gPSBrbGFzcyA9PSAnU3RyaW5nJ1xuICAgICAgPyB0aGlzLmNoYXJBdChzdGFydCArIGkpXG4gICAgICA6IHRoaXNbc3RhcnQgKyBpXTtcbiAgICByZXR1cm4gY2xvbmVkO1xuICB9XG59KTtcblxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAoJC5FUzVPYmplY3QgIT0gT2JqZWN0KSwgJ0FycmF5Jywge1xuICBqb2luOiBmdW5jdGlvbiBqb2luKCl7XG4gICAgcmV0dXJuIF9qb2luLmFwcGx5KCQuRVM1T2JqZWN0KHRoaXMpLCBhcmd1bWVudHMpO1xuICB9XG59KTtcblxuLy8gMjIuMS4yLjIgLyAxNS40LjMuMiBBcnJheS5pc0FycmF5KGFyZylcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XG4gIGlzQXJyYXk6IGZ1bmN0aW9uKGFyZyl7XG4gICAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG4gIH1cbn0pO1xuZnVuY3Rpb24gY3JlYXRlQXJyYXlSZWR1Y2UoaXNSaWdodCl7XG4gIHJldHVybiBmdW5jdGlvbihjYWxsYmFja2ZuLCBtZW1vKXtcbiAgICBhc3NlcnQuZm4oY2FsbGJhY2tmbik7XG4gICAgdmFyIE8gICAgICA9IHRvT2JqZWN0KHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSBpc1JpZ2h0ID8gbGVuZ3RoIC0gMSA6IDBcbiAgICAgICwgaSAgICAgID0gaXNSaWdodCA/IC0xIDogMTtcbiAgICBpZihhcmd1bWVudHMubGVuZ3RoIDwgMilmb3IoOzspe1xuICAgICAgaWYoaW5kZXggaW4gTyl7XG4gICAgICAgIG1lbW8gPSBPW2luZGV4XTtcbiAgICAgICAgaW5kZXggKz0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpbmRleCArPSBpO1xuICAgICAgYXNzZXJ0KGlzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXgsICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJyk7XG4gICAgfVxuICAgIGZvcig7aXNSaWdodCA/IGluZGV4ID49IDAgOiBsZW5ndGggPiBpbmRleDsgaW5kZXggKz0gaSlpZihpbmRleCBpbiBPKXtcbiAgICAgIG1lbW8gPSBjYWxsYmFja2ZuKG1lbW8sIE9baW5kZXhdLCBpbmRleCwgdGhpcyk7XG4gICAgfVxuICAgIHJldHVybiBtZW1vO1xuICB9O1xufVxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gMjIuMS4zLjEwIC8gMTUuNC40LjE4IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIGZvckVhY2g6ICQuZWFjaCA9ICQuZWFjaCB8fCBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xNSAvIDE1LjQuNC4xOSBBcnJheS5wcm90b3R5cGUubWFwKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXG4gIG1hcDogZnVuY3Rpb24gbWFwKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRtYXAodGhpcywgY2FsbGJhY2tmbiwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjcgLyAxNS40LjQuMjAgQXJyYXkucHJvdG90eXBlLmZpbHRlcihjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBmaWx0ZXI6IGZ1bmN0aW9uIGZpbHRlcihjYWxsYmFja2ZuLyosIHRoYXQgPSB1bmRlZmluZWQgKi8pe1xuICAgIHJldHVybiAkZmlsdGVyKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4yMyAvIDE1LjQuNC4xNyBBcnJheS5wcm90b3R5cGUuc29tZShjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBzb21lOiBmdW5jdGlvbiBzb21lKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRzb21lKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy41IC8gMTUuNC40LjE2IEFycmF5LnByb3RvdHlwZS5ldmVyeShjYWxsYmFja2ZuIFssIHRoaXNBcmddKVxuICBldmVyeTogZnVuY3Rpb24gZXZlcnkoY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcbiAgICByZXR1cm4gJGV2ZXJ5KHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH0sXG4gIC8vIDIyLjEuMy4xOCAvIDE1LjQuNC4yMSBBcnJheS5wcm90b3R5cGUucmVkdWNlKGNhbGxiYWNrZm4gWywgaW5pdGlhbFZhbHVlXSlcbiAgcmVkdWNlOiBjcmVhdGVBcnJheVJlZHVjZShmYWxzZSksXG4gIC8vIDIyLjEuMy4xOSAvIDE1LjQuNC4yMiBBcnJheS5wcm90b3R5cGUucmVkdWNlUmlnaHQoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxuICByZWR1Y2VSaWdodDogY3JlYXRlQXJyYXlSZWR1Y2UodHJ1ZSksXG4gIC8vIDIyLjEuMy4xMSAvIDE1LjQuNC4xNCBBcnJheS5wcm90b3R5cGUuaW5kZXhPZihzZWFyY2hFbGVtZW50IFssIGZyb21JbmRleF0pXG4gIGluZGV4T2Y6IGZ1bmN0aW9uIGluZGV4T2YoZWwgLyosIGZyb21JbmRleCA9IDAgKi8pe1xuICAgIHJldHVybiAkaW5kZXhPZih0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcbiAgfSxcbiAgLy8gMjIuMS4zLjE0IC8gMTUuNC40LjE1IEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZihzZWFyY2hFbGVtZW50IFssIGZyb21JbmRleF0pXG4gIGxhc3RJbmRleE9mOiBmdW5jdGlvbihlbCwgZnJvbUluZGV4IC8qID0gQFsqLTFdICovKXtcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcbiAgICAgICwgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpXG4gICAgICAsIGluZGV4ICA9IGxlbmd0aCAtIDE7XG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpaW5kZXggPSBNYXRoLm1pbihpbmRleCwgJC50b0ludGVnZXIoZnJvbUluZGV4KSk7XG4gICAgaWYoaW5kZXggPCAwKWluZGV4ID0gdG9MZW5ndGgobGVuZ3RoICsgaW5kZXgpO1xuICAgIGZvcig7aW5kZXggPj0gMDsgaW5kZXgtLSlpZihpbmRleCBpbiBPKWlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gaW5kZXg7XG4gICAgcmV0dXJuIC0xO1xuICB9XG59KTtcblxuLy8gMjEuMS4zLjI1IC8gMTUuNS40LjIwIFN0cmluZy5wcm90b3R5cGUudHJpbSgpXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHt0cmltOiByZXF1aXJlKCcuLyQucmVwbGFjZXInKSgvXlxccyooW1xcc1xcU10qXFxTKT9cXHMqJC8sICckMScpfSk7XG5cbi8vIDIwLjMuMy4xIC8gMTUuOS40LjQgRGF0ZS5ub3coKVxuJGRlZigkZGVmLlMsICdEYXRlJywge25vdzogZnVuY3Rpb24oKXtcbiAgcmV0dXJuICtuZXcgRGF0ZTtcbn19KTtcblxuZnVuY3Rpb24gbHoobnVtKXtcbiAgcmV0dXJuIG51bSA+IDkgPyBudW0gOiAnMCcgKyBudW07XG59XG5cbi8vIDIwLjMuNC4zNiAvIDE1LjkuNS40MyBEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZygpXG4vLyBQaGFudG9tSlMgYW5kIG9sZCB3ZWJraXQgaGFkIGEgYnJva2VuIERhdGUgaW1wbGVtZW50YXRpb24uXG52YXIgZGF0ZSAgICAgICA9IG5ldyBEYXRlKC01ZTEzIC0gMSlcbiAgLCBicm9rZW5EYXRlID0gIShkYXRlLnRvSVNPU3RyaW5nICYmIGRhdGUudG9JU09TdHJpbmcoKSA9PSAnMDM4NS0wNy0yNVQwNzowNjozOS45OTlaJ1xuICAgICAgJiYgcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7IG5ldyBEYXRlKE5hTikudG9JU09TdHJpbmcoKTsgfSkpO1xuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBicm9rZW5EYXRlLCAnRGF0ZScsIHt0b0lTT1N0cmluZzogZnVuY3Rpb24oKXtcbiAgaWYoIWlzRmluaXRlKHRoaXMpKXRocm93IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xuICB2YXIgZCA9IHRoaXNcbiAgICAsIHkgPSBkLmdldFVUQ0Z1bGxZZWFyKClcbiAgICAsIG0gPSBkLmdldFVUQ01pbGxpc2Vjb25kcygpXG4gICAgLCBzID0geSA8IDAgPyAnLScgOiB5ID4gOTk5OSA/ICcrJyA6ICcnO1xuICByZXR1cm4gcyArICgnMDAwMDAnICsgTWF0aC5hYnMoeSkpLnNsaWNlKHMgPyAtNiA6IC00KSArXG4gICAgJy0nICsgbHooZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBseihkLmdldFVUQ0RhdGUoKSkgK1xuICAgICdUJyArIGx6KGQuZ2V0VVRDSG91cnMoKSkgKyAnOicgKyBseihkLmdldFVUQ01pbnV0ZXMoKSkgK1xuICAgICc6JyArIGx6KGQuZ2V0VVRDU2Vjb25kcygpKSArICcuJyArIChtID4gOTkgPyBtIDogJzAnICsgbHoobSkpICsgJ1onO1xufX0pO1xuXG5pZihjbGFzc29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ09iamVjdCcpY29mLmNsYXNzb2YgPSBmdW5jdGlvbihpdCl7XG4gIHZhciB0YWcgPSBjbGFzc29mKGl0KTtcbiAgcmV0dXJuIHRhZyA9PSAnT2JqZWN0JyAmJiBpc0Z1bmN0aW9uKGl0LmNhbGxlZSkgPyAnQXJndW1lbnRzJyA6IHRhZztcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gMjIuMS4zLjMgQXJyYXkucHJvdG90eXBlLmNvcHlXaXRoaW4odGFyZ2V0LCBzdGFydCwgZW5kID0gdGhpcy5sZW5ndGgpXG4gIGNvcHlXaXRoaW46IGZ1bmN0aW9uIGNvcHlXaXRoaW4odGFyZ2V0LyogPSAwICovLCBzdGFydCAvKiA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xuICAgIHZhciBPICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgICAsIGxlbiAgID0gJC50b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgdG8gICAgPSB0b0luZGV4KHRhcmdldCwgbGVuKVxuICAgICAgLCBmcm9tICA9IHRvSW5kZXgoc3RhcnQsIGxlbilcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cbiAgICAgICwgZmluICAgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IHRvSW5kZXgoZW5kLCBsZW4pXG4gICAgICAsIGNvdW50ID0gTWF0aC5taW4oZmluIC0gZnJvbSwgbGVuIC0gdG8pXG4gICAgICAsIGluYyAgID0gMTtcbiAgICBpZihmcm9tIDwgdG8gJiYgdG8gPCBmcm9tICsgY291bnQpe1xuICAgICAgaW5jICA9IC0xO1xuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XG4gICAgICB0byAgID0gdG8gICArIGNvdW50IC0gMTtcbiAgICB9XG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xuICAgICAgaWYoZnJvbSBpbiBPKU9bdG9dID0gT1tmcm9tXTtcbiAgICAgIGVsc2UgZGVsZXRlIE9bdG9dO1xuICAgICAgdG8gICArPSBpbmM7XG4gICAgICBmcm9tICs9IGluYztcbiAgICB9IHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2NvcHlXaXRoaW4nKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIHRvSW5kZXggPSAkLnRvSW5kZXg7XG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjMuNiBBcnJheS5wcm90b3R5cGUuZmlsbCh2YWx1ZSwgc3RhcnQgPSAwLCBlbmQgPSB0aGlzLmxlbmd0aClcbiAgZmlsbDogZnVuY3Rpb24gZmlsbCh2YWx1ZSAvKiwgc3RhcnQgPSAwLCBlbmQgPSBAbGVuZ3RoICovKXtcbiAgICB2YXIgTyAgICAgID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChhcmd1bWVudHNbMV0sIGxlbmd0aClcbiAgICAgICwgZW5kICAgID0gYXJndW1lbnRzWzJdXG4gICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XG4gICAgd2hpbGUoZW5kUG9zID4gaW5kZXgpT1tpbmRleCsrXSA9IHZhbHVlO1xuICAgIHJldHVybiBPO1xuICB9XG59KTtcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2ZpbGwnKTsiLCIndXNlIHN0cmljdCc7XG4vLyAyMi4xLjMuOSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4KHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZEluZGV4J1xuICAsICRkZWYgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIGZvcmNlZCA9IHRydWVcbiAgLCAkZmluZCAgPSByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDYpO1xuLy8gU2hvdWxkbid0IHNraXAgaG9sZXNcbmlmKEtFWSBpbiBbXSlBcnJheSgxKVtLRVldKGZ1bmN0aW9uKCl7IGZvcmNlZCA9IGZhbHNlOyB9KTtcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogZm9yY2VkLCAnQXJyYXknLCB7XG4gIGZpbmRJbmRleDogZnVuY3Rpb24gZmluZEluZGV4KGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDIyLjEuMy44IEFycmF5LnByb3RvdHlwZS5maW5kKHByZWRpY2F0ZSwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbnZhciBLRVkgICAgPSAnZmluZCdcbiAgLCAkZGVmICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBmb3JjZWQgPSB0cnVlXG4gICwgJGZpbmQgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KTtcbi8vIFNob3VsZG4ndCBza2lwIGhvbGVzXG5pZihLRVkgaW4gW10pQXJyYXkoMSlbS0VZXShmdW5jdGlvbigpeyBmb3JjZWQgPSBmYWxzZTsgfSk7XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqIGZvcmNlZCwgJ0FycmF5Jywge1xuICBmaW5kOiBmdW5jdGlvbiBmaW5kKGNhbGxiYWNrZm4vKiwgdGhhdCA9IHVuZGVmaW5lZCAqLyl7XG4gICAgcmV0dXJuICRmaW5kKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSk7XG4gIH1cbn0pO1xucmVxdWlyZSgnLi8kLnVuc2NvcGUnKShLRVkpOyIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIGNhbGwgID0gcmVxdWlyZSgnLi8kLml0ZXItY2FsbCcpO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLml0ZXItZGV0ZWN0JykoZnVuY3Rpb24oaXRlcil7IEFycmF5LmZyb20oaXRlcik7IH0pLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcbiAgZnJvbTogZnVuY3Rpb24gZnJvbShhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XG4gICAgdmFyIE8gICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKGFycmF5TGlrZSkpXG4gICAgICAsIG1hcGZuICAgPSBhcmd1bWVudHNbMV1cbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgZiAgICAgICA9IG1hcHBpbmcgPyBjdHgobWFwZm4sIGFyZ3VtZW50c1syXSwgMikgOiB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICAgIGlmKCRpdGVyLmlzKE8pKXtcbiAgICAgIGl0ZXJhdG9yID0gJGl0ZXIuZ2V0KE8pO1xuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cbiAgICAgIHJlc3VsdCAgID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KTtcbiAgICAgIGZvcig7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gY2FsbChpdGVyYXRvciwgZiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBzdHJhbmdlIElFIHF1aXJrcyBtb2RlIGJ1ZyAtPiB1c2UgdHlwZW9mIGluc3RlYWQgb2YgaXNGdW5jdGlvblxuICAgICAgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKSk7XG4gICAgICBmb3IoOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gZihPW2luZGV4XSwgaW5kZXgpIDogT1tpbmRleF07XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgc2V0VW5zY29wZSA9IHJlcXVpcmUoJy4vJC51bnNjb3BlJylcbiAgLCBJVEVSICAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxuICAsICRpdGVyICAgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXG4gICwgc3RlcCAgICAgICA9ICRpdGVyLnN0ZXBcbiAgLCBJdGVyYXRvcnMgID0gJGl0ZXIuSXRlcmF0b3JzO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuLyQuaXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogJC50b09iamVjdChpdGVyYXRlZCksIGk6IDAsIGs6IGtpbmR9KTtcbi8vIDIyLjEuNS4yLjEgJUFycmF5SXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIGl0ZXIgID0gdGhpc1tJVEVSXVxuICAgICwgTyAgICAgPSBpdGVyLm9cbiAgICAsIGtpbmQgID0gaXRlci5rXG4gICAgLCBpbmRleCA9IGl0ZXIuaSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgaXRlci5vID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5zZXRVbnNjb3BlKCdrZXlzJyk7XG5zZXRVbnNjb3BlKCd2YWx1ZXMnKTtcbnNldFVuc2NvcGUoJ2VudHJpZXMnKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCB7XG4gIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcbiAgb2Y6IGZ1bmN0aW9uIG9mKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHZhciBpbmRleCAgPSAwXG4gICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgIC8vIHN0cmFuZ2UgSUUgcXVpcmtzIG1vZGUgYnVnIC0+IHVzZSB0eXBlb2YgaW5zdGVhZCBvZiBpc0Z1bmN0aW9uXG4gICAgICAsIHJlc3VsdCA9IG5ldyAodHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheSkobGVuZ3RoKTtcbiAgICB3aGlsZShsZW5ndGggPiBpbmRleClyZXN1bHRbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4KytdO1xuICAgIHJlc3VsdC5sZW5ndGggPSBsZW5ndGg7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufSk7IiwicmVxdWlyZSgnLi8kLnNwZWNpZXMnKShBcnJheSk7IiwidmFyICQgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxuICAsIEhBU19JTlNUQU5DRSAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2hhc0luc3RhbmNlJylcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuLy8gMTkuMi4zLjYgRnVuY3Rpb24ucHJvdG90eXBlW0BAaGFzSW5zdGFuY2VdKFYpXG5pZighKEhBU19JTlNUQU5DRSBpbiBGdW5jdGlvblByb3RvKSkkLnNldERlc2MoRnVuY3Rpb25Qcm90bywgSEFTX0lOU1RBTkNFLCB7dmFsdWU6IGZ1bmN0aW9uKE8pe1xuICBpZighJC5pc0Z1bmN0aW9uKHRoaXMpIHx8ICEkLmlzT2JqZWN0KE8pKXJldHVybiBmYWxzZTtcbiAgaWYoISQuaXNPYmplY3QodGhpcy5wcm90b3R5cGUpKXJldHVybiBPIGluc3RhbmNlb2YgdGhpcztcbiAgLy8gZm9yIGVudmlyb25tZW50IHcvbyBuYXRpdmUgYEBAaGFzSW5zdGFuY2VgIGxvZ2ljIGVub3VnaCBgaW5zdGFuY2VvZmAsIGJ1dCBhZGQgdGhpczpcbiAgd2hpbGUoTyA9ICQuZ2V0UHJvdG8oTykpaWYodGhpcy5wcm90b3R5cGUgPT09IE8pcmV0dXJuIHRydWU7XG4gIHJldHVybiBmYWxzZTtcbn19KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgTkFNRSA9ICduYW1lJ1xuICAsIHNldERlc2MgPSAkLnNldERlc2NcbiAgLCBGdW5jdGlvblByb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuLy8gMTkuMi40LjIgbmFtZVxuTkFNRSBpbiBGdW5jdGlvblByb3RvIHx8ICQuRlcgJiYgJC5ERVNDICYmIHNldERlc2MoRnVuY3Rpb25Qcm90bywgTkFNRSwge1xuICBjb25maWd1cmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24oKXtcbiAgICB2YXIgbWF0Y2ggPSBTdHJpbmcodGhpcykubWF0Y2goL15cXHMqZnVuY3Rpb24gKFteIChdKikvKVxuICAgICAgLCBuYW1lICA9IG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcbiAgICAkLmhhcyh0aGlzLCBOQU1FKSB8fCBzZXREZXNjKHRoaXMsIE5BTUUsICQuZGVzYyg1LCBuYW1lKSk7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH0sXG4gIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICQuaGFzKHRoaXMsIE5BTUUpIHx8IHNldERlc2ModGhpcywgTkFNRSwgJC5kZXNjKDAsIHZhbHVlKSk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcblxuLy8gMjMuMSBNYXAgT2JqZWN0c1xucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIE1hcCgpeyByZXR1cm4gZ2V0KHRoaXMsIGFyZ3VtZW50c1swXSk7IH07XG59LCB7XG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KXtcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcbiAgICByZXR1cm4gZW50cnkgJiYgZW50cnkudjtcbiAgfSxcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcbiAgc2V0OiBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSl7XG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xuICB9XG59LCBzdHJvbmcsIHRydWUpOyIsInZhciBJbmZpbml0eSA9IDEgLyAwXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBFICAgICA9IE1hdGguRVxuICAsIHBvdyAgID0gTWF0aC5wb3dcbiAgLCBhYnMgICA9IE1hdGguYWJzXG4gICwgZXhwICAgPSBNYXRoLmV4cFxuICAsIGxvZyAgID0gTWF0aC5sb2dcbiAgLCBzcXJ0ICA9IE1hdGguc3FydFxuICAsIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXG4gICwgRVBTSUxPTiAgID0gcG93KDIsIC01MilcbiAgLCBFUFNJTE9OMzIgPSBwb3coMiwgLTIzKVxuICAsIE1BWDMyICAgICA9IHBvdygyLCAxMjcpICogKDIgLSBFUFNJTE9OMzIpXG4gICwgTUlOMzIgICAgID0gcG93KDIsIC0xMjYpO1xuZnVuY3Rpb24gcm91bmRUaWVzVG9FdmVuKG4pe1xuICByZXR1cm4gbiArIDEgLyBFUFNJTE9OIC0gMSAvIEVQU0lMT047XG59XG5cbi8vIDIwLjIuMi4yOCBNYXRoLnNpZ24oeClcbmZ1bmN0aW9uIHNpZ24oeCl7XG4gIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcbn1cbi8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcbmZ1bmN0aW9uIGFzaW5oKHgpe1xuICByZXR1cm4gIWlzRmluaXRlKHggPSAreCkgfHwgeCA9PSAwID8geCA6IHggPCAwID8gLWFzaW5oKC14KSA6IGxvZyh4ICsgc3FydCh4ICogeCArIDEpKTtcbn1cbi8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXG5mdW5jdGlvbiBleHBtMSh4KXtcbiAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogeCA+IC0xZS02ICYmIHggPCAxZS02ID8geCArIHggKiB4IC8gMiA6IGV4cCh4KSAtIDE7XG59XG5cbiRkZWYoJGRlZi5TLCAnTWF0aCcsIHtcbiAgLy8gMjAuMi4yLjMgTWF0aC5hY29zaCh4KVxuICBhY29zaDogZnVuY3Rpb24gYWNvc2goeCl7XG4gICAgcmV0dXJuICh4ID0gK3gpIDwgMSA/IE5hTiA6IGlzRmluaXRlKHgpID8gbG9nKHggLyBFICsgc3FydCh4ICsgMSkgKiBzcXJ0KHggLSAxKSAvIEUpICsgMSA6IHg7XG4gIH0sXG4gIC8vIDIwLjIuMi41IE1hdGguYXNpbmgoeClcbiAgYXNpbmg6IGFzaW5oLFxuICAvLyAyMC4yLjIuNyBNYXRoLmF0YW5oKHgpXG4gIGF0YW5oOiBmdW5jdGlvbiBhdGFuaCh4KXtcbiAgICByZXR1cm4gKHggPSAreCkgPT0gMCA/IHggOiBsb2coKDEgKyB4KSAvICgxIC0geCkpIC8gMjtcbiAgfSxcbiAgLy8gMjAuMi4yLjkgTWF0aC5jYnJ0KHgpXG4gIGNicnQ6IGZ1bmN0aW9uIGNicnQoeCl7XG4gICAgcmV0dXJuIHNpZ24oeCA9ICt4KSAqIHBvdyhhYnMoeCksIDEgLyAzKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjExIE1hdGguY2x6MzIoeClcbiAgY2x6MzI6IGZ1bmN0aW9uIGNsejMyKHgpe1xuICAgIHJldHVybiAoeCA+Pj49IDApID8gMzEgLSBmbG9vcihsb2coeCArIDAuNSkgKiBNYXRoLkxPRzJFKSA6IDMyO1xuICB9LFxuICAvLyAyMC4yLjIuMTIgTWF0aC5jb3NoKHgpXG4gIGNvc2g6IGZ1bmN0aW9uIGNvc2goeCl7XG4gICAgcmV0dXJuIChleHAoeCA9ICt4KSArIGV4cCgteCkpIC8gMjtcbiAgfSxcbiAgLy8gMjAuMi4yLjE0IE1hdGguZXhwbTEoeClcbiAgZXhwbTE6IGV4cG0xLFxuICAvLyAyMC4yLjIuMTYgTWF0aC5mcm91bmQoeClcbiAgZnJvdW5kOiBmdW5jdGlvbiBmcm91bmQoeCl7XG4gICAgdmFyICRhYnMgID0gYWJzKHgpXG4gICAgICAsICRzaWduID0gc2lnbih4KVxuICAgICAgLCBhLCByZXN1bHQ7XG4gICAgaWYoJGFicyA8IE1JTjMyKXJldHVybiAkc2lnbiAqIHJvdW5kVGllc1RvRXZlbigkYWJzIC8gTUlOMzIgLyBFUFNJTE9OMzIpICogTUlOMzIgKiBFUFNJTE9OMzI7XG4gICAgYSA9ICgxICsgRVBTSUxPTjMyIC8gRVBTSUxPTikgKiAkYWJzO1xuICAgIHJlc3VsdCA9IGEgLSAoYSAtICRhYnMpO1xuICAgIGlmKHJlc3VsdCA+IE1BWDMyIHx8IHJlc3VsdCAhPSByZXN1bHQpcmV0dXJuICRzaWduICogSW5maW5pdHk7XG4gICAgcmV0dXJuICRzaWduICogcmVzdWx0O1xuICB9LFxuICAvLyAyMC4yLjIuMTcgTWF0aC5oeXBvdChbdmFsdWUxWywgdmFsdWUyWywg4oCmIF1dXSlcbiAgaHlwb3Q6IGZ1bmN0aW9uIGh5cG90KHZhbHVlMSwgdmFsdWUyKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHZhciBzdW0gID0gMFxuICAgICAgLCBpICAgID0gMFxuICAgICAgLCBsZW4gID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBsYXJnID0gMFxuICAgICAgLCBhcmcsIGRpdjtcbiAgICB3aGlsZShpIDwgbGVuKXtcbiAgICAgIGFyZyA9IGFicyhhcmd1bWVudHNbaSsrXSk7XG4gICAgICBpZihsYXJnIDwgYXJnKXtcbiAgICAgICAgZGl2ICA9IGxhcmcgLyBhcmc7XG4gICAgICAgIHN1bSAgPSBzdW0gKiBkaXYgKiBkaXYgKyAxO1xuICAgICAgICBsYXJnID0gYXJnO1xuICAgICAgfSBlbHNlIGlmKGFyZyA+IDApe1xuICAgICAgICBkaXYgID0gYXJnIC8gbGFyZztcbiAgICAgICAgc3VtICs9IGRpdiAqIGRpdjtcbiAgICAgIH0gZWxzZSBzdW0gKz0gYXJnO1xuICAgIH1cbiAgICByZXR1cm4gbGFyZyA9PT0gSW5maW5pdHkgPyBJbmZpbml0eSA6IGxhcmcgKiBzcXJ0KHN1bSk7XG4gIH0sXG4gIC8vIDIwLjIuMi4xOCBNYXRoLmltdWwoeCwgeSlcbiAgaW11bDogZnVuY3Rpb24gaW11bCh4LCB5KXtcbiAgICB2YXIgVUludDE2ID0gMHhmZmZmXG4gICAgICAsIHhuID0gK3hcbiAgICAgICwgeW4gPSAreVxuICAgICAgLCB4bCA9IFVJbnQxNiAmIHhuXG4gICAgICAsIHlsID0gVUludDE2ICYgeW47XG4gICAgcmV0dXJuIDAgfCB4bCAqIHlsICsgKChVSW50MTYgJiB4biA+Pj4gMTYpICogeWwgKyB4bCAqIChVSW50MTYgJiB5biA+Pj4gMTYpIDw8IDE2ID4+PiAwKTtcbiAgfSxcbiAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcbiAgbG9nMXA6IGZ1bmN0aW9uIGxvZzFwKHgpe1xuICAgIHJldHVybiAoeCA9ICt4KSA+IC0xZS04ICYmIHggPCAxZS04ID8geCAtIHggKiB4IC8gMiA6IGxvZygxICsgeCk7XG4gIH0sXG4gIC8vIDIwLjIuMi4yMSBNYXRoLmxvZzEwKHgpXG4gIGxvZzEwOiBmdW5jdGlvbiBsb2cxMCh4KXtcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xuICB9LFxuICAvLyAyMC4yLjIuMjIgTWF0aC5sb2cyKHgpXG4gIGxvZzI6IGZ1bmN0aW9uIGxvZzIoeCl7XG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xuICB9LFxuICAvLyAyMC4yLjIuMjggTWF0aC5zaWduKHgpXG4gIHNpZ246IHNpZ24sXG4gIC8vIDIwLjIuMi4zMCBNYXRoLnNpbmgoeClcbiAgc2luaDogZnVuY3Rpb24gc2luaCh4KXtcbiAgICByZXR1cm4gYWJzKHggPSAreCkgPCAxID8gKGV4cG0xKHgpIC0gZXhwbTEoLXgpKSAvIDIgOiAoZXhwKHggLSAxKSAtIGV4cCgteCAtIDEpKSAqIChFIC8gMik7XG4gIH0sXG4gIC8vIDIwLjIuMi4zMyBNYXRoLnRhbmgoeClcbiAgdGFuaDogZnVuY3Rpb24gdGFuaCh4KXtcbiAgICB2YXIgYSA9IGV4cG0xKHggPSAreClcbiAgICAgICwgYiA9IGV4cG0xKC14KTtcbiAgICByZXR1cm4gYSA9PSBJbmZpbml0eSA/IDEgOiBiID09IEluZmluaXR5ID8gLTEgOiAoYSAtIGIpIC8gKGV4cCh4KSArIGV4cCgteCkpO1xuICB9LFxuICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxuICB0cnVuYzogZnVuY3Rpb24gdHJ1bmMoaXQpe1xuICAgIHJldHVybiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBpc09iamVjdCAgID0gJC5pc09iamVjdFxuICAsIGlzRnVuY3Rpb24gPSAkLmlzRnVuY3Rpb25cbiAgLCBOVU1CRVIgICAgID0gJ051bWJlcidcbiAgLCAkTnVtYmVyICAgID0gJC5nW05VTUJFUl1cbiAgLCBCYXNlICAgICAgID0gJE51bWJlclxuICAsIHByb3RvICAgICAgPSAkTnVtYmVyLnByb3RvdHlwZTtcbmZ1bmN0aW9uIHRvUHJpbWl0aXZlKGl0KXtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC52YWx1ZU9mKSAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKGlzRnVuY3Rpb24oZm4gPSBpdC50b1N0cmluZykgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XG59XG5mdW5jdGlvbiB0b051bWJlcihpdCl7XG4gIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcbiAgaWYodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIgJiYgaXQuY2hhckNvZGVBdCgwKSA9PSA0OCl7XG4gICAgdmFyIGJpbmFyeSA9IGZhbHNlO1xuICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcbiAgICAgIGNhc2UgNjYgOiBjYXNlIDk4ICA6IGJpbmFyeSA9IHRydWU7XG4gICAgICBjYXNlIDc5IDogY2FzZSAxMTEgOiByZXR1cm4gcGFyc2VJbnQoaXQuc2xpY2UoMiksIGJpbmFyeSA/IDIgOiA4KTtcbiAgICB9XG4gIH0gcmV0dXJuICtpdDtcbn1cbmlmKCQuRlcgJiYgISgkTnVtYmVyKCcwbzEnKSAmJiAkTnVtYmVyKCcwYjEnKSkpe1xuICAkTnVtYmVyID0gZnVuY3Rpb24gTnVtYmVyKGl0KXtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mICROdW1iZXIgPyBuZXcgQmFzZSh0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xuICB9O1xuICAkLmVhY2guY2FsbCgkLkRFU0MgPyAkLmdldE5hbWVzKEJhc2UpIDogKFxuICAgICAgLy8gRVMzOlxuICAgICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgICAgLy8gRVM2IChpbiBjYXNlLCBpZiBtb2R1bGVzIHdpdGggRVM2IE51bWJlciBzdGF0aWNzIHJlcXVpcmVkIGJlZm9yZSk6XG4gICAgICAnRVBTSUxPTixpc0Zpbml0ZSxpc0ludGVnZXIsaXNOYU4saXNTYWZlSW50ZWdlcixNQVhfU0FGRV9JTlRFR0VSLCcgK1xuICAgICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXG4gICAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihrZXkpe1xuICAgICAgaWYoJC5oYXMoQmFzZSwga2V5KSAmJiAhJC5oYXMoJE51bWJlciwga2V5KSl7XG4gICAgICAgICQuc2V0RGVzYygkTnVtYmVyLCBrZXksICQuZ2V0RGVzYyhCYXNlLCBrZXkpKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG4gICROdW1iZXIucHJvdG90eXBlID0gcHJvdG87XG4gIHByb3RvLmNvbnN0cnVjdG9yID0gJE51bWJlcjtcbiAgcmVxdWlyZSgnLi8kLnJlZGVmJykoJC5nLCBOVU1CRVIsICROdW1iZXIpO1xufSIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBhYnMgICA9IE1hdGguYWJzXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXG4gICwgX2lzRmluaXRlID0gJC5nLmlzRmluaXRlXG4gICwgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmY7IC8vIHBvdygyLCA1MykgLSAxID09IDkwMDcxOTkyNTQ3NDA5OTE7XG5mdW5jdGlvbiBpc0ludGVnZXIoaXQpe1xuICByZXR1cm4gISQuaXNPYmplY3QoaXQpICYmIF9pc0Zpbml0ZShpdCkgJiYgZmxvb3IoaXQpID09PSBpdDtcbn1cbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xuICAvLyAyMC4xLjIuMSBOdW1iZXIuRVBTSUxPTlxuICBFUFNJTE9OOiBNYXRoLnBvdygyLCAtNTIpLFxuICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxuICBpc0Zpbml0ZTogZnVuY3Rpb24gaXNGaW5pdGUoaXQpe1xuICAgIHJldHVybiB0eXBlb2YgaXQgPT0gJ251bWJlcicgJiYgX2lzRmluaXRlKGl0KTtcbiAgfSxcbiAgLy8gMjAuMS4yLjMgTnVtYmVyLmlzSW50ZWdlcihudW1iZXIpXG4gIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxuICAvLyAyMC4xLjIuNCBOdW1iZXIuaXNOYU4obnVtYmVyKVxuICBpc05hTjogZnVuY3Rpb24gaXNOYU4obnVtYmVyKXtcbiAgICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcbiAgfSxcbiAgLy8gMjAuMS4yLjUgTnVtYmVyLmlzU2FmZUludGVnZXIobnVtYmVyKVxuICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbiBpc1NhZmVJbnRlZ2VyKG51bWJlcil7XG4gICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG4gIH0sXG4gIC8vIDIwLjEuMi42IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG4gIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXG4gIC8vIDIwLjEuMi4xMCBOdW1iZXIuTUlOX1NBRkVfSU5URUdFUlxuICBNSU5fU0FGRV9JTlRFR0VSOiAtTUFYX1NBRkVfSU5URUdFUixcbiAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcbiAgcGFyc2VGbG9hdDogcGFyc2VGbG9hdCxcbiAgLy8gMjAuMS4yLjEzIE51bWJlci5wYXJzZUludChzdHJpbmcsIHJhZGl4KVxuICBwYXJzZUludDogcGFyc2VJbnRcbn0pOyIsIi8vIDE5LjEuMy4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UpXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwiLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIGlzOiByZXF1aXJlKCcuLyQuc2FtZScpXG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG4kZGVmKCRkZWYuUywgJ09iamVjdCcsIHtzZXRQcm90b3R5cGVPZjogcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldH0pOyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3Q7XG4kLmVhY2guY2FsbCgoJ2ZyZWV6ZSxzZWFsLHByZXZlbnRFeHRlbnNpb25zLGlzRnJvemVuLGlzU2VhbGVkLGlzRXh0ZW5zaWJsZSwnICtcbiAgJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcixnZXRQcm90b3R5cGVPZixrZXlzLGdldE93blByb3BlcnR5TmFtZXMnKS5zcGxpdCgnLCcpXG4sIGZ1bmN0aW9uKEtFWSwgSUQpe1xuICB2YXIgZm4gICAgID0gKCQuY29yZS5PYmplY3QgfHwge30pW0tFWV0gfHwgT2JqZWN0W0tFWV1cbiAgICAsIGZvcmNlZCA9IDBcbiAgICAsIG1ldGhvZCA9IHt9O1xuICBtZXRob2RbS0VZXSA9IElEID09IDAgPyBmdW5jdGlvbiBmcmVlemUoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDEgPyBmdW5jdGlvbiBzZWFsKGl0KXtcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogaXQ7XG4gIH0gOiBJRCA9PSAyID8gZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnMoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiBpdDtcbiAgfSA6IElEID09IDMgPyBmdW5jdGlvbiBpc0Zyb3plbihpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IHRydWU7XG4gIH0gOiBJRCA9PSA0ID8gZnVuY3Rpb24gaXNTZWFsZWQoaXQpe1xuICAgIHJldHVybiBpc09iamVjdChpdCkgPyBmbihpdCkgOiB0cnVlO1xuICB9IDogSUQgPT0gNSA/IGZ1bmN0aW9uIGlzRXh0ZW5zaWJsZShpdCl7XG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGZhbHNlO1xuICB9IDogSUQgPT0gNiA/IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpLCBrZXkpO1xuICB9IDogSUQgPT0gNyA/IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcbiAgICByZXR1cm4gZm4oT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZChpdCkpKTtcbiAgfSA6IElEID09IDggPyBmdW5jdGlvbiBrZXlzKGl0KXtcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcbiAgfSA6IHJlcXVpcmUoJy4vJC5nZXQtbmFtZXMnKS5nZXQ7XG4gIHRyeSB7XG4gICAgZm4oJ3onKTtcbiAgfSBjYXRjaChlKXtcbiAgICBmb3JjZWQgPSAxO1xuICB9XG4gICRkZWYoJGRlZi5TICsgJGRlZi5GICogZm9yY2VkLCAnT2JqZWN0JywgbWV0aG9kKTtcbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsIHRtcCA9IHt9O1xudG1wW3JlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKV0gPSAneic7XG5pZihyZXF1aXJlKCcuLyQnKS5GVyAmJiBjb2YodG1wKSAhPSAneicpe1xuICByZXF1aXJlKCcuLyQucmVkZWYnKShPYmplY3QucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiAnW29iamVjdCAnICsgY29mLmNsYXNzb2YodGhpcykgKyAnXSc7XG4gIH0sIHRydWUpO1xufSIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY3R4ICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBjb2YgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgYXNzZXJ0ICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcbiAgLCBmb3JPZiAgICA9IHJlcXVpcmUoJy4vJC5mb3Itb2YnKVxuICAsIHNldFByb3RvID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldFxuICAsIHNhbWUgICAgID0gcmVxdWlyZSgnLi8kLnNhbWUnKVxuICAsIHNwZWNpZXMgID0gcmVxdWlyZSgnLi8kLnNwZWNpZXMnKVxuICAsIFNQRUNJRVMgID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJylcbiAgLCBSRUNPUkQgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdyZWNvcmQnKVxuICAsIFBST01JU0UgID0gJ1Byb21pc2UnXG4gICwgZ2xvYmFsICAgPSAkLmdcbiAgLCBwcm9jZXNzICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgYXNhcCAgICAgPSBwcm9jZXNzICYmIHByb2Nlc3MubmV4dFRpY2sgfHwgcmVxdWlyZSgnLi8kLnRhc2snKS5zZXRcbiAgLCBQICAgICAgICA9IGdsb2JhbFtQUk9NSVNFXVxuICAsIGlzRnVuY3Rpb24gICAgID0gJC5pc0Z1bmN0aW9uXG4gICwgaXNPYmplY3QgICAgICAgPSAkLmlzT2JqZWN0XG4gICwgYXNzZXJ0RnVuY3Rpb24gPSBhc3NlcnQuZm5cbiAgLCBhc3NlcnRPYmplY3QgICA9IGFzc2VydC5vYmpcbiAgLCBXcmFwcGVyO1xuXG5mdW5jdGlvbiB0ZXN0UmVzb2x2ZShzdWIpe1xuICB2YXIgdGVzdCA9IG5ldyBQKGZ1bmN0aW9uKCl7fSk7XG4gIGlmKHN1Yil0ZXN0LmNvbnN0cnVjdG9yID0gT2JqZWN0O1xuICByZXR1cm4gUC5yZXNvbHZlKHRlc3QpID09PSB0ZXN0O1xufVxuXG52YXIgdXNlTmF0aXZlID0gZnVuY3Rpb24oKXtcbiAgdmFyIHdvcmtzID0gZmFsc2U7XG4gIGZ1bmN0aW9uIFAyKHgpe1xuICAgIHZhciBzZWxmID0gbmV3IFAoeCk7XG4gICAgc2V0UHJvdG8oc2VsZiwgUDIucHJvdG90eXBlKTtcbiAgICByZXR1cm4gc2VsZjtcbiAgfVxuICB0cnkge1xuICAgIHdvcmtzID0gaXNGdW5jdGlvbihQKSAmJiBpc0Z1bmN0aW9uKFAucmVzb2x2ZSkgJiYgdGVzdFJlc29sdmUoKTtcbiAgICBzZXRQcm90byhQMiwgUCk7XG4gICAgUDIucHJvdG90eXBlID0gJC5jcmVhdGUoUC5wcm90b3R5cGUsIHtjb25zdHJ1Y3Rvcjoge3ZhbHVlOiBQMn19KTtcbiAgICAvLyBhY3R1YWwgRmlyZWZveCBoYXMgYnJva2VuIHN1YmNsYXNzIHN1cHBvcnQsIHRlc3QgdGhhdFxuICAgIGlmKCEoUDIucmVzb2x2ZSg1KS50aGVuKGZ1bmN0aW9uKCl7fSkgaW5zdGFuY2VvZiBQMikpe1xuICAgICAgd29ya3MgPSBmYWxzZTtcbiAgICB9XG4gICAgLy8gYWN0dWFsIFY4IGJ1ZywgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTQxNjJcbiAgICBpZih3b3JrcyAmJiAkLkRFU0Mpe1xuICAgICAgdmFyIHRoZW5hYmxlVGhlbkdvdHRlbiA9IGZhbHNlO1xuICAgICAgUC5yZXNvbHZlKCQuc2V0RGVzYyh7fSwgJ3RoZW4nLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgdGhlbmFibGVUaGVuR290dGVuID0gdHJ1ZTsgfVxuICAgICAgfSkpO1xuICAgICAgd29ya3MgPSB0aGVuYWJsZVRoZW5Hb3R0ZW47XG4gICAgfVxuICB9IGNhdGNoKGUpeyB3b3JrcyA9IGZhbHNlOyB9XG4gIHJldHVybiB3b3Jrcztcbn0oKTtcblxuLy8gaGVscGVyc1xuZnVuY3Rpb24gaXNQcm9taXNlKGl0KXtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiAodXNlTmF0aXZlID8gY29mLmNsYXNzb2YoaXQpID09ICdQcm9taXNlJyA6IFJFQ09SRCBpbiBpdCk7XG59XG5mdW5jdGlvbiBzYW1lQ29uc3RydWN0b3IoYSwgYil7XG4gIC8vIGxpYnJhcnkgd3JhcHBlciBzcGVjaWFsIGNhc2VcbiAgaWYoISQuRlcgJiYgYSA9PT0gUCAmJiBiID09PSBXcmFwcGVyKXJldHVybiB0cnVlO1xuICByZXR1cm4gc2FtZShhLCBiKTtcbn1cbmZ1bmN0aW9uIGdldENvbnN0cnVjdG9yKEMpe1xuICB2YXIgUyA9IGFzc2VydE9iamVjdChDKVtTUEVDSUVTXTtcbiAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XG59XG5mdW5jdGlvbiBpc1RoZW5hYmxlKGl0KXtcbiAgdmFyIHRoZW47XG4gIGlmKGlzT2JqZWN0KGl0KSl0aGVuID0gaXQudGhlbjtcbiAgcmV0dXJuIGlzRnVuY3Rpb24odGhlbikgPyB0aGVuIDogZmFsc2U7XG59XG5mdW5jdGlvbiBub3RpZnkocmVjb3JkKXtcbiAgdmFyIGNoYWluID0gcmVjb3JkLmM7XG4gIGlmKGNoYWluLmxlbmd0aClhc2FwKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHZhbHVlID0gcmVjb3JkLnZcbiAgICAgICwgb2sgICAgPSByZWNvcmQucyA9PSAxXG4gICAgICAsIGkgICAgID0gMDtcbiAgICBmdW5jdGlvbiBydW4ocmVhY3Qpe1xuICAgICAgdmFyIGNiID0gb2sgPyByZWFjdC5vayA6IHJlYWN0LmZhaWxcbiAgICAgICAgLCByZXQsIHRoZW47XG4gICAgICB0cnkge1xuICAgICAgICBpZihjYil7XG4gICAgICAgICAgaWYoIW9rKXJlY29yZC5oID0gdHJ1ZTtcbiAgICAgICAgICByZXQgPSBjYiA9PT0gdHJ1ZSA/IHZhbHVlIDogY2IodmFsdWUpO1xuICAgICAgICAgIGlmKHJldCA9PT0gcmVhY3QuUCl7XG4gICAgICAgICAgICByZWFjdC5yZWooVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xuICAgICAgICAgIH0gZWxzZSBpZih0aGVuID0gaXNUaGVuYWJsZShyZXQpKXtcbiAgICAgICAgICAgIHRoZW4uY2FsbChyZXQsIHJlYWN0LnJlcywgcmVhY3QucmVqKTtcbiAgICAgICAgICB9IGVsc2UgcmVhY3QucmVzKHJldCk7XG4gICAgICAgIH0gZWxzZSByZWFjdC5yZWoodmFsdWUpO1xuICAgICAgfSBjYXRjaChlcnIpe1xuICAgICAgICByZWFjdC5yZWooZXJyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSlydW4oY2hhaW5baSsrXSk7IC8vIHZhcmlhYmxlIGxlbmd0aCAtIGNhbid0IHVzZSBmb3JFYWNoXG4gICAgY2hhaW4ubGVuZ3RoID0gMDtcbiAgfSk7XG59XG5mdW5jdGlvbiBpc1VuaGFuZGxlZChwcm9taXNlKXtcbiAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxuICAgICwgY2hhaW4gID0gcmVjb3JkLmEgfHwgcmVjb3JkLmNcbiAgICAsIGkgICAgICA9IDBcbiAgICAsIHJlYWN0O1xuICBpZihyZWNvcmQuaClyZXR1cm4gZmFsc2U7XG4gIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpe1xuICAgIHJlYWN0ID0gY2hhaW5baSsrXTtcbiAgICBpZihyZWFjdC5mYWlsIHx8ICFpc1VuaGFuZGxlZChyZWFjdC5QKSlyZXR1cm4gZmFsc2U7XG4gIH0gcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiAkcmVqZWN0KHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXNcbiAgICAsIHByb21pc2U7XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICByZWNvcmQudiA9IHZhbHVlO1xuICByZWNvcmQucyA9IDI7XG4gIHJlY29yZC5hID0gcmVjb3JkLmMuc2xpY2UoKTtcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIGFzYXAoZnVuY3Rpb24oKXtcbiAgICAgIGlmKGlzVW5oYW5kbGVkKHByb21pc2UgPSByZWNvcmQucCkpe1xuICAgICAgICBpZihjb2YocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcbiAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGlmKGdsb2JhbC5jb25zb2xlICYmIGlzRnVuY3Rpb24oY29uc29sZS5lcnJvcikpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmVjb3JkLmEgPSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gIH0sIDEpO1xuICBub3RpZnkocmVjb3JkKTtcbn1cbmZ1bmN0aW9uICRyZXNvbHZlKHZhbHVlKXtcbiAgdmFyIHJlY29yZCA9IHRoaXNcbiAgICAsIHRoZW47XG4gIGlmKHJlY29yZC5kKXJldHVybjtcbiAgcmVjb3JkLmQgPSB0cnVlO1xuICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICBhc2FwKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgoJHJlc29sdmUsIHdyYXBwZXIsIDEpLCBjdHgoJHJlamVjdCwgd3JhcHBlciwgMSkpO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICRyZWplY3QuY2FsbCh3cmFwcGVyLCBlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlY29yZC52ID0gdmFsdWU7XG4gICAgICByZWNvcmQucyA9IDE7XG4gICAgICBub3RpZnkocmVjb3JkKTtcbiAgICB9XG4gIH0gY2F0Y2goZSl7XG4gICAgJHJlamVjdC5jYWxsKHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZSk7IC8vIHdyYXBcbiAgfVxufVxuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYoIXVzZU5hdGl2ZSl7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gIFAgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKXtcbiAgICBhc3NlcnRGdW5jdGlvbihleGVjdXRvcik7XG4gICAgdmFyIHJlY29yZCA9IHtcbiAgICAgIHA6IGFzc2VydC5pbnN0KHRoaXMsIFAsIFBST01JU0UpLCAgICAgICAvLyA8LSBwcm9taXNlXG4gICAgICBjOiBbXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gYXdhaXRpbmcgcmVhY3Rpb25zXG4gICAgICBhOiB1bmRlZmluZWQsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcbiAgICAgIHM6IDAsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBzdGF0ZVxuICAgICAgZDogZmFsc2UsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGRvbmVcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxuICAgICAgaDogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGhhbmRsZWQgcmVqZWN0aW9uXG4gICAgfTtcbiAgICAkLmhpZGUodGhpcywgUkVDT1JELCByZWNvcmQpO1xuICAgIHRyeSB7XG4gICAgICBleGVjdXRvcihjdHgoJHJlc29sdmUsIHJlY29yZCwgMSksIGN0eCgkcmVqZWN0LCByZWNvcmQsIDEpKTtcbiAgICB9IGNhdGNoKGVycil7XG4gICAgICAkcmVqZWN0LmNhbGwocmVjb3JkLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgcmVxdWlyZSgnLi8kLm1peCcpKFAucHJvdG90eXBlLCB7XG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcbiAgICAgIHZhciBTID0gYXNzZXJ0T2JqZWN0KGFzc2VydE9iamVjdCh0aGlzKS5jb25zdHJ1Y3RvcilbU1BFQ0lFU107XG4gICAgICB2YXIgcmVhY3QgPSB7XG4gICAgICAgIG9rOiAgIGlzRnVuY3Rpb24ob25GdWxmaWxsZWQpID8gb25GdWxmaWxsZWQgOiB0cnVlLFxuICAgICAgICBmYWlsOiBpc0Z1bmN0aW9uKG9uUmVqZWN0ZWQpICA/IG9uUmVqZWN0ZWQgIDogZmFsc2VcbiAgICAgIH07XG4gICAgICB2YXIgcHJvbWlzZSA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFApKGZ1bmN0aW9uKHJlcywgcmVqKXtcbiAgICAgICAgcmVhY3QucmVzID0gYXNzZXJ0RnVuY3Rpb24ocmVzKTtcbiAgICAgICAgcmVhY3QucmVqID0gYXNzZXJ0RnVuY3Rpb24ocmVqKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHJlY29yZCA9IHRoaXNbUkVDT1JEXTtcbiAgICAgIHJlY29yZC5jLnB1c2gocmVhY3QpO1xuICAgICAgaWYocmVjb3JkLmEpcmVjb3JkLmEucHVzaChyZWFjdCk7XG4gICAgICBpZihyZWNvcmQucylub3RpZnkocmVjb3JkKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH0sXG4gICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBleHBvcnRcbiRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogIXVzZU5hdGl2ZSwge1Byb21pc2U6IFB9KTtcbmNvZi5zZXQoUCwgUFJPTUlTRSk7XG5zcGVjaWVzKFApO1xuc3BlY2llcyhXcmFwcGVyID0gJC5jb3JlW1BST01JU0VdKTtcblxuLy8gc3RhdGljc1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC41IFByb21pc2UucmVqZWN0KHIpXG4gIHJlamVjdDogZnVuY3Rpb24gcmVqZWN0KHIpe1xuICAgIHJldHVybiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXMsIHJlail7IHJlaihyKTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoIXVzZU5hdGl2ZSB8fCB0ZXN0UmVzb2x2ZSh0cnVlKSksIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjYgUHJvbWlzZS5yZXNvbHZlKHgpXG4gIHJlc29sdmU6IGZ1bmN0aW9uIHJlc29sdmUoeCl7XG4gICAgcmV0dXJuIGlzUHJvbWlzZSh4KSAmJiBzYW1lQ29uc3RydWN0b3IoeC5jb25zdHJ1Y3RvciwgdGhpcylcbiAgICAgID8geCA6IG5ldyB0aGlzKGZ1bmN0aW9uKHJlcyl7IHJlcyh4KTsgfSk7XG4gIH1cbn0pO1xuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhKHVzZU5hdGl2ZSAmJiByZXF1aXJlKCcuLyQuaXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgUC5hbGwoaXRlcilbJ2NhdGNoJ10oZnVuY3Rpb24oKXt9KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxuICAgICAgLCB2YWx1ZXMgPSBbXTtcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzLCByZWope1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCB2YWx1ZXMucHVzaCwgdmFsdWVzKTtcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXG4gICAgICAgICwgcmVzdWx0cyAgID0gQXJyYXkocmVtYWluaW5nKTtcbiAgICAgIGlmKHJlbWFpbmluZykkLmVhY2guY2FsbCh2YWx1ZXMsIGZ1bmN0aW9uKHByb21pc2UsIGluZGV4KXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzKHJlc3VsdHMpO1xuICAgICAgICB9LCByZWopO1xuICAgICAgfSk7XG4gICAgICBlbHNlIHJlcyhyZXN1bHRzKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyA9IGdldENvbnN0cnVjdG9yKHRoaXMpO1xuICAgIHJldHVybiBuZXcgQyhmdW5jdGlvbihyZXMsIHJlail7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXMsIHJlaik7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufSk7IiwidmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgc2V0UHJvdG8gID0gcmVxdWlyZSgnLi8kLnNldC1wcm90bycpXG4gICwgJGl0ZXIgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vJC53a3MnKSgnaXRlcmF0b3InKVxuICAsIElURVIgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcbiAgLCBzdGVwICAgICAgPSAkaXRlci5zdGVwXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXG4gICwgaXNPYmplY3QgID0gJC5pc09iamVjdFxuICAsIGdldFByb3RvICA9ICQuZ2V0UHJvdG9cbiAgLCAkUmVmbGVjdCAgPSAkLmcuUmVmbGVjdFxuICAsIF9hcHBseSAgICA9IEZ1bmN0aW9uLmFwcGx5XG4gICwgYXNzZXJ0T2JqZWN0ID0gYXNzZXJ0Lm9ialxuICAsIF9pc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgX3ByZXZlbnRFeHRlbnNpb25zID0gT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zXG4gIC8vIElFIFRQIGhhcyBicm9rZW4gUmVmbGVjdC5lbnVtZXJhdGVcbiAgLCBidWdneUVudW1lcmF0ZSA9ICEoJFJlZmxlY3QgJiYgJFJlZmxlY3QuZW51bWVyYXRlICYmIElURVJBVE9SIGluICRSZWZsZWN0LmVudW1lcmF0ZSh7fSkpO1xuXG5mdW5jdGlvbiBFbnVtZXJhdGUoaXRlcmF0ZWQpe1xuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGs6IHVuZGVmaW5lZCwgaTogMH0pO1xufVxuJGl0ZXIuY3JlYXRlKEVudW1lcmF0ZSwgJ09iamVjdCcsIGZ1bmN0aW9uKCl7XG4gIHZhciBpdGVyID0gdGhpc1tJVEVSXVxuICAgICwga2V5cyA9IGl0ZXIua1xuICAgICwga2V5O1xuICBpZihrZXlzID09IHVuZGVmaW5lZCl7XG4gICAgaXRlci5rID0ga2V5cyA9IFtdO1xuICAgIGZvcihrZXkgaW4gaXRlci5vKWtleXMucHVzaChrZXkpO1xuICB9XG4gIGRvIHtcbiAgICBpZihpdGVyLmkgPj0ga2V5cy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XG4gIH0gd2hpbGUoISgoa2V5ID0ga2V5c1tpdGVyLmkrK10pIGluIGl0ZXIubykpO1xuICByZXR1cm4gc3RlcCgwLCBrZXkpO1xufSk7XG5cbnZhciByZWZsZWN0ID0ge1xuICAvLyAyNi4xLjEgUmVmbGVjdC5hcHBseSh0YXJnZXQsIHRoaXNBcmd1bWVudCwgYXJndW1lbnRzTGlzdClcbiAgYXBwbHk6IGZ1bmN0aW9uIGFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KXtcbiAgICByZXR1cm4gX2FwcGx5LmNhbGwodGFyZ2V0LCB0aGlzQXJndW1lbnQsIGFyZ3VtZW50c0xpc3QpO1xuICB9LFxuICAvLyAyNi4xLjIgUmVmbGVjdC5jb25zdHJ1Y3QodGFyZ2V0LCBhcmd1bWVudHNMaXN0IFssIG5ld1RhcmdldF0pXG4gIGNvbnN0cnVjdDogZnVuY3Rpb24gY29uc3RydWN0KHRhcmdldCwgYXJndW1lbnRzTGlzdCAvKiwgbmV3VGFyZ2V0Ki8pe1xuICAgIHZhciBwcm90byAgICA9IGFzc2VydC5mbihhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXSkucHJvdG90eXBlXG4gICAgICAsIGluc3RhbmNlID0gJC5jcmVhdGUoaXNPYmplY3QocHJvdG8pID8gcHJvdG8gOiBPYmplY3QucHJvdG90eXBlKVxuICAgICAgLCByZXN1bHQgICA9IF9hcHBseS5jYWxsKHRhcmdldCwgaW5zdGFuY2UsIGFyZ3VtZW50c0xpc3QpO1xuICAgIHJldHVybiBpc09iamVjdChyZXN1bHQpID8gcmVzdWx0IDogaW5zdGFuY2U7XG4gIH0sXG4gIC8vIDI2LjEuMyBSZWZsZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpXG4gIGRlZmluZVByb3BlcnR5OiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5LCBhdHRyaWJ1dGVzKXtcbiAgICBhc3NlcnRPYmplY3QodGFyZ2V0KTtcbiAgICB0cnkge1xuICAgICAgJC5zZXREZXNjKHRhcmdldCwgcHJvcGVydHlLZXksIGF0dHJpYnV0ZXMpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0sXG4gIC8vIDI2LjEuNCBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcGVydHlLZXkpXG4gIGRlbGV0ZVByb3BlcnR5OiBmdW5jdGlvbiBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5KXtcbiAgICB2YXIgZGVzYyA9ICQuZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xuICAgIHJldHVybiBkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSA/IGZhbHNlIDogZGVsZXRlIHRhcmdldFtwcm9wZXJ0eUtleV07XG4gIH0sXG4gIC8vIDI2LjEuNiBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3BlcnR5S2V5IFssIHJlY2VpdmVyXSlcbiAgZ2V0OiBmdW5jdGlvbiBnZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcbiAgICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXVxuICAgICAgLCBkZXNjID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSksIHByb3RvO1xuICAgIGlmKGRlc2MpcmV0dXJuICQuaGFzKGRlc2MsICd2YWx1ZScpXG4gICAgICA/IGRlc2MudmFsdWVcbiAgICAgIDogZGVzYy5nZXQgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xuICAgIHJldHVybiBpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpXG4gICAgICA/IGdldChwcm90bywgcHJvcGVydHlLZXksIHJlY2VpdmVyKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH0sXG4gIC8vIDI2LjEuNyBSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIHByb3BlcnR5S2V5KXtcbiAgICByZXR1cm4gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSk7XG4gIH0sXG4gIC8vIDI2LjEuOCBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldClcbiAgZ2V0UHJvdG90eXBlT2Y6IGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKHRhcmdldCl7XG4gICAgcmV0dXJuIGdldFByb3RvKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcbiAgfSxcbiAgLy8gMjYuMS45IFJlZmxlY3QuaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpXG4gIGhhczogZnVuY3Rpb24gaGFzKHRhcmdldCwgcHJvcGVydHlLZXkpe1xuICAgIHJldHVybiBwcm9wZXJ0eUtleSBpbiB0YXJnZXQ7XG4gIH0sXG4gIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxuICBpc0V4dGVuc2libGU6IGZ1bmN0aW9uIGlzRXh0ZW5zaWJsZSh0YXJnZXQpe1xuICAgIHJldHVybiBfaXNFeHRlbnNpYmxlKGFzc2VydE9iamVjdCh0YXJnZXQpKTtcbiAgfSxcbiAgLy8gMjYuMS4xMSBSZWZsZWN0Lm93bktleXModGFyZ2V0KVxuICBvd25LZXlzOiByZXF1aXJlKCcuLyQub3duLWtleXMnKSxcbiAgLy8gMjYuMS4xMiBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRhcmdldClcbiAgcHJldmVudEV4dGVuc2lvbnM6IGZ1bmN0aW9uIHByZXZlbnRFeHRlbnNpb25zKHRhcmdldCl7XG4gICAgYXNzZXJ0T2JqZWN0KHRhcmdldCk7XG4gICAgdHJ5IHtcbiAgICAgIGlmKF9wcmV2ZW50RXh0ZW5zaW9ucylfcHJldmVudEV4dGVuc2lvbnModGFyZ2V0KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9LFxuICAvLyAyNi4xLjEzIFJlZmxlY3Quc2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYgWywgcmVjZWl2ZXJdKVxuICBzZXQ6IGZ1bmN0aW9uIHNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWLyosIHJlY2VpdmVyKi8pe1xuICAgIHZhciByZWNlaXZlciA9IGFyZ3VtZW50cy5sZW5ndGggPCA0ID8gdGFyZ2V0IDogYXJndW1lbnRzWzNdXG4gICAgICAsIG93bkRlc2MgID0gJC5nZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcbiAgICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcbiAgICBpZighb3duRGVzYyl7XG4gICAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpKXtcbiAgICAgICAgcmV0dXJuIHNldChwcm90bywgcHJvcGVydHlLZXksIFYsIHJlY2VpdmVyKTtcbiAgICAgIH1cbiAgICAgIG93bkRlc2MgPSAkLmRlc2MoMCk7XG4gICAgfVxuICAgIGlmKCQuaGFzKG93bkRlc2MsICd2YWx1ZScpKXtcbiAgICAgIGlmKG93bkRlc2Mud3JpdGFibGUgPT09IGZhbHNlIHx8ICFpc09iamVjdChyZWNlaXZlcikpcmV0dXJuIGZhbHNlO1xuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yID0gJC5nZXREZXNjKHJlY2VpdmVyLCBwcm9wZXJ0eUtleSkgfHwgJC5kZXNjKDApO1xuICAgICAgZXhpc3RpbmdEZXNjcmlwdG9yLnZhbHVlID0gVjtcbiAgICAgICQuc2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvcik7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIG93bkRlc2Muc2V0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IChvd25EZXNjLnNldC5jYWxsKHJlY2VpdmVyLCBWKSwgdHJ1ZSk7XG4gIH1cbn07XG4vLyAyNi4xLjE0IFJlZmxlY3Quc2V0UHJvdG90eXBlT2YodGFyZ2V0LCBwcm90bylcbmlmKHNldFByb3RvKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZih0YXJnZXQsIHByb3RvKXtcbiAgc2V0UHJvdG8uY2hlY2sodGFyZ2V0LCBwcm90byk7XG4gIHRyeSB7XG4gICAgc2V0UHJvdG8uc2V0KHRhcmdldCwgcHJvdG8pO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuJGRlZigkZGVmLkcsIHtSZWZsZWN0OiB7fX0pO1xuXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqIGJ1Z2d5RW51bWVyYXRlLCAnUmVmbGVjdCcsIHtcbiAgLy8gMjYuMS41IFJlZmxlY3QuZW51bWVyYXRlKHRhcmdldClcbiAgZW51bWVyYXRlOiBmdW5jdGlvbiBlbnVtZXJhdGUodGFyZ2V0KXtcbiAgICByZXR1cm4gbmV3IEVudW1lcmF0ZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XG4gIH1cbn0pO1xuXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCByZWZsZWN0KTsiLCJ2YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRSZWdFeHAgPSAkLmcuUmVnRXhwXG4gICwgQmFzZSAgICA9ICRSZWdFeHBcbiAgLCBwcm90byAgID0gJFJlZ0V4cC5wcm90b3R5cGVcbiAgLCByZSAgICAgID0gL2EvZ1xuICAvLyBcIm5ld1wiIGNyZWF0ZXMgYSBuZXcgb2JqZWN0XG4gICwgQ09SUkVDVF9ORVcgPSBuZXcgJFJlZ0V4cChyZSkgIT09IHJlXG4gIC8vIFJlZ0V4cCBhbGxvd3MgYSByZWdleCB3aXRoIGZsYWdzIGFzIHRoZSBwYXR0ZXJuXG4gICwgQUxMT1dTX1JFX1dJVEhfRkxBR1MgPSBmdW5jdGlvbigpe1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gJFJlZ0V4cChyZSwgJ2knKSA9PSAnL2EvaSc7XG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICB9KCk7XG5pZigkLkZXICYmICQuREVTQyl7XG4gIGlmKCFDT1JSRUNUX05FVyB8fCAhQUxMT1dTX1JFX1dJVEhfRkxBR1Mpe1xuICAgICRSZWdFeHAgPSBmdW5jdGlvbiBSZWdFeHAocGF0dGVybiwgZmxhZ3Mpe1xuICAgICAgdmFyIHBhdHRlcm5Jc1JlZ0V4cCAgPSBjb2YocGF0dGVybikgPT0gJ1JlZ0V4cCdcbiAgICAgICAgLCBmbGFnc0lzVW5kZWZpbmVkID0gZmxhZ3MgPT09IHVuZGVmaW5lZDtcbiAgICAgIGlmKCEodGhpcyBpbnN0YW5jZW9mICRSZWdFeHApICYmIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkKXJldHVybiBwYXR0ZXJuO1xuICAgICAgcmV0dXJuIENPUlJFQ1RfTkVXXG4gICAgICAgID8gbmV3IEJhc2UocGF0dGVybklzUmVnRXhwICYmICFmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5zb3VyY2UgOiBwYXR0ZXJuLCBmbGFncylcbiAgICAgICAgOiBuZXcgQmFzZShwYXR0ZXJuSXNSZWdFeHAgPyBwYXR0ZXJuLnNvdXJjZSA6IHBhdHRlcm5cbiAgICAgICAgICAsIHBhdHRlcm5Jc1JlZ0V4cCAmJiBmbGFnc0lzVW5kZWZpbmVkID8gcGF0dGVybi5mbGFncyA6IGZsYWdzKTtcbiAgICB9O1xuICAgICQuZWFjaC5jYWxsKCQuZ2V0TmFtZXMoQmFzZSksIGZ1bmN0aW9uKGtleSl7XG4gICAgICBrZXkgaW4gJFJlZ0V4cCB8fCAkLnNldERlc2MoJFJlZ0V4cCwga2V5LCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gQmFzZVtrZXldOyB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgQmFzZVtrZXldID0gaXQ7IH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gJFJlZ0V4cDtcbiAgICAkUmVnRXhwLnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHJlcXVpcmUoJy4vJC5yZWRlZicpKCQuZywgJ1JlZ0V4cCcsICRSZWdFeHApO1xuICB9XG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcbiAgaWYoLy4vZy5mbGFncyAhPSAnZycpJC5zZXREZXNjKHByb3RvLCAnZmxhZ3MnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxuICB9KTtcbn1cbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoJFJlZ0V4cCk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHN0cm9uZyA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXN0cm9uZycpO1xuXG4vLyAyMy4yIFNldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdTZXQnLCBmdW5jdGlvbihnZXQpe1xuICByZXR1cm4gZnVuY3Rpb24gU2V0KCl7IHJldHVybiBnZXQodGhpcywgYXJndW1lbnRzWzBdKTsgfTtcbn0sIHtcbiAgLy8gMjMuMi4zLjEgU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gc3Ryb25nLmRlZih0aGlzLCB2YWx1ZSA9IHZhbHVlID09PSAwID8gMCA6IHZhbHVlLCB2YWx1ZSk7XG4gIH1cbn0sIHN0cm9uZyk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKGZhbHNlKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuMyBTdHJpbmcucHJvdG90eXBlLmNvZGVQb2ludEF0KHBvcylcbiAgY29kZVBvaW50QXQ6IGZ1bmN0aW9uIGNvZGVQb2ludEF0KHBvcyl7XG4gICAgcmV0dXJuICRhdCh0aGlzLCBwb3MpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0xlbmd0aCA9ICQudG9MZW5ndGg7XG5cbi8vIHNob3VsZCB0aHJvdyBlcnJvciBvbiByZWdleFxuJGRlZigkZGVmLlAgKyAkZGVmLkYgKiAhcmVxdWlyZSgnLi8kLnRocm93cycpKGZ1bmN0aW9uKCl7ICdxJy5lbmRzV2l0aCgvLi8pOyB9KSwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjYgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aChzZWFyY2hTdHJpbmcgWywgZW5kUG9zaXRpb25dKVxuICBlbmRzV2l0aDogZnVuY3Rpb24gZW5kc1dpdGgoc2VhcmNoU3RyaW5nIC8qLCBlbmRQb3NpdGlvbiA9IEBsZW5ndGggKi8pe1xuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xuICAgIHZhciB0aGF0ID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcbiAgICAgICwgZW5kUG9zaXRpb24gPSBhcmd1bWVudHNbMV1cbiAgICAgICwgbGVuID0gdG9MZW5ndGgodGhhdC5sZW5ndGgpXG4gICAgICAsIGVuZCA9IGVuZFBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBsZW4gOiBNYXRoLm1pbih0b0xlbmd0aChlbmRQb3NpdGlvbiksIGxlbik7XG4gICAgc2VhcmNoU3RyaW5nICs9ICcnO1xuICAgIHJldHVybiB0aGF0LnNsaWNlKGVuZCAtIHNlYXJjaFN0cmluZy5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cmluZztcbiAgfVxufSk7IiwidmFyICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCB0b0luZGV4ID0gcmVxdWlyZSgnLi8kJykudG9JbmRleFxuICAsIGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGVcbiAgLCAkZnJvbUNvZGVQb2ludCA9IFN0cmluZy5mcm9tQ29kZVBvaW50O1xuXG4vLyBsZW5ndGggc2hvdWxkIGJlIDEsIG9sZCBGRiBwcm9ibGVtXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICghISRmcm9tQ29kZVBvaW50ICYmICRmcm9tQ29kZVBvaW50Lmxlbmd0aCAhPSAxKSwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4yLjIgU3RyaW5nLmZyb21Db2RlUG9pbnQoLi4uY29kZVBvaW50cylcbiAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24gZnJvbUNvZGVQb2ludCh4KXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICAgIHZhciByZXMgPSBbXVxuICAgICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgICAsIGkgICA9IDBcbiAgICAgICwgY29kZTtcbiAgICB3aGlsZShsZW4gPiBpKXtcbiAgICAgIGNvZGUgPSArYXJndW1lbnRzW2krK107XG4gICAgICBpZih0b0luZGV4KGNvZGUsIDB4MTBmZmZmKSAhPT0gY29kZSl0aHJvdyBSYW5nZUVycm9yKGNvZGUgKyAnIGlzIG5vdCBhIHZhbGlkIGNvZGUgcG9pbnQnKTtcbiAgICAgIHJlcy5wdXNoKGNvZGUgPCAweDEwMDAwXG4gICAgICAgID8gZnJvbUNoYXJDb2RlKGNvZGUpXG4gICAgICAgIDogZnJvbUNoYXJDb2RlKCgoY29kZSAtPSAweDEwMDAwKSA+PiAxMCkgKyAweGQ4MDAsIGNvZGUgJSAweDQwMCArIDB4ZGMwMClcbiAgICAgICk7XG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxuICAsICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XG5cbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICAvLyAyMS4xLjMuNyBTdHJpbmcucHJvdG90eXBlLmluY2x1ZGVzKHNlYXJjaFN0cmluZywgcG9zaXRpb24gPSAwKVxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xuICAgIHJldHVybiAhIX5TdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKS5pbmRleE9mKHNlYXJjaFN0cmluZywgYXJndW1lbnRzWzFdKTtcbiAgfVxufSk7IiwidmFyIHNldCAgID0gcmVxdWlyZSgnLi8kJykuc2V0XG4gICwgJGF0ICAgPSByZXF1aXJlKCcuLyQuc3RyaW5nLWF0JykodHJ1ZSlcbiAgLCBJVEVSICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdpdGVyJylcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcbiAgLCBzdGVwICA9ICRpdGVyLnN0ZXA7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vJC5pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgc2V0KHRoaXMsIElURVIsIHtvOiBTdHJpbmcoaXRlcmF0ZWQpLCBpOiAwfSk7XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXG4gICAgLCBPICAgICA9IGl0ZXIub1xuICAgICwgaW5kZXggPSBpdGVyLmlcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4gc3RlcCgxKTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4gc3RlcCgwLCBwb2ludCk7XG59KTsiLCJ2YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuJGRlZigkZGVmLlMsICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXG4gIHJhdzogZnVuY3Rpb24gcmF3KGNhbGxTaXRlKXtcbiAgICB2YXIgdHBsID0gJC50b09iamVjdChjYWxsU2l0ZS5yYXcpXG4gICAgICAsIGxlbiA9ICQudG9MZW5ndGgodHBsLmxlbmd0aClcbiAgICAgICwgc2xuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCByZXMgPSBbXVxuICAgICAgLCBpICAgPSAwO1xuICAgIHdoaWxlKGxlbiA+IGkpe1xuICAgICAgcmVzLnB1c2goU3RyaW5nKHRwbFtpKytdKSk7XG4gICAgICBpZihpIDwgc2xuKXJlcy5wdXNoKFN0cmluZyhhcmd1bWVudHNbaV0pKTtcbiAgICB9IHJldHVybiByZXMuam9pbignJyk7XG4gIH1cbn0pOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgLy8gMjEuMS4zLjEzIFN0cmluZy5wcm90b3R5cGUucmVwZWF0KGNvdW50KVxuICByZXBlYXQ6IHJlcXVpcmUoJy4vJC5zdHJpbmctcmVwZWF0Jylcbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcblxuLy8gc2hvdWxkIHRocm93IGVycm9yIG9uIHJlZ2V4XG4kZGVmKCRkZWYuUCArICRkZWYuRiAqICFyZXF1aXJlKCcuLyQudGhyb3dzJykoZnVuY3Rpb24oKXsgJ3EnLnN0YXJ0c1dpdGgoLy4vKTsgfSksICdTdHJpbmcnLCB7XG4gIC8vIDIxLjEuMy4xOCBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIFssIHBvc2l0aW9uIF0pXG4gIHN0YXJ0c1dpdGg6IGZ1bmN0aW9uIHN0YXJ0c1dpdGgoc2VhcmNoU3RyaW5nIC8qLCBwb3NpdGlvbiA9IDAgKi8pe1xuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xuICAgIHZhciB0aGF0ICA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXG4gICAgICAsIGluZGV4ID0gJC50b0xlbmd0aChNYXRoLm1pbihhcmd1bWVudHNbMV0sIHRoYXQubGVuZ3RoKSk7XG4gICAgc2VhcmNoU3RyaW5nICs9ICcnO1xuICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgc2V0VGFnICAgPSByZXF1aXJlKCcuLyQuY29mJykuc2V0XG4gICwgdWlkICAgICAgPSByZXF1aXJlKCcuLyQudWlkJylcbiAgLCBzaGFyZWQgICA9IHJlcXVpcmUoJy4vJC5zaGFyZWQnKVxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHJlZGVmICAgPSByZXF1aXJlKCcuLyQucmVkZWYnKVxuICAsIGtleU9mICAgID0gcmVxdWlyZSgnLi8kLmtleW9mJylcbiAgLCBlbnVtS2V5cyA9IHJlcXVpcmUoJy4vJC5lbnVtLWtleXMnKVxuICAsIGFzc2VydE9iamVjdCA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKS5vYmpcbiAgLCBPYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGVcbiAgLCBERVNDICAgICA9ICQuREVTQ1xuICAsIGhhcyAgICAgID0gJC5oYXNcbiAgLCAkY3JlYXRlICA9ICQuY3JlYXRlXG4gICwgZ2V0RGVzYyAgPSAkLmdldERlc2NcbiAgLCBzZXREZXNjICA9ICQuc2V0RGVzY1xuICAsIGRlc2MgICAgID0gJC5kZXNjXG4gICwgJG5hbWVzICAgPSByZXF1aXJlKCcuLyQuZ2V0LW5hbWVzJylcbiAgLCBnZXROYW1lcyA9ICRuYW1lcy5nZXRcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3RcbiAgLCAkU3ltYm9sICA9ICQuZy5TeW1ib2xcbiAgLCBzZXR0ZXIgICA9IGZhbHNlXG4gICwgVEFHICAgICAgPSB1aWQoJ3RhZycpXG4gICwgSElEREVOICAgPSB1aWQoJ2hpZGRlbicpXG4gICwgX3Byb3BlcnR5SXNFbnVtZXJhYmxlID0ge30ucHJvcGVydHlJc0VudW1lcmFibGVcbiAgLCBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5JylcbiAgLCBBbGxTeW1ib2xzID0gc2hhcmVkKCdzeW1ib2xzJylcbiAgLCB1c2VOYXRpdmUgPSAkLmlzRnVuY3Rpb24oJFN5bWJvbCk7XG5cbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQyA/IGZ1bmN0aW9uKCl7IC8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZFxuICB0cnkge1xuICAgIHJldHVybiAkY3JlYXRlKHNldERlc2Moe30sIEhJRERFTiwge1xuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gc2V0RGVzYyh0aGlzLCBISURERU4sIHt2YWx1ZTogZmFsc2V9KVtISURERU5dO1xuICAgICAgfVxuICAgIH0pKVtISURERU5dIHx8IHNldERlc2M7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0LCBrZXksIEQpe1xuICAgICAgdmFyIHByb3RvRGVzYyA9IGdldERlc2MoT2JqZWN0UHJvdG8sIGtleSk7XG4gICAgICBpZihwcm90b0Rlc2MpZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gICAgICBzZXREZXNjKGl0LCBrZXksIEQpO1xuICAgICAgaWYocHJvdG9EZXNjICYmIGl0ICE9PSBPYmplY3RQcm90bylzZXREZXNjKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG4gICAgfTtcbiAgfVxufSgpIDogc2V0RGVzYztcblxuZnVuY3Rpb24gd3JhcCh0YWcpe1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gJC5zZXQoJGNyZWF0ZSgkU3ltYm9sLnByb3RvdHlwZSksIFRBRywgdGFnKTtcbiAgREVTQyAmJiBzZXR0ZXIgJiYgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgaWYoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSl0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGRlc2MoMSwgdmFsdWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3ltO1xufVxuXG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKXtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSl7XG4gICAgaWYoIUQuZW51bWVyYWJsZSl7XG4gICAgICBpZighaGFzKGl0LCBISURERU4pKXNldERlc2MoaXQsIEhJRERFTiwgZGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSAkY3JlYXRlKEQsIHtlbnVtZXJhYmxlOiBkZXNjKDAsIGZhbHNlKX0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIHNldERlc2MoaXQsIGtleSwgRCk7XG59XG5mdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKGl0LCBQKXtcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9PYmplY3QoUCkpXG4gICAgLCBpICAgID0gMFxuICAgICwgbCA9IGtleXMubGVuZ3RoXG4gICAgLCBrZXk7XG4gIHdoaWxlKGwgPiBpKWRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyAkY3JlYXRlKGl0KSA6IGRlZmluZVByb3BlcnRpZXMoJGNyZWF0ZShpdCksIFApO1xufVxuZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBfcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh0aGlzLCBrZXkpO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldXG4gICAgPyBFIDogdHJ1ZTtcbn1cbmZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgdmFyIEQgPSBnZXREZXNjKGl0ID0gdG9PYmplY3QoaXQpLCBrZXkpO1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoIWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSAmJiBrZXkgIT0gSElEREVOKXJlc3VsdC5wdXNoKGtleSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkpcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZighdXNlTmF0aXZlKXtcbiAgJFN5bWJvbCA9IGZ1bmN0aW9uIFN5bWJvbCgpe1xuICAgIGlmKHRoaXMgaW5zdGFuY2VvZiAkU3ltYm9sKXRocm93IFR5cGVFcnJvcignU3ltYm9sIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG4gICAgcmV0dXJuIHdyYXAodWlkKGFyZ3VtZW50c1swXSkpO1xuICB9O1xuICAkcmVkZWYoJFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIHRoaXNbVEFHXTtcbiAgfSk7XG5cbiAgJC5jcmVhdGUgICAgID0gY3JlYXRlO1xuICAkLnNldERlc2MgICAgPSBkZWZpbmVQcm9wZXJ0eTtcbiAgJC5nZXREZXNjICAgID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICAkLnNldERlc2NzICAgPSBkZWZpbmVQcm9wZXJ0aWVzO1xuICAkLmdldE5hbWVzICAgPSAkbmFtZXMuZ2V0ID0gZ2V0T3duUHJvcGVydHlOYW1lcztcbiAgJC5nZXRTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmKCQuREVTQyAmJiAkLkZXKSRyZWRlZihPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgcHJvcGVydHlJc0VudW1lcmFibGUsIHRydWUpO1xufVxuXG52YXIgc3ltYm9sU3RhdGljcyA9IHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcbiAgICByZXR1cm4ga2V5T2YoU3ltYm9sUmVnaXN0cnksIGtleSk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSBmYWxzZTsgfVxufTtcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxuLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcbi8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcbi8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcbi8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcbiQuZWFjaC5jYWxsKChcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xuICAgICdzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuICApLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGl0KXtcbiAgICB2YXIgc3ltID0gcmVxdWlyZSgnLi8kLndrcycpKGl0KTtcbiAgICBzeW1ib2xTdGF0aWNzW2l0XSA9IHVzZU5hdGl2ZSA/IHN5bSA6IHdyYXAoc3ltKTtcbiAgfVxuKTtcblxuc2V0dGVyID0gdHJ1ZTtcblxuJGRlZigkZGVmLkcgKyAkZGVmLlcsIHtTeW1ib2w6ICRTeW1ib2x9KTtcblxuJGRlZigkZGVmLlMsICdTeW1ib2wnLCBzeW1ib2xTdGF0aWNzKTtcblxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAhdXNlTmF0aXZlLCAnT2JqZWN0Jywge1xuICAvLyAxOS4xLjIuMiBPYmplY3QuY3JlYXRlKE8gWywgUHJvcGVydGllc10pXG4gIGNyZWF0ZTogY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6IGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzLFxuICAvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcjogZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiBnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogZ2V0T3duUHJvcGVydHlTeW1ib2xzXG59KTtcblxuLy8gMTkuNC4zLjUgU3ltYm9sLnByb3RvdHlwZVtAQHRvU3RyaW5nVGFnXVxuc2V0VGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRhZygkLmcuSlNPTiwgJ0pTT04nLCB0cnVlKTsiLCIndXNlIHN0cmljdCc7XG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCB3ZWFrICAgICAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJylcbiAgLCBsZWFrU3RvcmUgPSB3ZWFrLmxlYWtTdG9yZVxuICAsIElEICAgICAgICA9IHdlYWsuSURcbiAgLCBXRUFLICAgICAgPSB3ZWFrLldFQUtcbiAgLCBoYXMgICAgICAgPSAkLmhhc1xuICAsIGlzT2JqZWN0ICA9ICQuaXNPYmplY3RcbiAgLCBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGlzT2JqZWN0XG4gICwgdG1wICAgICAgID0ge307XG5cbi8vIDIzLjMgV2Vha01hcCBPYmplY3RzXG52YXIgJFdlYWtNYXAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrTWFwJywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIFdlYWtNYXAoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHNbMF0pOyB9O1xufSwge1xuICAvLyAyMy4zLjMuMyBXZWFrTWFwLnByb3RvdHlwZS5nZXQoa2V5KVxuICBnZXQ6IGZ1bmN0aW9uIGdldChrZXkpe1xuICAgIGlmKGlzT2JqZWN0KGtleSkpe1xuICAgICAgaWYoIWlzRXh0ZW5zaWJsZShrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuZ2V0KGtleSk7XG4gICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbSURdXTtcbiAgICB9XG4gIH0sXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxuICBzZXQ6IGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywga2V5LCB2YWx1ZSk7XG4gIH1cbn0sIHdlYWssIHRydWUsIHRydWUpO1xuXG4vLyBJRTExIFdlYWtNYXAgZnJvemVuIGtleXMgZml4XG5pZihuZXcgJFdlYWtNYXAoKS5zZXQoKE9iamVjdC5mcmVlemUgfHwgT2JqZWN0KSh0bXApLCA3KS5nZXQodG1wKSAhPSA3KXtcbiAgJC5lYWNoLmNhbGwoWydkZWxldGUnLCAnaGFzJywgJ2dldCcsICdzZXQnXSwgZnVuY3Rpb24oa2V5KXtcbiAgICB2YXIgcHJvdG8gID0gJFdlYWtNYXAucHJvdG90eXBlXG4gICAgICAsIG1ldGhvZCA9IHByb3RvW2tleV07XG4gICAgcmVxdWlyZSgnLi8kLnJlZGVmJykocHJvdG8sIGtleSwgZnVuY3Rpb24oYSwgYil7XG4gICAgICAvLyBzdG9yZSBmcm96ZW4gb2JqZWN0cyBvbiBsZWFreSBtYXBcbiAgICAgIGlmKGlzT2JqZWN0KGEpICYmICFpc0V4dGVuc2libGUoYSkpe1xuICAgICAgICB2YXIgcmVzdWx0ID0gbGVha1N0b3JlKHRoaXMpW2tleV0oYSwgYik7XG4gICAgICAgIHJldHVybiBrZXkgPT0gJ3NldCcgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgLy8gc3RvcmUgYWxsIHRoZSByZXN0IG9uIG5hdGl2ZSB3ZWFrbWFwXG4gICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcbiAgICB9KTtcbiAgfSk7XG59IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHdlYWsgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJyk7XG5cbi8vIDIzLjQgV2Vha1NldCBPYmplY3RzXG5yZXF1aXJlKCcuLyQuY29sbGVjdGlvbicpKCdXZWFrU2V0JywgZnVuY3Rpb24oZ2V0KXtcbiAgcmV0dXJuIGZ1bmN0aW9uIFdlYWtTZXQoKXsgcmV0dXJuIGdldCh0aGlzLCBhcmd1bWVudHNbMF0pOyB9O1xufSwge1xuICAvLyAyMy40LjMuMSBXZWFrU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXG4gIGFkZDogZnVuY3Rpb24gYWRkKHZhbHVlKXtcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywgdmFsdWUsIHRydWUpO1xuICB9XG59LCB3ZWFrLCBmYWxzZSwgdHJ1ZSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgICAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICRpbmNsdWRlcyA9IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKHRydWUpO1xuJGRlZigkZGVmLlAsICdBcnJheScsIHtcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvbWVuaWMvQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG4gIGluY2x1ZGVzOiBmdW5jdGlvbiBpbmNsdWRlcyhlbCAvKiwgZnJvbUluZGV4ID0gMCAqLyl7XG4gICAgcmV0dXJuICRpbmNsdWRlcyh0aGlzLCBlbCwgYXJndW1lbnRzWzFdKTtcbiAgfVxufSk7XG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdpbmNsdWRlcycpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXRvLWpzb24nKSgnTWFwJyk7IiwiLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi85MzUzNzgxXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsIG93bktleXMgPSByZXF1aXJlKCcuLyQub3duLWtleXMnKTtcblxuJGRlZigkZGVmLlMsICdPYmplY3QnLCB7XG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM6IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnMob2JqZWN0KXtcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXG4gICAgICAsIHJlc3VsdCA9IHt9O1xuICAgICQuZWFjaC5jYWxsKG93bktleXMoTyksIGZ1bmN0aW9uKGtleSl7XG4gICAgICAkLnNldERlc2MocmVzdWx0LCBrZXksICQuZGVzYygwLCAkLmdldERlc2MoTywga2V5KSkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pOyIsIi8vIGh0dHA6Ly9nb28uZ2wvWGtCcmpEXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdFRvQXJyYXkoaXNFbnRyaWVzKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxuICAgICAgLCBrZXlzICAgPSAkLmdldEtleXMoTylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaSAgICAgID0gMFxuICAgICAgLCByZXN1bHQgPSBBcnJheShsZW5ndGgpXG4gICAgICAsIGtleTtcbiAgICBpZihpc0VudHJpZXMpd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBba2V5ID0ga2V5c1tpKytdLCBPW2tleV1dO1xuICAgIGVsc2Ugd2hpbGUobGVuZ3RoID4gaSlyZXN1bHRbaV0gPSBPW2tleXNbaSsrXV07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xuICB2YWx1ZXM6ICBjcmVhdGVPYmplY3RUb0FycmF5KGZhbHNlKSxcbiAgZW50cmllczogY3JlYXRlT2JqZWN0VG9BcnJheSh0cnVlKVxufSk7IiwiLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2FuZ2F4Lzk2OTgxMDBcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xuJGRlZigkZGVmLlMsICdSZWdFeHAnLCB7XG4gIGVzY2FwZTogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoLyhbXFxcXFxcLVtcXF17fSgpKis/LixeJHxdKS9nLCAnXFxcXCQxJywgdHJ1ZSlcbn0pOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9EYXZpZEJydWFudC9NYXAtU2V0LnByb3RvdHlwZS50b0pTT05cbnJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uLXRvLWpzb24nKSgnU2V0Jyk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxuJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkYXQgID0gcmVxdWlyZSgnLi8kLnN0cmluZy1hdCcpKHRydWUpO1xuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XG4gIGF0OiBmdW5jdGlvbiBhdChwb3Mpe1xuICAgIHJldHVybiAkYXQodGhpcywgcG9zKTtcbiAgfVxufSk7IiwiJ3VzZSBzdHJpY3QnO1xudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJylcbiAgLCAkcGFkID0gcmVxdWlyZSgnLi8kLnN0cmluZy1wYWQnKTtcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xuICBscGFkOiBmdW5jdGlvbiBscGFkKG4pe1xuICAgIHJldHVybiAkcGFkKHRoaXMsIG4sIGFyZ3VtZW50c1sxXSwgdHJ1ZSk7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJHBhZCA9IHJlcXVpcmUoJy4vJC5zdHJpbmctcGFkJyk7XG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcbiAgcnBhZDogZnVuY3Rpb24gcnBhZChuKXtcbiAgICByZXR1cm4gJHBhZCh0aGlzLCBuLCBhcmd1bWVudHNbMV0sIGZhbHNlKTtcbiAgfVxufSk7IiwiLy8gSmF2YVNjcmlwdCAxLjYgLyBTdHJhd21hbiBhcnJheSBzdGF0aWNzIHNoaW1cbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgJEFycmF5ICA9ICQuY29yZS5BcnJheSB8fCBBcnJheVxuICAsIHN0YXRpY3MgPSB7fTtcbmZ1bmN0aW9uIHNldFN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcbiAgJC5lYWNoLmNhbGwoa2V5cy5zcGxpdCgnLCcpLCBmdW5jdGlvbihrZXkpe1xuICAgIGlmKGxlbmd0aCA9PSB1bmRlZmluZWQgJiYga2V5IGluICRBcnJheSlzdGF0aWNzW2tleV0gPSAkQXJyYXlba2V5XTtcbiAgICBlbHNlIGlmKGtleSBpbiBbXSlzdGF0aWNzW2tleV0gPSByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgW11ba2V5XSwgbGVuZ3RoKTtcbiAgfSk7XG59XG5zZXRTdGF0aWNzKCdwb3AscmV2ZXJzZSxzaGlmdCxrZXlzLHZhbHVlcyxlbnRyaWVzJywgMSk7XG5zZXRTdGF0aWNzKCdpbmRleE9mLGV2ZXJ5LHNvbWUsZm9yRWFjaCxtYXAsZmlsdGVyLGZpbmQsZmluZEluZGV4LGluY2x1ZGVzJywgMyk7XG5zZXRTdGF0aWNzKCdqb2luLHNsaWNlLGNvbmNhdCxwdXNoLHNwbGljZSx1bnNoaWZ0LHNvcnQsbGFzdEluZGV4T2YsJyArXG4gICAgICAgICAgICdyZWR1Y2UscmVkdWNlUmlnaHQsY29weVdpdGhpbixmaWxsLHR1cm4nKTtcbiRkZWYoJGRlZi5TLCAnQXJyYXknLCBzdGF0aWNzKTsiLCJyZXF1aXJlKCcuL2VzNi5hcnJheS5pdGVyYXRvcicpO1xudmFyICQgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcbiAgLCBJdGVyYXRvcnMgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuSXRlcmF0b3JzXG4gICwgSVRFUkFUT1IgICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBBcnJheVZhbHVlcyA9IEl0ZXJhdG9ycy5BcnJheVxuICAsIE5MICAgICAgICAgID0gJC5nLk5vZGVMaXN0XG4gICwgSFRDICAgICAgICAgPSAkLmcuSFRNTENvbGxlY3Rpb25cbiAgLCBOTFByb3RvICAgICA9IE5MICYmIE5MLnByb3RvdHlwZVxuICAsIEhUQ1Byb3RvICAgID0gSFRDICYmIEhUQy5wcm90b3R5cGU7XG5pZigkLkZXKXtcbiAgaWYoTkwgJiYgIShJVEVSQVRPUiBpbiBOTFByb3RvKSkkLmhpZGUoTkxQcm90bywgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcbiAgaWYoSFRDICYmICEoSVRFUkFUT1IgaW4gSFRDUHJvdG8pKSQuaGlkZShIVENQcm90bywgSVRFUkFUT1IsIEFycmF5VmFsdWVzKTtcbn1cbkl0ZXJhdG9ycy5Ob2RlTGlzdCA9IEl0ZXJhdG9ycy5IVE1MQ29sbGVjdGlvbiA9IEFycmF5VmFsdWVzOyIsInZhciAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxuICAsICR0YXNrID0gcmVxdWlyZSgnLi8kLnRhc2snKTtcbiRkZWYoJGRlZi5HICsgJGRlZi5CLCB7XG4gIHNldEltbWVkaWF0ZTogICAkdGFzay5zZXQsXG4gIGNsZWFySW1tZWRpYXRlOiAkdGFzay5jbGVhclxufSk7IiwiLy8gaWU5LSBzZXRUaW1lb3V0ICYgc2V0SW50ZXJ2YWwgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGZpeFxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXG4gICwgJGRlZiAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXG4gICwgaW52b2tlICAgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXG4gICwgcGFydGlhbCAgID0gcmVxdWlyZSgnLi8kLnBhcnRpYWwnKVxuICAsIG5hdmlnYXRvciA9ICQuZy5uYXZpZ2F0b3JcbiAgLCBNU0lFICAgICAgPSAhIW5hdmlnYXRvciAmJiAvTVNJRSAuXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpOyAvLyA8LSBkaXJ0eSBpZTktIGNoZWNrXG5mdW5jdGlvbiB3cmFwKHNldCl7XG4gIHJldHVybiBNU0lFID8gZnVuY3Rpb24oZm4sIHRpbWUgLyosIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBzZXQoaW52b2tlKFxuICAgICAgcGFydGlhbCxcbiAgICAgIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSxcbiAgICAgICQuaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKVxuICAgICksIHRpbWUpO1xuICB9IDogc2V0O1xufVxuJGRlZigkZGVmLkcgKyAkZGVmLkIgKyAkZGVmLkYgKiBNU0lFLCB7XG4gIHNldFRpbWVvdXQ6ICB3cmFwKCQuZy5zZXRUaW1lb3V0KSxcbiAgc2V0SW50ZXJ2YWw6IHdyYXAoJC5nLnNldEludGVydmFsKVxufSk7IiwicmVxdWlyZSgnLi9tb2R1bGVzL2VzNScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3QuaXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5vYmplY3Quc3RhdGljcy1hY2NlcHQtcHJpbWl0aXZlcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5mdW5jdGlvbi5uYW1lJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmZ1bmN0aW9uLmhhcy1pbnN0YW5jZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5udW1iZXIuY29uc3RydWN0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubnVtYmVyLnN0YXRpY3MnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuZnJvbS1jb2RlLXBvaW50Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yYXcnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5jb2RlLXBvaW50LWF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5lbmRzLXdpdGgnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5yZXBlYXQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnN0YXJ0cy13aXRoJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkub2YnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5jb3B5LXdpdGhpbicpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maWxsJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmluZC1pbmRleCcpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWdleHAnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucHJvbWlzZScpO1xucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5tYXAnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc2V0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstbWFwJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstc2V0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnJlZmxlY3QnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuc3RyaW5nLmF0Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5scGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnN0cmluZy5ycGFkJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LnRvLWFycmF5Jyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3Lm1hcC50by1qc29uJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvZXM3LnNldC50by1qc29uJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvanMuYXJyYXkuc3RhdGljcycpO1xucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi50aW1lcnMnKTtcbnJlcXVpcmUoJy4vbW9kdWxlcy93ZWIuaW1tZWRpYXRlJyk7XG5yZXF1aXJlKCcuL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21vZHVsZXMvJCcpLmNvcmU7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBodHRwczovL3Jhdy5naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL21hc3Rlci9MSUNFTlNFIGZpbGUuIEFuXG4gKiBhZGRpdGlvbmFsIGdyYW50IG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW5cbiAqIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4hKGZ1bmN0aW9uKGdsb2JhbCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciBpdGVyYXRvclN5bWJvbCA9XG4gICAgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcblxuICB2YXIgaW5Nb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiO1xuICB2YXIgcnVudGltZSA9IGdsb2JhbC5yZWdlbmVyYXRvclJ1bnRpbWU7XG4gIGlmIChydW50aW1lKSB7XG4gICAgaWYgKGluTW9kdWxlKSB7XG4gICAgICAvLyBJZiByZWdlbmVyYXRvclJ1bnRpbWUgaXMgZGVmaW5lZCBnbG9iYWxseSBhbmQgd2UncmUgaW4gYSBtb2R1bGUsXG4gICAgICAvLyBtYWtlIHRoZSBleHBvcnRzIG9iamVjdCBpZGVudGljYWwgdG8gcmVnZW5lcmF0b3JSdW50aW1lLlxuICAgICAgbW9kdWxlLmV4cG9ydHMgPSBydW50aW1lO1xuICAgIH1cbiAgICAvLyBEb24ndCBib3RoZXIgZXZhbHVhdGluZyB0aGUgcmVzdCBvZiB0aGlzIGZpbGUgaWYgdGhlIHJ1bnRpbWUgd2FzXG4gICAgLy8gYWxyZWFkeSBkZWZpbmVkIGdsb2JhbGx5LlxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIERlZmluZSB0aGUgcnVudGltZSBnbG9iYWxseSAoYXMgZXhwZWN0ZWQgYnkgZ2VuZXJhdGVkIGNvZGUpIGFzIGVpdGhlclxuICAvLyBtb2R1bGUuZXhwb3J0cyAoaWYgd2UncmUgaW4gYSBtb2R1bGUpIG9yIGEgbmV3LCBlbXB0eSBvYmplY3QuXG4gIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lID0gaW5Nb2R1bGUgPyBtb2R1bGUuZXhwb3J0cyA6IHt9O1xuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKChvdXRlckZuIHx8IEdlbmVyYXRvcikucHJvdG90eXBlKTtcblxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChcbiAgICAgIGlubmVyRm4sIHNlbGYgfHwgbnVsbCxcbiAgICAgIG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKVxuICAgICk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIHJ1bnRpbWUud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9IEdlbmVyYXRvci5wcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gXCJHZW5lcmF0b3JGdW5jdGlvblwiO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIHByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHJ1bnRpbWUuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIHJ1bnRpbWUubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYHZhbHVlIGluc3RhbmNlb2YgQXdhaXRBcmd1bWVudGAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuIFNvbWUgbWF5IGNvbnNpZGVyIHRoZSBuYW1lIG9mIHRoaXMgbWV0aG9kIHRvb1xuICAvLyBjdXRlc3ksIGJ1dCB0aGV5IGFyZSBjdXJtdWRnZW9ucy5cbiAgcnVudGltZS5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBuZXcgQXdhaXRBcmd1bWVudChhcmcpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEF3YWl0QXJndW1lbnQoYXJnKSB7XG4gICAgdGhpcy5hcmcgPSBhcmc7XG4gIH1cblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvcikge1xuICAgIC8vIFRoaXMgaW52b2tlIGZ1bmN0aW9uIGlzIHdyaXR0ZW4gaW4gYSBzdHlsZSB0aGF0IGFzc3VtZXMgc29tZVxuICAgIC8vIGNhbGxpbmcgZnVuY3Rpb24gKG9yIFByb21pc2UpIHdpbGwgaGFuZGxlIGV4Y2VwdGlvbnMuXG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gZ2VuZXJhdG9yW21ldGhvZF0oYXJnKTtcbiAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEF3YWl0QXJndW1lbnRcbiAgICAgICAgPyBQcm9taXNlLnJlc29sdmUodmFsdWUuYXJnKS50aGVuKGludm9rZU5leHQsIGludm9rZVRocm93KVxuICAgICAgICA6IHJlc3VsdDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgcHJvY2Vzcy5kb21haW4pIHtcbiAgICAgIGludm9rZSA9IHByb2Nlc3MuZG9tYWluLmJpbmQoaW52b2tlKTtcbiAgICB9XG5cbiAgICB2YXIgaW52b2tlTmV4dCA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJuZXh0XCIpO1xuICAgIHZhciBpbnZva2VUaHJvdyA9IGludm9rZS5iaW5kKGdlbmVyYXRvciwgXCJ0aHJvd1wiKTtcbiAgICB2YXIgaW52b2tlUmV0dXJuID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInJldHVyblwiKTtcbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgdmFyIGVucXVldWVSZXN1bHQgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICAgIH0pIDogbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgIHJlc29sdmUoaW52b2tlKG1ldGhvZCwgYXJnKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBlbnF1ZXVlUmVzdWx0IGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5XG4gICAgICAvLyBsYXRlciBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IsIGFuZCBjYWxsIGdlbmVyYXRvci5yZXR1cm4oKSB0b1xuICAgICAgLy8gYWxsb3cgdGhlIGdlbmVyYXRvciBhIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgIHByZXZpb3VzUHJvbWlzZSA9IGVucXVldWVSZXN1bHQuY2F0Y2goaW52b2tlUmV0dXJuKTtcblxuICAgICAgcmV0dXJuIGVucXVldWVSZXN1bHQ7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgcnVudGltZS5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpXG4gICAgKTtcblxuICAgIHJldHVybiBydW50aW1lLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICBpZiAobWV0aG9kID09PSBcInJldHVyblwiIHx8XG4gICAgICAgICAgICAgIChtZXRob2QgPT09IFwidGhyb3dcIiAmJiBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICAvLyBBIHJldHVybiBvciB0aHJvdyAod2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIHRocm93XG4gICAgICAgICAgICAvLyBtZXRob2QpIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgICB2YXIgcmV0dXJuTWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl07XG4gICAgICAgICAgICBpZiAocmV0dXJuTWV0aG9kKSB7XG4gICAgICAgICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChyZXR1cm5NZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBhcmcpO1xuICAgICAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSByZXR1cm4gbWV0aG9kIHRocmV3IGFuIGV4Y2VwdGlvbiwgbGV0IHRoYXRcbiAgICAgICAgICAgICAgICAvLyBleGNlcHRpb24gcHJldmFpbCBvdmVyIHRoZSBvcmlnaW5hbCByZXR1cm4gb3IgdGhyb3cuXG4gICAgICAgICAgICAgICAgbWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgICAgICAgIGFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSBvdXRlciByZXR1cm4sIG5vdyB0aGF0IHRoZSBkZWxlZ2F0ZVxuICAgICAgICAgICAgICAvLyBpdGVyYXRvciBoYXMgYmVlbiB0ZXJtaW5hdGVkLlxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGVsZWdhdGUgZ2VuZXJhdG9yIHJhbiBhbmQgaGFuZGxlZCBpdHMgb3duIGV4Y2VwdGlvbnMgc29cbiAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoYXQgdGhlIG1ldGhvZCB3YXMsIHdlIGNvbnRpbnVlIGFzIGlmIGl0IGlzXG4gICAgICAgICAgLy8gXCJuZXh0XCIgd2l0aCBhbiB1bmRlZmluZWQgYXJnLlxuICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcbiAgICAgICAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcbiAgICAgICAgICAgIHJldHVybiBpbmZvO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkWWllbGQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuc2VudCA9IGFyZztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGNvbnRleHQuc2VudDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihhcmcpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICAgIG1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgaWYgKGNvbnRleHQuZGVsZWdhdGUgJiYgbWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgICAgICAgIGFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIG1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgdGhpcy5zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIC8vIFByZS1pbml0aWFsaXplIGF0IGxlYXN0IDIwIHRlbXBvcmFyeSB2YXJpYWJsZXMgdG8gZW5hYmxlIGhpZGRlblxuICAgICAgLy8gY2xhc3Mgb3B0aW1pemF0aW9ucyBmb3Igc2ltcGxlIGdlbmVyYXRvcnMuXG4gICAgICBmb3IgKHZhciB0ZW1wSW5kZXggPSAwLCB0ZW1wTmFtZTtcbiAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgdGVtcE5hbWUgPSBcInRcIiArIHRlbXBJbmRleCkgfHwgdGVtcEluZGV4IDwgMjA7XG4gICAgICAgICAgICsrdGVtcEluZGV4KSB7XG4gICAgICAgIHRoaXNbdGVtcE5hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xufSkoXG4gIC8vIEFtb25nIHRoZSB2YXJpb3VzIHRyaWNrcyBmb3Igb2J0YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWxcbiAgLy8gb2JqZWN0LCB0aGlzIHNlZW1zIHRvIGJlIHRoZSBtb3N0IHJlbGlhYmxlIHRlY2huaXF1ZSB0aGF0IGRvZXMgbm90XG4gIC8vIHVzZSBpbmRpcmVjdCBldmFsICh3aGljaCB2aW9sYXRlcyBDb250ZW50IFNlY3VyaXR5IFBvbGljeSkuXG4gIHR5cGVvZiBnbG9iYWwgPT09IFwib2JqZWN0XCIgPyBnbG9iYWwgOlxuICB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiID8gd2luZG93IDpcbiAgdHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgPyBzZWxmIDogdGhpc1xuKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vbGliL2JhYmVsL3BvbHlmaWxsXCIpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZS9wb2x5ZmlsbFwiKTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogc3RhcmZpZWxkLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcblxuY29uc3QgTWF4TGF5ZXJzID0gODtcbmNvbnN0IE51bVNwYXJrbGluZ1N0YXJzID0gMztcblxuY2xhc3MgU3RhcmZpZWxkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIG51bUxheWVycyA9IDgsIHN0YXJzRWFjaExheWVyID0gMTAwKSB7XG4gICAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgICAgdGhpcy5fbnVtTGF5ZXJzID0gTWF0aC5taW4oTWF4TGF5ZXJzLCBudW1MYXllcnMpO1xuICAgICAgICB0aGlzLl9zdGFyc0VhY2hMYXllciA9IHN0YXJzRWFjaExheWVyO1xuXG4gICAgICAgIHRoaXMuX3N0YXJzID0gdGhpcy5fcGFyZW50LmFkZC5ncm91cCgpO1xuICAgICAgICB0aGlzLl9zcGFya2xpbmdTdGFycyA9IHRoaXMuX3BhcmVudC5hZGQuZ3JvdXAoKTtcblxuICAgICAgICB0aGlzLl9jcmVhdGVTdGFycygpO1xuICAgICAgICB0aGlzLl9jcmVhdGVTcGFya2xpbmdTdGFycygpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdmFyIHcgPSB0aGlzLl9wYXJlbnQuZ2FtZS53aWR0aDtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy5fcGFyZW50LndvcmxkO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5fc3RhcnMudG90YWw7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBzdGFyID0gdGhpcy5fc3RhcnMuZ2V0QXQoaSk7XG4gICAgICAgICAgICBsZXQgZGVwdGggPSBpICUgdGhpcy5fbnVtTGF5ZXJzO1xuXG4gICAgICAgICAgICBsZXQgc3BlZWQgPSAoZGVwdGggPCAxID8gMS41IDogZGVwdGggKiAxLjUpO1xuICAgICAgICAgICAgc3Rhci54IC09IChzdGFyLmlzU2hvb3RpbmdTdGFyID8gc3BlZWQgKiAyIDogc3BlZWQpO1xuXG4gICAgICAgICAgICBpZiAoc3Rhci54IDwgMCkge1xuICAgICAgICAgICAgICAgIHN0YXIueCA9IHcgKyAzMjtcbiAgICAgICAgICAgICAgICBzdGFyLnkgPSB3b3JsZC5yYW5kb21ZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZVN0YXJzKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLl9wYXJlbnQud29ybGQ7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9udW1MYXllcnMgKiB0aGlzLl9zdGFyc0VhY2hMYXllcjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgc3RhciA9IHRoaXMuX3N0YXJzLmNyZWF0ZSh3b3JsZC5yYW5kb21YLCB3b3JsZC5yYW5kb21ZLFxuICAgICAgICAgICAgICAgIHRoaXMuX3BhcmVudC5jYWNoZS5nZXRCaXRtYXBEYXRhKENvbnN0LkZJTExFRF9SRUNUKSk7XG4gICAgICAgICAgICBsZXQgZGVwdGggPSBpICUgdGhpcy5fbnVtTGF5ZXJzO1xuXG4gICAgICAgICAgICBzdGFyLmFuY2hvci5zZXQoMC41KTtcbiAgICAgICAgICAgIHN0YXIud2lkdGggPSBzdGFyLmhlaWdodCA9IDI7XG4gICAgICAgICAgICBzdGFyLmFscGhhID0gKGRlcHRoICsgMSkgLyB0aGlzLl9udW1MYXllcnM7XG5cbiAgICAgICAgICAgIC8vIHNldCBhIHNlbGVjdCBmZXcgc3RhcnMgdG8gYmUgc2hvb3Rpbmcgc3RhcnNcbiAgICAgICAgICAgIGlmIChzdGFyLmFscGhhID09PSAxICYmIFBoYXNlci5NYXRoLmNoYW5jZVJvbGwoMTApKSB7XG4gICAgICAgICAgICAgICAgc3Rhci53aWR0aCA9IDE2O1xuICAgICAgICAgICAgICAgIHN0YXIuaXNTaG9vdGluZ1N0YXIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NyZWF0ZVNwYXJrbGluZ1N0YXJzKCkge1xuICAgICAgICB2YXIgd29ybGQgPSB0aGlzLl9wYXJlbnQuZ2FtZS53b3JsZDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IE51bVNwYXJrbGluZ1N0YXJzOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBzdGFyID0gdGhpcy5fc3BhcmtsaW5nU3RhcnMuY3JlYXRlKHdvcmxkLnJhbmRvbVgsIHdvcmxkLnJhbmRvbVksXG4gICAgICAgICAgICAgICAgQ29uc3QuU1BSSVRFX1NIRUVULCAzMTQpO1xuXG4gICAgICAgICAgICBzdGFyLmFuY2hvci5zZXQoMC41KTtcbiAgICAgICAgICAgIHN0YXIuc2NhbGUuc2V0KDIpO1xuXG4gICAgICAgICAgICBsZXQgZHVyYXRpb24gPSB0aGlzLl9wYXJlbnQucm5kLmJldHdlZW4oNTAwLCA4NTApO1xuICAgICAgICAgICAgbGV0IGRlbGF5ID0gdGhpcy5fcGFyZW50LnJuZC5iZXR3ZWVuKDI1MCwgNTAwKTtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5hZGQudHdlZW4oc3Rhci5zY2FsZSlcbiAgICAgICAgICAgICAgICAudG8oeyB4OiAwLCB5OiAwIH0sIGR1cmF0aW9uLCBQaGFzZXIuRWFzaW5nLlNpbnVzb2lkYWwuT3V0LFxuICAgICAgICAgICAgICAgICAgICB0cnVlLCBkZWxheSwgLTEsIHRydWUpXG4gICAgICAgICAgICAgICAgLm9uTG9vcC5hZGQoKHMsIHQpID0+IHRoaXMuX29uU3BhcmtsaW5nU3RhclVwZGF0ZShzdGFyKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25TcGFya2xpbmdTdGFyVXBkYXRlKHN0YXIpIHtcbiAgICAgICAgdmFyIHdvcmxkID0gdGhpcy5fcGFyZW50LndvcmxkO1xuXG4gICAgICAgIHN0YXIueCA9IHdvcmxkLnJhbmRvbVg7XG4gICAgICAgIHN0YXIueSA9IHdvcmxkLnJhbmRvbVk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTdGFyZmllbGQ7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBlbnRpdHkuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5jbGFzcyBFbnRpdHkgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lLCB4LCB5LCBrZXksIGZyYW1lKSB7XG4gICAgICAgIHN1cGVyKGdhbWUsIHgsIHksIGtleSwgZnJhbWUpO1xuXG4gICAgICAgIHRoaXMuZmFjaW5nID0gUGhhc2VyLkxFRlQ7XG4gICAgfVxuXG4gICAgc2V0dXAobGV2ZWwpIHtcbiAgICAgICAgbGV2ZWwucGh5c2ljcy5lbmFibGUodGhpcywgUGhhc2VyLlBoeXNpY3MuQVJDQURFKTtcbiAgICAgICAgdGhpcy5hbmNob3Iuc2V0KDAuNSwgMSk7XG4gICAgICAgIHRoaXMuYm9keS5maXhlZFJvdGF0aW9uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25zLmN1cnJlbnRBbmltLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuYm9keS5lbmFibGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXN1bWUoKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucy5jdXJyZW50QW5pbS5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ib2R5LmVuYWJsZSA9IHRydWU7XG4gICAgfVxuXG4gICAgZmxpcCgpIHtcbiAgICAgICAgdmFyIGRpciA9ICh0aGlzLmZhY2luZyA9PT0gMSA/IC0yIDogMik7XG4gICAgICAgIHRoaXMuc2NhbGUueCA9IGRpcjtcbiAgICB9XG5cbiAgICBfYWRkQW5pbWF0aW9ucyhhbmltcywgZnJhbWVSYXRlID0gNjAsIGxvb3AgPSBmYWxzZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFuaW1zLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgbGV0IGFuaW0gPSBhbmltc1tpXTtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9ucy5hZGQoYW5pbS5uYW1lLCBhbmltLmZyYW1lcywgZnJhbWVSYXRlLCBsb29wKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRW50aXR5O1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogZ2F0ZS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIEdhdGUgZXh0ZW5kcyBQaGFzZXIuU3ByaXRlIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lLCB4LCB5KSB7XG4gICAgICAgIHN1cGVyKGdhbWUsIHgsIHksIGdhbWUuY2FjaGUuZ2V0Qml0bWFwRGF0YShDb25zdC5GSUxMRURfUkVDVCkpO1xuXG4gICAgICAgIHRoaXMuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgICB0aGlzLndpZHRoID0gQ29uc3QuQkxPQ0tfU0laRSAqIDY7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gQ29uc3QuQkxPQ0tfU0laRSAqIDY7XG4gICAgICAgIHRoaXMudGludCA9IDB4MDAwMEZGO1xuXG4gICAgICAgIGdhbWUuYWRkLnR3ZWVuKHRoaXMpXG4gICAgICAgICAgICAudG8oeyBhbHBoYTogMC4yNSB9LCA1MDAsIFBoYXNlci5FYXNpbmcuU2ludXNvaWRhbC5PdXQsXG4gICAgICAgICAgICAgICAgdHJ1ZSwgMCwgLTEsIHRydWUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2F0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHBsYXllci5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBFbnRpdHkgZnJvbSAnY2xpZW50L2VudGl0aWVzL2VudGl0eSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5sZXQgUGxheWVyU3RhdGVzID0ge1xuICAgIElkbGU6IDAsXG4gICAgV2Fsa2luZzogMSxcbiAgICBKdW1waW5nOiAyLFxuICAgIEZhbGxpbmc6IDRcbn07XG5cbmNsYXNzIFBsYXllciBleHRlbmRzIEVudGl0eSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSkge1xuICAgICAgICBzdXBlcihnYW1lLCB4LCB5LCBDb25zdC5TUFJJVEVfU0hFRVQsIDApO1xuICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5GYWxsaW5nO1xuICAgICAgICB0aGlzLmp1bXBSZWxlYXNlZCA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5fZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fbW92aW5nID0gW107XG4gICAgICAgIHRoaXMuX2FkZEFuaW1hdGlvbnMoW3sgbmFtZTogJ3dhbGsnLCBmcmFtZXM6IFsxLCAyLCAzLCA0LCA1XSB9XSxcbiAgICAgICAgICAgIDIwLCB0cnVlKTtcbiAgICAgICAgdGhpcy5zY2FsZS5zZXQoMiwgMik7XG4gICAgfVxuXG4gICAgc2V0dXAobGV2ZWwpIHtcbiAgICAgICAgc3VwZXIuc2V0dXAobGV2ZWwpO1xuXG4gICAgICAgIHRoaXMuX3ZlbG9jaXR5ID0gdGhpcy5ib2R5LnZlbG9jaXR5O1xuICAgICAgICB0aGlzLl9hY2NlbGVyYXRpb24gPSB0aGlzLmJvZHkuYWNjZWxlcmF0aW9uO1xuICAgICAgICB0aGlzLmJvZHkuc2V0U2l6ZSg4LCA2KTtcbiAgICAgICAgdGhpcy5ib2R5Lm1heFZlbG9jaXR5LnggPSBDb25zdC5QTEFZRVJfTUFYX1ZFTDtcbiAgICAgICAgdGhpcy5ib2R5LmRyYWcuc2V0KENvbnN0LlBMQVlFUl9EUkFHLCAwKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIHRoaXMuX3VwZGF0ZUFuaW1hdGlvbnMoKTtcbiAgICAgICAgdGhpcy5fZ3JvdW5kZWQgPSB0aGlzLmJvZHkub25GbG9vcigpIHx8IHRoaXMuYm9keS50b3VjaGluZy5kb3duO1xuXG4gICAgICAgIGlmICh0aGlzLl9pc0N1cnJlbnRTdGF0ZShQbGF5ZXJTdGF0ZXMuRmFsbGluZykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ncm91bmRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZS5oaXRHcm91bmRTb3VuZC5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fbW92aW5nW1BoYXNlci5MRUZUXSkge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSAtQ29uc3QuUExBWUVSX0FDQ0VMO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuV2Fsa2luZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9tb3ZpbmdbUGhhc2VyLlJJR0hUXSkge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSBDb25zdC5QTEFZRVJfQUNDRUw7XG4gICAgICAgICAgICBpZiAodGhpcy5fZ3JvdW5kZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5XYWxraW5nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fYWNjZWxlcmF0aW9uLnggPSAwO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuSWRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBlcmZvcm0gdmFyaWFibGUganVtcCBoZWlnaHQgY2hlY2tcbiAgICAgICAgaWYgKHRoaXMuX2lzQ3VycmVudFN0YXRlKFBsYXllclN0YXRlcy5KdW1waW5nKSAmJiB0aGlzLmp1bXBSZWxlYXNlZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3ZlbG9jaXR5LnkgPCBDb25zdC5QTEFZRVJfSlVNUF9TUEVFRC80KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdmVsb2NpdHkueSA9IENvbnN0LlBMQVlFUl9KVU1QX1NQRUVELzQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNDdXJyZW50U3RhdGUoUGxheWVyU3RhdGVzLkp1bXBpbmcpICYmXG4gICAgICAgICAgICB0aGlzLl92ZWxvY2l0eS55ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RhdGUgPSBQbGF5ZXJTdGF0ZXMuRmFsbGluZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhcCBwbGF5ZXIgZmFsbCBzcGVlZFxuICAgICAgICB0aGlzLl92ZWxvY2l0eS55ID0gTWF0aC5taW4odGhpcy5fdmVsb2NpdHkueSxcbiAgICAgICAgICAgIENvbnN0LlBMQVlFUl9NQVhfRkFMTF9TUEVFRCk7XG4gICAgfVxuXG4gICAganVtcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX2dyb3VuZGVkICYmICF0aGlzLl9pc0N1cnJlbnRTdGF0ZShQbGF5ZXJTdGF0ZXMuSnVtcGluZykgJiZcbiAgICAgICAgICAgIHRoaXMuanVtcFJlbGVhc2VkKSB7XG4gICAgICAgICAgICB0aGlzLmp1bXBSZWxlYXNlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBzZXQgdGhlIGFwcHJvcHJpYXRlIHN0YXRlXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGF0ZSA9IFBsYXllclN0YXRlcy5KdW1waW5nO1xuICAgICAgICAgICAgdGhpcy5fdmVsb2NpdHkueSA9IENvbnN0LlBMQVlFUl9KVU1QX1NQRUVEO1xuICAgICAgICAgICAgdGhpcy5nYW1lLmp1bXBTb3VuZC5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3ZlKGRpcmVjdGlvbiwgYWN0aXZlKSB7XG4gICAgICAgIHRoaXMuX21vdmluZ1tkaXJlY3Rpb25dID0gYWN0aXZlO1xuICAgICAgICB0aGlzLmZhY2luZyA9IGRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICBfdXBkYXRlQW5pbWF0aW9ucygpIHtcbiAgICAgICAgdGhpcy5mbGlwKCk7XG5cbiAgICAgICAgc3dpdGNoICh0aGlzLmN1cnJlbnRTdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBQbGF5ZXJTdGF0ZXMuV2Fsa2luZzpcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnMucGxheSgnd2FsaycpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQbGF5ZXJTdGF0ZXMuSnVtcGluZzpcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMjY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBsYXllclN0YXRlcy5GYWxsaW5nOlxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAyNztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUGxheWVyU3RhdGVzLklkbGU6IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pc0N1cnJlbnRTdGF0ZShzdGF0ZSkge1xuICAgICAgICByZXR1cm4gKHRoaXMuY3VycmVudFN0YXRlID09PSBzdGF0ZSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXI7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBnYW1lLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxudmFyIHdvcmxkcyA9IHJlcXVpcmUoJ2NsaWVudC9sZXZlbHMvd29ybGRzJyk7XG5cbmltcG9ydCBCb290U3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9ib290JztcbmltcG9ydCBQcmVsb2FkU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9wcmVsb2FkJztcbmltcG9ydCBTcGxhc2hTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3NwbGFzaCc7XG5pbXBvcnQgTWVudVN0YXRlIGZyb20gJ2NsaWVudC9zdGF0ZXMvbWVudSc7XG5pbXBvcnQgUGxheVN0YXRlIGZyb20gJ2NsaWVudC9zdGF0ZXMvcGxheSc7XG5cbmNsYXNzIEdhbWUgZXh0ZW5kcyBQaGFzZXIuR2FtZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKDQwMCwgMjQwLCBQaGFzZXIuQVVUTywgJ2dhbWUnLCBudWxsLCBmYWxzZSwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hZGQoJ2Jvb3QnLCBCb290U3RhdGUsIHRydWUpO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZCgncHJlbG9hZCcsIFByZWxvYWRTdGF0ZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZCgnc3BsYXNoJywgU3BsYXNoU3RhdGUsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5hZGQoJ21haW5tZW51JywgTWVudVN0YXRlLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuc3RhdGUuYWRkKCdwbGF5JywgUGxheVN0YXRlLCBmYWxzZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHdvcmxkcyk7XG4gICAgICAgIHRoaXMuX2FkZFdvcmxkcyh3b3JsZHMpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF9hZGRXb3JsZHMod29ybGRzKSB7XG4gICAgICAgIHZhciBpID0gMTtcbiAgICAgICAgXy5lYWNoKHdvcmxkcywgKHYsIGspID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2FkZExldmVsKHYsIGkrKyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIF9hZGRMZXZlbChsZXZlbHMsIHdvcmxkSWR4KSB7XG4gICAgICAgIHZhciBsZXZlbElkeCA9IDE7XG4gICAgICAgIF8uZWFjaChsZXZlbHMsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFkZChgbGV2ZWxfJHt3b3JsZElkeH1fJHtsZXZlbElkeH1gLCB2LCBmYWxzZSk7XG4gICAgICAgICAgICBsZXZlbElkeCsrO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBkaWFsb2cuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgVGV4dExhYmVsIGZyb20gJ2NsaWVudC9ndWkvdGV4dF9sYWJlbCc7XG5pbXBvcnQgVGV4dEJ1dHRvbiBmcm9tICdjbGllbnQvZ3VpL3RleHRfYnV0dG9uJztcbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIERpYWxvZyBleHRlbmRzIFBoYXNlci5Hcm91cCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgcGFyZW50LCB0aXRsZSwgb25DbG9zZSA9IG51bGwsIGF1dG9TaG93ID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG5cbiAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICB0aGlzLl90aXRsZSA9IHRpdGxlO1xuICAgICAgICB0aGlzLl9vbkNsb3NlID0gb25DbG9zZTtcbiAgICAgICAgdGhpcy5fYXV0b1Nob3cgPSBhdXRvU2hvdztcblxuICAgICAgICB0aGlzLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xuICAgIH1cblxuICAgIHNldHVwKGJvZHlUZXh0SXRlbXMsIGNsb3NlKSB7XG4gICAgICAgIGJvZHlUZXh0SXRlbXMudW5zaGlmdCh7IHR5cGU6ICdsYWJlbCcsIHBvczogJ2NlbnRlcicsXG4gICAgICAgICAgICB0ZXh0OiB0aGlzLl90aXRsZSwgbmV3TGluZTogdHJ1ZSB9KTtcblxuICAgICAgICBpZiAoY2xvc2UpIHtcbiAgICAgICAgICAgIGJvZHlUZXh0SXRlbXMucHVzaCh7IHR5cGU6ICdidXR0b24nLCBwb3M6ICdjZW50ZXInLFxuICAgICAgICAgICAgICAgIHRleHQ6ICdDbG9zZScsIG5ld0xpbmU6IHRydWUsIGZuOiB0aGlzLmhpZGUsIGN0eDogdGhpcyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2JvZHlUZXh0SXRlbXMgPSBib2R5VGV4dEl0ZW1zO1xuICAgICAgICB0aGlzLl9pbml0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2F1dG9TaG93KSB7XG4gICAgICAgICAgICB0aGlzLnNob3coKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX3RleHRJdGVtc0dyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3RhcnRPcGVuVHdlZW4oKTtcbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLl90ZXh0SXRlbXNHcm91cC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3N0YXJ0Q2xvc2VUd2VlbigpO1xuICAgIH1cblxuICAgIF9pbml0KCkge1xuICAgICAgICAvLyBzZXR1cCB0aGUgZGlhbG9nIGJhY2tncm91bmQgc3ByaXRlXG4gICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUgPSB0aGlzLmNyZWF0ZSh0aGlzLmdhbWUud2lkdGgvMixcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQqMC43NSwgdGhpcy5nYW1lLmNhY2hlLmdldEJpdG1hcERhdGEoQ29uc3QuUkVDVCkpO1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUuYW5jaG9yLnNldCgwLjUpO1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUuYWxwaGEgPSAwLjg7XG4gICAgICAgIHRoaXMuX2RpYWxvZ1Nwcml0ZS53aWR0aCA9IHRoaXMuZ2FtZS53aWR0aCArIDY0O1xuICAgICAgICB0aGlzLl9kaWFsb2dTcHJpdGUuaGVpZ2h0ID0gXy5zaXplKHRoaXMuX2JvZHlUZXh0SXRlbXMpICogMTI7XG5cbiAgICAgICAgLy8gc2V0dXAgYWxsIHRoZSB0ZXh0IGl0ZW1zXG4gICAgICAgIHZhciBjZW50ZXJYID0gdGhpcy5fZGlhbG9nU3ByaXRlLng7XG4gICAgICAgIHZhciBjZW50ZXJZID0gdGhpcy5fZGlhbG9nU3ByaXRlLnk7XG4gICAgICAgIHRoaXMuX3RleHRJdGVtc0dyb3VwID0gbmV3IFBoYXNlci5Hcm91cCh0aGlzLmdhbWUsIHRoaXMpO1xuICAgICAgICB0aGlzLl9pbml0Qm9keVRleHQoY2VudGVyWCwgY2VudGVyWSk7XG4gICAgICAgIHRoaXMuX2RpYWxvZ1Nwcml0ZS5oZWlnaHQgPSAwO1xuICAgIH1cblxuICAgIF9pbml0Qm9keVRleHQoY2VudGVyWCwgY2VudGVyWSkge1xuICAgICAgICB2YXIgc2l6ZSA9IF8uc2l6ZSh0aGlzLl9ib2R5VGV4dEl0ZW1zKTtcbiAgICAgICAgdmFyIHlQb3MgPSAoc2l6ZSA+IDEgPyBjZW50ZXJZICsgdGhpcy5fZGlhbG9nU3ByaXRlLmhlaWdodC8yIC1cbiAgICAgICAgICAgIDEyIC0gc2l6ZSAqIDggOiBjZW50ZXJZKTtcblxuICAgICAgICBfLmVhY2godGhpcy5fYm9keVRleHRJdGVtcywgKHYsIGspID0+IHtcbiAgICAgICAgICAgIGxldCB4UG9zID0gY2VudGVyWDtcblxuICAgICAgICAgICAgaWYgKHYucG9zID09PSAnbGVmdCcpIHtcbiAgICAgICAgICAgICAgICB4UG9zID0gY2VudGVyWCAtIHRoaXMuX2RpYWxvZ1Nwcml0ZS53aWR0aC82O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2LnBvcyA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgICAgIHhQb3MgPSBjZW50ZXJYICsgdGhpcy5fZGlhbG9nU3ByaXRlLndpZHRoLzY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBpdGVtID0gKHYudHlwZSA9PT0gJ2xhYmVsJyA/XG4gICAgICAgICAgICAgICAgbmV3IFRleHRMYWJlbCh0aGlzLmdhbWUsIHhQb3MsIHlQb3MsIHYudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGV4dEl0ZW1zR3JvdXApIDpcbiAgICAgICAgICAgICAgICBuZXcgVGV4dEJ1dHRvbih0aGlzLmdhbWUsIHhQb3MsIHlQb3MsIHYudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGV4dEl0ZW1zR3JvdXAsIGZhbHNlLCB7IGZuOiB2LmZuLCBjdHg6IHYuY3R4IH0pKTtcblxuICAgICAgICAgICAgaWYgKHYubmV3TGluZSkge1xuICAgICAgICAgICAgICAgIHlQb3MgKz0gaXRlbS5oZWlnaHQqMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX3N0YXJ0T3BlblR3ZWVuKCkge1xuICAgICAgICB2YXIgaCA9IHRoaXMuZ2FtZS5oZWlnaHQgLyAzO1xuICAgICAgICB2YXIgdHdlZW4gPSB0aGlzLl9jcmVhdGVUd2VlbihoKTtcblxuICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmID0+IHRoaXMuX3RleHRJdGVtc0dyb3VwLnZpc2libGUgPSB0cnVlKTtcbiAgICAgICAgdHdlZW4uc3RhcnQoKTtcbiAgICB9XG5cbiAgICBfc3RhcnRDbG9zZVR3ZWVuKCkge1xuICAgICAgICB2YXIgdHdlZW4gPSB0aGlzLl9jcmVhdGVUd2VlbigwKTtcblxuICAgICAgICB0d2Vlbi5vbkNvbXBsZXRlLmFkZChmID0+IHtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBpZiB1c2VyIGRlZmluZWQgYSBvbmNsb3NlIGNhbGxiYWNrLCBpbnZva2UgaXRcbiAgICAgICAgICAgIGlmICh0aGlzLl9vbkNsb3NlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25DbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdHdlZW4uc3RhcnQoKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlVHdlZW4oaGVpZ2h0KSB7XG4gICAgICAgIHZhciB0d2VlbiA9IHRoaXMuX3BhcmVudC5hZGQudHdlZW4odGhpcy5fZGlhbG9nU3ByaXRlKVxuICAgICAgICAgICAgLnRvKHsgaGVpZ2h0OiBoZWlnaHQgfSwgNTAwLFxuICAgICAgICAgICAgICAgIFBoYXNlci5FYXNpbmcuUXVpbnRpYy5PdXQpO1xuXG4gICAgICAgIHJldHVybiB0d2VlbjtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERpYWxvZztcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IG9wdGlvbnNfZGlhbG9nLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IERpYWxvZyBmcm9tICdjbGllbnQvZ3VpL2RpYWxvZyc7XG5cbmNsYXNzIE1haW5NZW51RGlhbG9nIGV4dGVuZHMgRGlhbG9nIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lLCBwYXJlbnQsIG9uQ2xvc2UsIGF1dG9TdGFydCkge1xuICAgICAgICBzdXBlcihnYW1lLCBwYXJlbnQsICdTdGFyZ3VhcmQnLCBvbkNsb3NlLCBhdXRvU3RhcnQpO1xuXG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9XG5cbiAgICBzZXR1cCgpIHtcbiAgICAgICAgc3VwZXIuc2V0dXAoW1xuICAgICAgICAgICAgeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAnY2VudGVyJywgdGV4dDogJ1N0YXJ0JyxcbiAgICAgICAgICAgICAgICBuZXdMaW5lOiB0cnVlLCBmbjogdGhpcy5fb25TdGFydFNlbGVjdGVkLCBjdHg6IHRoaXMgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ2J1dHRvbicsIHBvczogJ2NlbnRlcicsIHRleHQ6ICdUcmlhbCcsXG4gICAgICAgICAgICAgICAgbmV3TGluZTogdHJ1ZSwgZm46IHRoaXMuX29uVHJpYWxTZWxlY3RlZCwgY3R4OiB0aGlzIH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdidXR0b24nLCBwb3M6ICdjZW50ZXInLCB0ZXh0OiAnT3B0aW9ucycsXG4gICAgICAgICAgICAgICAgbmV3TGluZTogdHJ1ZSwgZm46IHRoaXMuX29uT3B0aW9uc1NlbGVjdGVkLCBjdHg6IHRoaXMgfVxuICAgICAgICBdKTtcbiAgICB9XG5cbiAgICBfb25TdGFydFNlbGVjdGVkKCkge1xuICAgICAgICB0aGlzLl9wYXJlbnQuc3RhdGUuc3RhcnQoJ3BsYXknKTtcbiAgICB9XG5cbiAgICBfb25UcmlhbFNlbGVjdGVkKCkge1xuXG4gICAgfVxuXG4gICAgX29uT3B0aW9uc1NlbGVjdGVkKCkge1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1haW5NZW51RGlhbG9nO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogb3B0aW9uc19kaWFsb2cuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgRGlhbG9nIGZyb20gJ2NsaWVudC9ndWkvZGlhbG9nJztcblxuY2xhc3MgT3B0aW9uc0RpYWxvZyBleHRlbmRzIERpYWxvZyB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgcGFyZW50LCBvbkNsb3NlLCByZXR1cm5Ub01lbnUgPSBmYWxzZSkge1xuICAgICAgICBzdXBlcihnYW1lLCBwYXJlbnQsICdPcHRpb25zJywgb25DbG9zZSwgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuc2V0dXAocmV0dXJuVG9NZW51KTtcbiAgICB9XG5cbiAgICBzZXR1cChyZXR1cm5Ub01lbnUpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gW1xuICAgICAgICAgICAgeyB0eXBlOiAnbGFiZWwnLCBwb3M6ICdsZWZ0JywgdGV4dDogJ2Z1bGxzY3JlZW4nLCBuZXdMaW5lOiBmYWxzZSB9LFxuICAgICAgICAgICAgeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAncmlnaHQnLCB0ZXh0OiAnb2ZmJyxcbiAgICAgICAgICAgICAgICBmbjogdGhpcy5fb25GdWxsc2NyZWVuVG9nZ2xlLCBjdHg6IHRoaXMsIG5ld0xpbmU6IHRydWUgfSxcbiAgICAgICAgICAgIHsgdHlwZTogJ2xhYmVsJywgcG9zOiAnbGVmdCcsIHRleHQ6ICdhdWRpbycsIG5ld0xpbmU6IGZhbHNlIH0sXG4gICAgICAgICAgICB7IHR5cGU6ICdidXR0b24nLCBwb3M6ICdyaWdodCcsIHRleHQ6ICdvbicsXG4gICAgICAgICAgICAgICAgZm46IHRoaXMuX29uQXVkaW9Ub2dnbGUsIGN0eDogdGhpcywgbmV3TGluZTogdHJ1ZSB9LFxuICAgICAgICBdO1xuXG4gICAgICAgIGlmIChyZXR1cm5Ub01lbnUpIHtcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goeyB0eXBlOiAnYnV0dG9uJywgcG9zOiAnY2VudGVyJywgdGV4dDogJ01haW4wLU1lbnUnLFxuICAgICAgICAgICAgICAgIGZuOiB0aGlzLl9vbk1haW5NZW51LCBjdHg6IHRoaXMsIG5ld0xpbmU6IHRydWUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5zZXR1cChpdGVtcywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgX29uRnVsbHNjcmVlblRvZ2dsZShidXR0b24pIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhcmVudC5zY2FsZS5pc0Z1bGxTY3JlZW4pIHtcbiAgICAgICAgICAgIHRoaXMuX3BhcmVudC5zY2FsZS5zdG9wRnVsbFNjcmVlbigpO1xuICAgICAgICAgICAgYnV0dG9uLnNldFRleHQoJ29mZicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50LnNjYWxlLnN0YXJ0RnVsbFNjcmVlbihmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnQuc2NhbGUuc2V0U2NyZWVuU2l6ZSgpO1xuICAgICAgICAgICAgYnV0dG9uLnNldFRleHQoJ29uJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb25BdWRpb1RvZ2dsZShidXR0b24pIHtcbiAgICAgICAgdmFyIGlzTXV0ZWQgPSB0aGlzLl9wYXJlbnQuc291bmQubXV0ZTtcbiAgICAgICAgdmFyIHN0YXR1cyA9IChpc011dGVkID8gJ29uJyA6ICdvZmYnKTtcblxuICAgICAgICB0aGlzLl9wYXJlbnQuc291bmQubXV0ZSA9ICF0aGlzLl9wYXJlbnQuc291bmQubXV0ZTtcbiAgICAgICAgYnV0dG9uLnNldFRleHQoc3RhdHVzKTtcbiAgICB9XG5cbiAgICBfb25NYWluTWVudSgpIHtcbiAgICAgICAgdGhpcy5fcGFyZW50LnJlc3VtZSgpO1xuICAgICAgICB0aGlzLl9wYXJlbnQuc3RhdGUuc3RhcnQoJ21haW5tZW51Jyk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPcHRpb25zRGlhbG9nO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiB0ZXh0X2J1dHRvbi5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5pbXBvcnQgVGV4dExhYmVsIGZyb20gJ2NsaWVudC9ndWkvdGV4dF9sYWJlbCc7XG5cbmNsYXNzIFRleHRCdXR0b24gZXh0ZW5kcyBUZXh0TGFiZWwge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIHgsIHksIHRleHQsIHBhcmVudCwgZml4ZWRUb0NhbSwgY2FsbGJhY2tPYmosXG4gICAgICAgIGNlbnRlclRleHQsIGFsaWduLCBzaXplLCBvdmVyVGludCA9IDB4RkYwMDAwLCBvdXRUaW50ID0gMHhGRkZGRkYpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgeCwgeSwgdGV4dCwgcGFyZW50LCBmaXhlZFRvQ2FtLCBjZW50ZXJUZXh0LCBhbGlnbiwgc2l6ZSk7XG5cbiAgICAgICAgLy8gZW5hYmxlIGlucHV0IGFuZCBzZXR1cCBjYWxsYmFjayBldmVudHNcbiAgICAgICAgdGhpcy5pbnB1dEVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmV2ZW50cy5vbklucHV0T3Zlci5hZGQoZiA9PiB0aGlzLnRpbnQgPSBvdmVyVGludCk7XG4gICAgICAgIHRoaXMuZXZlbnRzLm9uSW5wdXRPdXQuYWRkKGYgPT4gdGhpcy50aW50ID0gb3V0VGludCk7XG4gICAgICAgIHRoaXMuZXZlbnRzLm9uSW5wdXREb3duLmFkZChjYWxsYmFja09iai5mbiwgY2FsbGJhY2tPYmouY3R4KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRCdXR0b247XG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHRleHRfbGFiZWwuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBUZXh0TGFiZWwgZXh0ZW5kcyBQaGFzZXIuQml0bWFwVGV4dCB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSwgeCwgeSwgdGV4dCwgcGFyZW50ID0gbnVsbCwgZml4ZWRUb0NhbSA9IGZhbHNlLFxuICAgICAgICBjZW50ZXJUZXh0ID0gdHJ1ZSwgYWxpZ24gPSAnY2VudGVyJywgc2l6ZSA9IDgpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSwgeCwgeSwgQ29uc3QuR0FNRV9GT05ULCB0ZXh0LCBzaXplKTtcblxuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICBwYXJlbnQuYWRkKHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hbGlnbiA9IGFsaWduO1xuICAgICAgICB0aGlzLmZpeGVkVG9DYW1lcmEgPSBmaXhlZFRvQ2FtO1xuXG4gICAgICAgIGlmIChjZW50ZXJUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmFuY2hvci54ID0gTWF0aC5yb3VuZCh0aGlzLndpZHRoICogMC41KSAvIHRoaXMud2lkdGg7XG4gICAgICAgICAgICB0aGlzLmFuY2hvci55ID0gTWF0aC5yb3VuZCh0aGlzLmhlaWdodCAqIDAuNSkgLyB0aGlzLmhlaWdodDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV4dExhYmVsO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBjbGllbnRfZ2FtZV9tYW5hZ2VyLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxucmVxdWlyZSgnYmFiZWwvcG9seWZpbGwnKTtcblxuaW1wb3J0IEdhbWUgZnJvbSAnY2xpZW50L2dhbWUnO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKS5zdGFydCgpO1xufTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGlucHV0X2hhbmRsZXIuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5jbGFzcyBJbnB1dEhhbmRsZXIge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9pbnB1dE1hcCA9ICB7fTtcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJNYXAgPSB7fTtcbiAgICB9XG5cbiAgICBzZXRJbnB1dE1hcChpbnB1dE1hcCA9IHt9KSB7XG4gICAgICAgIHRoaXMuX2lucHV0TWFwID0gaW5wdXRNYXA7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoa2V5LCBjdHggPSBudWxsLCBoYW5kbGVyID0gbnVsbCwgb25Eb3duID0gbnVsbCwgb25VcCA9IG51bGwpIHtcbiAgICAgICAgaWYgKF8uaGFzKHRoaXMuX2lucHV0TWFwLCBrZXkpKSB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lck1hcFtrZXldID0ge1xuICAgICAgICAgICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgICAgICAgICAgY3R4OiBjdHgsXG4gICAgICAgICAgICAgICAgb25Eb3duOiBvbkRvd24sXG4gICAgICAgICAgICAgICAgb25VcDogb25VcFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBFcnJvcjogJHtrZXl9IG5vdCBmb3VuZCBpbiBpbnB1dCBtYXBgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRMaXN0ZW5lckJ5SW5wdXRDb2RlKGNvZGUpIHtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gbnVsbDtcblxuICAgICAgICAvLyBnZXQgdGhlIGlucHV0TWFwIGtleSB2aWEgYSBwaGFzZXIgaW5wdXQgY29kZSAoaS5lIFBoYXNlci5LZXlib2FyZC5VUClcbiAgICAgICAgXy5lYWNoKHRoaXMuX2lucHV0TWFwLCAodiwgaykgPT4ge1xuICAgICAgICAgICAgaWYgKHYgPT09IGNvZGUpIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyB1c2UgdGhpcyBrZXkgdG8gcmV0cmlldmUgdGhlIGxpc3RlbmVyXG4gICAgICAgIGlmIChfLmhhcyh0aGlzLl9saXN0ZW5lck1hcCwga2V5KSkge1xuICAgICAgICAgICAgbGlzdGVuZXIgPSB0aGlzLl9saXN0ZW5lck1hcFtrZXldO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW5wdXRIYW5kbGVyO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBrZXlib2FyZF9oYW5kbGVyLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IElucHV0SGFuZGxlciBmcm9tICdjbGllbnQvaW5wdXQvaW5wdXRfaGFuZGxlcic7XG5cbmNsYXNzIEtleWJvYXJkSGFuZGxlciBleHRlbmRzIElucHV0SGFuZGxlciB7XG4gICAgY3JlYXRlKGlucHV0KSB7XG4gICAgICAgIGlucHV0LmtleWJvYXJkLmFkZENhbGxiYWNrcyh0aGlzLCB0aGlzLl9vbktleURvd24sIHRoaXMuX29uS2V5VXApO1xuICAgIH1cblxuICAgIHNldElucHV0TWFwKGlucHV0TWFwKSB7XG4gICAgICAgIHN1cGVyLnNldElucHV0TWFwKGlucHV0TWFwKTtcblxuICAgICAgICAvLyBleHRlbmQgdGhlIGlucHV0TWFwIHdpdGggc29tZSBkZWZhdWx0IGtleXNcbiAgICAgICAgLy8gdGhhdCB3aWxsIGdlbmVyYWxseSBiZSB1c2VkIGluIGFsbCBzdGF0ZXNcbiAgICAgICAgXy5leHRlbmQodGhpcy5faW5wdXRNYXAsIHtcbiAgICAgICAgICAgIHVwOiBQaGFzZXIuS2V5Ym9hcmQuVVAsXG4gICAgICAgICAgICBkb3duOiBQaGFzZXIuS2V5Ym9hcmQuRE9XTixcbiAgICAgICAgICAgIGxlZnQ6IFBoYXNlci5LZXlib2FyZC5MRUZULFxuICAgICAgICAgICAgcmlnaHQ6IFBoYXNlci5LZXlib2FyZC5SSUdIVFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25LZXlEb3duKGV2ZW50KSB7XG4gICAgICAgIHZhciBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gdGhpcy5fZ2V0TGlzdGVuZXJCeUlucHV0Q29kZShrZXlDb2RlKTtcblxuICAgICAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lci5vbkRvd24pIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5vbkRvd24uY2FsbChsaXN0ZW5lci5jdHgsIGtleUNvZGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobGlzdGVuZXIuaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmhhbmRsZXIuY2FsbChsaXN0ZW5lci5jdHgsIGtleUNvZGUsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29uS2V5VXAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGtleUNvZGUgPSBldmVudC5rZXlDb2RlO1xuICAgICAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLl9nZXRMaXN0ZW5lckJ5SW5wdXRDb2RlKGtleUNvZGUpO1xuXG4gICAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVyLm9uVXApIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5vblVwLmNhbGwobGlzdGVuZXIuY3R4LCBrZXlDb2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyLmhhbmRsZXIpIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5oYW5kbGVyLmNhbGwobGlzdGVuZXIuY3R4LCBrZXlDb2RlLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEtleWJvYXJkSGFuZGxlcjtcblxuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogbGV2ZWwuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuaW1wb3J0IExldmVsTWFuYWdlciBmcm9tICdjbGllbnQvbGV2ZWxzL2xldmVsX21hbmFnZXInO1xuaW1wb3J0IE9wdGlvbnNEaWFsb2cgZnJvbSAnY2xpZW50L2d1aS9vcHRpb25zX2RpYWxvZyc7XG5cbmNsYXNzIExldmVsIGV4dGVuZHMgU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUsIGdyYXZpdHkpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG5cbiAgICAgICAgdGhpcy5ncmF2aXR5ID0gZ3Jhdml0eTtcbiAgICAgICAgdGhpcy5tYXBLZXkgPSAnJztcbiAgICAgICAgdGhpcy5sZXZlbE1hbmFnZXIgPSBudWxsO1xuICAgICAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIHByZWxvYWQoKSB7XG4gICAgICAgIHN1cGVyLnByZWxvYWQoKTtcblxuICAgICAgICAvLyBUT0RPOiBnZXQgdGlsZW1hcCBmcm9tIGNhY2hlLCB0aGlzIHNob3VsZCBiZSBsb2FkZWQgaW4gdGhlXG4gICAgICAgIC8vIHByZWxvYWQgc3RhdGVcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMudGltZXIgPSBuZXcgUGhhc2VyLlRpbWVyKHRoaXMuZ2FtZSwgZmFsc2UpO1xuICAgICAgICB0aGlzLnRpbWUuYWRkKHRoaXMudGltZXIpO1xuICAgICAgICB0aGlzLl9pbml0SW5wdXRIYW5kbGVyKCk7XG4gICAgICAgIHRoaXMucGxheWVyID0gdGhpcy5nYW1lLnBsYXllcjtcbiAgICAgICAgdGhpcy5sZXZlbE1hbmFnZXIgPSBuZXcgTGV2ZWxNYW5hZ2VyKHRoaXMpO1xuXG4gICAgICAgIHRoaXMubGV2ZWxNYW5hZ2VyLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLl9vcHRpb25zRGlhbG9nID0gbmV3IE9wdGlvbnNEaWFsb2codGhpcy5nYW1lLCB0aGlzLFxuICAgICAgICAgICAgZiA9PiB0aGlzLnJlc3VtZSgpLCB0cnVlKTtcbiAgICAgICAgdGhpcy5nYW1lLnN0YXJ0U291bmQucGxheSgpO1xuICAgIH1cblxuICAgIHNodXRkb3duKCkge1xuICAgICAgICBzdXBlci5zaHV0ZG93bigpO1xuICAgICAgICB0aGlzLmxldmVsTWFuYWdlci5zaHV0ZG93bigpO1xuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5sZXZlbE1hbmFnZXIudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgLy9yZW5kZXIoKSB7XG4gICAgICAgIC8vdGhpcy5nYW1lLmRlYnVnLmJvZHkodGhpcy5wbGF5ZXIsICcjRkYwMDAwJywgZmFsc2UpO1xuICAgIC8vfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5nYW1lLmlzUGF1c2VkKSB7XG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zRGlhbG9nLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubGV2ZWxNYW5hZ2VyLnBhdXNlKCk7XG4gICAgICAgICAgICB0aGlzLmdhbWUuaXNQYXVzZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVzdW1lKCkge1xuICAgICAgICBpZiAodGhpcy5nYW1lLmlzUGF1c2VkKSB7XG4gICAgICAgICAgICB0aGlzLmxldmVsTWFuYWdlci5yZXN1bWUoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5pc1BhdXNlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2luaXRJbnB1dEhhbmRsZXIoKSB7XG4gICAgICAgIHRoaXMuaW5wdXRIYW5kbGVyLnNldElucHV0TWFwKHtcbiAgICAgICAgICAgIGp1bXA6IFBoYXNlci5LZXlib2FyZC5aLFxuICAgICAgICAgICAgc2hvb3Q6IFBoYXNlci5LZXlib2FyZC5YLFxuICAgICAgICAgICAgcGF1c2U6IFBoYXNlci5LZXlib2FyZC5FTlRFUlxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlucHV0SGFuZGxlci5hZGRMaXN0ZW5lcignbGVmdCcsIHRoaXMsIHRoaXMuX29uTW92ZSk7XG4gICAgICAgIHRoaXMuaW5wdXRIYW5kbGVyLmFkZExpc3RlbmVyKCdyaWdodCcsIHRoaXMsIHRoaXMuX29uTW92ZSk7XG4gICAgICAgIHRoaXMuaW5wdXRIYW5kbGVyLmFkZExpc3RlbmVyKCdqdW1wJywgdGhpcywgbnVsbCwgdGhpcy5fb25KdW1wLFxuICAgICAgICAgICAgdGhpcy5fb25KdW1wUmVsZWFzZWQpO1xuICAgICAgICB0aGlzLmlucHV0SGFuZGxlci5hZGRMaXN0ZW5lcigncGF1c2UnLCB0aGlzLCB0aGlzLl9vblBhdXNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnB1dCBsaXN0ZW5lcnNcbiAgICAgKi9cbiAgICBfb25Nb3ZlKGtleWNvZGUsIGFjdGl2ZSkge1xuICAgICAgICB2YXIgZGlyID0gKGtleWNvZGUgPT09IFBoYXNlci5LZXlib2FyZC5MRUZUID8gUGhhc2VyLkxFRlQgOlxuICAgICAgICAgICAgUGhhc2VyLlJJR0hUKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIubW92ZShkaXIsIGFjdGl2ZSk7XG4gICAgfVxuXG4gICAgX29uSnVtcChrZXljb2RlKSB7XG4gICAgICAgIHRoaXMucGxheWVyLmp1bXAoKTtcbiAgICB9XG5cbiAgICBfb25KdW1wUmVsZWFzZWQoa2V5Y29kZSkge1xuICAgICAgICB0aGlzLnBsYXllci5qdW1wUmVsZWFzZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIF9vblBhdXNlKGtleWNvZGUpIHtcbiAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGV2ZWw7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBsZXZlbF9tYW5hZ2VyLmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuaW1wb3J0IEdhdGUgZnJvbSAnY2xpZW50L2VudGl0aWVzL2dhdGUnO1xuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcblxuY2xhc3MgTGV2ZWxNYW5hZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihsZXZlbCkge1xuICAgICAgICB0aGlzLm1hcCA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5fcGxheWVyID0gbGV2ZWwucGxheWVyO1xuICAgICAgICB0aGlzLl9sZXZlbCA9IGxldmVsO1xuICAgICAgICB0aGlzLl9nYW1lID0gbGV2ZWwuZ2FtZTtcbiAgICAgICAgdGhpcy5fcGh5c2ljcyA9IGxldmVsLnBoeXNpY3M7XG4gICAgICAgIHRoaXMuX2lucHV0SGFuZGxlciA9IGxldmVsLmlucHV0SGFuZGxlcjtcbiAgICAgICAgdGhpcy5fdGltZXIgPSBsZXZlbC50aW1lcjtcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZW50aXRpZXNHcm91cCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbkxheWVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5fc3RhdGljTGF5ZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwID0gdGhpcy5fbGV2ZWwuYWRkLmdyb3VwKCk7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAgPSB0aGlzLl9sZXZlbC5hZGQuZ3JvdXAoKTtcbiAgICAgICAgdGhpcy5fbWFpbkdyb3VwLmFkZCh0aGlzLl9lbnRpdGllc0dyb3VwKTtcblxuICAgICAgICB0aGlzLl9jcmVhdGVXb3JsZCgpO1xuICAgICAgICB0aGlzLl9wbGF5ZXIuc2V0dXAodGhpcy5fbGV2ZWwpO1xuICAgICAgICB0aGlzLl9lbnRpdGllc0dyb3VwLmFkZCh0aGlzLl9wbGF5ZXIpO1xuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgZW50aXRpZXMgZ3JvdXAgaXMgcmVuZGVyZWQgb24gdG9wXG4gICAgICAgIHRoaXMuX21haW5Hcm91cC5icmluZ1RvVG9wKHRoaXMuX2VudGl0aWVzR3JvdXApO1xuXG4gICAgICAgIHRoaXMuX2xldmVsLmNhbWVyYS5jaGVja0JvdW5kcygpO1xuICAgICAgICB0aGlzLl9sZXZlbC5jYW1lcmEuZm9sbG93KHRoaXMuX3BsYXllciwgUGhhc2VyLkZPTExPV19QTEFURk9STUVSKTtcbiAgICAgICAgdGhpcy5fcGh5c2ljcy5hcmNhZGUuZ3Jhdml0eS55ID0gdGhpcy5fbGV2ZWwuZ3Jhdml0eTtcbiAgICB9XG5cbiAgICBzaHV0ZG93bigpIHtcbiAgICAgICAgdGhpcy5fbGV2ZWwuY2FtZXJhLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuX21haW5Hcm91cC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLl91cGRhdGVDb2xsaXNpb24oKTtcbiAgICAgICAgdGhpcy5fdXBkYXRlRW50aXRpZXMoKTtcbiAgICB9XG5cbiAgICBwYXVzZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9nYW1lLmluTXVsdGlwbGF5ZXJNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9nYW1lLmlucHV0LmtleWJvYXJkLmVuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAuY2FsbEFsbCgncGF1c2UnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VtZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9nYW1lLmluTXVsdGlwbGF5ZXJNb2RlKSB7XG4gICAgICAgICAgICB0aGlzLl9nYW1lLmlucHV0LmtleWJvYXJkLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fZW50aXRpZXNHcm91cC5jYWxsQWxsKCdyZXN1bWUnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jcmVhdGVXb3JsZCgpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlTWFwKCk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZU1hcE9iamVjdHMoKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlTWFwKCkge1xuICAgICAgICB0aGlzLm1hcCA9IHRoaXMuX2xldmVsLmFkZC50aWxlbWFwKHRoaXMuX2xldmVsLm1hcEtleSk7XG4gICAgICAgIHRoaXMubWFwLmFkZFRpbGVzZXRJbWFnZShDb25zdC5USUxFU0VUX0lNRywgQ29uc3QuVElMRVNFVF9JTUcpO1xuXG4gICAgICAgIHRoaXMuX2NvbGxpc2lvbkxheWVyID0gdGhpcy5tYXAuY3JlYXRlTGF5ZXIoJ2NvbGxpc2lvbl9sYXllcicpO1xuICAgICAgICB0aGlzLl9jb2xsaXNpb25MYXllci52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3N0YXRpY0xheWVyID0gdGhpcy5tYXAuY3JlYXRlTGF5ZXIoJ3N0YXRpY19sYXllcicpO1xuICAgICAgICB0aGlzLl9jb2xsaXNpb25MYXllci5yZXNpemVXb3JsZCgpO1xuXG4gICAgICAgIHRoaXMubWFwLnNldENvbGxpc2lvbig5LCB0cnVlLCB0aGlzLl9jb2xsaXNpb25MYXllcik7XG4gICAgICAgIHRoaXMuX21haW5Hcm91cC5hZGQodGhpcy5fc3RhdGljTGF5ZXIpO1xuICAgIH1cblxuICAgIF9jcmVhdGVNYXBPYmplY3RzKCkge1xuICAgICAgICB2YXIgb2JqTGF5ZXIgPSB0aGlzLm1hcC5vYmplY3RzLm9iamVjdF9sYXllcjtcblxuICAgICAgICAvLyBzZXQgcGxheWVyIHNwYXduIHBvaW50XG4gICAgICAgIGZvciAodmFyIG9iaiBvZiBvYmpMYXllcikge1xuICAgICAgICAgICAgc3dpdGNoKG9iai5uYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3Bhd24nOlxuICAgICAgICAgICAgICAgICAgICBsZXQgZ2F0ZSA9IG5ldyBHYXRlKHRoaXMuX2dhbWUsIG9iai54LCBvYmoueSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAuYWRkKGdhdGUpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wbGF5ZXIucG9zaXRpb24uc2V0KG9iai54LCBvYmoueSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3VwZGF0ZUNvbGxpc2lvbigpIHtcbiAgICAgICAgdGhpcy5fcGh5c2ljcy5hcmNhZGUuY29sbGlkZSh0aGlzLl9wbGF5ZXIsIHRoaXMuX2NvbGxpc2lvbkxheWVyKTtcbiAgICB9XG5cbiAgICBfdXBkYXRlRW50aXRpZXMoKSB7XG4gICAgICAgIHRoaXMuX2VudGl0aWVzR3JvdXAuY2FsbEFsbCgndXBkYXRlJyk7XG4gICAgfVxuXG4gICAgX2FkZEVudGl0eShlbnRpdHkpIHtcblxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGV2ZWxNYW5hZ2VyO1xuXG5cbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGluZGV4LmpzXG4gKiBBdXRob3I6IEFudGhvbnkgRGVsIENpb3R0b1xuICogRGVzYzogVE9ET1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuZXhwb3J0cy53b3JsZF8xID0gcmVxdWlyZSgnY2xpZW50L2xldmVscy93b3JsZHMvd29ybGRfMScpO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogd29ybGRfMS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBMZXZlbCBmcm9tICdjbGllbnQvbGV2ZWxzL2xldmVsJztcbmltcG9ydCBDb25zdCBmcm9tICdjb25zdCc7XG5cbmNsYXNzIFRlc3RMZXZlbCBleHRlbmRzIExldmVsIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgICAgIHN1cGVyKGdhbWUsIENvbnN0Lk5PUk1BTF9HUkFWSVRZKTtcblxuICAgICAgICB0aGlzLm1hcEtleSA9ICd0ZXN0bWFwJztcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMuc3RhZ2UuYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XG4gICAgfVxufVxuXG5leHBvcnRzLlRlc3RMZXZlbCA9IFRlc3RMZXZlbDtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IGJvb3QuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBCb290U3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHRoaXMuX2NvbmZpZ3VyZVNjYWxlKCk7XG4gICAgICAgIHRoaXMuX2NvbmZpZ3VyZUlucHV0KCk7XG5cbiAgICAgICAgdGhpcy5nYW1lLnJlbmRlcmVyLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHMgPSB0cnVlO1xuICAgICAgICB0aGlzLnN0YWdlLnNtb290aGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMucGh5c2ljcy5zdGFydFN5c3RlbShQaGFzZXIuUGh5c2ljcy5BUkNBREUpO1xuICAgICAgICB0aGlzLmdhbWUuYWRkLnBsdWdpbihQaGFzZXIuUGx1Z2luLkRlYnVnKTtcblxuICAgICAgICB0aGlzLl9wcmVyZW5kZXIoKTtcbiAgICAgICAgdGhpcy5zdGF0ZS5zdGFydCgncHJlbG9hZCcpO1xuICAgIH1cblxuICAgIF9wcmVyZW5kZXIoKSB7XG4gICAgICAgIC8vIHByZS1yZW5kZXIgc29tZSBzaW1wbGUgYXNzZXRzIHRoYXQgSSBjYW5ub3QgYmUgYm90aGVyZWRcbiAgICAgICAgLy8gY3JlYXRpbmcgaW4gR0lNUFxuICAgICAgICB2YXIgYm1kID0gdGhpcy5hZGQuYml0bWFwRGF0YSgxLCAxKTtcbiAgICAgICAgYm1kLmNvbnRleHQuZmlsbFN0eWxlID0gJyNGRkZGRkYnO1xuICAgICAgICBibWQuY29udGV4dC5maWxsUmVjdCgwLCAwLCAxLCAxKTtcbiAgICAgICAgdGhpcy5jYWNoZS5hZGRCaXRtYXBEYXRhKENvbnN0LkZJTExFRF9SRUNULCBibWQpO1xuXG4gICAgICAgIGJtZCA9IHRoaXMuYWRkLmJpdG1hcERhdGEoMTYsIDE2KTtcbiAgICAgICAgYm1kLmNvbnRleHQuZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuICAgICAgICBibWQuY29udGV4dC5maWxsUmVjdCgwLCAwLCAxNiwgMTYpO1xuICAgICAgICBibWQuY29udGV4dC5zdHJva2VTdHlsZSA9ICcjRkZGRkZGJztcbiAgICAgICAgYm1kLmNvbnRleHQucmVjdCgwLCAwLCAxNiwgMTYpO1xuICAgICAgICBibWQuY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgdGhpcy5jYWNoZS5hZGRCaXRtYXBEYXRhKENvbnN0LlJFQ1QsIGJtZCk7XG4gICAgfVxuXG4gICAgX2NvbmZpZ3VyZVNjYWxlKCkge1xuICAgICAgICB0aGlzLnNjYWxlLm1pbldpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5zY2FsZS5taW5IZWlnaHQgPSB0aGlzLmhlaWdodDtcbiAgICAgICAgdGhpcy5zY2FsZS5wYWdlQWxpZ25Ib3Jpem9udGFsbHkgPSB0cnVlO1xuICAgICAgICB0aGlzLnNjYWxlLnBhZ2VBbGlnblZlcnRpY2FsbHkgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuc2NhbGUuc2NhbGVNb2RlID0gdGhpcy5zY2FsZS5mdWxsU2NyZWVuU2NhbGVNb2RlID1cbiAgICAgICAgICAgIFBoYXNlci5TY2FsZU1hbmFnZXIuU0hPV19BTEw7XG4gICAgICAgIHRoaXMuc2NhbGUuc2V0U2NyZWVuU2l6ZSgpO1xuICAgIH1cblxuICAgIF9jb25maWd1cmVJbnB1dCgpIHtcbiAgICAgICAgLy8gY2FwdHVyZSBjZXJ0YWluIGtleXMgdG8gcHJldmVudCB0aGVpciBkZWZhdWx0IGFjdGlvbnMgaW4gdGhlIGJyb3dzZXIuXG4gICAgICAgIC8vIHRoaXMgaXMgb25seSBuZWNlc3NhcnkgYmVjYXVzZSB0aGlzIGlzIGFuIEhUTUw1IGdhbWUuXG4gICAgICAgIHRoaXMuaW5wdXQua2V5Ym9hcmQuYWRkS2V5Q2FwdHVyZShbXG4gICAgICAgICAgICBQaGFzZXIuS2V5Ym9hcmQuTEVGVCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5SSUdIVCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5VUCxcbiAgICAgICAgICAgIFBoYXNlci5LZXlib2FyZC5ET1dOXG4gICAgICAgIF0pO1xuXG4gICAgICAgIHRoaXMuaW5wdXQubWF4UG9pbnRlcnMgPSAxO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm9vdFN0YXRlO1xuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogbWVudS5qc1xuICogQXV0aG9yOiBBbnRob255IERlbCBDaW90dG9cbiAqIERlc2M6IFRPRE9cbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG5cbmltcG9ydCBTdGF0ZSBmcm9tICdjbGllbnQvc3RhdGVzL3N0YXRlJztcbmltcG9ydCBTdGFyZmllbGQgZnJvbSAnY2xpZW50L2VmZmVjdHMvc3RhcmZpZWxkJztcbmltcG9ydCBPcHRpb25zRGlhbG9nIGZyb20gJ2NsaWVudC9ndWkvb3B0aW9uc19kaWFsb2cnO1xuaW1wb3J0IE1haW5NZW51RGlhbG9nIGZyb20gJ2NsaWVudC9ndWkvbWFpbl9tZW51X2RpYWxvZyc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBNZW51U3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcblxuICAgICAgICB0aGlzLm9wdGlvbnNEaWFsb2cgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuX3N0YXJmaWVsZCA9IG51bGw7XG4gICAgICAgIHRoaXMuX21haW5NZW51RGlhbG9nID0gbnVsbDtcbiAgICB9XG5cbiAgICBjcmVhdGUoKSB7XG4gICAgICAgIHN1cGVyLmNyZWF0ZSgpO1xuXG4gICAgICAgIHRoaXMud29ybGQucmVzaXplKHRoaXMuZ2FtZS53aWR0aCwgdGhpcy5nYW1lLmhlaWdodCk7XG4gICAgICAgIHRoaXMuX3N0YXJmaWVsZCA9IG5ldyBTdGFyZmllbGQodGhpcywgNCwgMzIpO1xuICAgICAgICB0aGlzLl9jcmVhdGVMb2dvKCk7XG5cbiAgICAgICAgdGhpcy5vcHRpb25zRGlhbG9nID0gbmV3IE9wdGlvbnNEaWFsb2codGhpcy5nYW1lLCB0aGlzLFxuICAgICAgICAgICAgZiA9PiB0aGlzLl9vbk9wdGlvbnNDbG9zZSgpKTtcbiAgICAgICAgdGhpcy5fbWFpbk1lbnVEaWFsb2cgPSBuZXcgTWFpbk1lbnVEaWFsb2codGhpcy5nYW1lLCB0aGlzLFxuICAgICAgICAgICAgZiA9PiB0aGlzLl9vbk1haW5NZW51Q2xvc2UoKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlKCkge1xuICAgICAgICB0aGlzLl9zdGFyZmllbGQudXBkYXRlKCk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUxvZ28oKSB7XG4gICAgICAgIHZhciB0b3BIYWxmID0gdGhpcy5hZGQuc3ByaXRlKC0zNiwgdGhpcy5nYW1lLmhlaWdodC8yIC0gNTQsXG4gICAgICAgICAgICBDb25zdC5HQU1FX0xPR08sIDApO1xuICAgICAgICB2YXIgYm90dG9tSGFsZiA9IHRoaXMuYWRkLnNwcml0ZSh0aGlzLmdhbWUud2lkdGggKyAzNixcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5oZWlnaHQvMiAtIDE4LCBDb25zdC5HQU1FX0xPR08sIDEpO1xuXG4gICAgICAgIHRvcEhhbGYuYW5jaG9yLnggPSB0b3BIYWxmLmFuY2hvci55ID0gYm90dG9tSGFsZi5hbmNob3IueCA9XG4gICAgICAgICAgICBib3R0b21IYWxmLmFuY2hvci55ID0gMC41O1xuICAgICAgICB0b3BIYWxmLnNjYWxlLnggPSB0b3BIYWxmLnNjYWxlLnkgPSBib3R0b21IYWxmLnNjYWxlLnggPVxuICAgICAgICAgICAgYm90dG9tSGFsZi5zY2FsZS55ID0gMztcbiAgICAgICAgdGhpcy5hZGQudHdlZW4odG9wSGFsZilcbiAgICAgICAgICAgIC50byh7IHg6IHRoaXMuZ2FtZS53aWR0aC8yIH0sIDEwMDAsIFBoYXNlci5FYXNpbmcuRXhwb25lbnRpYWwuT3V0LFxuICAgICAgICAgICAgICAgIHRydWUpO1xuICAgICAgICB0aGlzLmFkZC50d2Vlbihib3R0b21IYWxmKVxuICAgICAgICAgICAgLnRvKHsgeDogdGhpcy5nYW1lLndpZHRoLzIgfSwgMTAwMCwgUGhhc2VyLkVhc2luZy5FeHBvbmVudGlhbC5PdXQsXG4gICAgICAgICAgICAgICAgdHJ1ZSlcbiAgICAgICAgICAgIC5vbkNvbXBsZXRlLmFkZChmID0+IHRoaXMuX21haW5NZW51RGlhbG9nLnNob3coKSk7XG4gICAgfVxuXG4gICAgX29uT3B0aW9uc0Nsb3NlKCkge1xuICAgICAgICB0aGlzLl9tYWluTWVudURpYWxvZy5zaG93KCk7XG4gICAgfVxuXG4gICAgX29uTWFpbk1lbnVDbG9zZSgpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zRGlhbG9nLnNob3coKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lbnVTdGF0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHBsYXkuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgUGxheWVyIGZyb20gJ2NsaWVudC9lbnRpdGllcy9wbGF5ZXInO1xuaW1wb3J0IENvbnN0IGZyb20gJ2NvbnN0JztcblxuY2xhc3MgUGxheVN0YXRlIGV4dGVuZHMgU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICBzdXBlci5jcmVhdGUoKTtcblxuICAgICAgICB0aGlzLmdhbWUucGxheWVyID0gbmV3IFBsYXllcih0aGlzLmdhbWUsIDAsIDApO1xuICAgICAgICB0aGlzLmdhbWUuc3RhcnRTb3VuZCA9IHRoaXMuZ2FtZS5hZGQuYXVkaW8oQ29uc3QuU1RBUlRfU09VTkQpO1xuICAgICAgICB0aGlzLmdhbWUuaGl0R3JvdW5kU291bmQgPSB0aGlzLmdhbWUuYWRkLmF1ZGlvKENvbnN0LkZBTExfU09VTkQpO1xuICAgICAgICB0aGlzLmdhbWUuanVtcFNvdW5kID0gdGhpcy5nYW1lLmFkZC5hdWRpbyhDb25zdC5KVU1QX1NPVU5EKTtcblxuICAgICAgICB0aGlzLnN0YXRlLnN0YXJ0KCdsZXZlbF8xXzEnKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBsYXlTdGF0ZTtcbiIsIi8qXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIEZpbGU6IHByZWxvYWQuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBQcmVsb2FkU3RhdGUgZXh0ZW5kcyBTdGF0ZSB7XG4gICAgY29uc3RydWN0b3IoZ2FtZSkge1xuICAgICAgICBzdXBlcihnYW1lKTtcbiAgICB9XG5cbiAgICBwcmVsb2FkKCkge1xuICAgICAgICBzdXBlci5wcmVsb2FkKCk7XG5cbiAgICAgICAgdmFyIGxvYWRpbmdCYXIgPSB0aGlzLmFkZC5zcHJpdGUodGhpcy5nYW1lLndpZHRoLzIsIHRoaXMuZ2FtZS5oZWlnaHQvMixcbiAgICAgICAgICAgIHRoaXMuY2FjaGUuZ2V0Qml0bWFwRGF0YShDb25zdC5GSUxMRURfUkVDVCkpO1xuICAgICAgICBsb2FkaW5nQmFyLmFuY2hvci5zZXQoMC41KTtcbiAgICAgICAgbG9hZGluZ0Jhci53aWR0aCA9IDEyODtcbiAgICAgICAgbG9hZGluZ0Jhci5oZWlnaHQgPSAxNjtcbiAgICAgICAgdGhpcy5sb2FkLnNldFByZWxvYWRTcHJpdGUobG9hZGluZ0Jhcik7XG5cbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KENvbnN0LlNQUklURV9TSEVFVCwgJ3Jlcy9pbWcvc2hlZXQucG5nJywgMTIsIDEyKTtcbiAgICAgICAgdGhpcy5sb2FkLnNwcml0ZXNoZWV0KENvbnN0LkdBTUVfTE9HTywgJ3Jlcy9pbWcvbG9nby5wbmcnLCAyNCwgMTIpO1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoQ29uc3QuSFRNTF9MT0dPLCAncmVzL2ltZy9odG1sLnBuZycpO1xuICAgICAgICB0aGlzLmxvYWQuYml0bWFwRm9udChDb25zdC5HQU1FX0ZPTlQsICdyZXMvZm9udHMvcGx1bWJlcl9icm9zLnBuZycsXG4gICAgICAgICAgICAncmVzL2ZvbnRzL3BsdW1iZXJfYnJvcy54bWwnKTtcblxuICAgICAgICB0aGlzLmxvYWQudGlsZW1hcCgndGVzdG1hcCcsICdyZXMvdGlsZW1hcHMvdGVzdG1hcC5qc29uJyxcbiAgICAgICAgICAgIG51bGwsIFBoYXNlci5UaWxlbWFwLlRJTEVEX0pTT04pO1xuICAgICAgICB0aGlzLmxvYWQuaW1hZ2UoQ29uc3QuVElMRVNFVF9JTUcsICdyZXMvdGlsZW1hcHMvdGlsZXMucG5nJyk7XG5cbiAgICAgICAgdGhpcy5sb2FkLmF1ZGlvKENvbnN0LlNUQVJUX1NPVU5ELCAncmVzL3NvdW5kcy9zdGFydC5tcDMnKTtcbiAgICAgICAgdGhpcy5sb2FkLmF1ZGlvKENvbnN0LkpVTVBfU09VTkQsICdyZXMvc291bmRzL2p1bXAubXAzJyk7XG4gICAgICAgIHRoaXMubG9hZC5hdWRpbyhDb25zdC5GQUxMX1NPVU5ELCAncmVzL3NvdW5kcy9oaXRfZ3JvdW5kLm1wMycpO1xuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgc3VwZXIuY3JlYXRlKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZS5zdGFydCgnc3BsYXNoJyk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmVsb2FkU3RhdGU7XG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBzcGxhc2guanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgU3RhdGUgZnJvbSAnY2xpZW50L3N0YXRlcy9zdGF0ZSc7XG5pbXBvcnQgQ29uc3QgZnJvbSAnY29uc3QnO1xuXG5jbGFzcyBTcGxhc2hTdGF0ZSBleHRlbmRzIFN0YXRlIHtcbiAgICBjb25zdHJ1Y3RvcihnYW1lKSB7XG4gICAgICAgIHN1cGVyKGdhbWUpO1xuICAgIH1cblxuICAgIGNyZWF0ZSgpIHtcbiAgICAgICAgc3VwZXIuY3JlYXRlKCk7XG4gICAgICAgIHRoaXMuX2h0bWxMb2dvID0gdGhpcy5hZGQuc3ByaXRlKHRoaXMud29ybGQuY2VudGVyWCwgdGhpcy53b3JsZC5jZW50ZXJZLFxuICAgICAgICAgICAgQ29uc3QuSFRNTF9MT0dPKTtcbiAgICAgICAgdGhpcy5faHRtbExvZ28uc21vb3RoZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLl9odG1sTG9nby5hbmNob3Iuc2V0KDAuNSwgMC41KTtcbiAgICAgICAgdGhpcy5faHRtbExvZ28uc2NhbGUuc2V0KDAuNSk7XG4gICAgICAgIHRoaXMuX2h0bWxMb2dvLmFscGhhID0gMDtcblxuICAgICAgICB0aGlzLl9jcmVhdGVIdG1sVHdlZW4oKTtcbiAgICB9XG5cbiAgICBfY3JlYXRlSHRtbFR3ZWVuKCkge1xuICAgICAgICB2YXIgaHRtbFR3ZWVuID0gdGhpcy5hZGQudHdlZW4odGhpcy5faHRtbExvZ28pLnRvKHthbHBoYTogMX0sIDEwMDAsXG4gICAgICAgICAgICBQaGFzZXIuRWFzaW5nLkN1YmljLkluLCB0cnVlLCAwLCAwLCB0cnVlKTtcbiAgICAgICAgaHRtbFR3ZWVuLm9uQ29tcGxldGUuYWRkKCgpID0+IHsgdGhpcy5zdGF0ZS5zdGFydCgnbWFpbm1lbnUnKTsgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBTcGxhc2hTdGF0ZTtcblxuIiwiLypcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogRmlsZTogc3RhdGUuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5pbXBvcnQgS2V5Ym9hcmRIYW5kbGVyIGZyb20gJ2NsaWVudC9pbnB1dC9rZXlib2FyZF9oYW5kbGVyJztcblxuY2xhc3MgU3RhdGUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xuICAgIGNvbnN0cnVjdG9yKGdhbWUpIHtcbiAgICAgICAgc3VwZXIoZ2FtZSk7XG5cbiAgICAgICAgdGhpcy5pbnB1dEhhbmRsZXIgPSBuZXcgS2V5Ym9hcmRIYW5kbGVyKCk7XG4gICAgfVxuXG4gICAgY3JlYXRlKCkge1xuICAgICAgICBzdXBlci5jcmVhdGUoKTtcbiAgICAgICAgdGhpcy5zdGFnZS5iYWNrZ3JvdW5kQ29sb3IgPSAweDAwMDAwMDtcbiAgICAgICAgdGhpcy5pbnB1dEhhbmRsZXIuY3JlYXRlKHRoaXMuaW5wdXQpO1xuICAgIH1cblxuICAgIHNodXRkb3duKCkge1xuICAgICAgICB0aGlzLnNvdW5kLnN0b3BBbGwoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRlO1xuXG4iLCIvKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBGaWxlOiBjb25zdGFudHMuanNcbiAqIEF1dGhvcjogQW50aG9ueSBEZWwgQ2lvdHRvXG4gKiBEZXNjOiBUT0RPXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvKipcbiAgICAgKiBjb2xvciBjb25zdGFudHNcbiAgICAgKi9cbiAgICBTS1lfQkxVRTogMHg2RDkzRkMsXG4gICAgR09MRDogMHhGRkQ3MDAsXG5cbiAgICAvKipcbiAgICAgKiBwaHlzaWNzIGNvbnN0YW50c1xuICAgICAqL1xuICAgIE5PUk1BTF9HUkFWSVRZOiA1MjAuMCxcbiAgICBQTEFZRVJfQUNDRUw6IDQ4MC4wLFxuICAgIFBMQVlFUl9NQVhfVkVMOiAxMjAuMCxcbiAgICBQTEFZRVJfRFJBRzogNTIwLjAsXG4gICAgUExBWUVSX0pVTVBfU1BFRUQ6IC0yNTYuMCxcbiAgICBQTEFZRVJfTUFYX0ZBTExfU1BFRUQ6IDMyMCxcblxuICAgIC8qKlxuICAgICAqIGFzc2V0IGNvbnN0YW50c1xuICAgICAqL1xuICAgIEhUTUxfTE9HTzogJ2h0bWxfbG9nbycsXG4gICAgR0FNRV9MT0dPOiAnZ2FtZV9sb2dvJyxcbiAgICBTUFJJVEVfU0hFRVQ6ICdzcHJpdGVzaGVldCcsXG4gICAgRklMTEVEX1JFQ1Q6ICdmaWxsZWRfcmVjdCcsXG4gICAgUkVDVDogJ3JlY3QnLFxuICAgIFRJTEVTRVRfSU1HOiAndGlsZXMnLFxuICAgIEdBTUVfRk9OVDogJ3JldHJvX2ZudCcsXG4gICAgU1RBUlRfU09VTkQ6ICdzdGFydCcsXG4gICAgSlVNUF9TT1VORDogJ2p1bXAnLFxuICAgIEZBTExfU09VTkQ6ICdmYWxsJyxcblxuICAgIC8qKlxuICAgICAqIHNpemUgY29uc3RhbnRzXG4gICAgICovXG4gICAgQkxPQ0tfU0laRTogMTJcbn07XG4iXX0=