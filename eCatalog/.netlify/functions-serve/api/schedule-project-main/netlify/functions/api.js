var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "../node_modules/cookie/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parse = parse3;
    exports2.serialize = serialize2;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse3(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
          break;
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        if (obj[key] === void 0) {
          let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str, endIdx, valStartIdx);
          const value = dec(str.slice(valStartIdx, valEndIdx));
          obj[key] = value;
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        const code = str.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    function serialize2(name, val, options) {
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str = name + "=" + value;
      if (!options)
        return str;
      if (options.maxAge !== void 0) {
        if (!Number.isInteger(options.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
      }
      if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
          throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
      }
      if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
          throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
      }
      if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
      }
      if (options.httpOnly) {
        str += "; HttpOnly";
      }
      if (options.secure) {
        str += "; Secure";
      }
      if (options.partitioned) {
        str += "; Partitioned";
      }
      if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
      }
      if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
      }
      return str;
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// ../netlify/functions/api.js
var api_exports = {};
__export(api_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(api_exports);

// ../node_modules/postgres/src/index.js
var import_os = __toESM(require("os"), 1);
var import_fs = __toESM(require("fs"), 1);

// ../node_modules/postgres/src/query.js
var originCache = /* @__PURE__ */ new Map();
var originStackCache = /* @__PURE__ */ new Map();
var originError = Symbol("OriginError");
var CLOSE = {};
var Query = class extends Promise {
  constructor(strings, args, handler2, canceller, options = {}) {
    let resolve, reject;
    super((a, b2) => {
      resolve = a;
      reject = b2;
    });
    this.tagged = Array.isArray(strings.raw);
    this.strings = strings;
    this.args = args;
    this.handler = handler2;
    this.canceller = canceller;
    this.options = options;
    this.state = null;
    this.statement = null;
    this.resolve = (x) => (this.active = false, resolve(x));
    this.reject = (x) => (this.active = false, reject(x));
    this.active = false;
    this.cancelled = null;
    this.executed = false;
    this.signature = "";
    this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
  }
  get origin() {
    return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || "";
  }
  static get [Symbol.species]() {
    return Promise;
  }
  cancel() {
    return this.canceller && (this.canceller(this), this.canceller = null);
  }
  simple() {
    this.options.simple = true;
    this.options.prepare = false;
    return this;
  }
  async readable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  async writable() {
    this.simple();
    this.streaming = true;
    return this;
  }
  cursor(rows = 1, fn) {
    this.options.simple = false;
    if (typeof rows === "function") {
      fn = rows;
      rows = 1;
    }
    this.cursorRows = rows;
    if (typeof fn === "function")
      return this.cursorFn = fn, this;
    let prev;
    return {
      [Symbol.asyncIterator]: () => ({
        next: () => {
          if (this.executed && !this.active)
            return { done: true };
          prev && prev();
          const promise = new Promise((resolve, reject) => {
            this.cursorFn = (value) => {
              resolve({ value, done: false });
              return new Promise((r) => prev = r);
            };
            this.resolve = () => (this.active = false, resolve({ done: true }));
            this.reject = (x) => (this.active = false, reject(x));
          });
          this.execute();
          return promise;
        },
        return() {
          prev && prev(CLOSE);
          return { done: true };
        }
      })
    };
  }
  describe() {
    this.options.simple = false;
    this.onlyDescribe = this.options.prepare = true;
    return this;
  }
  stream() {
    throw new Error(".stream has been renamed to .forEach");
  }
  forEach(fn) {
    this.forEachFn = fn;
    this.handle();
    return this;
  }
  raw() {
    this.isRaw = true;
    return this;
  }
  values() {
    this.isRaw = "values";
    return this;
  }
  async handle() {
    !this.executed && (this.executed = true) && await 1 && this.handler(this);
  }
  execute() {
    this.handle();
    return this;
  }
  then() {
    this.handle();
    return super.then.apply(this, arguments);
  }
  catch() {
    this.handle();
    return super.catch.apply(this, arguments);
  }
  finally() {
    this.handle();
    return super.finally.apply(this, arguments);
  }
};
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}

// ../node_modules/postgres/src/errors.js
var PostgresError = class extends Error {
  constructor(x) {
    super(x.message);
    this.name = this.constructor.name;
    Object.assign(this, x);
  }
};
var Errors = {
  connection,
  postgres,
  generic,
  notSupported
};
function connection(x, options, socket) {
  const { host, port } = socket || options;
  const error = Object.assign(
    new Error("write " + x + " " + (options.path || host + ":" + port)),
    {
      code: x,
      errno: x,
      address: options.path || host
    },
    options.path ? {} : { port }
  );
  Error.captureStackTrace(error, connection);
  return error;
}
function postgres(x) {
  const error = new PostgresError(x);
  Error.captureStackTrace(error, postgres);
  return error;
}
function generic(code, message) {
  const error = Object.assign(new Error(code + ": " + message), { code });
  Error.captureStackTrace(error, generic);
  return error;
}
function notSupported(x) {
  const error = Object.assign(
    new Error(x + " (B) is not supported"),
    {
      code: "MESSAGE_NOT_SUPPORTED",
      name: x
    }
  );
  Error.captureStackTrace(error, notSupported);
  return error;
}

// ../node_modules/postgres/src/types.js
var types = {
  string: {
    to: 25,
    from: null,
    // defaults to string
    serialize: (x) => "" + x
  },
  number: {
    to: 0,
    from: [21, 23, 26, 700, 701],
    serialize: (x) => "" + x,
    parse: (x) => +x
  },
  json: {
    to: 114,
    from: [114, 3802],
    serialize: (x) => JSON.stringify(x),
    parse: (x) => JSON.parse(x)
  },
  boolean: {
    to: 16,
    from: 16,
    serialize: (x) => x === true ? "t" : "f",
    parse: (x) => x === "t"
  },
  date: {
    to: 1184,
    from: [1082, 1114, 1184],
    serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
    parse: (x) => new Date(x)
  },
  bytea: {
    to: 17,
    from: 17,
    serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
    parse: (x) => Buffer.from(x.slice(2), "hex")
  }
};
var NotTagged = class {
  then() {
    notTagged();
  }
  catch() {
    notTagged();
  }
  finally() {
    notTagged();
  }
};
var Identifier = class extends NotTagged {
  constructor(value) {
    super();
    this.value = escapeIdentifier(value);
  }
};
var Parameter = class extends NotTagged {
  constructor(value, type, array) {
    super();
    this.value = value;
    this.type = type;
    this.array = array;
  }
};
var Builder = class extends NotTagged {
  constructor(first, rest) {
    super();
    this.first = first;
    this.rest = rest;
  }
  build(before, parameters, types2, options) {
    const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b2) => a.i - b2.i).pop();
    return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types2, options);
  }
};
function handleValue(x, parameters, types2, options) {
  let value = x instanceof Parameter ? x.value : x;
  if (value === void 0) {
    x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
    if (value === void 0)
      throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
  }
  return "$" + types2.push(
    x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
  );
}
var defaultHandlers = typeHandlers(types);
function stringify(q, string, value, parameters, types2, options) {
  for (let i = 1; i < q.strings.length; i++) {
    string += stringifyValue(string, value, parameters, types2, options) + q.strings[i];
    value = q.args[i];
  }
  return string;
}
function stringifyValue(string, value, parameters, types2, o) {
  return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
}
function fragment(q, parameters, types2, options) {
  q.fragment = true;
  return stringify(q, q.strings[0], q.args[0], parameters, types2, options);
}
function valuesBuilder(first, parameters, types2, columns, options) {
  return first.map(
    (row) => "(" + columns.map(
      (column) => stringifyValue("values", row[column], parameters, types2, options)
    ).join(",") + ")"
  ).join(",");
}
function values(first, rest, parameters, types2, options) {
  const multi = Array.isArray(first[0]);
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
  return valuesBuilder(multi ? first : [first], parameters, types2, columns, options);
}
function select(first, rest, parameters, types2, options) {
  typeof first === "string" && (first = [first].concat(rest));
  if (Array.isArray(first))
    return escapeIdentifiers(first, options);
  let value;
  const columns = rest.length ? rest.flat() : Object.keys(first);
  return columns.map((x) => {
    value = first[x];
    return (value instanceof Query ? fragment(value, parameters, types2, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options)) + " as " + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
  }).join(",");
}
var builders = Object.entries({
  values,
  in: (...xs) => {
    const x = values(...xs);
    return x === "()" ? "(null)" : x;
  },
  select,
  as: select,
  returning: select,
  "\\(": select,
  update(first, rest, parameters, types2, options) {
    return (rest.length ? rest.flat() : Object.keys(first)).map(
      (x) => escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options)
    );
  },
  insert(first, rest, parameters, types2, options) {
    const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
    return "(" + escapeIdentifiers(columns, options) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options);
  }
}).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
var serializers = defaultHandlers.serializers;
var parsers = defaultHandlers.parsers;
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
var mergeUserTypes = function(types2) {
  const user = typeHandlers(types2 || {});
  return {
    serializers: Object.assign({}, serializers, user.serializers),
    parsers: Object.assign({}, parsers, user.parsers)
  };
};
function typeHandlers(types2) {
  return Object.keys(types2).reduce((acc, k) => {
    types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
    if (types2[k].serialize) {
      acc.serializers[types2[k].to] = types2[k].serialize;
      types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
    }
    return acc;
  }, { parsers: {}, serializers: {} });
}
function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
}
var escapeIdentifier = function escape(str) {
  return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
};
var inferType = function inferType2(x) {
  return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
};
var escapeBackslash = /\\/g;
var escapeQuote = /"/g;
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
var arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
  if (Array.isArray(xs) === false)
    return xs;
  if (!xs.length)
    return "{}";
  const first = xs[0];
  const delimiter = typarray === 1020 ? ";" : ",";
  if (Array.isArray(first) && !first.type)
    return "{" + xs.map((x) => arraySerializer2(x, serializer, options, typarray)).join(delimiter) + "}";
  return "{" + xs.map((x) => {
    if (x === void 0) {
      x = options.transform.undefined;
      if (x === void 0)
        throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
    }
    return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
  }).join(delimiter) + "}";
};
var arrayParserState = {
  i: 0,
  char: null,
  str: "",
  quoted: false,
  last: 0
};
var arrayParser = function arrayParser2(x, parser, typarray) {
  arrayParserState.i = arrayParserState.last = 0;
  return arrayParserLoop(arrayParserState, x, parser, typarray);
};
function arrayParserLoop(s, x, parser, typarray) {
  const xs = [];
  const delimiter = typarray === 1020 ? ";" : ",";
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i];
    if (s.quoted) {
      if (s.char === "\\") {
        s.str += x[++s.i];
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str);
        s.str = "";
        s.quoted = x[s.i + 1] === '"';
        s.last = s.i + 2;
      } else {
        s.str += s.char;
      }
    } else if (s.char === '"') {
      s.quoted = true;
    } else if (s.char === "{") {
      s.last = ++s.i;
      xs.push(arrayParserLoop(s, x, parser, typarray));
    } else if (s.char === "}") {
      s.quoted = false;
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
      break;
    } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
    }
    s.p = s.char;
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
  return xs;
}
var toCamel = (x) => {
  let str = x[0];
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toPascal = (x) => {
  let str = x[0].toUpperCase();
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toKebab = (x) => x.replace(/_/g, "-");
var fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
var fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
var fromKebab = (x) => x.replace(/-/g, "_");
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
toCamel.column = { from: toCamel };
toCamel.value = { from: createJsonTransform(toCamel) };
fromCamel.column = { to: fromCamel };
var camel = { ...toCamel };
camel.column.to = fromCamel;
toPascal.column = { from: toPascal };
toPascal.value = { from: createJsonTransform(toPascal) };
fromPascal.column = { to: fromPascal };
var pascal = { ...toPascal };
pascal.column.to = fromPascal;
toKebab.column = { from: toKebab };
toKebab.value = { from: createJsonTransform(toKebab) };
fromKebab.column = { to: fromKebab };
var kebab = { ...toKebab };
kebab.column.to = fromKebab;

// ../node_modules/postgres/src/connection.js
var import_net = __toESM(require("net"), 1);
var import_tls = __toESM(require("tls"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_stream = __toESM(require("stream"), 1);
var import_perf_hooks = require("perf_hooks");

// ../node_modules/postgres/src/result.js
var Result = class extends Array {
  constructor() {
    super();
    Object.defineProperties(this, {
      count: { value: null, writable: true },
      state: { value: null, writable: true },
      command: { value: null, writable: true },
      columns: { value: null, writable: true },
      statement: { value: null, writable: true }
    });
  }
  static get [Symbol.species]() {
    return Array;
  }
};

// ../node_modules/postgres/src/queue.js
var queue_default = Queue;
function Queue(initial = []) {
  let xs = initial.slice();
  let index = 0;
  return {
    get length() {
      return xs.length - index;
    },
    remove: (x) => {
      const index2 = xs.indexOf(x);
      return index2 === -1 ? null : (xs.splice(index2, 1), x);
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index++];
      if (index === xs.length) {
        index = 0;
        xs = [];
      } else {
        xs[index - 1] = void 0;
      }
      return out;
    }
  };
}

// ../node_modules/postgres/src/bytes.js
var size = 256;
var buffer = Buffer.allocUnsafe(size);
var messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
  const v = x.charCodeAt(0);
  acc[x] = () => {
    buffer[0] = v;
    b.i = 5;
    return b;
  };
  return acc;
}, {});
var b = Object.assign(reset, messages, {
  N: String.fromCharCode(0),
  i: 0,
  inc(x) {
    b.i += x;
    return b;
  },
  str(x) {
    const length = Buffer.byteLength(x);
    fit(length);
    b.i += buffer.write(x, b.i, length, "utf8");
    return b;
  },
  i16(x) {
    fit(2);
    buffer.writeUInt16BE(x, b.i);
    b.i += 2;
    return b;
  },
  i32(x, i) {
    if (i || i === 0) {
      buffer.writeUInt32BE(x, i);
      return b;
    }
    fit(4);
    buffer.writeUInt32BE(x, b.i);
    b.i += 4;
    return b;
  },
  z(x) {
    fit(x);
    buffer.fill(0, b.i, b.i + x);
    b.i += x;
    return b;
  },
  raw(x) {
    buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
    b.i = buffer.length;
    return b;
  },
  end(at = 1) {
    buffer.writeUInt32BE(b.i - at, at);
    const out = buffer.subarray(0, b.i);
    b.i = 0;
    buffer = Buffer.allocUnsafe(size);
    return out;
  }
});
var bytes_default = b;
function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer, length = prev.length;
    buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
    prev.copy(buffer);
  }
}
function reset() {
  b.i = 0;
  return b;
}

// ../node_modules/postgres/src/connection.js
var connection_default = Connection;
var uid = 1;
var Sync = bytes_default().S().end();
var Flush = bytes_default().H().end();
var SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
var ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
var DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
var noop = () => {
};
var retryRoutines = /* @__PURE__ */ new Set([
  "FetchPreparedStatement",
  "RevalidateCachedQuery",
  "transformAssignedExpr"
]);
var errorFields = {
  83: "severity_local",
  // S
  86: "severity",
  // V
  67: "code",
  // C
  77: "message",
  // M
  68: "detail",
  // D
  72: "hint",
  // H
  80: "position",
  // P
  112: "internal_position",
  // p
  113: "internal_query",
  // q
  87: "where",
  // W
  115: "schema_name",
  // s
  116: "table_name",
  // t
  99: "column_name",
  // c
  100: "data type_name",
  // d
  110: "constraint_name",
  // n
  70: "file",
  // F
  76: "line",
  // L
  82: "routine"
  // R
};
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    sslnegotiation,
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers: parsers2,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff: backoff2,
    target_session_attrs
  } = options;
  const sent = queue_default(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
  let socket = null, cancelMessage, errorResponse = null, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
  const connection2 = {
    queue: queues.closed,
    idleTimer,
    connect(query2) {
      initial = query2;
      reconnect();
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  };
  queues.closed && queues.closed.push(connection2);
  return connection2;
  async function createSocket() {
    let x;
    try {
      x = options.socket ? await Promise.resolve(options.socket(options)) : new import_net.default.Socket();
    } catch (e) {
      error(e);
      return;
    }
    x.on("error", error);
    x.on("close", closed);
    x.on("drain", drain);
    return x;
  }
  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes_default().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
      await connect();
      socket.once("error", reject);
      socket.once("close", resolve);
    } catch (error2) {
      reject(error2);
    }
  }
  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection("CONNECTION_DESTROYED", options));
    if (stream)
      return queryError(q, Errors.generic("COPY_IN_PROGRESS", "You cannot execute queries during copy"));
    if (q.cancelled)
      return;
    try {
      q.state = backend;
      query ? sent.push(q) : (query = q, query.active = true);
      build(q);
      return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection2));
    } catch (error2) {
      sent.length === 0 && write(Sync);
      errored(error2);
      return true;
    }
  }
  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
    return q.options.simple ? bytes_default().Q().str(q.statement.string + bytes_default.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
  }
  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe("S", q.statement.name)
    ]);
  }
  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
    ]);
  }
  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ]);
  }
  function build(q) {
    const parameters = [], types2 = [];
    const string = stringify(q, q.strings[0], q.args[0], parameters, types2, options);
    !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types2, options));
    q.prepare = options.prepare && ("prepare" in q.options ? q.options.prepare : true);
    q.string = string;
    q.signature = q.prepare && types2 + string;
    q.onlyDescribe && delete statements[q.signature];
    q.parameters = q.parameters || parameters;
    q.prepared = q.prepare && q.signature in statements;
    q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
    q.statement = q.prepared ? statements[q.signature] : { string, types: types2, name: q.prepare ? statementId + statementCount++ : "" };
    typeof options.debug === "function" && options.debug(id, string, parameters, types2);
  }
  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
    if (fn || chunk.length >= 1024)
      return nextWrite(fn);
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
    return true;
  }
  function nextWrite(fn) {
    const x = socket.write(chunk, fn);
    nextWriteTimer !== null && clearImmediate(nextWriteTimer);
    chunk = nextWriteTimer = null;
    return x;
  }
  function connectTimedOut() {
    errored(Errors.connection("CONNECT_TIMEOUT", options, socket));
    socket.destroy();
  }
  async function secure() {
    if (sslnegotiation !== "direct") {
      write(SSLRequest);
      const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
      if (!canSSL && ssl === "prefer")
        return connected();
    }
    const options2 = {
      socket,
      servername: import_net.default.isIP(socket.host) ? void 0 : socket.host
    };
    if (sslnegotiation === "direct")
      options2.ALPNProtocols = ["postgresql"];
    if (ssl === "require" || ssl === "allow" || ssl === "prefer")
      options2.rejectUnauthorized = false;
    else if (typeof ssl === "object")
      Object.assign(options2, ssl);
    socket.removeAllListeners();
    socket = import_tls.default.connect(options2);
    socket.on("secureConnect", connected);
    socket.on("error", error);
    socket.on("close", closed);
    socket.on("drain", drain);
  }
  function drain() {
    !query && onopen(connection2);
  }
  function data(x) {
    if (incomings) {
      incomings.push(x);
      remaining -= x.length;
      if (remaining > 0)
        return;
    }
    incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1);
      if (length >= incoming.length) {
        remaining = length - incoming.length;
        incomings = [incoming];
        break;
      }
      try {
        handle(incoming.subarray(0, length + 1));
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        errored(e);
      }
      incoming = incoming.subarray(length + 1);
      remaining = 0;
      incomings = null;
    }
  }
  async function connect() {
    terminated = false;
    backendParameters = {};
    socket || (socket = await createSocket());
    if (!socket)
      return;
    connectTimer.start();
    if (options.socket)
      return ssl ? secure() : connected();
    socket.on("connect", ssl ? secure : connected);
    if (options.path)
      return socket.connect(options.path);
    socket.ssl = ssl;
    socket.connect(port[hostIndex], host[hostIndex]);
    socket.host = host[hostIndex];
    socket.port = port[hostIndex];
    hostIndex = (hostIndex + 1) % port.length;
  }
  function reconnect() {
    setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - import_perf_hooks.performance.now()) : 0);
  }
  function connected() {
    try {
      statements = {};
      needsTypes = options.fetch_types;
      statementId = Math.random().toString(36).slice(2);
      statementCount = 1;
      lifeTimer.start();
      socket.on("data", data);
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
      const s = StartupMessage();
      write(s);
    } catch (err) {
      error(err);
    }
  }
  function error(err) {
    if (connection2.queue === queues.connecting && options.host[retries + 1])
      return;
    errored(err);
    while (sent.length)
      queryError(sent.shift(), err);
  }
  function errored(err) {
    stream && (stream.destroy(err), stream = null);
    query && queryError(query, err);
    initial && (queryError(initial, err), initial = null);
  }
  function queryError(query2, err) {
    if (query2.reserve)
      return query2.reject(err);
    if (!err || typeof err !== "object")
      err = new Error(err);
    "query" in err || "parameters" in err || Object.defineProperties(err, {
      stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options.debug },
      query: { value: query2.string, enumerable: options.debug },
      parameters: { value: query2.parameters, enumerable: options.debug },
      args: { value: query2.args, enumerable: options.debug },
      types: { value: query2.statement && query2.statement.types, enumerable: options.debug }
    });
    query2.reject(err);
  }
  function end() {
    return ending || (!connection2.reserved && onend(connection2), !connection2.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
  }
  function terminate() {
    terminated = true;
    if (stream || query || initial || sent.length)
      error(Errors.connection("CONNECTION_DESTROYED", options));
    clearImmediate(nextWriteTimer);
    if (socket) {
      socket.removeListener("data", data);
      socket.removeListener("connect", connected);
      socket.readyState === "open" && socket.end(bytes_default().X().end());
    }
    ended && (ended(), ending = ended = null);
  }
  async function closed(hadError) {
    incoming = Buffer.alloc(0);
    remaining = 0;
    incomings = null;
    clearImmediate(nextWriteTimer);
    socket.removeListener("data", data);
    socket.removeListener("connect", connected);
    idleTimer.cancel();
    lifeTimer.cancel();
    connectTimer.cancel();
    socket.removeAllListeners();
    socket = null;
    if (initial)
      return reconnect();
    !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options, socket));
    closedTime = import_perf_hooks.performance.now();
    hadError && options.shared.retries++;
    delay = (typeof backoff2 === "function" ? backoff2(options.shared.retries) : backoff2) * 1e3;
    onclose(connection2, Errors.connection("CONNECTION_CLOSED", options, socket));
  }
  function handle(xs, x = xs[0]) {
    (x === 68 ? DataRow : (
      // D
      x === 100 ? CopyData : (
        // d
        x === 65 ? NotificationResponse : (
          // A
          x === 83 ? ParameterStatus : (
            // S
            x === 90 ? ReadyForQuery : (
              // Z
              x === 67 ? CommandComplete : (
                // C
                x === 50 ? BindComplete : (
                  // 2
                  x === 49 ? ParseComplete : (
                    // 1
                    x === 116 ? ParameterDescription : (
                      // t
                      x === 84 ? RowDescription : (
                        // T
                        x === 82 ? Authentication : (
                          // R
                          x === 110 ? NoData : (
                            // n
                            x === 75 ? BackendKeyData : (
                              // K
                              x === 69 ? ErrorResponse : (
                                // E
                                x === 115 ? PortalSuspended : (
                                  // s
                                  x === 51 ? CloseComplete : (
                                    // 3
                                    x === 71 ? CopyInResponse : (
                                      // G
                                      x === 78 ? NoticeResponse : (
                                        // N
                                        x === 72 ? CopyOutResponse : (
                                          // H
                                          x === 99 ? CopyDone : (
                                            // c
                                            x === 73 ? EmptyQueryResponse : (
                                              // I
                                              x === 86 ? FunctionCallResponse : (
                                                // V
                                                x === 118 ? NegotiateProtocolVersion : (
                                                  // v
                                                  x === 87 ? CopyBothResponse : (
                                                    // W
                                                    /* c8 ignore next */
                                                    UnknownMessage
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))(xs);
  }
  function DataRow(x) {
    let index = 7;
    let length2;
    let column;
    let value;
    const row = query.isRaw ? new Array(query.statement.columns.length) : {};
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i];
      length2 = x.readInt32BE(index);
      index += 4;
      value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index, index += length2) : column.parser === void 0 ? x.toString("utf8", index, index += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index + 1, index += length2)) : column.parser(x.toString("utf8", index, index += length2));
      query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
  }
  function ParameterStatus(x) {
    const [k, v] = x.toString("utf8", 5, x.length - 1).split(bytes_default.N);
    backendParameters[k] = v;
    if (options.parameters[k] !== v) {
      options.parameters[k] = v;
      onparameter && onparameter(k, v);
    }
  }
  function ReadyForQuery(x) {
    if (query) {
      if (errorResponse) {
        query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse.routine) ? retry(query, errorResponse) : errored(errorResponse);
      } else {
        query.resolve(results || result);
      }
    } else if (errorResponse) {
      errored(errorResponse);
    }
    query = results = errorResponse = null;
    result = new Result();
    connectTimer.cancel();
    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState();
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate();
      }
      if (needsTypes) {
        initial.reserve && (initial = null);
        return fetchArrayTypes();
      }
      initial && !initial.reserve && execute(initial);
      options.shared.retries = retries = 0;
      initial = null;
      return;
    }
    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
    if (query)
      return;
    connection2.reserved ? !connection2.reserved.release && x[5] === 73 ? ending ? terminate() : (connection2.reserved = null, onopen(connection2)) : connection2.reserved() : ending ? terminate() : onopen(connection2);
  }
  function CommandComplete(x) {
    rows = 0;
    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString("utf8", i + 1, x.length - 1);
      if (x[i - 1] >= 65) {
        result.command = x.toString("utf8", 5, i);
        result.state = backend;
        break;
      }
    }
    final && (final(), final = null);
    if (result.command === "BEGIN" && max !== 1 && !connection2.reserved)
      return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin, sql.reserved or max: 1"));
    if (query.options.simple)
      return BindComplete();
    if (query.cursorFn) {
      result.count && query.cursorFn(result);
      write(Sync);
    }
  }
  function ParseComplete() {
    query.parsing = false;
  }
  function BindComplete() {
    !result.statement && (result.statement = query.statement);
    result.columns = query.statement.columns;
  }
  function ParameterDescription(x) {
    const length2 = x.readUInt16BE(5);
    for (let i = 0; i < length2; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
    query.prepare && (statements[query.signature] = query.statement);
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
  }
  function RowDescription(x) {
    if (result.command) {
      results = results || [result];
      results.push(result = new Result());
      result.count = null;
      query.statement.columns = null;
    }
    const length2 = x.readUInt16BE(5);
    let index = 7;
    let start;
    query.statement.columns = Array(length2);
    for (let i = 0; i < length2; ++i) {
      start = index;
      while (x[index++] !== 0) ;
      const table = x.readUInt32BE(index);
      const number = x.readUInt16BE(index + 4);
      const type = x.readUInt32BE(index + 6);
      query.statement.columns[i] = {
        name: transform.column.from ? transform.column.from(x.toString("utf8", start, index - 1)) : x.toString("utf8", start, index - 1),
        parser: parsers2[type],
        table,
        number,
        type
      };
      index += 18;
    }
    result.statement = query.statement;
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  async function Authentication(x, type = x.readUInt32BE(5)) {
    (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
  }
  async function AuthenticationCleartextPassword() {
    const payload = await Pass();
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function AuthenticationMD5Password(x) {
    const payload = "md5" + await md5(
      Buffer.concat([
        Buffer.from(await md5(await Pass() + user)),
        x.subarray(9)
      ])
    );
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function SASL() {
    nonce = (await import_crypto.default.randomBytes(18)).toString("base64");
    bytes_default().p().str("SCRAM-SHA-256" + bytes_default.N);
    const i = bytes_default.i;
    write(bytes_default.inc(4).str("n,,n=*,r=" + nonce).i32(bytes_default.i - i - 4, i).end());
  }
  async function SASLContinue(x) {
    const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
    const saltedPassword = await import_crypto.default.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, "base64"),
      parseInt(res.i),
      32,
      "sha256"
    );
    const clientKey = await hmac(saltedPassword, "Client Key");
    const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
    serverSignature = (await hmac(await hmac(saltedPassword, "Server Key"), auth)).toString("base64");
    const payload = "c=biws,r=" + res.r + ",p=" + xor(
      clientKey,
      Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString("base64");
    write(
      bytes_default().p().str(payload).end()
    );
  }
  function SASLFinal(x) {
    if (x.toString("utf8", 9).split(bytes_default.N, 1)[0].slice(2) === serverSignature)
      return;
    errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
    socket.destroy();
  }
  function Pass() {
    return Promise.resolve(
      typeof options.pass === "function" ? options.pass() : options.pass
    );
  }
  function NoData() {
    result.statement = query.statement;
    result.statement.columns = [];
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5);
    backend.secret = x.readUInt32BE(9);
  }
  async function fetchArrayTypes() {
    needsTypes = false;
    const types2 = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
    types2.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
  }
  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
    const parser = options.parsers[oid];
    options.shared.typeArrayMap[oid] = typarray;
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray);
    options.parsers[typarray].array = true;
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray);
  }
  function tryNext(x, xs) {
    return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options.host[retries];
  }
  function fetchState() {
    const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
    query2.resolve = ([[a], [b2]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only;
      backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
    };
    query2.execute();
  }
  function ErrorResponse(x) {
    if (query) {
      (query.cursorFn || query.describeFirst) && write(Sync);
      errorResponse = Errors.postgres(parseError(x));
    } else {
      errored(Errors.postgres(parseError(x)));
    }
  }
  function retry(q, error2) {
    delete statements[q.signature];
    q.retried = error2;
    execute(q);
  }
  function NotificationResponse(x) {
    if (!onnotify)
      return;
    let index = 9;
    while (x[index++] !== 0) ;
    onnotify(
      x.toString("utf8", 9, index - 1),
      x.toString("utf8", index, x.length - 1)
    );
  }
  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result));
      rows = 0;
      x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
    } catch (err) {
      write(Sync);
      query.reject(err);
    }
  }
  function CloseComplete() {
    result.count && query.cursorFn(result);
    query.resolve(result);
  }
  function CopyInResponse() {
    stream = new import_stream.default.Writable({
      autoDestroy: true,
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
        stream = null;
      }
    });
    query.resolve(stream);
  }
  function CopyOutResponse() {
    stream = new import_stream.default.Readable({
      read() {
        socket.resume();
      }
    });
    query.resolve(stream);
  }
  function CopyBothResponse() {
    stream = new import_stream.default.Duplex({
      autoDestroy: true,
      read() {
        socket.resume();
      },
      /* c8 ignore next 11 */
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
      }
    });
    query.resolve(stream);
  }
  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause());
  }
  function CopyDone() {
    stream && stream.push(null);
    stream = null;
  }
  function NoticeResponse(x) {
    onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
  }
  function EmptyQueryResponse() {
  }
  function FunctionCallResponse() {
    errored(Errors.notSupported("FunctionCallResponse"));
  }
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported("NegotiateProtocolVersion"));
  }
  function UnknownMessage(x) {
    console.error("Postgres.js : Unknown Message:", x[0]);
  }
  function UnknownAuth(x, type) {
    console.error("Postgres.js : Unknown Auth:", type);
  }
  function Bind(parameters, types2, statement = "", portal = "") {
    let prev, type;
    bytes_default().B().str(portal + bytes_default.N).str(statement + bytes_default.N).i16(0).i16(parameters.length);
    parameters.forEach((x, i) => {
      if (x === null)
        return bytes_default.i32(4294967295);
      type = types2[i];
      parameters[i] = x = type in options.serializers ? options.serializers[type](x) : "" + x;
      prev = bytes_default.i;
      bytes_default.inc(4).str(x).i32(bytes_default.i - prev - 4, prev);
    });
    bytes_default.i16(0);
    return bytes_default.end();
  }
  function Parse(str, parameters, types2, name = "") {
    bytes_default().P().str(name + bytes_default.N).str(str + bytes_default.N).i16(parameters.length);
    parameters.forEach((x, i) => bytes_default.i32(types2[i] || 0));
    return bytes_default.end();
  }
  function Describe(x, name = "") {
    return bytes_default().D().str(x).str(name + bytes_default.N).end();
  }
  function Execute(portal = "", rows2 = 0) {
    return Buffer.concat([
      bytes_default().E().str(portal + bytes_default.N).i32(rows2).end(),
      Flush
    ]);
  }
  function Close(portal = "") {
    return Buffer.concat([
      bytes_default().C().str("P").str(portal + bytes_default.N).end(),
      bytes_default().S().end()
    ]);
  }
  function StartupMessage() {
    return cancelMessage || bytes_default().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign(
        {
          user,
          database,
          client_encoding: "UTF8"
        },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes_default.N + v).join(bytes_default.N)
    ).z(2).end(0);
  }
}
function parseError(x) {
  const error = {};
  let start = 5;
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
      start = i + 1;
    }
  }
  return error;
}
function md5(x) {
  return import_crypto.default.createHash("md5").update(x).digest("hex");
}
function hmac(key, x) {
  return import_crypto.default.createHmac("sha256", key).update(x).digest();
}
function sha256(x) {
  return import_crypto.default.createHash("sha256").update(x).digest();
}
function xor(a, b2) {
  const length = Math.max(a.length, b2.length);
  const buffer2 = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++)
    buffer2[i] = a[i] ^ b2[i];
  return buffer2;
}
function timer(fn, seconds) {
  seconds = typeof seconds === "function" ? seconds() : seconds;
  if (!seconds)
    return { cancel: noop, start: noop };
  let timer2;
  return {
    cancel() {
      timer2 && (clearTimeout(timer2), timer2 = null);
    },
    start() {
      timer2 && clearTimeout(timer2);
      timer2 = setTimeout(done, seconds * 1e3, arguments);
    }
  };
  function done(args) {
    fn.apply(null, args);
    timer2 = null;
  }
}

// ../node_modules/postgres/src/subscribe.js
var noop2 = () => {
};
function Subscribe(postgres2, options) {
  const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
  let connection2, stream, ended = false;
  const sql2 = subscribe.sql = postgres2({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: "database"
    },
    onclose: async function() {
      if (ended)
        return;
      stream = null;
      state.pid = state.secret = void 0;
      connected(await init(sql2, slot, options.publications));
      subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
    },
    no_subscribe: true
  });
  const end = sql2.end, close = sql2.close;
  sql2.end = async () => {
    ended = true;
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return end();
  };
  sql2.close = async () => {
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return close();
  };
  return subscribe;
  async function subscribe(event, fn, onsubscribe = noop2, onerror = noop2) {
    event = parseEvent(event);
    if (!connection2)
      connection2 = init(sql2, slot, options.publications);
    const subscriber = { fn, onsubscribe };
    const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
    const unsubscribe = () => {
      fns.delete(subscriber);
      fns.size === 0 && subscribers.delete(event);
    };
    return connection2.then((x) => {
      connected(x);
      onsubscribe();
      stream && stream.on("error", onerror);
      return { unsubscribe, state, sql: sql2 };
    });
  }
  function connected(x) {
    stream = x.stream;
    state.pid = x.state.pid;
    state.secret = x.state.secret;
  }
  async function init(sql3, slot2, publications) {
    if (!publications)
      throw new Error("Missing publication names");
    const xs = await sql3.unsafe(
      `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    );
    const [x] = xs;
    const stream2 = await sql3.unsafe(
      `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
    ).writable();
    const state2 = {
      lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
    };
    stream2.on("data", data);
    stream2.on("error", error);
    stream2.on("close", sql3.close);
    return { stream: stream2, state: xs.state };
    function error(e) {
      console.error("Unexpected error during logical streaming - reconnecting", e);
    }
    function data(x2) {
      if (x2[0] === 119) {
        parse(x2.subarray(25), state2, sql3.options.parsers, handle, options.transform);
      } else if (x2[0] === 107 && x2[17]) {
        state2.lsn = x2.subarray(1, 9);
        pong();
      }
    }
    function handle(a, b2) {
      const path = b2.relation.schema + "." + b2.relation.table;
      call("*", a, b2);
      call("*:" + path, a, b2);
      b2.relation.keys.length && call("*:" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
      call(b2.command, a, b2);
      call(b2.command + ":" + path, a, b2);
      b2.relation.keys.length && call(b2.command + ":" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
    }
    function pong() {
      const x2 = Buffer.alloc(34);
      x2[0] = "r".charCodeAt(0);
      x2.fill(state2.lsn, 1);
      x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
      stream2.write(x2);
    }
  }
  function call(x, a, b2) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b2, x));
  }
}
function Time(x) {
  return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
}
function parse(x, state, parsers2, handle, transform) {
  const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
  Object.entries({
    R: (x2) => {
      let i = 1;
      const r = state[x2.readUInt32BE(i)] = {
        schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
        table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
        columns: Array(x2.readUInt16BE(i += 2)),
        keys: []
      };
      i += 2;
      let columnIndex = 0, column;
      while (i < x2.length) {
        column = r.columns[columnIndex++] = {
          key: x2[i++],
          name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
          type: x2.readUInt32BE(i += 1),
          parser: parsers2[x2.readUInt32BE(i)],
          atttypmod: x2.readUInt32BE(i += 4)
        };
        column.key && r.keys.push(column);
        i += 4;
      }
    },
    Y: () => {
    },
    // Type
    O: () => {
    },
    // Origin
    B: (x2) => {
      state.date = Time(x2.readBigInt64BE(9));
      state.lsn = x2.subarray(1, 9);
    },
    I: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      const { row } = tuples(x2, relation.columns, i += 7, transform);
      handle(row, {
        command: "insert",
        relation
      });
    },
    D: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      handle(
        key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform).row : null,
        {
          command: "delete",
          relation,
          key
        }
      );
    },
    U: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      const xs = key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform) : null;
      xs && (i = xs.i);
      const { row } = tuples(x2, relation.columns, i + 3, transform);
      handle(row, {
        command: "update",
        relation,
        key,
        old: xs && xs.row
      });
    },
    T: () => {
    },
    // Truncate,
    C: () => {
    }
    // Commit
  }).reduce(char, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
  let type, column, value;
  const row = transform.raw ? new Array(columns.length) : {};
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++];
    column = columns[i];
    value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
    transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
  }
  return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
}
function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
  if (!xs)
    throw new Error("Malformed subscribe pattern: " + x);
  const [, command, path, key] = xs;
  return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
}

// ../node_modules/postgres/src/large.js
var import_stream2 = __toESM(require("stream"), 1);
function largeObject(sql2, oid, mode = 131072 | 262144) {
  return new Promise(async (resolve, reject) => {
    await sql2.begin(async (sql3) => {
      let finish;
      !oid && ([{ oid }] = await sql3`select lo_creat(-1) as oid`);
      const [{ fd }] = await sql3`select lo_open(${oid}, ${mode}) as fd`;
      const lo = {
        writable,
        readable,
        close: () => sql3`select lo_close(${fd})`.then(finish),
        tell: () => sql3`select lo_tell64(${fd})`,
        read: (x) => sql3`select loread(${fd}, ${x}) as data`,
        write: (x) => sql3`select lowrite(${fd}, ${x})`,
        truncate: (x) => sql3`select lo_truncate64(${fd}, ${x})`,
        seek: (x, whence = 0) => sql3`select lo_lseek64(${fd}, ${x}, ${whence})`,
        size: () => sql3`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      };
      resolve(lo);
      return new Promise(async (r) => finish = r);
      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start;
        start && await lo.seek(start);
        return new import_stream2.default.Readable({
          highWaterMark,
          async read(size2) {
            const l = size2 > max ? size2 - max : size2;
            max -= size2;
            const [{ data }] = await lo.read(l);
            this.push(data);
            if (data.length < size2)
              this.push(null);
          }
        });
      }
      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start);
        return new import_stream2.default.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback);
          }
        });
      }
    }).catch(reject);
  });
}

// ../node_modules/postgres/src/index.js
Object.assign(Postgres, {
  PostgresError,
  toPascal,
  pascal,
  toCamel,
  camel,
  toKebab,
  kebab,
  fromPascal,
  fromCamel,
  fromKebab,
  BigInt: {
    to: 20,
    from: [20],
    parse: (x) => BigInt(x),
    // eslint-disable-line
    serialize: (x) => x.toString()
  }
});
var src_default = Postgres;
function Postgres(a, b2) {
  const options = parseOptions(a, b2), subscribe = options.no_subscribe || Subscribe(Postgres, { ...options });
  let ending = false;
  const queries = queue_default(), connecting = queue_default(), reserved = queue_default(), closed = queue_default(), ended = queue_default(), open = queue_default(), busy = queue_default(), full = queue_default(), queues = { connecting, reserved, closed, ended, open, busy, full };
  const connections = [...Array(options.max)].map(() => connection_default(options, queues, { onopen, onend, onclose }));
  const sql2 = Sql(handler2);
  Object.assign(sql2, {
    get parameters() {
      return options.parameters;
    },
    largeObject: largeObject.bind(null, sql2),
    subscribe,
    CLOSE,
    END: CLOSE,
    PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  });
  return sql2;
  function Sql(handler3) {
    handler3.debug = options.debug;
    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to);
      return acc;
    }, typed);
    Object.assign(sql3, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json,
      file
    });
    return sql3;
    function typed(value, type) {
      return new Parameter(value, type);
    }
    function sql3(strings, ...args) {
      const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler3, cancel) : typeof strings === "string" && !args.length ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings) : new Builder(strings, args);
      return query;
    }
    function unsafe(string, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([string], args, handler3, cancel, {
        prepare: false,
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
    function file(path, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([], args, (query2) => {
        import_fs.default.readFile(path, "utf8", (err, string) => {
          if (err)
            return query2.reject(err);
          query2.strings = [string];
          handler3(query2);
        });
      }, cancel, {
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
  }
  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten };
    const sql3 = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
          delete listen.channels[name2];
          Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
          })));
        });
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
      }
    }));
    const channels = listen.channels || (listen.channels = {}), exists = name in channels;
    if (exists) {
      channels[name].listeners.push(listener);
      const result2 = await channels[name].result;
      listener.onlisten && listener.onlisten();
      return { state: result2.state, unlisten };
    }
    channels[name] = { result: sql3`listen ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
    const result = await channels[name].result;
    listener.onlisten && listener.onlisten();
    return { state: result.state, unlisten };
    async function unlisten() {
      if (name in channels === false)
        return;
      channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
      if (channels[name].listeners.length)
        return;
      delete channels[name];
      return sql3`unlisten ${sql3.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
    }
  }
  async function notify(channel, payload) {
    return await sql2`select pg_notify(${channel}, ${"" + payload})`;
  }
  async function reserve() {
    const queue = queue_default();
    const c = open.length ? open.shift() : await new Promise((resolve, reject) => {
      const query = { reserve: resolve, reject };
      queries.push(query);
      closed.length && connect(closed.shift(), query);
    });
    move(c, reserved);
    c.reserved = () => queue.length ? c.execute(queue.shift()) : move(c, reserved);
    c.reserved.release = true;
    const sql3 = Sql(handler3);
    sql3.release = () => {
      c.reserved = null;
      onopen(c);
    };
    return sql3;
    function handler3(q) {
      c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
    }
  }
  async function begin(options2, fn) {
    !fn && (fn = options2, options2 = "");
    const queries2 = queue_default();
    let savepoints = 0, connection2, prepare = null;
    try {
      await sql2.unsafe("begin " + options2.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
      return await Promise.race([
        scope(connection2, fn),
        new Promise((_, reject) => connection2.onclose = reject)
      ]);
    } catch (error) {
      throw error;
    }
    async function scope(c, fn2, name) {
      const sql3 = Sql(handler3);
      sql3.savepoint = savepoint;
      sql3.prepare = (x) => prepare = x.replace(/[^a-z0-9$-_. ]/gi);
      let uncaughtError, result;
      name && await sql3`savepoint ${sql3(name)}`;
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn2(sql3);
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
        });
        if (uncaughtError)
          throw uncaughtError;
      } catch (e) {
        await (name ? sql3`rollback to ${sql3(name)}` : sql3`rollback`);
        throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
      }
      if (!name) {
        prepare ? await sql3`prepare transaction '${sql3.unsafe(prepare)}'` : await sql3`commit`;
      }
      return result;
      function savepoint(name2, fn3) {
        if (name2 && Array.isArray(name2.raw))
          return savepoint((sql4) => sql4.apply(sql4, arguments));
        arguments.length === 1 && (fn3 = name2, name2 = null);
        return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
      }
      function handler3(q) {
        q.catch((e) => uncaughtError || (uncaughtError = e));
        c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
      }
    }
    function onexecute(c) {
      connection2 = c;
      move(c, reserved);
      c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
    }
  }
  function move(c, queue) {
    c.queue.remove(c);
    queue.push(c);
    c.queue = queue;
    queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
    return c;
  }
  function json(x) {
    return new Parameter(x, 3802);
  }
  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments));
    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap);
  }
  function handler2(query) {
    if (ending)
      return query.reject(Errors.connection("CONNECTION_ENDED", options, options));
    if (open.length)
      return go(open.shift(), query);
    if (closed.length)
      return connect(closed.shift(), query);
    busy.length ? go(busy.shift(), query) : queries.push(query);
  }
  function go(c, query) {
    return c.execute(query) ? move(c, busy) : move(c, full);
  }
  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state ? query.active ? connection_default(options).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
    });
  }
  async function end({ timeout = null } = {}) {
    if (ending)
      return ending;
    await 1;
    let timer2;
    return ending = Promise.race([
      new Promise((r) => timeout !== null && (timer2 = setTimeout(destroy, timeout * 1e3, r))),
      Promise.all(connections.map((c) => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer2));
  }
  async function close() {
    await Promise.all(connections.map((c) => c.end()));
  }
  async function destroy(resolve) {
    await Promise.all(connections.map((c) => c.terminate()));
    while (queries.length)
      queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options));
    resolve();
  }
  function connect(c, query) {
    move(c, connecting);
    c.connect(query);
    return c;
  }
  function onend(c) {
    move(c, ended);
  }
  function onopen(c) {
    if (queries.length === 0)
      return move(c, open);
    let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
    while (ready && queries.length && max-- > 0) {
      const query = queries.shift();
      if (query.reserve)
        return query.reserve(c);
      ready = c.execute(query);
    }
    ready ? move(c, busy) : move(c, full);
  }
  function onclose(c, e) {
    move(c, closed);
    c.reserved = null;
    c.onclose && (c.onclose(e), c.onclose = null);
    options.onclose && options.onclose(c.id);
    queries.length && connect(c, queries.shift());
  }
}
function parseOptions(a, b2) {
  if (a && a.shared)
    return a;
  const env = process.env, o = (!a || typeof a === "string" ? b2 : a) || {}, { url, multihost } = parseUrl(a), query = [...url.searchParams].reduce((a2, [b3, c]) => (a2[b3] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || "localhost", port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
  o.no_prepare && (o.prepare = false);
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
  "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
  query.sslrootcert === "system" && (query.ssl = "verify-full");
  const ints = ["idle_timeout", "connect_timeout", "max_lifetime", "max_pipeline", "backoff", "keep_alive"];
  const defaults = {
    max: globalThis.Cloudflare ? 3 : 10,
    ssl: false,
    sslnegotiation: null,
    idle_timeout: null,
    connect_timeout: 30,
    max_lifetime,
    max_pipeline: 100,
    backoff,
    keep_alive: 60,
    prepare: true,
    debug: false,
    fetch_types: true,
    publications: "alltables",
    target_session_attrs: null
  };
  return {
    host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
    port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
    path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
    database: o.database || o.db || (url.pathname || "").slice(1) || env.PGDATABASE || user,
    user,
    pass: o.pass || o.password || url.password || env.PGPASSWORD || "",
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env["PG" + k.toUpperCase()] || d;
        acc[k] = typeof value === "string" && ints.includes(k) ? +value : value;
        return acc;
      },
      {}
    ),
    connection: {
      application_name: env.PGAPPNAME || "postgres.js",
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types: o.types || {},
    target_session_attrs: tsa(o, url, env),
    onnotice: o.onnotice,
    onnotify: o.onnotify,
    onclose: o.onclose,
    onparameter: o.onparameter,
    socket: o.socket,
    transform: parseTransform(o.transform || { undefined: void 0 }),
    parameters: {},
    shared: { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  };
}
function tsa(o, url, env) {
  const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env.PGTARGETSESSIONATTRS;
  if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
    return x;
  throw new Error("target_session_attrs " + x + " is not supported");
}
function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
  return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === "function" ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === "function" ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === "function" ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  };
}
function parseUrl(url) {
  if (!url || typeof url !== "string")
    return { url: { searchParams: /* @__PURE__ */ new Map() } };
  let host = url;
  host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
  host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
  const urlObj = new URL(url.replace(host, host.split(",")[0]));
  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(",") > -1 && host
  };
}
function osUsername() {
  try {
    return import_os.default.userInfo().username;
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
  }
}

// ../netlify/functions/api.js
var import_cookie = __toESM(require_dist(), 1);

// ../netlify/functions/utils/notificationSender.js
var import_https = __toESM(require("https"), 1);
var sendNotification = (heading, content, data = {}, overrideConfig = {}) => {
  return new Promise((resolve, reject) => {
    const apiKey = overrideConfig.apiKey || process.env.ONESIGNAL_API_KEY;
    const appId = overrideConfig.appId || process.env.ONESIGNAL_APP_ID;
    if (!apiKey || !appId) {
      console.error("OneSignal Credentials missing (Check .env or Settings)");
      reject(new Error("OneSignal Credentials missing"));
      return;
    }
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": `Basic ${apiKey}`
    };
    const body = {
      app_id: appId,
      headings: { "en": heading },
      contents: { "en": content },
      included_segments: ["All"],
      data
    };
    const options = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers
    };
    const req = import_https.default.request(options, function(res) {
      res.on("data", function(data2) {
        console.log("OneSignal Response:");
        try {
          console.log(JSON.parse(data2));
          resolve(JSON.parse(data2));
        } catch (e) {
          console.log(data2.toString());
          resolve(data2.toString());
        }
      });
    });
    req.on("error", function(e) {
      console.log("OneSignal Error:");
      console.log(e);
      reject(e);
    });
    req.write(JSON.stringify(body));
    req.end();
  });
};
var sendLeaveNotification = (doctorName, startDate, endDate, overrideConfig = {}) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  if (end < today) {
    console.log("Notification skipped: Leave period has already ended.");
    return Promise.resolve({ skipped: true, reason: "Expired" });
  }
  const heading = "\u{1F4C5} DOCTOR LEAVE INFO";
  const formatDate = (dateVal) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  let dateDisplay = "";
  if (startStr === endStr) {
    dateDisplay = `(${startStr})`;
  } else {
    dateDisplay = `(${startStr} - ${endStr})`;
  }
  const content = `${doctorName} is on leave ${dateDisplay}`;
  return sendNotification(heading, content, {}, overrideConfig);
};

// ../netlify/functions/api.js
var sql;
if (process.env.NEON_DATABASE_URL) {
  sql = src_default(process.env.NEON_DATABASE_URL, {
    ssl: "require",
    idle_timeout: 5,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
    prepare: false
  });
} else {
  console.warn("\u26A0\uFE0F NEON_DATABASE_URL is missing! Database features will not work.");
  sql = {
    unsafe: async () => {
      throw new Error("Database connection invalid. Please check NEON_DATABASE_URL environment variable.");
    }
  };
}
function createKey(name) {
  if (typeof name !== "string") return "";
  return name.toLowerCase().replace(/spesialis|sub|dokter|gigi|&/g, "").replace(/,/g, "").replace(/\(|\)/g, "").trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
async function handler(event, context) {
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowedOrigins = [
    "https://shab.web.id",
    "https://jadwaldoktershab.netlify.app",
    "https://dashdev1.netlify.app",
    "https://dashdev2.netlify.app",
    "https://dashdev3.netlify.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
  ];
  const headers = {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-onesignal-app-id, x-onesignal-api-key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json"
  };
  console.log("[API] " + event.httpMethod + " " + event.path);
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  try {
    let checkAuth = function() {
      const cookies = (0, import_cookie.parse)(event.headers.cookie || "");
      const adminPassword = "admin123";
      if (cookies.adminAuth !== adminPassword) {
        throw new Error("Unauthorized");
      }
    };
    let path = event.path || "";
    path = path.replace(/^\/.netlify\/functions\/api/, "").replace(/^\/api/, "");
    const method = event.httpMethod;
    if (path === "/login" && method === "POST") {
      const { password } = JSON.parse(event.body || "{}");
      const adminPass = "admin123";
      const inputPass = String(password || "").trim();
      if (inputPass === adminPass) {
        const authCookie = (0, import_cookie.serialize)("adminAuth", inputPass, {
          httpOnly: false,
          secure: true,
          sameSite: "Lax",
          path: "/",
          maxAge: 60 * 60 * 24
          // 1 day
        });
        return {
          statusCode: 200,
          headers: {
            ...headers,
            "Set-Cookie": authCookie
          },
          body: JSON.stringify({ success: true, message: "Login successful" })
        };
      } else {
        console.warn(`Login failed. Input Matches: ${inputPass === adminPass}`);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Invalid password",
            debug: `Input Length: ${inputPass.length}`
          })
        };
      }
    }
    if (path === "/logout" && method === "POST") {
      const authCookie = (0, import_cookie.serialize)("adminAuth", "expired", {
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
        path: "/",
        maxAge: -1
      });
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Set-Cookie": authCookie
        },
        body: JSON.stringify({ success: true, message: "Logged out" })
      };
    }
    if (path.startsWith("/settings")) {
      if ((path === "/settings" || path === "/settings/") && method === "GET") {
        const settings = await sql.unsafe("SELECT * FROM app_settings ORDER BY setting_key ASC");
        const settingsMap = {};
        for (const s of settings) {
          settingsMap[s.setting_key] = {
            key: s.setting_key,
            value: s.setting_value,
            is_enabled: s.is_enabled,
            updated_at: s.updated_at
          };
        }
        return { statusCode: 200, headers, body: JSON.stringify(settingsMap) };
      }
      if (path.startsWith("/settings/") && method === "GET") {
        const key = path.split("/")[2];
        const rows = await sql.unsafe("SELECT * FROM app_settings WHERE setting_key = $1", [key]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Setting not found" }) };
        }
        const setting = rows[0];
        let value = setting.setting_value;
        try {
          value = JSON.parse(value);
        } catch (e) {
        }
        return { statusCode: 200, headers, body: JSON.stringify({ key: setting.setting_key, value }) };
      }
      if ((path === "/settings" || path === "/settings/") && method === "POST") {
        checkAuth();
        const updates = JSON.parse(event.body);
        if (!Array.isArray(updates)) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Expected array of {key, value}" }) };
        }
        for (const { key, value } of updates) {
          const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
          await sql.unsafe("INSERT INTO app_settings (setting_key, setting_value, updated_at, is_enabled) VALUES ($1, $2, NOW(), true) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()", [key, jsonValue]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Settings updated" }) };
      }
      if (path.startsWith("/settings/") && method === "PUT") {
        checkAuth();
        const key = path.split("/")[2];
        const { value } = JSON.parse(event.body);
        const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
        await sql.unsafe("INSERT INTO app_settings (setting_key, setting_value, updated_at, is_enabled) VALUES ($1, $2, NOW(), true) ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()", [key, jsonValue]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Setting updated" }) };
      }
      if (path.startsWith("/settings/") && method === "DELETE") {
        checkAuth();
        const key = path.split("/")[2];
        await sql.unsafe("DELETE FROM app_settings WHERE setting_key = $1", [key]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Setting deleted" }) };
      }
    }
    if (path.startsWith("/analytics")) {
      const action = event.queryStringParameters?.action;
      if (action === "track" && method === "POST") {
        const { isNewVisitor, path: pagePath, device, browser, referrer, event_type, event_name } = JSON.parse(event.body || "{}");
        let trafficSource = "Direct";
        if (referrer) {
          if (referrer.includes("google")) trafficSource = "Organic Search";
          else if (referrer.includes("facebook") || referrer.includes("instagram") || referrer.includes("t.co")) trafficSource = "Social Media";
          else if (referrer.includes(event.headers.host)) trafficSource = "Internal";
          else trafficSource = "Referral";
        }
        const region = event.headers["x-nf-geo-country-code"] || "unknown";
        const city = event.headers["x-nf-geo-city"] || "unknown";
        const ip = event.headers["client-ip"] || "unknown";
        await sql.unsafe(`
                INSERT INTO analytics_events (
                    date, timestamp, event_type, path, event_name,
                    device_type, browser, region, city, 
                    referrer, traffic_source, ip_hash
                )
                VALUES (
                    CURRENT_DATE, NOW(), $1, $2, $3,
                    $4, $5, $6, $7,
                    $8, $9, $10
                )
            `, [
          event_type || "pageview",
          pagePath || event_name,
          event_name || null,
          device,
          browser,
          region,
          city,
          referrer,
          trafficSource,
          ip
        ]);
        if (event_type === "pageview") {
          await sql.unsafe(`
                    INSERT INTO daily_stats (date, page_views, visitors)
                    VALUES (CURRENT_DATE, 1, $1)
                    ON CONFLICT (date)
                    DO UPDATE SET 
                        page_views = daily_stats.page_views + 1,
                        visitors = daily_stats.visitors + $2
                `, [isNewVisitor ? 1 : 0, isNewVisitor ? 1 : 0]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }
      if (action === "stats" && method === "GET") {
        const type = event.queryStringParameters?.type || "basic";
        const period = event.queryStringParameters?.period || "7days";
        if (type === "advanced") {
          const daysLimit = period === "30days" ? 30 : 7;
          const devices = await sql.unsafe(`
            SELECT device_type as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND device_type IS NOT NULL
            GROUP BY device_type
            ORDER BY value DESC
          `);
          const browsers = await sql.unsafe(`
            SELECT browser as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND browser IS NOT NULL
            GROUP BY browser
            ORDER BY value DESC
            LIMIT 5
          `);
          const sources = await sql.unsafe(`
            SELECT traffic_source as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND traffic_source IS NOT NULL
            GROUP BY traffic_source
            ORDER BY value DESC
          `);
          const topPages = await sql.unsafe(`
            SELECT path as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND path IS NOT NULL
            GROUP BY path
            ORDER BY value DESC
            LIMIT 10
          `);
          const conversions = await sql.unsafe(`
            SELECT event_name as name, COUNT(*) as value
            FROM analytics_events
            WHERE date >= CURRENT_DATE - INTERVAL '${daysLimit} days' AND event_type = 'conversion' AND event_name IS NOT NULL
            GROUP BY event_name
            ORDER BY value DESC
          `);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              devices: devices.map((d) => ({ name: d.name, value: Number(d.value) })),
              browsers: browsers.map((b2) => ({ name: b2.name, value: Number(b2.value) })),
              sources: sources.map((s) => ({ name: s.name, value: Number(s.value) })),
              topPages: topPages.map((p) => ({ name: p.name, value: Number(p.value) })),
              conversions: conversions.map((c) => ({ name: c.name, value: Number(c.value) }))
            })
          };
        }
        let query = "";
        let params = [];
        if (period === "year") {
          query = `
                    SELECT to_char(date_trunc('month', date), 'Mon YYYY') as name,
                           SUM(visitors) as visitors,
                           SUM(page_views) as page_views,
                           MIN(date) as sort_date
                    FROM daily_stats
                    WHERE date > CURRENT_DATE - INTERVAL '1 year'
                    GROUP BY date_trunc('month', date)
                    ORDER BY sort_date DESC
                `;
        } else {
          const limit = period === "30days" ? 30 : 7;
          query = `
                    SELECT to_char(date, 'DD Mon') as name,
                           date as full_date,
                           visitors,
                           page_views
                    FROM daily_stats 
                    ORDER BY date DESC 
                    LIMIT $1
                `;
          params.push(limit);
        }
        const rows = await sql.unsafe(query, params);
        const stats = rows.reverse().map((row) => ({
          name: row.name,
          visitors: Number(row.visitors),
          pageviews: Number(row.page_views),
          fullDate: row.full_date || row.sort_date
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ stats, systemStatus: { online: true, lastSync: (/* @__PURE__ */ new Date()).toISOString() } }) };
      }
      if (action === "monthly" && method === "GET") {
        const month = event.queryStringParameters?.month || (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
        const [year, monthStr] = month.split("-");
        const query = `
          SELECT to_char(date, 'YYYY-MM-DD') as formattedDate,
                 to_char(date, 'Day') as dayName,
                 date,
                 visitors,
                 page_views as pageviews
          FROM daily_stats
          WHERE EXTRACT(YEAR FROM date) = $1 AND EXTRACT(MONTH FROM date) = $2
          ORDER BY date ASC
        `;
        const rows = await sql.unsafe(query, [year, monthStr]);
        const stats = rows.map((row) => ({
          formattedDate: row.formatteddate,
          // postgres returns lowercase keys often
          dayName: row.dayname ? row.dayname.trim() : "",
          date: row.date,
          visitors: Number(row.visitors),
          pageviews: Number(row.pageviews)
        }));
        return { statusCode: 200, headers, body: JSON.stringify({ stats }) };
      }
    }
    if (path.startsWith("/doctors")) {
      if (path === "/doctors/grouped" && method === "GET") {
        const doctors = await sql.unsafe("SELECT * FROM doctors");
        const doctorsData = {};
        for (const doc of doctors) {
          const specialtyKey = createKey(doc.specialty);
          if (!doctorsData[specialtyKey]) {
            doctorsData[specialtyKey] = { specialty: doc.specialty, title: doc.specialty, doctors: [] };
          }
          doctorsData[specialtyKey].doctors.push(doc);
        }
        return { statusCode: 200, headers, body: JSON.stringify(doctorsData) };
      }
      if (path === "/doctors/on-leave" && method === "GET") {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const result = await sql.unsafe('SELECT t2.name AS "NamaDokter", t2.specialty AS "Spesialis", t1.start_date AS "TanggalMulaiCuti", t1.end_date AS "TanggalSelesaiCuti" FROM leave_data t1 JOIN doctors t2 ON t1.doctor_id = t2.id WHERE t1.end_date >= $1 ORDER BY t1.start_date ASC', [today]);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      if (path === "/doctors/all" && method === "GET") {
        const doctors = await sql.unsafe("SELECT id, name, specialty FROM doctors ORDER BY name");
        return { statusCode: 200, headers, body: JSON.stringify(doctors) };
      }
      if ((path === "/doctors" || path === "/doctors/") && method === "GET") {
        const { page = "1", limit = "30", search = "" } = event.queryStringParameters || {};
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let countQuery = "SELECT COUNT(*) FROM doctors";
        let doctorsQuery = "SELECT * FROM doctors";
        let params = [];
        if (search) {
          countQuery += " WHERE name ILIKE $1 OR specialty ILIKE $2";
          doctorsQuery += " WHERE name ILIKE $1 OR specialty ILIKE $2";
          params.push("%" + search + "%");
          params.push("%" + search + "%");
        }
        const countResult = await sql.unsafe(countQuery, params);
        doctorsQuery += ` ORDER BY name LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
        const doctors = await sql.unsafe(doctorsQuery, params);
        return { statusCode: 200, headers, body: JSON.stringify({ doctors, total: parseInt(countResult[0].count) }) };
      }
      if ((path === "/doctors" || path === "/doctors/") && method === "POST") {
        checkAuth();
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        if (!name || !specialty) return { statusCode: 400, headers, body: JSON.stringify({ message: "Nama dan Spesialisasi wajib." }) };
        const newDoctor = await sql.unsafe("INSERT INTO doctors(name, specialty, image_url, schedule, updated_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *", [name, specialty, image_url || "", schedule || "{}"]);
        return { statusCode: 201, headers, body: JSON.stringify(newDoctor[0]) };
      }
      if (path.match(/^\/doctors\/\d+$/) && method === "GET") {
        const id = parseInt(path.split("/")[2]);
        const rows = await sql.unsafe("SELECT d.*, s.image_url AS image_url_sstv FROM doctors d LEFT JOIN sstv_images s ON d.id = s.doctor_id WHERE d.id = $1", [id]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Doctor not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }
      if ((path.match(/^\/doctors\/\d+$/) || (path === "/doctors" || path === "/doctors/")) && method === "PUT") {
        checkAuth();
        let id;
        if (path.match(/^\/doctors\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing doctor ID" }) };
        }
        const { name, specialty, image_url, schedule } = JSON.parse(event.body);
        const updated = await sql.unsafe("UPDATE doctors SET name = $1, specialty = $2, image_url = $3, schedule = $4, updated_at = NOW() WHERE id = $5 RETURNING *", [name, specialty, image_url || "", schedule || "{}", id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Doctor not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if ((path.match(/^\/doctors\/\d+$/) || (path === "/doctors" || path === "/doctors/")) && method === "DELETE") {
        checkAuth();
        let id;
        if (path.match(/^\/doctors\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing doctor ID" }) };
        }
        await sql.unsafe("DELETE FROM doctors WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Doctor deleted" }) };
      }
    }
    if ((path === "/specialties" || path === "/specialties/") && method === "GET") {
      const rows = await sql.unsafe("SELECT DISTINCT specialty FROM doctors WHERE specialty IS NOT NULL AND specialty != '' ORDER BY specialty ASC");
      const list = rows.map((r) => r.specialty);
      return { statusCode: 200, headers, body: JSON.stringify(list) };
    }
    if (path.startsWith("/leave") || path.startsWith("/leaves")) {
      if ((path === "/leave" || path === "/leaves" || path === "/leave/" || path === "/leaves/") && method === "GET") {
        const leave = await sql.unsafe("SELECT l.*, d.name AS doctor_name, d.specialty FROM leave_data l JOIN doctors d ON l.doctor_id = d.id ORDER BY l.start_date DESC");
        return { statusCode: 200, headers, body: JSON.stringify(leave) };
      }
      if ((path === "/leave" || path === "/leaves" || path === "/leave/" || path === "/leaves/") && method === "POST") {
        checkAuth();
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        if (!doctor_id || !start_date || !end_date) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "doctor_id, start_date, dan end_date wajib." }) };
        }
        const newLeave = await sql.unsafe("INSERT INTO leave_data(doctor_id, start_date, end_date, reason, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *", [doctor_id, start_date, end_date, reason || ""]);
        const doctorResult = await sql.unsafe("SELECT * FROM doctors WHERE id = $1", [doctor_id]);
        if (doctorResult.length > 0) {
          await sendLeaveNotification(doctorResult[0], start_date, end_date, reason);
        }
        return { statusCode: 201, headers, body: JSON.stringify(newLeave[0]) };
      }
      if ((path === "/leave" || path === "/leaves" || path === "/leave/" || path === "/leaves/") && method === "DELETE") {
        checkAuth();
        if (event.queryStringParameters?.id) {
          const id = parseInt(event.queryStringParameters.id);
          await sql.unsafe("DELETE FROM leave_data WHERE id = $1", [id]);
          return { statusCode: 200, headers, body: JSON.stringify({ message: "Leave deleted" }) };
        }
        if (event.queryStringParameters?.cleanup === "true") {
          const result = await sql.unsafe("DELETE FROM leave_data WHERE end_date < CURRENT_DATE");
          return { statusCode: 200, headers, body: JSON.stringify({ message: "History cleanup success", deleted: result.count }) };
        }
        return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing id or cleanup param" }) };
      }
      if (path.match(/^\/leaves?\/\d+$/) && method === "PUT") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        const { doctor_id, start_date, end_date, reason } = JSON.parse(event.body);
        const updated = await sql.unsafe("UPDATE leave_data SET doctor_id = $1, start_date = $2, end_date = $3, reason = $4 WHERE id = $5 RETURNING *", [doctor_id, start_date, end_date, reason || "", id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Leave not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if (path.match(/^\/leaves?\/\d+$/) && method === "DELETE") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        await sql.unsafe("DELETE FROM leave_data WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Leave deleted" }) };
      }
    }
    if (path.startsWith("/catalog-items")) {
      if ((path === "/catalog-items" || path === "/catalog-items/") && method === "GET") {
        const category = event.queryStringParameters?.category;
        let query = "SELECT * FROM catalog_items WHERE is_active = true";
        const params = [];
        if (category) {
          query += " AND category = $1";
          params.push(category);
        }
        query += " ORDER BY sort_order ASC, created_at DESC";
        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }
      if (path === "/catalog-items/all" && method === "GET") {
        checkAuth();
        const category = event.queryStringParameters?.category;
        let query = "SELECT * FROM catalog_items WHERE 1=1";
        const params = [];
        if (category) {
          query += " AND category = $1";
          params.push(category);
        }
        query += " ORDER BY sort_order ASC, created_at DESC";
        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }
      if ((path === "/catalog-items" || path === "/catalog-items/") && method === "POST") {
        checkAuth();
        const { title, price, image_url, category, description, features, sort_order, is_active } = JSON.parse(event.body);
        const newItem = await sql.unsafe(`
            INSERT INTO catalog_items (
                title, price, image_url, category, description, 
                features, sort_order, is_active, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
            RETURNING *
          `, [
          title,
          price,
          image_url || "",
          category,
          description || "",
          features ? JSON.stringify(features) : "[]",
          sort_order || 0,
          is_active !== void 0 ? is_active : true
        ]);
        return { statusCode: 201, headers, body: JSON.stringify(newItem[0]) };
      }
      if ((path === "/catalog-items" || path === "/catalog-items/") && method === "PUT") {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing ID" }) };
        const { title, price, image_url, category, description, features, sort_order, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe(`
            UPDATE catalog_items SET 
                title = $1, price = $2, image_url = $3, category = $4, 
                description = $5, features = $6, sort_order = $7, 
                is_active = $8, updated_at = NOW()
            WHERE id = $9
            RETURNING *
          `, [
          title,
          price,
          image_url,
          category,
          description,
          features ? JSON.stringify(features) : "[]",
          sort_order,
          is_active,
          // Allow setting to true/false
          id
        ]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Item not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if ((path === "/catalog-items" || path === "/catalog-items/") && method === "DELETE") {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing ID" }) };
        await sql.unsafe("UPDATE catalog_items SET is_active = false WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Item deleted (soft)" }) };
      }
      if (path.match(/^\/catalog-items\/\d+$/) && method === "DELETE") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        await sql.unsafe("UPDATE catalog_items SET is_active = false WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Item deleted (soft)" }) };
      }
    }
    if (path.startsWith("/radiology")) {
      if ((path === "/radiology" || path === "/radiology/") && method === "GET") {
        const search = event.queryStringParameters?.search || "";
        const limit = parseInt(event.queryStringParameters?.limit) || 1e3;
        const offset = parseInt(event.queryStringParameters?.offset) || 0;
        let query = "SELECT * FROM radiology_prices WHERE is_active = true";
        const params = [];
        if (search) {
          query += ` AND (
                REPLACE(name, '-', '') ILIKE $1 
                OR REPLACE(common_name, '-', '') ILIKE $1 
                OR REPLACE(category, '-', '') ILIKE $1
            )`;
          const cleanSearch = search.replace(/-/g, "");
          params.push(`%${cleanSearch}%`);
        }
        query += " ORDER BY category ASC, name ASC";
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const items = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      }
      if ((path === "/radiology" || path === "/radiology/") && method === "POST") {
        checkAuth();
        const { name, common_name, category, price } = JSON.parse(event.body);
        if (!name) return { statusCode: 400, headers, body: JSON.stringify({ message: "Name is required" }) };
        const newItem = await sql.unsafe(`
            INSERT INTO radiology_prices (name, common_name, category, price, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, true, NOW(), NOW())
            RETURNING *
        `, [name, common_name || "", category || "General", price || 0]);
        return { statusCode: 201, headers, body: JSON.stringify(newItem[0]) };
      }
      if (path === "/radiology/batch" && method === "POST") {
        checkAuth();
        const items = JSON.parse(event.body);
        if (!Array.isArray(items)) {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Input must be an array" }) };
        }
        const result = await sql.begin(async (sql2) => {
          const inserted = [];
          for (const item of items) {
            const { name, common_name, category, price } = item;
            if (!name) continue;
            const [newRow] = await sql2`
                    INSERT INTO radiology_prices (name, common_name, category, price, is_active, created_at, updated_at)
                    VALUES (${name}, ${common_name || ""}, ${category || "General"}, ${price || 0}, true, NOW(), NOW())
                    RETURNING *
                  `;
            inserted.push(newRow);
          }
          return inserted;
        });
        return { statusCode: 201, headers, body: JSON.stringify({ message: "Batch upload success", count: result.length }) };
      }
      if (path.match(/^\/radiology\/\d+$/) && method === "PUT") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        const { name, common_name, category, price, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe(`
              UPDATE radiology_prices 
              SET name = $1, common_name = $2, category = $3, price = $4, is_active = $5, updated_at = NOW()
              WHERE id = $6
              RETURNING *
          `, [name, common_name, category, price, is_active, id]);
        if (updated.length === 0) return { statusCode: 404, headers, body: "Not Found" };
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if (path.match(/^\/radiology\/\d+$/) && method === "DELETE") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        await sql.unsafe("UPDATE radiology_prices SET is_active = false WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Deleted (soft)" }) };
      }
    }
    if (path.startsWith("/mcu-packages")) {
      if ((path === "/mcu-packages/all" || path === "/mcu-packages/all/") && method === "GET") {
        const pkgs = await sql.unsafe("SELECT * FROM mcu_packages ORDER BY display_order ASC, created_at DESC");
        return { statusCode: 200, headers, body: JSON.stringify(pkgs) };
      }
      if ((path === "/mcu-packages" || path === "/mcu-packages/") && method === "POST") {
        checkAuth();
        const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled = true, display_order = 0 } = JSON.parse(event.body);
        await sql.unsafe(`
          INSERT INTO mcu_packages (
            package_id, name, price, base_price, image_url, 
            is_pelaut, is_recommended, items, addons, 
            is_enabled, display_order, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        `, [
          package_id,
          name,
          price,
          base_price || null,
          image_url || "",
          is_pelaut || false,
          is_recommended || false,
          JSON.stringify(items || []),
          addons ? JSON.stringify(addons) : null,
          is_enabled,
          display_order
        ]);
        return { statusCode: 201, headers, body: JSON.stringify({ message: "Package created" }) };
      }
      if (path.match(/^\/mcu-packages\/\d+$/) && method === "PUT") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        const { package_id, name, price, base_price, image_url, is_pelaut, is_recommended, items, addons, is_enabled, display_order } = JSON.parse(event.body);
        await sql.unsafe(`
          UPDATE mcu_packages SET 
            package_id = $1, name = $2, price = $3, base_price = $4, 
            image_url = $5, is_pelaut = $6, is_recommended = $7, 
            items = $8, addons = $9, is_enabled = $10, display_order = $11,
            updated_at = NOW()
          WHERE id = $12
        `, [
          package_id,
          name,
          price,
          base_price || null,
          image_url || "",
          is_pelaut || false,
          is_recommended || false,
          JSON.stringify(items || []),
          addons ? JSON.stringify(addons) : null,
          is_enabled,
          display_order,
          id
        ]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Package updated" }) };
      }
      if (path.match(/^\/mcu-packages\/\d+$/) && method === "DELETE") {
        checkAuth();
        const id = parseInt(path.split("/").pop());
        await sql.unsafe("DELETE FROM mcu_packages WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Package deleted" }) };
      }
    }
    if (path.startsWith("/promos")) {
      if ((path === "/promos" || path === "/promos/") && method === "GET") {
        const promos = await sql.unsafe("SELECT p.id, p.title, p.content, p.image_url, p.sort_order, p.is_active, p.created_at, p.updated_at, s.image_url AS image_url_sstv FROM promos p LEFT JOIN sstv_images s ON p.id = s.promo_id WHERE p.is_active = true ORDER BY p.sort_order ASC, p.created_at DESC");
        return { statusCode: 200, headers, body: JSON.stringify(promos) };
      }
      if (path === "/promos/all" && method === "GET") {
        const promos = await sql.unsafe("SELECT * FROM promos ORDER BY sort_order ASC");
        return { statusCode: 200, headers, body: JSON.stringify(promos) };
      }
      if ((path === "/promos" || path === "/promos/") && method === "POST") {
        checkAuth();
        const { title, content, image_url, sort_order = 0, is_active = true } = JSON.parse(event.body);
        const newPromo = await sql.unsafe("INSERT INTO promos(title, content, image_url, sort_order, is_active, created_at, updated_at) VALUES($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *", [title || "", content || "", image_url || "", sort_order, is_active]);
        return { statusCode: 201, headers, body: JSON.stringify(newPromo[0]) };
      }
      if ((path.match(/^\/promos\/\d+$/) || (path === "/promos" || path === "/promos/")) && method === "PUT") {
        checkAuth();
        let id;
        if (path.match(/^\/promos\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing promo ID" }) };
        }
        const { title, content, image_url, sort_order, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe("UPDATE promos SET title = $1, content = $2, image_url = $3, sort_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *", [title, content, image_url, sort_order, is_active, id]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Promo not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if ((path.match(/^\/promos\/\d+$/) || (path === "/promos" || path === "/promos/")) && method === "DELETE") {
        checkAuth();
        let id;
        if (path.match(/^\/promos\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing promo ID" }) };
        }
        await sql.unsafe("DELETE FROM promos WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Promo deleted" }) };
      }
    }
    if (path.startsWith("/sstv") || path.startsWith("/sstv_images")) {
      if ((path === "/sstv_images" || path === "/sstv_images/") && method === "GET") {
        const images = await sql.unsafe("SELECT * FROM sstv_images");
        const map = {};
        for (const img of images) {
          if (img.doctor_id) map[img.doctor_id] = img.image_url;
          if (img.promo_id) map[img.promo_id] = img.image_url;
        }
        return { statusCode: 200, headers, body: JSON.stringify(map) };
      }
      if ((path === "/sstv_images" || path === "/sstv_images/") && method === "POST") {
        checkAuth();
        const { doctor_id, promo_id, image_url } = JSON.parse(event.body);
        if (doctor_id) {
          await sql.unsafe("INSERT INTO sstv_images(doctor_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (doctor_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()", [doctor_id, image_url]);
        } else if (promo_id) {
          await sql.unsafe("INSERT INTO sstv_images(promo_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (promo_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()", [promo_id, image_url]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: "SSTV image uploaded" }) };
      }
      if (path === "/sstv/doctors" && method === "GET") {
        const images = await sql.unsafe("SELECT * FROM sstv_images WHERE doctor_id IS NOT NULL ORDER BY doctor_id ASC");
        return { statusCode: 200, headers, body: JSON.stringify(images) };
      }
      if (path === "/sstv/promos" && method === "GET") {
        const images = await sql.unsafe("SELECT * FROM sstv_images WHERE promo_id IS NOT NULL ORDER BY promo_id ASC");
        return { statusCode: 200, headers, body: JSON.stringify(images) };
      }
      if (path.match(/^\/sstv\/doctors\/\d+$/) && method === "POST") {
        checkAuth();
        const doctor_id = parseInt(path.split("/")[3]);
        const { image_url } = JSON.parse(event.body);
        await sql.unsafe("INSERT INTO sstv_images(doctor_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (doctor_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()", [doctor_id, image_url]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "SSTV image uploaded" }) };
      }
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === "POST") {
        checkAuth();
        const promo_id = parseInt(path.split("/")[3]);
        const { image_url } = JSON.parse(event.body);
        await sql.unsafe("INSERT INTO sstv_images(promo_id, image_url, uploaded_at) VALUES($1, $2, NOW()) ON CONFLICT (promo_id) DO UPDATE SET image_url = $2, uploaded_at = NOW()", [promo_id, image_url]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "SSTV image uploaded" }) };
      }
      if (path.match(/^\/sstv\/doctors\/\d+$/) && method === "DELETE") {
        checkAuth();
        const doctor_id = parseInt(path.split("/")[3]);
        await sql.unsafe("DELETE FROM sstv_images WHERE doctor_id = $1", [doctor_id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "SSTV image deleted" }) };
      }
      if (path.match(/^\/sstv\/promos\/\d+$/) && method === "DELETE") {
        checkAuth();
        const promo_id = parseInt(path.split("/")[3]);
        await sql.unsafe("DELETE FROM sstv_images WHERE promo_id = $1", [promo_id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "SSTV image deleted" }) };
      }
    }
    if (path.startsWith("/popup-ad")) {
      if ((path === "/popup-ad" || path === "/popup-ad/") && method === "GET") {
        const rows = await sql.unsafe("SELECT * FROM popup_ads WHERE is_active = true ORDER BY created_at DESC LIMIT 1");
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "No active popup ad" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }
      if (path === "/popup-ad/all" && method === "GET") {
        const ads = await sql.unsafe("SELECT * FROM popup_ads ORDER BY created_at DESC");
        return { statusCode: 200, headers, body: JSON.stringify(ads) };
      }
      if ((path === "/popup-ad" || path === "/popup-ad/") && method === "POST") {
        checkAuth();
        const { title, image_url, link_url, is_active = true } = JSON.parse(event.body);
        const newAd = await sql.unsafe("INSERT INTO popup_ads(title, image_url, link_url, is_active, created_at) VALUES($1, $2, $3, $4, NOW()) RETURNING *", [title || "", image_url || "", link_url || "", is_active]);
        return { statusCode: 201, headers, body: JSON.stringify(newAd[0]) };
      }
      if (path.match(/^\/popup-ad\/\d+$/) && method === "PUT") {
        checkAuth();
        const id = parseInt(path.split("/")[2]);
        const { title, image_url, link_url, is_active } = JSON.parse(event.body);
        const updated = await sql.unsafe("UPDATE popup_ads SET title = $1, image_url = $2, link_url = $3, is_active = $4 WHERE id = $5 RETURNING *", [title, image_url, link_url, is_active, id]);
        if (!updated) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Popup ad not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if (path.match(/^\/popup-ad\/\d+$/) && method === "DELETE") {
        checkAuth();
        const id = parseInt(path.split("/")[2]);
        await sql.unsafe("DELETE FROM popup_ads WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Popup ad deleted" }) };
      }
    }
    if (path === "/newsletter-archive" && method === "GET") {
      const { page = 1, limit = 20, admin = "false" } = event.queryStringParameters || {};
      const offset = (page - 1) * limit;
      let whereClause = "WHERE 1=1";
      const params = [limit, offset];
      if (admin !== "true") {
        whereClause += " AND is_published = true";
      }
      const newsletters = await sql.unsafe(`SELECT * FROM newsletters ${whereClause} ORDER BY year DESC, month DESC LIMIT $1 OFFSET $2`, params);
      const count = await sql.unsafe(`SELECT count(*) FROM newsletters ${whereClause}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          newsletters,
          total: parseInt(count[0].count),
          page: parseInt(page),
          limit: parseInt(limit)
        })
      };
    }
    if (path === "/newsletter-issue") {
      if (method === "GET") {
        const { id, year, month } = event.queryStringParameters || {};
        let result;
        if (id) {
          result = await sql.unsafe("SELECT * FROM newsletters WHERE id = $1", [id]);
        } else if (year && month) {
          result = await sql.unsafe("SELECT * FROM newsletters WHERE year = $1 AND month = $2", [year, month]);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing id or year/month" }) };
        }
        if (result.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Newsletter not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
      }
      if (method === "PUT") {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing ID" }) };
        const current = await sql.unsafe("SELECT is_published FROM newsletters WHERE id = $1", [id]);
        if (current.length === 0) return { statusCode: 404, headers, body: JSON.stringify({ message: "Not found" }) };
        const newStatus = !current[0].is_published;
        await sql.unsafe("UPDATE newsletters SET is_published = $1 WHERE id = $2", [newStatus, id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Status updated", is_published: newStatus }) };
      }
      if (method === "DELETE") {
        checkAuth();
        const { id } = event.queryStringParameters || {};
        if (!id) return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing ID" }) };
        await sql.unsafe("DELETE FROM newsletters WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Deleted" }) };
      }
    }
    if (path === "/newsletter-upsert" && method === "POST") {
      checkAuth();
      const { id, year, month, title, description, pdf_url, cloudinary_public_id } = JSON.parse(event.body);
      const existing = await sql.unsafe("SELECT id FROM newsletters WHERE year = $1 AND month = $2", [year, month]);
      if (existing.length > 0 && (!id || existing[0].id != id)) {
        return { statusCode: 409, headers, body: JSON.stringify({ message: `Newsletter for ${month}/${year} already exists` }) };
      }
      let result;
      if (id) {
        result = await sql.unsafe(
          `UPDATE newsletters SET year=$1, month=$2, title=$3, description=$4, pdf_url=$5, cloudinary_public_id=$6, updated_at=NOW() WHERE id=$7 RETURNING *`,
          [year, month, title, description, pdf_url, cloudinary_public_id, id]
        );
      } else {
        result = await sql.unsafe(
          `INSERT INTO newsletters (year, month, title, description, pdf_url, cloudinary_public_id, is_published, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW()) RETURNING *`,
          [year, month, title, description, pdf_url, cloudinary_public_id]
        );
      }
      return { statusCode: 200, headers, body: JSON.stringify(result[0]) };
    }
    if (path.startsWith("/posts")) {
      if (path === "/posts/all" && method === "GET") {
        const posts = await sql.unsafe("SELECT * FROM posts ORDER BY created_at DESC");
        return { statusCode: 200, headers, body: JSON.stringify(posts) };
      }
      if ((path === "/posts" || path === "/posts/") && method === "GET") {
        const { limit, category, status, admin } = event.queryStringParameters || {};
        let query = "SELECT * FROM posts";
        const params = [];
        const conditions = [];
        if (admin !== "true") {
          if (status) {
            conditions.push("status = $" + (params.length + 1));
            params.push(status);
          } else {
            conditions.push("is_active = true");
          }
        } else {
          if (status) {
            conditions.push("status = $" + (params.length + 1));
            params.push(status);
          }
        }
        if (category) {
          conditions.push("category = $" + (params.length + 1));
          params.push(category);
        }
        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }
        query += " ORDER BY created_at DESC";
        if (limit) {
          query += " LIMIT $" + (params.length + 1);
          params.push(parseInt(limit));
        }
        const posts = await sql.unsafe(query, params);
        return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
      }
      if (path.match(/^\/posts\/\d+$/) && method === "GET") {
        const id = parseInt(path.split("/")[2]);
        const rows = await sql.unsafe("SELECT * FROM posts WHERE id = $1", [id]);
        if (rows.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Post not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(rows[0]) };
      }
      if ((path === "/posts" || path === "/posts/") && method === "POST") {
        checkAuth();
        const { title, content, image_url, is_active = true, slug, excerpt, category, tags, status } = JSON.parse(event.body);
        const newPost = await sql.unsafe(`
            INSERT INTO posts (
                title, content, image_url, is_active, slug, excerpt, category, tags, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
            RETURNING *
        `, [
          title,
          content || "",
          image_url || "",
          is_active,
          slug || "",
          excerpt || "",
          category || "article",
          tags || "",
          status || "draft"
        ]);
        return { statusCode: 201, headers, body: JSON.stringify(newPost[0]) };
      }
      if ((path.match(/^\/posts\/\d+$/) || (path === "/posts" || path === "/posts/")) && method === "PUT") {
        checkAuth();
        let id;
        if (path.match(/^\/posts\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing post ID" }) };
        }
        const { title, content, image_url, is_active, slug, excerpt, category, tags, status } = JSON.parse(event.body);
        const updated = await sql.unsafe(`
            UPDATE posts SET 
                title = $1, content = $2, image_url = $3, is_active = $4, 
                slug = $5, excerpt = $6, category = $7, tags = $8, status = $9,
                updated_at = NOW() 
            WHERE id = $10 
            RETURNING *
        `, [
          title,
          content,
          image_url,
          is_active,
          slug,
          excerpt,
          category,
          tags,
          status,
          id
        ]);
        if (updated.length === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ message: "Post not found" }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify(updated[0]) };
      }
      if ((path.match(/^\/posts\/\d+$/) || (path === "/posts" || path === "/posts/")) && method === "DELETE") {
        checkAuth();
        let id;
        if (path.match(/^\/posts\/\d+$/)) {
          id = parseInt(path.split("/")[2]);
        } else if (event.queryStringParameters?.id) {
          id = parseInt(event.queryStringParameters.id);
        } else {
          return { statusCode: 400, headers, body: JSON.stringify({ message: "Missing post ID" }) };
        }
        await sql.unsafe("DELETE FROM posts WHERE id = $1", [id]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Post deleted" }) };
      }
    }
    if (path === "/device-heartbeat" && method === "POST") {
      const body = JSON.parse(event.body);
      const action = body.action || "heartbeat";
      if (action === "heartbeat") {
        const { device_id, device_name, last_ip, friendly_name, browser_info, current_slide } = body;
        if (!device_id) return { statusCode: 400, headers, body: JSON.stringify({ message: "device_id required" }) };
        await sql.unsafe(`
              INSERT INTO device_heartbeats (
                  device_id, friendly_name, last_heartbeat, ip_address, browser_info, current_slide, status, last_seen, last_ip, device_name
              ) VALUES ($1, $2, NOW(), $3, $4, $5, 'online', NOW(), $3, $2)
              ON CONFLICT (device_id) DO UPDATE SET 
                  last_heartbeat = NOW(),
                  last_seen = NOW(), -- Legacy
                  status = 'online',
                  ip_address = $3,
                  last_ip = $3, -- Legacy
                  browser_info = COALESCE($4, device_heartbeats.browser_info),
                  current_slide = COALESCE($5, device_heartbeats.current_slide)
                  -- Don't overwrite friendly_name if null, but maybe device_name is sent?
          `, [
          device_id,
          friendly_name || device_name || "",
          last_ip || event.headers["client-ip"] || "unknown",
          browser_info,
          current_slide
        ]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Heartbeat recorded" }) };
      }
      if (action === "update_meta") {
        checkAuth();
        const { deviceId, friendlyName, isPinned } = body;
        if (friendlyName !== void 0) {
          await sql.unsafe("UPDATE device_heartbeats SET friendly_name = $1 WHERE device_id = $2", [friendlyName, deviceId]);
        }
        if (isPinned !== void 0) {
          await sql.unsafe("UPDATE device_heartbeats SET is_pinned = $1 WHERE device_id = $2", [isPinned, deviceId]);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Device meta updated" }) };
      }
      if (action === "trigger_refresh") {
      }
      if (action === "delete") {
        checkAuth();
        const { deviceId } = body;
        await sql.unsafe("DELETE FROM device_heartbeats WHERE device_id = $1", [deviceId]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Device deleted" }) };
      }
    }
    if ((path === "/device-heartbeat" || path === "/device-heartbeat/") && method === "GET") {
      const action = event.queryStringParameters?.action;
      if (action === "trigger_refresh") {
        const { deviceId } = event.queryStringParameters;
        await sql.unsafe("UPDATE device_heartbeats SET refresh_trigger = true WHERE device_id = $1", [deviceId]);
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Refresh trigger set" }) };
      }
      const devices = await sql.unsafe("SELECT * FROM device_heartbeats ORDER BY last_heartbeat DESC");
      return { statusCode: 200, headers, body: JSON.stringify(devices) };
    }
    if (path.startsWith("/newsletter-archive")) {
      if (method === "GET") {
        const { limit = "20", page = "1", admin } = event.queryStringParameters || {};
        const offset = (parseInt(page) - 1) * parseInt(limit);
        let query = "SELECT * FROM newsletters";
        if (admin !== "true") {
          query += " WHERE is_published = true";
        }
        query += ` ORDER BY year DESC, month DESC LIMIT ${parseInt(limit)} OFFSET ${offset}`;
        const newsletters = await sql.unsafe(query);
        return { statusCode: 200, headers, body: JSON.stringify(newsletters) };
      }
    }
    if ((path === "/admin/login" || path === "/login") && method === "POST") {
      const { password } = JSON.parse(event.body);
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (password === adminPassword) {
        return {
          statusCode: 200,
          headers: {
            ...headers
            // 'Set-Cookie': ... (Moved to multiValueHeaders)
          },
          multiValueHeaders: {
            "Set-Cookie": [
              "adminAuth=" + adminPassword + "; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000",
              "adminSession=true; Path=/; Secure; SameSite=None; Max-Age=2592000"
            ]
          },
          body: JSON.stringify({ message: "Login successful" })
        };
        return { statusCode: 401, headers, body: JSON.stringify({ message: "Invalid password" }) };
      }
    }
    if (path === "/mcu-packages" && method === "GET") {
      try {
        const items = await sql.unsafe("SELECT * FROM mcu_packages ORDER BY id ASC");
        return { statusCode: 200, headers, body: JSON.stringify(items) };
      } catch (err) {
        console.error("Failed to fetch mcu packages:", err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
      }
    }
    if (path === "/admin/logout" && method === "GET") {
      return {
        statusCode: 200,
        headers: {
          ...headers
        },
        multiValueHeaders: {
          "Set-Cookie": [
            "adminAuth=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
            "adminSession=; Path=/; Secure; SameSite=None; Max-Age=0"
          ]
        },
        body: JSON.stringify({ message: "Logged out" })
      };
    }
    if (path === "/debug-ecatalog" && method === "GET") {
      try {
        await sql.unsafe("SELECT 1 FROM app_settings LIMIT 1");
        const count = await sql.unsafe("SELECT count(*) FROM ecatalog_items");
        return { statusCode: 200, headers, body: JSON.stringify({ message: "Table exists", count: count[0].count }) };
      } catch (err) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            message: "Check failed",
            error: err.message,
            stack: err.stack,
            db_url_exists: !!process.env.NEON_DATABASE_URL
          })
        };
      }
    }
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: "Route not found", path, method })
    };
  } catch (error) {
    console.error("[API Error]", error);
    if (error.message === "Unauthorized") {
      return { statusCode: 401, headers, body: JSON.stringify({ message: "Unauthorized" }) };
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error", error: error.message })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=api.js.map
