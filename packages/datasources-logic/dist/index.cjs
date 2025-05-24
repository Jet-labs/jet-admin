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

// ../../node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "../../node_modules/postgres-array/index.js"(exports2) {
    "use strict";
    exports2.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
  }
});

// ../../node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "../../node_modules/pg-types/lib/arrayParser.js"(exports2, module2) {
    var array = require_postgres_array();
    module2.exports = {
      create: function(source, transform) {
        return {
          parse: function() {
            return array.parse(source, transform);
          }
        };
      }
    };
  }
});

// ../../node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "../../node_modules/postgres-date/index.js"(exports2, module2) {
    "use strict";
    var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
    var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
    var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
    var INFINITY = /^-?infinity$/;
    module2.exports = function parseDate(isoDate) {
      if (INFINITY.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms = matches[7];
      ms = ms ? 1e3 * parseFloat(ms) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    };
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign * 1e3;
    }
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
  }
});

// ../../node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "../../node_modules/xtend/mutable.js"(exports2, module2) {
    module2.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
  }
});

// ../../node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "../../node_modules/postgres-interval/index.js"(exports2, module2) {
    "use strict";
    var extend = require_mutable();
    module2.exports = PostgresInterval;
    function PostgresInterval(raw) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw);
      }
      extend(this, parse(raw));
    }
    var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = ["years", "months", "days"];
    var timeProperties = ["hours", "minutes", "seconds"];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
    };
    var NUMBER = "([+-]?\\d+)";
    var YEAR = NUMBER + "\\s+years?";
    var MONTH = NUMBER + "\\s+mons?";
    var DAY = NUMBER + "\\s+days?";
    var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
    var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = ["hours", "minutes", "seconds", "milliseconds"];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
  }
});

// ../../node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "../../node_modules/postgres-bytea/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function parseBytea(input) {
      if (/^\\x/.test(input)) {
        return new Buffer(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\") {
              backslashes++;
            }
            for (var k = 0; k < Math.floor(backslashes / 2); ++k) {
              output += "\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return new Buffer(output, "binary");
    };
  }
});

// ../../node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "../../node_modules/pg-types/lib/textParsers.js"(exports2, module2) {
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn) {
      return function nullAllowed(value) {
        if (value === null) return value;
        return fn(value);
      };
    }
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    var parsePointArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseFloatArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseStringArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value);
      return p.parse();
    };
    var parseDateArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseIntervalArray = function(value) {
      if (!value) {
        return null;
      }
      var p = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p.parse();
    };
    var parseByteAArray = function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    };
    var parseInteger = function(value) {
      return parseInt(value, 10);
    };
    var parseBigInteger = function(value) {
      var valStr = String(value);
      if (/^\d+$/.test(valStr)) {
        return valStr;
      }
      return value;
    };
    var parseJsonArray = function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    };
    var parsePoint = function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    };
    var parseCircle = function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    };
    var init = function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    };
    module2.exports = {
      init
    };
  }
});

// ../../node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "../../node_modules/pg-int8/index.js"(exports2, module2) {
    "use strict";
    var BASE = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l;
      var i;
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        high = high / BASE >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE >>> 0;
        digits = "" + (t - BASE * low);
        if (low === 0 && high === 0) {
          return sign + digits + result;
        }
        pad = "";
        l = 6 - digits.length;
        for (i = 0; i < l; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE;
        return sign + digits + result;
      }
    }
    module2.exports = readInt8;
  }
});

// ../../node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "../../node_modules/pg-types/lib/binaryParsers.js"(exports2, module2) {
    var parseInt64 = require_pg_int8();
    var parseBits = function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      };
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    };
    var parseFloatFromBits = function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      };
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    };
    var parseInt16 = function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    };
    var parseInt32 = function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    };
    var parseFloat32 = function(value) {
      return parseFloatFromBits(value, 23, 8);
    };
    var parseFloat64 = function(value) {
      return parseFloatFromBits(value, 52, 11);
    };
    var parseNumeric = function(value) {
      var sign = parseBits(value, 16, 32);
      if (sign == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    };
    var parseDate = function(isUTC, value) {
      var sign = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    };
    var parseArray = function(value) {
      var dim = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      };
      var parse = function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      };
      return parse(dims, elementType);
    };
    var parseText = function(value) {
      return value.toString("utf8");
    };
    var parseBool = function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    };
    var init = function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray);
      register(1007, parseArray);
      register(1016, parseArray);
      register(1008, parseArray);
      register(1009, parseArray);
      register(25, parseText);
    };
    module2.exports = {
      init
    };
  }
});

// ../../node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "../../node_modules/pg-types/lib/builtins.js"(exports2, module2) {
    module2.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// ../../node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "../../node_modules/pg-types/index.js"(exports2) {
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports2.getTypeParser = getTypeParser;
    exports2.setTypeParser = setTypeParser;
    exports2.arrayParser = arrayParser;
    exports2.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    function getTypeParser(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// ../../node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "../../node_modules/pg/lib/defaults.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user: process.platform === "win32" ? process.env.USERNAME : process.env.USER,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module2.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// ../../node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/pg/lib/utils.js"(exports2, module2) {
    "use strict";
    var defaults2 = require_defaults();
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result = result + ",";
        }
        if (val[i] === null || typeof val[i] === "undefined") {
          result = result + "NULL";
        } else if (Array.isArray(val[i])) {
          result = result + arrayString(val[i]);
        } else if (ArrayBuffer.isView(val[i])) {
          let item = val[i];
          if (!(item instanceof Buffer)) {
            const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
            if (buf.length === item.byteLength) {
              item = buf;
            } else {
              item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
            }
          }
          result += "\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(val[i]));
        }
      }
      result = result + "}";
      return result;
    }
    var prepareValue = function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
          if (buf.length === val.byteLength) {
            return buf;
          }
          return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
        }
        if (val instanceof Date) {
          if (defaults2.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    };
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    function normalizeQueryConfig(config, values, callback) {
      config = typeof config === "string" ? { text: config } : config;
      if (values) {
        if (typeof values === "function") {
          config.callback = values;
        } else {
          config.values = values;
        }
      }
      if (callback) {
        config.callback = callback;
      }
      return config;
    }
    var escapeIdentifier2 = function(str) {
      return '"' + str.replace(/"/g, '""') + '"';
    };
    var escapeLiteral2 = function(str) {
      let hasBackslash = false;
      let escaped = "'";
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "'") {
          escaped += c + c;
        } else if (c === "\\") {
          escaped += c + c;
          hasBackslash = true;
        } else {
          escaped += c;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    };
    module2.exports = {
      prepareValue: function prepareValueWrapper(value) {
        return prepareValue(value);
      },
      normalizeQueryConfig,
      escapeIdentifier: escapeIdentifier2,
      escapeLiteral: escapeLiteral2
    };
  }
});

// ../../node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS({
  "../../node_modules/pg/lib/crypto/utils-legacy.js"(exports2, module2) {
    "use strict";
    var nodeCrypto = require("crypto");
    function md5(string) {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    }
    function postgresMd5PasswordHash(user, password, salt) {
      const inner = md5(password + user);
      const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    function sha256(text) {
      return nodeCrypto.createHash("sha256").update(text).digest();
    }
    function hashByName(hashName, text) {
      hashName = hashName.replace(/(\D)-/, "$1");
      return nodeCrypto.createHash(hashName).update(text).digest();
    }
    function hmacSha256(key, msg) {
      return nodeCrypto.createHmac("sha256", key).update(msg).digest();
    }
    async function deriveKey(password, salt, iterations) {
      return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }
    module2.exports = {
      postgresMd5PasswordHash,
      randomBytes: nodeCrypto.randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
  }
});

// ../../node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS({
  "../../node_modules/pg/lib/crypto/utils-webcrypto.js"(exports2, module2) {
    var nodeCrypto = require("crypto");
    module2.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    }
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
    }
  }
});

// ../../node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "../../node_modules/pg/lib/crypto/utils.js"(exports2, module2) {
    "use strict";
    var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
    if (useLegacyCrypto) {
      module2.exports = require_utils_legacy();
    } else {
      module2.exports = require_utils_webcrypto();
    }
  }
});

// ../../node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "../../node_modules/pg/lib/crypto/cert-signatures.js"(exports2, module2) {
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return { length, index };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return { length, index };
    }
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return { oid, index };
    }
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    module2.exports = { signatureAlgorithmHashFromCertificate };
  }
});

// ../../node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "../../node_modules/pg/lib/crypto/sasl.js"(exports2, module2) {
    "use strict";
    var crypto = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function startSession(mechanisms, stream) {
      const candidates = ["SCRAM-SHA-256"];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse"
      };
    }
    async function continueSession(session, password, serverData, stream) {
      if (session.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const clientFirstMessageBare = "n=*,r=" + session.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([Buffer.from("p=tls-server-end-point,,"), Buffer.from(certHash)]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto.deriveKey(password, saltBytes, sv.iteration);
      const clientKey = await crypto.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto.sha256(clientKey);
      const clientSignature = await crypto.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto.hmacSha256(serverKey, authMessage);
      session.message = "SASLResponse";
      session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    function finalizeSession(session, serverData) {
      if (session.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c) => c >= 33 && c <= 43 || c >= 45 && c <= 126);
    }
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
    }
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(
        text.split(",").map((attrValue) => {
          if (!/^.=/.test(attrValue)) {
            throw new Error("SASL: Invalid attribute pair entry");
          }
          const name = attrValue[0];
          const value = attrValue.substring(2);
          return [name, value];
        })
      );
    }
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const serverSignature = attrPairs.get("v");
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    function xorBuffers(a, b) {
      if (!Buffer.isBuffer(a)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a.length !== b.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a.map((_, i) => a[i] ^ b[i]));
    }
    module2.exports = {
      startSession,
      continueSession,
      finalizeSession
    };
  }
});

// ../../node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "../../node_modules/pg/lib/type-overrides.js"(exports2, module2) {
    "use strict";
    var types2 = require_pg_types();
    function TypeOverrides2(userTypes) {
      this._types = userTypes || types2;
      this.text = {};
      this.binary = {};
    }
    TypeOverrides2.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides2.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides2.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module2.exports = TypeOverrides2;
  }
});

// ../../node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "../../node_modules/pg-connection-string/index.js"(exports2, module2) {
    "use strict";
    function parse(str, options = {}) {
      if (str.charAt(0) === "/") {
        const config2 = str.split(" ");
        return { host: config2[0], database: config2[1] };
      }
      const config = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str)) {
        str = encodeURI(str).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        result = new URL(str, "postgres://base");
      } catch (e) {
        result = new URL(str.replace("@/", "@___DUMMY___/"), "postgres://base");
        dummyHost = true;
      }
      for (const entry of result.searchParams.entries()) {
        config[entry[0]] = entry[1];
      }
      config.user = config.user || decodeURIComponent(result.username);
      config.password = config.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config.host = decodeURI(result.pathname);
        config.database = result.searchParams.get("db");
        config.client_encoding = result.searchParams.get("encoding");
        return config;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config.host) {
        config.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config.port) {
        config.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config.database = pathname ? decodeURI(pathname) : null;
      if (config.ssl === "true" || config.ssl === "1") {
        config.ssl = true;
      }
      if (config.ssl === "0") {
        config.ssl = false;
      }
      if (config.sslcert || config.sslkey || config.sslrootcert || config.sslmode) {
        config.ssl = {};
      }
      const fs = config.sslcert || config.sslkey || config.sslrootcert ? require("fs") : null;
      if (config.sslcert) {
        config.ssl.cert = fs.readFileSync(config.sslcert).toString();
      }
      if (config.sslkey) {
        config.ssl.key = fs.readFileSync(config.sslkey).toString();
      }
      if (config.sslrootcert) {
        config.ssl.ca = fs.readFileSync(config.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config.sslrootcert) {
              config.ssl.checkServerIdentity = function() {
              };
            } else {
              config.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config.sslmode) {
          case "disable": {
            config.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            break;
          }
          case "no-verify": {
            config.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config;
    }
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c[key] = value;
        }
        return c;
      }, {});
      return connectionOptions;
    }
    function toClientConfig(config) {
      const poolConfig = Object.entries(config).reduce((c, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v = parseInt(value, 10);
              if (isNaN(v)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c[key] = v;
            }
          } else {
            c[key] = value;
          }
        }
        return c;
      }, {});
      return poolConfig;
    }
    function parseIntoClientConfig(str) {
      return toClientConfig(parse(str));
    }
    module2.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// ../../node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "../../node_modules/pg/lib/connection-parameters.js"(exports2, module2) {
    "use strict";
    var dns = require("dns");
    var defaults2 = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = function(key, config, envVar) {
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return config[key] || envVar || defaults2[key];
    };
    var readSSLConfigFromEnvironment = function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return { rejectUnauthorized: false };
      }
      return defaults2.ssl;
    };
    var quoteParamValue = function(value) {
      return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    };
    var add = function(params, config, paramName) {
      const value = config[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    };
    var ConnectionParameters = class {
      constructor(config) {
        config = typeof config === "string" ? parse(config) : config || {};
        if (config.connectionString) {
          config = Object.assign({}, config, parse(config.connectionString));
        }
        this.user = val("user", config);
        this.database = val("database", config);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config), 10);
        this.host = val("host", config);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config)
        });
        this.binary = val("binary", config);
        this.options = val("options", config);
        this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = { rejectUnauthorized: false };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.client_encoding = val("client_encoding", config);
        this.replication = val("replication", config);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config, false);
        this.statement_timeout = val("statement_timeout", config, false);
        this.lock_timeout = val("lock_timeout", config, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
        this.query_timeout = val("query_timeout", config, false);
        if (config.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
        }
        if (config.keepAlive === false) {
          this.keepalives = 0;
        } else if (config.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add(params, this, "user");
        add(params, this, "password");
        add(params, this, "port");
        add(params, this, "application_name");
        add(params, this, "fallback_application_name");
        add(params, this, "connect_timeout");
        add(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
        add(params, ssl, "sslmode");
        add(params, ssl, "sslca");
        add(params, ssl, "sslkey");
        add(params, ssl, "sslcert");
        add(params, ssl, "sslrootcert");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module2.exports = ConnectionParameters;
  }
});

// ../../node_modules/pg/lib/result.js
var require_result = __commonJS({
  "../../node_modules/pg/lib/result.js"(exports2, module2) {
    "use strict";
    var types2 = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
    var Result2 = class {
      constructor(rowMode, types3) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types3;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match;
        if (msg.text) {
          match = matchRegexp.exec(msg.text);
        } else {
          match = matchRegexp.exec(msg.command);
        }
        if (match) {
          this.command = match[1];
          if (match[3]) {
            this.oid = parseInt(match[2], 10);
            this.rowCount = parseInt(match[3], 10);
          } else if (match[2]) {
            this.rowCount = parseInt(match[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = { ...this._prebuiltEmptyResultObject };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            row[field] = this._parsers[i](rawValue);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = {};
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types2.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = { ...row };
      }
    };
    module2.exports = Result2;
  }
});

// ../../node_modules/pg/lib/query.js
var require_query = __commonJS({
  "../../node_modules/pg/lib/query.js"(exports2, module2) {
    "use strict";
    var { EventEmitter } = require("events");
    var Result2 = require_result();
    var utils = require_utils();
    var Query2 = class extends EventEmitter {
      constructor(config, values, callback) {
        super();
        config = utils.normalizeQueryConfig(config, values, callback);
        this.text = config.text;
        this.values = config.values;
        this.rows = config.rows;
        this.types = config.types;
        this.name = config.name;
        this.queryMode = config.queryMode;
        this.binary = config.binary;
        this.portal = config.portal || "";
        this.callback = config.callback;
        this._rowMode = config.rowMode;
        if (process.domain && config.callback) {
          this.callback = process.domain.bind(config.callback);
        }
        this._result = new Result2(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [this._result];
          }
          this._result = new Result2(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the intial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module2.exports = Query2;
  }
});

// ../../node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "../../node_modules/pg-protocol/dist/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NoticeMessage = exports2.DataRowMessage = exports2.CommandCompleteMessage = exports2.ReadyForQueryMessage = exports2.NotificationResponseMessage = exports2.BackendKeyDataMessage = exports2.AuthenticationMD5Password = exports2.ParameterStatusMessage = exports2.ParameterDescriptionMessage = exports2.RowDescriptionMessage = exports2.Field = exports2.CopyResponse = exports2.CopyDataMessage = exports2.DatabaseError = exports2.copyDone = exports2.emptyQuery = exports2.replicationStart = exports2.portalSuspended = exports2.noData = exports2.closeComplete = exports2.bindComplete = exports2.parseComplete = void 0;
    exports2.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports2.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports2.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports2.noData = {
      name: "noData",
      length: 5
    };
    exports2.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports2.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports2.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports2.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError2 = class extends Error {
      constructor(message, length, name) {
        super(message);
        this.length = length;
        this.name = name;
      }
    };
    exports2.DatabaseError = DatabaseError2;
    var CopyDataMessage = class {
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports2.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      constructor(length, name, binary, columnCount) {
        this.length = length;
        this.name = name;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports2.CopyResponse = CopyResponse;
    var Field = class {
      constructor(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports2.Field = Field;
    var RowDescriptionMessage = class {
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports2.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports2.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports2.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports2.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports2.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      constructor(length, processId, channel, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports2.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports2.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports2.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports2.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports2.NoticeMessage = NoticeMessage;
  }
});

// ../../node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "../../node_modules/pg-protocol/dist/buffer-writer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Writer = void 0;
    var Writer = class {
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
    };
    exports2.Writer = Writer;
  }
});

// ../../node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "../../node_modules/pg-protocol/dist/serializer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = (opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    };
    var requestSsl = () => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    };
    var password = (password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    };
    var sendSASLInitialResponseMessage = function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    };
    var sendSCRAMClientFinalMessage = function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    };
    var query = (text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    };
    var emptyArray = [];
    var parse = (query2) => {
      const name = query2.name || "";
      if (name.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name, name.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types2 = query2.types || emptyArray;
      const len = types2.length;
      const buffer = writer.addCString(name).addCString(query2.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types2[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    };
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(Buffer.byteLength(mappedVal));
          paramWriter.addString(mappedVal);
        }
      }
    };
    var bind = (config = {}) => {
      const portal = config.portal || "";
      const statement = config.statement || "";
      const binary = config.binary || false;
      const values = config.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config.valueMapper);
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    };
    var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
    var execute = (config) => {
      if (!config || !config.portal && !config.rows) {
        return emptyExecute;
      }
      const portal = config.portal || "";
      const rows = config.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    };
    var cancel = (processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    };
    var cstringMessage = (code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    };
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = (msg) => {
      return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    };
    var close = (msg) => {
      const text = `${msg.type}${msg.name || ""}`;
      return cstringMessage(67, text);
    };
    var copyData = (chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    };
    var copyFail = (message) => {
      return cstringMessage(102, message);
    };
    var codeOnlyBuffer = (code) => Buffer.from([code, 0, 0, 0, 4]);
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: () => flushBuffer,
      sync: () => syncBuffer,
      end: () => endBuffer,
      copyData,
      copyDone: () => copyDoneBuffer,
      copyFail,
      cancel
    };
    exports2.serialize = serialize;
  }
});

// ../../node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "../../node_modules/pg-protocol/dist/buffer-reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BufferReader = void 0;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var BufferReader = class {
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = emptyBuffer;
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++] !== 0) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports2.BufferReader = BufferReader;
  }
});

// ../../node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "../../node_modules/pg-protocol/dist/parser.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        switch (code) {
          case 50:
            return messages_1.bindComplete;
          case 49:
            return messages_1.parseComplete;
          case 51:
            return messages_1.closeComplete;
          case 110:
            return messages_1.noData;
          case 115:
            return messages_1.portalSuspended;
          case 99:
            return messages_1.copyDone;
          case 87:
            return messages_1.replicationStart;
          case 73:
            return messages_1.emptyQuery;
          case 68:
            return this.parseDataRowMessage(offset, length, bytes);
          case 67:
            return this.parseCommandCompleteMessage(offset, length, bytes);
          case 90:
            return this.parseReadyForQueryMessage(offset, length, bytes);
          case 65:
            return this.parseNotificationMessage(offset, length, bytes);
          case 82:
            return this.parseAuthenticationResponse(offset, length, bytes);
          case 83:
            return this.parseParameterStatusMessage(offset, length, bytes);
          case 75:
            return this.parseBackendKeyData(offset, length, bytes);
          case 69:
            return this.parseErrorMessage(offset, length, bytes, "error");
          case 78:
            return this.parseErrorMessage(offset, length, bytes, "notice");
          case 84:
            return this.parseRowDescriptionMessage(offset, length, bytes);
          case 116:
            return this.parseParameterDescriptionMessage(offset, length, bytes);
          case 71:
            return this.parseCopyInMessage(offset, length, bytes);
          case 72:
            return this.parseCopyOutMessage(offset, length, bytes);
          case 100:
            return this.parseCopyData(offset, length, bytes);
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
      }
      parseReadyForQueryMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const status = this.reader.string(1);
        return new messages_1.ReadyForQueryMessage(length, status);
      }
      parseCommandCompleteMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const text = this.reader.cstring();
        return new messages_1.CommandCompleteMessage(length, text);
      }
      parseCopyData(offset, length, bytes) {
        const chunk = bytes.slice(offset, offset + (length - 4));
        return new messages_1.CopyDataMessage(length, chunk);
      }
      parseCopyInMessage(offset, length, bytes) {
        return this.parseCopyMessage(offset, length, bytes, "copyInResponse");
      }
      parseCopyOutMessage(offset, length, bytes) {
        return this.parseCopyMessage(offset, length, bytes, "copyOutResponse");
      }
      parseCopyMessage(offset, length, bytes, messageName) {
        this.reader.setBuffer(offset, bytes);
        const isBinary = this.reader.byte() !== 0;
        const columnCount = this.reader.int16();
        const message = new messages_1.CopyResponse(length, messageName, isBinary, columnCount);
        for (let i = 0; i < columnCount; i++) {
          message.columnTypes[i] = this.reader.int16();
        }
        return message;
      }
      parseNotificationMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const processId = this.reader.int32();
        const channel = this.reader.cstring();
        const payload = this.reader.cstring();
        return new messages_1.NotificationResponseMessage(length, processId, channel, payload);
      }
      parseRowDescriptionMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const fieldCount = this.reader.int16();
        const message = new messages_1.RowDescriptionMessage(length, fieldCount);
        for (let i = 0; i < fieldCount; i++) {
          message.fields[i] = this.parseField();
        }
        return message;
      }
      parseField() {
        const name = this.reader.cstring();
        const tableID = this.reader.uint32();
        const columnID = this.reader.int16();
        const dataTypeID = this.reader.uint32();
        const dataTypeSize = this.reader.int16();
        const dataTypeModifier = this.reader.int32();
        const mode = this.reader.int16() === 0 ? "text" : "binary";
        return new messages_1.Field(name, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
      }
      parseParameterDescriptionMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const parameterCount = this.reader.int16();
        const message = new messages_1.ParameterDescriptionMessage(length, parameterCount);
        for (let i = 0; i < parameterCount; i++) {
          message.dataTypeIDs[i] = this.reader.int32();
        }
        return message;
      }
      parseDataRowMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const fieldCount = this.reader.int16();
        const fields = new Array(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
          const len = this.reader.int32();
          fields[i] = len === -1 ? null : this.reader.string(len);
        }
        return new messages_1.DataRowMessage(length, fields);
      }
      parseParameterStatusMessage(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const name = this.reader.cstring();
        const value = this.reader.cstring();
        return new messages_1.ParameterStatusMessage(length, name, value);
      }
      parseBackendKeyData(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const processID = this.reader.int32();
        const secretKey = this.reader.int32();
        return new messages_1.BackendKeyDataMessage(length, processID, secretKey);
      }
      parseAuthenticationResponse(offset, length, bytes) {
        this.reader.setBuffer(offset, bytes);
        const code = this.reader.int32();
        const message = {
          name: "authenticationOk",
          length
        };
        switch (code) {
          case 0:
            break;
          case 3:
            if (message.length === 8) {
              message.name = "authenticationCleartextPassword";
            }
            break;
          case 5:
            if (message.length === 12) {
              message.name = "authenticationMD5Password";
              const salt = this.reader.bytes(4);
              return new messages_1.AuthenticationMD5Password(length, salt);
            }
            break;
          case 10:
            {
              message.name = "authenticationSASL";
              message.mechanisms = [];
              let mechanism;
              do {
                mechanism = this.reader.cstring();
                if (mechanism) {
                  message.mechanisms.push(mechanism);
                }
              } while (mechanism);
            }
            break;
          case 11:
            message.name = "authenticationSASLContinue";
            message.data = this.reader.string(length - 8);
            break;
          case 12:
            message.name = "authenticationSASLFinal";
            message.data = this.reader.string(length - 8);
            break;
          default:
            throw new Error("Unknown authenticationOk message type " + code);
        }
        return message;
      }
      parseErrorMessage(offset, length, bytes, name) {
        this.reader.setBuffer(offset, bytes);
        const fields = {};
        let fieldType = this.reader.string(1);
        while (fieldType !== "\0") {
          fields[fieldType] = this.reader.cstring();
          fieldType = this.reader.string(1);
        }
        const messageValue = fields.M;
        const message = name === "notice" ? new messages_1.NoticeMessage(length, messageValue) : new messages_1.DatabaseError(messageValue, length, name);
        message.severity = fields.S;
        message.code = fields.C;
        message.detail = fields.D;
        message.hint = fields.H;
        message.position = fields.P;
        message.internalPosition = fields.p;
        message.internalQuery = fields.q;
        message.where = fields.W;
        message.schema = fields.s;
        message.table = fields.t;
        message.column = fields.c;
        message.dataType = fields.d;
        message.constraint = fields.n;
        message.file = fields.F;
        message.line = fields.L;
        message.routine = fields.R;
        return message;
      }
    };
    exports2.Parser = Parser;
  }
});

// ../../node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/pg-protocol/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DatabaseError = exports2.serialize = exports2.parse = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "DatabaseError", { enumerable: true, get: function() {
      return messages_1.DatabaseError;
    } });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports2, "serialize", { enumerable: true, get: function() {
      return serializer_1.serialize;
    } });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    exports2.parse = parse;
  }
});

// ../../node_modules/pg-cloudflare/dist/index.js
var require_dist2 = __commonJS({
  "../../node_modules/pg-cloudflare/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CloudflareSocket = void 0;
    var events_1 = require("events");
    var CloudflareSocket = class extends events_1.EventEmitter {
      constructor(ssl) {
        super();
        this.ssl = ssl;
        this.writable = false;
        this.destroyed = false;
        this._upgrading = false;
        this._upgraded = false;
        this._cfSocket = null;
        this._cfWriter = null;
        this._cfReader = null;
      }
      setNoDelay() {
        return this;
      }
      setKeepAlive() {
        return this;
      }
      ref() {
        return this;
      }
      unref() {
        return this;
      }
      async connect(port, host, connectListener) {
        try {
          log("connecting");
          if (connectListener)
            this.once("connect", connectListener);
          const options = this.ssl ? { secureTransport: "starttls" } : {};
          const mod = await import("cloudflare:sockets");
          const connect = mod.connect;
          this._cfSocket = connect(`${host}:${port}`, options);
          this._cfWriter = this._cfSocket.writable.getWriter();
          this._addClosedHandler();
          this._cfReader = this._cfSocket.readable.getReader();
          if (this.ssl) {
            this._listenOnce().catch((e) => this.emit("error", e));
          } else {
            this._listen().catch((e) => this.emit("error", e));
          }
          await this._cfWriter.ready;
          log("socket ready");
          this.writable = true;
          this.emit("connect");
          return this;
        } catch (e) {
          this.emit("error", e);
        }
      }
      async _listen() {
        while (true) {
          log("awaiting receive from CF socket");
          const { done, value } = await this._cfReader.read();
          log("CF socket received:", done, value);
          if (done) {
            log("done");
            break;
          }
          this.emit("data", Buffer.from(value));
        }
      }
      async _listenOnce() {
        log("awaiting first receive from CF socket");
        const { done, value } = await this._cfReader.read();
        log("First CF socket received:", done, value);
        this.emit("data", Buffer.from(value));
      }
      write(data, encoding = "utf8", callback = () => {
      }) {
        if (data.length === 0)
          return callback();
        if (typeof data === "string")
          data = Buffer.from(data, encoding);
        log("sending data direct:", data);
        this._cfWriter.write(data).then(() => {
          log("data sent");
          callback();
        }, (err) => {
          log("send error", err);
          callback(err);
        });
        return true;
      }
      end(data = Buffer.alloc(0), encoding = "utf8", callback = () => {
      }) {
        log("ending CF socket");
        this.write(data, encoding, (err) => {
          this._cfSocket.close();
          if (callback)
            callback(err);
        });
        return this;
      }
      destroy(reason) {
        log("destroying CF socket", reason);
        this.destroyed = true;
        return this.end();
      }
      startTls(options) {
        if (this._upgraded) {
          this.emit("error", "Cannot call `startTls()` more than once on a socket");
          return;
        }
        this._cfWriter.releaseLock();
        this._cfReader.releaseLock();
        this._upgrading = true;
        this._cfSocket = this._cfSocket.startTls(options);
        this._cfWriter = this._cfSocket.writable.getWriter();
        this._cfReader = this._cfSocket.readable.getReader();
        this._addClosedHandler();
        this._listen().catch((e) => this.emit("error", e));
      }
      _addClosedHandler() {
        this._cfSocket.closed.then(() => {
          if (!this._upgrading) {
            log("CF socket closed");
            this._cfSocket = null;
            this.emit("close");
          } else {
            this._upgrading = false;
            this._upgraded = true;
          }
        }).catch((e) => this.emit("error", e));
      }
    };
    exports2.CloudflareSocket = CloudflareSocket;
    var debug = false;
    function dump(data) {
      if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
        const hex = Buffer.from(data).toString("hex");
        const str = new TextDecoder().decode(data);
        return `
>>> STR: "${str.replace(/\n/g, "\\n")}"
>>> HEX: ${hex}
`;
      } else {
        return data;
      }
    }
    function log(...args) {
      debug && console.log(...args.map(dump));
    }
  }
});

// ../../node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "../../node_modules/pg/lib/stream.js"(exports2, module2) {
    var { getStream, getSecureStream } = getStreamFuncs();
    module2.exports = {
      /**
       * Get a socket stream compatible with the current runtime environment.
       * @returns {Duplex}
       */
      getStream,
      /**
       * Get a TLS secured socket, compatible with the current environment,
       * using the socket and other settings given in `options`.
       * @returns {Duplex}
       */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net = require("net");
        return new net.Socket();
      }
      function getSecureStream2(options) {
        const tls = require("tls");
        return tls.connect(options);
      }
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_dist2();
        return new CloudflareSocket(ssl);
      }
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && typeof navigator.userAgent === "string") {
        return navigator.userAgent === "Cloudflare-Workers";
      }
      if (typeof Response === "function") {
        const resp = new Response(null, { cf: { thing: true } });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
  }
});

// ../../node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "../../node_modules/pg/lib/connection.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var { parse, serialize } = require_dist();
    var { getStream, getSecureStream } = require_stream();
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection2 = class extends EventEmitter {
      constructor(config) {
        super();
        config = config || {};
        this.stream = config.stream || getStream(config.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config);
        }
        this._keepAlive = config.keepAlive;
        this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
        this.lastBuffer = false;
        this.parsedStatements = {};
        this.ssl = config.ssl || false;
        this._ending = false;
        this._emitMessage = false;
        const self2 = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self2._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self2 = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self2._keepAlive) {
            self2.stream.setKeepAlive(true, self2._keepAliveInitialDelayMillis);
          }
          self2.emit("connect");
        });
        const reportStreamError = function(error) {
          if (self2._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self2.emit("error", error);
        };
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self2.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self2.stream.end();
              return self2.emit("error", new Error("The server does not support SSL connections"));
            default:
              self2.stream.end();
              return self2.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          const options = {
            socket: self2.stream
          };
          if (self2.ssl !== true) {
            Object.assign(options, self2.ssl);
            if ("key" in self2.ssl) {
              options.key = self2.ssl.key;
            }
          }
          const net = require("net");
          if (net.isIP && net.isIP(host) === 0) {
            options.servername = host;
          }
          try {
            self2.stream = getSecureStream(options);
          } catch (err) {
            return self2.emit("error", err);
          }
          self2.attachListeners(self2.stream);
          self2.stream.on("error", reportStreamError);
          self2.emit("sslconnect");
        });
      }
      attachListeners(stream) {
        parse(stream, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config) {
        this.stream.write(serialize.startup(config));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query) {
        this._send(serialize.parse(query));
      }
      // send bind message
      bind(config) {
        this._send(serialize.bind(config));
      }
      // send execute message
      execute(config) {
        this._send(serialize.execute(config));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module2.exports = Connection2;
  }
});

// ../../node_modules/split2/index.js
var require_split2 = __commonJS({
  "../../node_modules/split2/index.js"(exports2, module2) {
    "use strict";
    var { Transform } = require("stream");
    var { StringDecoder } = require("string_decoder");
    var kLast = Symbol("last");
    var kDecoder = Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    function push(self2, val) {
      if (val !== void 0) {
        self2.push(val);
      }
    }
    function noop(incoming) {
      return incoming;
    }
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    module2.exports = split;
  }
});

// ../../node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "../../node_modules/pgpass/lib/helper.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var Stream = require("stream").Stream;
    var split = require_split2();
    var util = require("util");
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    var fieldNames = ["host", "port", "database", "user", "password"];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    Object.defineProperty(module2.exports, "isWin", {
      get: function() {
        return isWin;
      },
      set: function(val) {
        isWin = val;
      }
    });
    module2.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module2.exports.getFileName = function(rawEnv) {
      var env = rawEnv || process.env;
      var file = env.PGPASSFILE || (isWin ? path.join(env.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env.HOME || "./", ".pgpass"));
      return file;
    };
    module2.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module2.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module2.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      var onEnd = function() {
        stream.destroy();
        cb(pass);
      };
      var onErr = function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      };
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module2.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\([:\\])/g, "$1");
        }
        obj[fieldNames[idx]] = field;
      };
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module2.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x) {
          return x.length > 0;
        },
        // port
        1: function(x) {
          if (x === "*") {
            return true;
          }
          x = Number(x);
          return isFinite(x) && x > 0 && x < 9007199254740992 && Math.floor(x) === x;
        },
        // database
        2: function(x) {
          return x.length > 0;
        },
        // username
        3: function(x) {
          return x.length > 0;
        },
        // password
        4: function(x) {
          return x.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// ../../node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/pgpass/lib/index.js"(exports2, module2) {
    "use strict";
    var path = require("path");
    var fs = require("fs");
    var helper = require_helper();
    module2.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st = fs.createReadStream(file);
        helper.getPassword(connInfo, st, cb);
      });
    };
    module2.exports.warnTo = helper.warnTo;
  }
});

// ../../node_modules/pg/lib/client.js
var require_client = __commonJS({
  "../../node_modules/pg/lib/client.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var utils = require_utils();
    var sasl = require_sasl();
    var TypeOverrides2 = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query2 = require_query();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var crypto = require_utils2();
    var Client2 = class extends EventEmitter {
      constructor(config) {
        super();
        this.connectionParameters = new ConnectionParameters(config);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c = config || {};
        this._Promise = c.Promise || global.Promise;
        this._types = new TypeOverrides2(c.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this.enableChannelBinding = Boolean(c.enableChannelBinding);
        this.connection = c.connection || new Connection2({
          stream: c.stream,
          ssl: this.connectionParameters.ssl,
          keepAlive: c.keepAlive || false,
          keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this.queryQueue = [];
        this.binary = c.binary || defaults2.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
      }
      _errorAllQueries(err) {
        const enqueueError = (query) => {
          process.nextTick(() => {
            query.handleError(err, this.connection);
          });
        };
        if (this.activeQuery) {
          enqueueError(this.activeQuery);
          this.activeQuery = null;
        }
        this.queryQueue.forEach(enqueueError);
        this.queryQueue.length = 0;
      }
      _connect(callback) {
        const self2 = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self2.ssl) {
            con.requestSsl();
          } else {
            con.startup(self2.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self2.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      // TODO(bmc): deprecate pgpass "built in" integration since this.password can be a function
      // it can be supplied by the user if required - this is a breaking change!
      _checkPgPass(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password()).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e) {
            this.emit("error", e);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._checkPgPass(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._checkPgPass(async () => {
          try {
            const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e) {
            this.emit("error", e);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._checkPgPass(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(
            this.saslSession,
            this.password,
            msg.data,
            this.enableChannelBinding && this.connection.stream
          );
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const { activeQuery } = this;
        this.activeQuery = null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receieve an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this.activeQuery;
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this.activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        this.activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        this.activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        this.activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        this.activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        if (this.activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        this.activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        if (this.activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (this.activeQuery.name) {
          this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        this.activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        this.activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query) {
        if (client.activeQuery === query) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client.queryQueue.indexOf(query) !== -1) {
          client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str) {
        return utils.escapeIdentifier(str);
      }
      escapeLiteral(str) {
        return utils.escapeLiteral(str);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this.activeQuery = this.queryQueue.shift();
          if (this.activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = this.activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                this.activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this.activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config, values, callback) {
        let query;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config === null || config === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config.submit === "function") {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          result = query = config;
          if (typeof values === "function") {
            query.callback = query.callback || values;
          }
        } else {
          readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
          query = new Query2(config, values, callback);
          if (!query.callback) {
            result = new this._Promise((resolve, reject) => {
              query.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          }
        }
        if (readTimeout) {
          queryCallback = query.callback;
          readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query.handleError(error, this.connection);
            });
            queryCallback(error);
            query.callback = () => {
            };
            const index = this.queryQueue.indexOf(query);
            if (index > -1) {
              this.queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query.binary) {
          query.binary = true;
        }
        if (query._result && !query._result._types) {
          query._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        this.queryQueue.push(query);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
          } else {
            return this._Promise.resolve();
          }
        }
        if (this.activeQuery || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
    };
    Client2.Query = Query2;
    module2.exports = Client2;
  }
});

// ../../node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "../../node_modules/pg-pool/index.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var NOOP = function() {
    };
    var removeWhere = (list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    };
    var IdleItem = class {
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    function promisify(Promise2, callback) {
      if (callback) {
        return { callback, result: void 0 };
      }
      let rej;
      let res;
      const cb = function(err, client) {
        err ? rej(err) : res(client);
      };
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return { callback: cb, result };
    }
    function makeIdleListener(pool, client) {
      return function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool.log("additional client error after disconnection due to error", err);
        });
        pool._remove(client);
        pool.emit("error", err, client);
      };
    }
    var Pool2 = class extends EventEmitter {
      constructor(options, Client2) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client2 || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c) => c !== client);
        client.end();
        this.emit("remove", client);
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = (err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          };
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            this.log("ending client due to timeout");
            timeoutHit = true;
            client.connection ? client.connection.stream.destroy() : client.end();
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c) => c !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", { cause: err });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.maxLifetimeSeconds !== 0) {
              const maxLifetimeTimeout = setTimeout(() => {
                this.log("ending client due to expired lifetime");
                this._expired.add(client);
                const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
                if (idleIndex !== -1) {
                  this._acquireClient(
                    client,
                    new PendingItem((err2, client2, clientRelease) => clientRelease()),
                    idleListener,
                    false
                  );
                }
              }, this.options.maxLifetimeSeconds * 1e3);
              maxLifetimeTimeout.unref();
              client.once("end", () => clearTimeout(maxLifetimeTimeout));
            }
            return this._acquireClient(client, pendingItem, idleListener, true);
          }
        });
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          this._remove(client);
          this._pulseQueue();
          return;
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          this._remove(client);
          this._pulseQueue();
          return;
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            this.log("remove idle client");
            this._remove(client);
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = (err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          };
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module2.exports = Pool2;
  }
});

// ../../node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "../../node_modules/pg/lib/native/query.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var utils = require_utils();
    var NativeQuery = module2.exports = function(config, values, callback) {
      EventEmitter.call(this);
      config = utils.normalizeQueryConfig(config, values, callback);
      this.text = config.text;
      this.values = config.values;
      this.name = config.name;
      this.queryMode = config.queryMode;
      this.callback = config.callback;
      this.state = "new";
      this._arrayMode = config.rowMode === "array";
      this._emitRowEvents = false;
      this.on(
        "newListener",
        function(event) {
          if (event === "row") this._emitRowEvents = true;
        }.bind(this)
      );
    };
    util.inherits(NativeQuery, EventEmitter);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise(
        function(resolve, reject) {
          this._once("end", resolve);
          this._once("error", reject);
        }.bind(this)
      );
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self2 = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self2.emit("_done");
        });
        if (err) {
          return self2.handleError(err);
        }
        if (self2._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self2.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self2.emit("row", row, results);
            });
          }
        }
        self2.state = "end";
        self2.emit("end", results);
        if (self2.callback) {
          self2.callback(null, results);
        }
      };
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self2.name] = self2.text;
          return self2.native.execute(self2.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// ../../node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "../../node_modules/pg/lib/native/client.js"(exports2, module2) {
    "use strict";
    var Native;
    try {
      Native = require("pg-native");
    } catch (e) {
      throw e;
    }
    var TypeOverrides2 = require_type_overrides();
    var EventEmitter = require("events").EventEmitter;
    var util = require("util");
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var Client2 = module2.exports = function(config) {
      EventEmitter.call(this);
      config = config || {};
      this._Promise = config.Promise || global.Promise;
      this._types = new TypeOverrides2(config.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp = this.connectionParameters = new ConnectionParameters(config);
      if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
      this.user = cp.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp.password
      });
      this.database = cp.database;
      this.host = cp.host;
      this.port = cp.port;
      this.namedQueries = {};
    };
    Client2.Query = NativeQuery;
    util.inherits(Client2, EventEmitter);
    Client2.prototype._errorAllQueries = function(err) {
      const enqueueError = (query) => {
        process.nextTick(() => {
          query.native = this.native;
          query.handleError(err);
        });
      };
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client2.prototype._connect = function(cb) {
      const self2 = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self2.connectionParameters.nativeConnectionString) conString = self2.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self2.native.connect(conString, function(err2) {
          if (err2) {
            self2.native.end();
            return cb(err2);
          }
          self2._connected = true;
          self2.native.on("error", function(err3) {
            self2._queryable = false;
            self2._errorAllQueries(err3);
            self2.emit("error", err3);
          });
          self2.native.on("notification", function(msg) {
            self2.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self2.emit("connect");
          self2._pulseQueryQueue(true);
          cb();
        });
      });
    };
    Client2.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    };
    Client2.prototype.query = function(config, values, callback) {
      let query;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config === null || config === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config.submit === "function") {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        result = query = config;
        if (typeof values === "function") {
          config.callback = values;
        }
      } else {
        readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
        query = new NativeQuery(config, values, callback);
        if (!query.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query.callback;
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          const index = this._queryQueue.indexOf(query);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      this._queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    };
    Client2.prototype.end = function(cb) {
      const self2 = this;
      this._ending = true;
      if (!this._connected) {
        this.once("connect", this.end.bind(this, cb));
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = (err) => err ? reject(err) : resolve();
        });
      }
      this.native.end(function() {
        self2._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self2.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client2.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client2.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query = this._queryQueue.shift();
      if (!query) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query;
      query.submit(this);
      const self2 = this;
      query.once("_done", function() {
        self2._pulseQueryQueue();
      });
    };
    Client2.prototype.cancel = function(query) {
      if (this._activeQuery === query) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
      }
    };
    Client2.prototype.ref = function() {
    };
    Client2.prototype.unref = function() {
    };
    Client2.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client2.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
  }
});

// ../../node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "../../node_modules/pg/lib/native/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_client2();
  }
});

// ../../node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/pg/lib/index.js"(exports2, module2) {
    "use strict";
    var Client2 = require_client();
    var defaults2 = require_defaults();
    var Connection2 = require_connection();
    var Result2 = require_result();
    var utils = require_utils();
    var Pool2 = require_pg_pool();
    var TypeOverrides2 = require_type_overrides();
    var { DatabaseError: DatabaseError2 } = require_dist();
    var { escapeIdentifier: escapeIdentifier2, escapeLiteral: escapeLiteral2 } = require_utils();
    var poolFactory = (Client3) => {
      return class BoundPool extends Pool2 {
        constructor(options) {
          super(options, Client3);
        }
      };
    };
    var PG = function(clientConstructor) {
      this.defaults = defaults2;
      this.Client = clientConstructor;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection2;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError2;
      this.TypeOverrides = TypeOverrides2;
      this.escapeIdentifier = escapeIdentifier2;
      this.escapeLiteral = escapeLiteral2;
      this.Result = Result2;
      this.utils = utils;
    };
    if (typeof process.env.NODE_PG_FORCE_NATIVE !== "undefined") {
      module2.exports = new PG(require_native());
    } else {
      module2.exports = new PG(Client2);
      Object.defineProperty(module2.exports, "native", {
        configurable: true,
        enumerable: false,
        get() {
          let native = null;
          try {
            native = new PG(require_native());
          } catch (err) {
            if (err.code !== "MODULE_NOT_FOUND") {
              throw err;
            }
          }
          Object.defineProperty(module2.exports, "native", {
            value: native
          });
          return native;
        }
      });
    }
  }
});

// ../../node_modules/logform/format.js
var require_format = __commonJS({
  "../../node_modules/logform/format.js"(exports2, module2) {
    "use strict";
    var InvalidFormatError = class _InvalidFormatError extends Error {
      constructor(formatFn) {
        super(`Format functions must be synchronous taking a two arguments: (info, opts)
Found: ${formatFn.toString().split("\n")[0]}
`);
        Error.captureStackTrace(this, _InvalidFormatError);
      }
    };
    module2.exports = (formatFn) => {
      if (formatFn.length > 2) {
        throw new InvalidFormatError(formatFn);
      }
      function Format(options = {}) {
        this.options = options;
      }
      Format.prototype.transform = formatFn;
      function createFormatWrap(opts) {
        return new Format(opts);
      }
      createFormatWrap.Format = Format;
      return createFormatWrap;
    };
  }
});

// ../../node_modules/@colors/colors/lib/styles.js
var require_styles = __commonJS({
  "../../node_modules/@colors/colors/lib/styles.js"(exports2, module2) {
    var styles = {};
    module2["exports"] = styles;
    var codes = {
      reset: [0, 0],
      bold: [1, 22],
      dim: [2, 22],
      italic: [3, 23],
      underline: [4, 24],
      inverse: [7, 27],
      hidden: [8, 28],
      strikethrough: [9, 29],
      black: [30, 39],
      red: [31, 39],
      green: [32, 39],
      yellow: [33, 39],
      blue: [34, 39],
      magenta: [35, 39],
      cyan: [36, 39],
      white: [37, 39],
      gray: [90, 39],
      grey: [90, 39],
      brightRed: [91, 39],
      brightGreen: [92, 39],
      brightYellow: [93, 39],
      brightBlue: [94, 39],
      brightMagenta: [95, 39],
      brightCyan: [96, 39],
      brightWhite: [97, 39],
      bgBlack: [40, 49],
      bgRed: [41, 49],
      bgGreen: [42, 49],
      bgYellow: [43, 49],
      bgBlue: [44, 49],
      bgMagenta: [45, 49],
      bgCyan: [46, 49],
      bgWhite: [47, 49],
      bgGray: [100, 49],
      bgGrey: [100, 49],
      bgBrightRed: [101, 49],
      bgBrightGreen: [102, 49],
      bgBrightYellow: [103, 49],
      bgBrightBlue: [104, 49],
      bgBrightMagenta: [105, 49],
      bgBrightCyan: [106, 49],
      bgBrightWhite: [107, 49],
      // legacy styles for colors pre v1.0.0
      blackBG: [40, 49],
      redBG: [41, 49],
      greenBG: [42, 49],
      yellowBG: [43, 49],
      blueBG: [44, 49],
      magentaBG: [45, 49],
      cyanBG: [46, 49],
      whiteBG: [47, 49]
    };
    Object.keys(codes).forEach(function(key) {
      var val = codes[key];
      var style = styles[key] = [];
      style.open = "\x1B[" + val[0] + "m";
      style.close = "\x1B[" + val[1] + "m";
    });
  }
});

// ../../node_modules/@colors/colors/lib/system/has-flag.js
var require_has_flag = __commonJS({
  "../../node_modules/@colors/colors/lib/system/has-flag.js"(exports2, module2) {
    "use strict";
    module2.exports = function(flag, argv) {
      argv = argv || process.argv || [];
      var terminatorPos = argv.indexOf("--");
      var prefix = /^-{1,2}/.test(flag) ? "" : "--";
      var pos = argv.indexOf(prefix + flag);
      return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
    };
  }
});

// ../../node_modules/@colors/colors/lib/system/supports-colors.js
var require_supports_colors = __commonJS({
  "../../node_modules/@colors/colors/lib/system/supports-colors.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var hasFlag = require_has_flag();
    var env = process.env;
    var forceColor = void 0;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
      forceColor = false;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = true;
    }
    if ("FORCE_COLOR" in env) {
      forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(stream) {
      if (forceColor === false) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
      }
      var min = forceColor ? 1 : 0;
      if (process.platform === "win32") {
        var osRelease = os.release().split(".");
        if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some(function(sign) {
          return sign in env;
        }) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if ("TERM_PROGRAM" in env) {
        var version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Hyper":
            return 3;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      if (env.TERM === "dumb") {
        return min;
      }
      return min;
    }
    function getSupportLevel(stream) {
      var level = supportsColor(stream);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: getSupportLevel(process.stdout),
      stderr: getSupportLevel(process.stderr)
    };
  }
});

// ../../node_modules/@colors/colors/lib/custom/trap.js
var require_trap = __commonJS({
  "../../node_modules/@colors/colors/lib/custom/trap.js"(exports2, module2) {
    module2["exports"] = function runTheTrap(text, options) {
      var result = "";
      text = text || "Run the trap, drop the bass";
      text = text.split("");
      var trap = {
        a: ["@", "\u0104", "\u023A", "\u0245", "\u0394", "\u039B", "\u0414"],
        b: ["\xDF", "\u0181", "\u0243", "\u026E", "\u03B2", "\u0E3F"],
        c: ["\xA9", "\u023B", "\u03FE"],
        d: ["\xD0", "\u018A", "\u0500", "\u0501", "\u0502", "\u0503"],
        e: [
          "\xCB",
          "\u0115",
          "\u018E",
          "\u0258",
          "\u03A3",
          "\u03BE",
          "\u04BC",
          "\u0A6C"
        ],
        f: ["\u04FA"],
        g: ["\u0262"],
        h: ["\u0126", "\u0195", "\u04A2", "\u04BA", "\u04C7", "\u050A"],
        i: ["\u0F0F"],
        j: ["\u0134"],
        k: ["\u0138", "\u04A0", "\u04C3", "\u051E"],
        l: ["\u0139"],
        m: ["\u028D", "\u04CD", "\u04CE", "\u0520", "\u0521", "\u0D69"],
        n: ["\xD1", "\u014B", "\u019D", "\u0376", "\u03A0", "\u048A"],
        o: [
          "\xD8",
          "\xF5",
          "\xF8",
          "\u01FE",
          "\u0298",
          "\u047A",
          "\u05DD",
          "\u06DD",
          "\u0E4F"
        ],
        p: ["\u01F7", "\u048E"],
        q: ["\u09CD"],
        r: ["\xAE", "\u01A6", "\u0210", "\u024C", "\u0280", "\u042F"],
        s: ["\xA7", "\u03DE", "\u03DF", "\u03E8"],
        t: ["\u0141", "\u0166", "\u0373"],
        u: ["\u01B1", "\u054D"],
        v: ["\u05D8"],
        w: ["\u0428", "\u0460", "\u047C", "\u0D70"],
        x: ["\u04B2", "\u04FE", "\u04FC", "\u04FD"],
        y: ["\xA5", "\u04B0", "\u04CB"],
        z: ["\u01B5", "\u0240"]
      };
      text.forEach(function(c) {
        c = c.toLowerCase();
        var chars = trap[c] || [" "];
        var rand = Math.floor(Math.random() * chars.length);
        if (typeof trap[c] !== "undefined") {
          result += trap[c][rand];
        } else {
          result += c;
        }
      });
      return result;
    };
  }
});

// ../../node_modules/@colors/colors/lib/custom/zalgo.js
var require_zalgo = __commonJS({
  "../../node_modules/@colors/colors/lib/custom/zalgo.js"(exports2, module2) {
    module2["exports"] = function zalgo(text, options) {
      text = text || "   he is here   ";
      var soul = {
        "up": [
          "\u030D",
          "\u030E",
          "\u0304",
          "\u0305",
          "\u033F",
          "\u0311",
          "\u0306",
          "\u0310",
          "\u0352",
          "\u0357",
          "\u0351",
          "\u0307",
          "\u0308",
          "\u030A",
          "\u0342",
          "\u0313",
          "\u0308",
          "\u034A",
          "\u034B",
          "\u034C",
          "\u0303",
          "\u0302",
          "\u030C",
          "\u0350",
          "\u0300",
          "\u0301",
          "\u030B",
          "\u030F",
          "\u0312",
          "\u0313",
          "\u0314",
          "\u033D",
          "\u0309",
          "\u0363",
          "\u0364",
          "\u0365",
          "\u0366",
          "\u0367",
          "\u0368",
          "\u0369",
          "\u036A",
          "\u036B",
          "\u036C",
          "\u036D",
          "\u036E",
          "\u036F",
          "\u033E",
          "\u035B",
          "\u0346",
          "\u031A"
        ],
        "down": [
          "\u0316",
          "\u0317",
          "\u0318",
          "\u0319",
          "\u031C",
          "\u031D",
          "\u031E",
          "\u031F",
          "\u0320",
          "\u0324",
          "\u0325",
          "\u0326",
          "\u0329",
          "\u032A",
          "\u032B",
          "\u032C",
          "\u032D",
          "\u032E",
          "\u032F",
          "\u0330",
          "\u0331",
          "\u0332",
          "\u0333",
          "\u0339",
          "\u033A",
          "\u033B",
          "\u033C",
          "\u0345",
          "\u0347",
          "\u0348",
          "\u0349",
          "\u034D",
          "\u034E",
          "\u0353",
          "\u0354",
          "\u0355",
          "\u0356",
          "\u0359",
          "\u035A",
          "\u0323"
        ],
        "mid": [
          "\u0315",
          "\u031B",
          "\u0300",
          "\u0301",
          "\u0358",
          "\u0321",
          "\u0322",
          "\u0327",
          "\u0328",
          "\u0334",
          "\u0335",
          "\u0336",
          "\u035C",
          "\u035D",
          "\u035E",
          "\u035F",
          "\u0360",
          "\u0362",
          "\u0338",
          "\u0337",
          "\u0361",
          " \u0489"
        ]
      };
      var all = [].concat(soul.up, soul.down, soul.mid);
      function randomNumber(range) {
        var r = Math.floor(Math.random() * range);
        return r;
      }
      function isChar(character) {
        var bool = false;
        all.filter(function(i) {
          bool = i === character;
        });
        return bool;
      }
      function heComes(text2, options2) {
        var result = "";
        var counts;
        var l;
        options2 = options2 || {};
        options2["up"] = typeof options2["up"] !== "undefined" ? options2["up"] : true;
        options2["mid"] = typeof options2["mid"] !== "undefined" ? options2["mid"] : true;
        options2["down"] = typeof options2["down"] !== "undefined" ? options2["down"] : true;
        options2["size"] = typeof options2["size"] !== "undefined" ? options2["size"] : "maxi";
        text2 = text2.split("");
        for (l in text2) {
          if (isChar(l)) {
            continue;
          }
          result = result + text2[l];
          counts = { "up": 0, "down": 0, "mid": 0 };
          switch (options2.size) {
            case "mini":
              counts.up = randomNumber(8);
              counts.mid = randomNumber(2);
              counts.down = randomNumber(8);
              break;
            case "maxi":
              counts.up = randomNumber(16) + 3;
              counts.mid = randomNumber(4) + 1;
              counts.down = randomNumber(64) + 3;
              break;
            default:
              counts.up = randomNumber(8) + 1;
              counts.mid = randomNumber(6) / 2;
              counts.down = randomNumber(8) + 1;
              break;
          }
          var arr = ["up", "mid", "down"];
          for (var d in arr) {
            var index = arr[d];
            for (var i = 0; i <= counts[index]; i++) {
              if (options2[index]) {
                result = result + soul[index][randomNumber(soul[index].length)];
              }
            }
          }
        }
        return result;
      }
      return heComes(text, options);
    };
  }
});

// ../../node_modules/@colors/colors/lib/maps/america.js
var require_america = __commonJS({
  "../../node_modules/@colors/colors/lib/maps/america.js"(exports2, module2) {
    module2["exports"] = function(colors) {
      return function(letter, i, exploded) {
        if (letter === " ") return letter;
        switch (i % 3) {
          case 0:
            return colors.red(letter);
          case 1:
            return colors.white(letter);
          case 2:
            return colors.blue(letter);
        }
      };
    };
  }
});

// ../../node_modules/@colors/colors/lib/maps/zebra.js
var require_zebra = __commonJS({
  "../../node_modules/@colors/colors/lib/maps/zebra.js"(exports2, module2) {
    module2["exports"] = function(colors) {
      return function(letter, i, exploded) {
        return i % 2 === 0 ? letter : colors.inverse(letter);
      };
    };
  }
});

// ../../node_modules/@colors/colors/lib/maps/rainbow.js
var require_rainbow = __commonJS({
  "../../node_modules/@colors/colors/lib/maps/rainbow.js"(exports2, module2) {
    module2["exports"] = function(colors) {
      var rainbowColors = ["red", "yellow", "green", "blue", "magenta"];
      return function(letter, i, exploded) {
        if (letter === " ") {
          return letter;
        } else {
          return colors[rainbowColors[i++ % rainbowColors.length]](letter);
        }
      };
    };
  }
});

// ../../node_modules/@colors/colors/lib/maps/random.js
var require_random = __commonJS({
  "../../node_modules/@colors/colors/lib/maps/random.js"(exports2, module2) {
    module2["exports"] = function(colors) {
      var available = [
        "underline",
        "inverse",
        "grey",
        "yellow",
        "red",
        "green",
        "blue",
        "white",
        "cyan",
        "magenta",
        "brightYellow",
        "brightRed",
        "brightGreen",
        "brightBlue",
        "brightWhite",
        "brightCyan",
        "brightMagenta"
      ];
      return function(letter, i, exploded) {
        return letter === " " ? letter : colors[available[Math.round(Math.random() * (available.length - 2))]](letter);
      };
    };
  }
});

// ../../node_modules/@colors/colors/lib/colors.js
var require_colors = __commonJS({
  "../../node_modules/@colors/colors/lib/colors.js"(exports2, module2) {
    var colors = {};
    module2["exports"] = colors;
    colors.themes = {};
    var util = require("util");
    var ansiStyles = colors.styles = require_styles();
    var defineProps = Object.defineProperties;
    var newLineRegex = new RegExp(/[\r\n]+/g);
    colors.supportsColor = require_supports_colors().supportsColor;
    if (typeof colors.enabled === "undefined") {
      colors.enabled = colors.supportsColor() !== false;
    }
    colors.enable = function() {
      colors.enabled = true;
    };
    colors.disable = function() {
      colors.enabled = false;
    };
    colors.stripColors = colors.strip = function(str) {
      return ("" + str).replace(/\x1B\[\d+m/g, "");
    };
    var stylize = colors.stylize = function stylize2(str, style) {
      if (!colors.enabled) {
        return str + "";
      }
      var styleMap = ansiStyles[style];
      if (!styleMap && style in colors) {
        return colors[style](str);
      }
      return styleMap.open + str + styleMap.close;
    };
    var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
    var escapeStringRegexp = function(str) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      return str.replace(matchOperatorsRe, "\\$&");
    };
    function build(_styles) {
      var builder = function builder2() {
        return applyStyle.apply(builder2, arguments);
      };
      builder._styles = _styles;
      builder.__proto__ = proto;
      return builder;
    }
    var styles = function() {
      var ret = {};
      ansiStyles.grey = ansiStyles.gray;
      Object.keys(ansiStyles).forEach(function(key) {
        ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), "g");
        ret[key] = {
          get: function() {
            return build(this._styles.concat(key));
          }
        };
      });
      return ret;
    }();
    var proto = defineProps(function colors2() {
    }, styles);
    function applyStyle() {
      var args = Array.prototype.slice.call(arguments);
      var str = args.map(function(arg) {
        if (arg != null && arg.constructor === String) {
          return arg;
        } else {
          return util.inspect(arg);
        }
      }).join(" ");
      if (!colors.enabled || !str) {
        return str;
      }
      var newLinesPresent = str.indexOf("\n") != -1;
      var nestedStyles = this._styles;
      var i = nestedStyles.length;
      while (i--) {
        var code = ansiStyles[nestedStyles[i]];
        str = code.open + str.replace(code.closeRe, code.open) + code.close;
        if (newLinesPresent) {
          str = str.replace(newLineRegex, function(match) {
            return code.close + match + code.open;
          });
        }
      }
      return str;
    }
    colors.setTheme = function(theme) {
      if (typeof theme === "string") {
        console.log("colors.setTheme now only accepts an object, not a string.  If you are trying to set a theme from a file, it is now your (the caller's) responsibility to require the file.  The old syntax looked like colors.setTheme(__dirname + '/../themes/generic-logging.js'); The new syntax looks like colors.setTheme(require(__dirname + '/../themes/generic-logging.js'));");
        return;
      }
      for (var style in theme) {
        (function(style2) {
          colors[style2] = function(str) {
            if (typeof theme[style2] === "object") {
              var out = str;
              for (var i in theme[style2]) {
                out = colors[theme[style2][i]](out);
              }
              return out;
            }
            return colors[theme[style2]](str);
          };
        })(style);
      }
    };
    function init() {
      var ret = {};
      Object.keys(styles).forEach(function(name) {
        ret[name] = {
          get: function() {
            return build([name]);
          }
        };
      });
      return ret;
    }
    var sequencer = function sequencer2(map2, str) {
      var exploded = str.split("");
      exploded = exploded.map(map2);
      return exploded.join("");
    };
    colors.trap = require_trap();
    colors.zalgo = require_zalgo();
    colors.maps = {};
    colors.maps.america = require_america()(colors);
    colors.maps.zebra = require_zebra()(colors);
    colors.maps.rainbow = require_rainbow()(colors);
    colors.maps.random = require_random()(colors);
    for (map in colors.maps) {
      (function(map2) {
        colors[map2] = function(str) {
          return sequencer(colors.maps[map2], str);
        };
      })(map);
    }
    var map;
    defineProps(colors, init());
  }
});

// ../../node_modules/@colors/colors/safe.js
var require_safe = __commonJS({
  "../../node_modules/@colors/colors/safe.js"(exports2, module2) {
    var colors = require_colors();
    module2["exports"] = colors;
  }
});

// ../../node_modules/triple-beam/config/cli.js
var require_cli = __commonJS({
  "../../node_modules/triple-beam/config/cli.js"(exports2) {
    "use strict";
    exports2.levels = {
      error: 0,
      warn: 1,
      help: 2,
      data: 3,
      info: 4,
      debug: 5,
      prompt: 6,
      verbose: 7,
      input: 8,
      silly: 9
    };
    exports2.colors = {
      error: "red",
      warn: "yellow",
      help: "cyan",
      data: "grey",
      info: "green",
      debug: "blue",
      prompt: "grey",
      verbose: "cyan",
      input: "grey",
      silly: "magenta"
    };
  }
});

// ../../node_modules/triple-beam/config/npm.js
var require_npm = __commonJS({
  "../../node_modules/triple-beam/config/npm.js"(exports2) {
    "use strict";
    exports2.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      verbose: 4,
      debug: 5,
      silly: 6
    };
    exports2.colors = {
      error: "red",
      warn: "yellow",
      info: "green",
      http: "green",
      verbose: "cyan",
      debug: "blue",
      silly: "magenta"
    };
  }
});

// ../../node_modules/triple-beam/config/syslog.js
var require_syslog = __commonJS({
  "../../node_modules/triple-beam/config/syslog.js"(exports2) {
    "use strict";
    exports2.levels = {
      emerg: 0,
      alert: 1,
      crit: 2,
      error: 3,
      warning: 4,
      notice: 5,
      info: 6,
      debug: 7
    };
    exports2.colors = {
      emerg: "red",
      alert: "yellow",
      crit: "red",
      error: "red",
      warning: "red",
      notice: "yellow",
      info: "green",
      debug: "blue"
    };
  }
});

// ../../node_modules/triple-beam/config/index.js
var require_config = __commonJS({
  "../../node_modules/triple-beam/config/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "cli", {
      value: require_cli()
    });
    Object.defineProperty(exports2, "npm", {
      value: require_npm()
    });
    Object.defineProperty(exports2, "syslog", {
      value: require_syslog()
    });
  }
});

// ../../node_modules/triple-beam/index.js
var require_triple_beam = __commonJS({
  "../../node_modules/triple-beam/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "LEVEL", {
      value: Symbol.for("level")
    });
    Object.defineProperty(exports2, "MESSAGE", {
      value: Symbol.for("message")
    });
    Object.defineProperty(exports2, "SPLAT", {
      value: Symbol.for("splat")
    });
    Object.defineProperty(exports2, "configs", {
      value: require_config()
    });
  }
});

// ../../node_modules/logform/colorize.js
var require_colorize = __commonJS({
  "../../node_modules/logform/colorize.js"(exports2, module2) {
    "use strict";
    var colors = require_safe();
    var { LEVEL, MESSAGE } = require_triple_beam();
    colors.enabled = true;
    var hasSpace = /\s+/;
    var Colorizer = class _Colorizer {
      constructor(opts = {}) {
        if (opts.colors) {
          this.addColors(opts.colors);
        }
        this.options = opts;
      }
      /*
       * Adds the colors Object to the set of allColors
       * known by the Colorizer
       *
       * @param {Object} colors Set of color mappings to add.
       */
      static addColors(clrs) {
        const nextColors = Object.keys(clrs).reduce((acc, level) => {
          acc[level] = hasSpace.test(clrs[level]) ? clrs[level].split(hasSpace) : clrs[level];
          return acc;
        }, {});
        _Colorizer.allColors = Object.assign({}, _Colorizer.allColors || {}, nextColors);
        return _Colorizer.allColors;
      }
      /*
       * Adds the colors Object to the set of allColors
       * known by the Colorizer
       *
       * @param {Object} colors Set of color mappings to add.
       */
      addColors(clrs) {
        return _Colorizer.addColors(clrs);
      }
      /*
       * function colorize (lookup, level, message)
       * Performs multi-step colorization using @colors/colors/safe
       */
      colorize(lookup, level, message) {
        if (typeof message === "undefined") {
          message = level;
        }
        if (!Array.isArray(_Colorizer.allColors[lookup])) {
          return colors[_Colorizer.allColors[lookup]](message);
        }
        for (let i = 0, len = _Colorizer.allColors[lookup].length; i < len; i++) {
          message = colors[_Colorizer.allColors[lookup][i]](message);
        }
        return message;
      }
      /*
       * function transform (info, opts)
       * Attempts to colorize the { level, message } of the given
       * `logform` info object.
       */
      transform(info, opts) {
        if (opts.all && typeof info[MESSAGE] === "string") {
          info[MESSAGE] = this.colorize(info[LEVEL], info.level, info[MESSAGE]);
        }
        if (opts.level || opts.all || !opts.message) {
          info.level = this.colorize(info[LEVEL], info.level);
        }
        if (opts.all || opts.message) {
          info.message = this.colorize(info[LEVEL], info.level, info.message);
        }
        return info;
      }
    };
    module2.exports = (opts) => new Colorizer(opts);
    module2.exports.Colorizer = module2.exports.Format = Colorizer;
  }
});

// ../../node_modules/logform/levels.js
var require_levels = __commonJS({
  "../../node_modules/logform/levels.js"(exports2, module2) {
    "use strict";
    var { Colorizer } = require_colorize();
    module2.exports = (config) => {
      Colorizer.addColors(config.colors || config);
      return config;
    };
  }
});

// ../../node_modules/logform/align.js
var require_align = __commonJS({
  "../../node_modules/logform/align.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    module2.exports = format((info) => {
      info.message = `	${info.message}`;
      return info;
    });
  }
});

// ../../node_modules/logform/errors.js
var require_errors = __commonJS({
  "../../node_modules/logform/errors.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    var { LEVEL, MESSAGE } = require_triple_beam();
    module2.exports = format((einfo, { stack, cause }) => {
      if (einfo instanceof Error) {
        const info = Object.assign({}, einfo, {
          level: einfo.level,
          [LEVEL]: einfo[LEVEL] || einfo.level,
          message: einfo.message,
          [MESSAGE]: einfo[MESSAGE] || einfo.message
        });
        if (stack) info.stack = einfo.stack;
        if (cause) info.cause = einfo.cause;
        return info;
      }
      if (!(einfo.message instanceof Error)) return einfo;
      const err = einfo.message;
      Object.assign(einfo, err);
      einfo.message = err.message;
      einfo[MESSAGE] = err.message;
      if (stack) einfo.stack = err.stack;
      if (cause) einfo.cause = err.cause;
      return einfo;
    });
  }
});

// ../../node_modules/logform/pad-levels.js
var require_pad_levels = __commonJS({
  "../../node_modules/logform/pad-levels.js"(exports2, module2) {
    "use strict";
    var { configs, LEVEL, MESSAGE } = require_triple_beam();
    var Padder = class _Padder {
      constructor(opts = { levels: configs.npm.levels }) {
        this.paddings = _Padder.paddingForLevels(opts.levels, opts.filler);
        this.options = opts;
      }
      /**
       * Returns the maximum length of keys in the specified `levels` Object.
       * @param  {Object} levels Set of all levels to calculate longest level against.
       * @returns {Number} Maximum length of the longest level string.
       */
      static getLongestLevel(levels) {
        const lvls = Object.keys(levels).map((level) => level.length);
        return Math.max(...lvls);
      }
      /**
       * Returns the padding for the specified `level` assuming that the
       * maximum length of all levels it's associated with is `maxLength`.
       * @param  {String} level Level to calculate padding for.
       * @param  {String} filler Repeatable text to use for padding.
       * @param  {Number} maxLength Length of the longest level
       * @returns {String} Padding string for the `level`
       */
      static paddingForLevel(level, filler, maxLength) {
        const targetLen = maxLength + 1 - level.length;
        const rep = Math.floor(targetLen / filler.length);
        const padding = `${filler}${filler.repeat(rep)}`;
        return padding.slice(0, targetLen);
      }
      /**
       * Returns an object with the string paddings for the given `levels`
       * using the specified `filler`.
       * @param  {Object} levels Set of all levels to calculate padding for.
       * @param  {String} filler Repeatable text to use for padding.
       * @returns {Object} Mapping of level to desired padding.
       */
      static paddingForLevels(levels, filler = " ") {
        const maxLength = _Padder.getLongestLevel(levels);
        return Object.keys(levels).reduce((acc, level) => {
          acc[level] = _Padder.paddingForLevel(level, filler, maxLength);
          return acc;
        }, {});
      }
      /**
       * Prepends the padding onto the `message` based on the `LEVEL` of
       * the `info`. This is based on the behavior of `winston@2` which also
       * prepended the level onto the message.
       *
       * See: https://github.com/winstonjs/winston/blob/2.x/lib/winston/logger.js#L198-L201
       *
       * @param  {Info} info Logform info object
       * @param  {Object} opts Options passed along to this instance.
       * @returns {Info} Modified logform info object.
       */
      transform(info, opts) {
        info.message = `${this.paddings[info[LEVEL]]}${info.message}`;
        if (info[MESSAGE]) {
          info[MESSAGE] = `${this.paddings[info[LEVEL]]}${info[MESSAGE]}`;
        }
        return info;
      }
    };
    module2.exports = (opts) => new Padder(opts);
    module2.exports.Padder = module2.exports.Format = Padder;
  }
});

// ../../node_modules/logform/cli.js
var require_cli2 = __commonJS({
  "../../node_modules/logform/cli.js"(exports2, module2) {
    "use strict";
    var { Colorizer } = require_colorize();
    var { Padder } = require_pad_levels();
    var { configs, MESSAGE } = require_triple_beam();
    var CliFormat = class {
      constructor(opts = {}) {
        if (!opts.levels) {
          opts.levels = configs.cli.levels;
        }
        this.colorizer = new Colorizer(opts);
        this.padder = new Padder(opts);
        this.options = opts;
      }
      /*
       * function transform (info, opts)
       * Attempts to both:
       * 1. Pad the { level }
       * 2. Colorize the { level, message }
       * of the given `logform` info object depending on the `opts`.
       */
      transform(info, opts) {
        this.colorizer.transform(
          this.padder.transform(info, opts),
          opts
        );
        info[MESSAGE] = `${info.level}:${info.message}`;
        return info;
      }
    };
    module2.exports = (opts) => new CliFormat(opts);
    module2.exports.Format = CliFormat;
  }
});

// ../../node_modules/logform/combine.js
var require_combine = __commonJS({
  "../../node_modules/logform/combine.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    function cascade(formats) {
      if (!formats.every(isValidFormat)) {
        return;
      }
      return (info) => {
        let obj = info;
        for (let i = 0; i < formats.length; i++) {
          obj = formats[i].transform(obj, formats[i].options);
          if (!obj) {
            return false;
          }
        }
        return obj;
      };
    }
    function isValidFormat(fmt) {
      if (typeof fmt.transform !== "function") {
        throw new Error([
          "No transform function found on format. Did you create a format instance?",
          "const myFormat = format(formatFn);",
          "const instance = myFormat();"
        ].join("\n"));
      }
      return true;
    }
    module2.exports = (...formats) => {
      const combinedFormat = format(cascade(formats));
      const instance = combinedFormat();
      instance.Format = combinedFormat.Format;
      return instance;
    };
    module2.exports.cascade = cascade;
  }
});

// ../../node_modules/safe-stable-stringify/index.js
var require_safe_stable_stringify = __commonJS({
  "../../node_modules/safe-stable-stringify/index.js"(exports2, module2) {
    "use strict";
    var { hasOwnProperty } = Object.prototype;
    var stringify = configure();
    stringify.configure = configure;
    stringify.stringify = stringify;
    stringify.default = stringify;
    exports2.stringify = stringify;
    exports2.configure = configure;
    module2.exports = stringify;
    var strEscapeSequencesRegExp = /[\u0000-\u001f\u0022\u005c\ud800-\udfff]/;
    function strEscape(str) {
      if (str.length < 5e3 && !strEscapeSequencesRegExp.test(str)) {
        return `"${str}"`;
      }
      return JSON.stringify(str);
    }
    function sort(array, comparator) {
      if (array.length > 200 || comparator) {
        return array.sort(comparator);
      }
      for (let i = 1; i < array.length; i++) {
        const currentValue = array[i];
        let position = i;
        while (position !== 0 && array[position - 1] > currentValue) {
          array[position] = array[position - 1];
          position--;
        }
        array[position] = currentValue;
      }
      return array;
    }
    var typedArrayPrototypeGetSymbolToStringTag = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(
        Object.getPrototypeOf(
          new Int8Array()
        )
      ),
      Symbol.toStringTag
    ).get;
    function isTypedArrayWithEntries(value) {
      return typedArrayPrototypeGetSymbolToStringTag.call(value) !== void 0 && value.length !== 0;
    }
    function stringifyTypedArray(array, separator, maximumBreadth) {
      if (array.length < maximumBreadth) {
        maximumBreadth = array.length;
      }
      const whitespace = separator === "," ? "" : " ";
      let res = `"0":${whitespace}${array[0]}`;
      for (let i = 1; i < maximumBreadth; i++) {
        res += `${separator}"${i}":${whitespace}${array[i]}`;
      }
      return res;
    }
    function getCircularValueOption(options) {
      if (hasOwnProperty.call(options, "circularValue")) {
        const circularValue = options.circularValue;
        if (typeof circularValue === "string") {
          return `"${circularValue}"`;
        }
        if (circularValue == null) {
          return circularValue;
        }
        if (circularValue === Error || circularValue === TypeError) {
          return {
            toString() {
              throw new TypeError("Converting circular structure to JSON");
            }
          };
        }
        throw new TypeError('The "circularValue" argument must be of type string or the value null or undefined');
      }
      return '"[Circular]"';
    }
    function getDeterministicOption(options) {
      let value;
      if (hasOwnProperty.call(options, "deterministic")) {
        value = options.deterministic;
        if (typeof value !== "boolean" && typeof value !== "function") {
          throw new TypeError('The "deterministic" argument must be of type boolean or comparator function');
        }
      }
      return value === void 0 ? true : value;
    }
    function getBooleanOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== "boolean") {
          throw new TypeError(`The "${key}" argument must be of type boolean`);
        }
      }
      return value === void 0 ? true : value;
    }
    function getPositiveIntegerOption(options, key) {
      let value;
      if (hasOwnProperty.call(options, key)) {
        value = options[key];
        if (typeof value !== "number") {
          throw new TypeError(`The "${key}" argument must be of type number`);
        }
        if (!Number.isInteger(value)) {
          throw new TypeError(`The "${key}" argument must be an integer`);
        }
        if (value < 1) {
          throw new RangeError(`The "${key}" argument must be >= 1`);
        }
      }
      return value === void 0 ? Infinity : value;
    }
    function getItemCount(number) {
      if (number === 1) {
        return "1 item";
      }
      return `${number} items`;
    }
    function getUniqueReplacerSet(replacerArray) {
      const replacerSet = /* @__PURE__ */ new Set();
      for (const value of replacerArray) {
        if (typeof value === "string" || typeof value === "number") {
          replacerSet.add(String(value));
        }
      }
      return replacerSet;
    }
    function getStrictOption(options) {
      if (hasOwnProperty.call(options, "strict")) {
        const value = options.strict;
        if (typeof value !== "boolean") {
          throw new TypeError('The "strict" argument must be of type boolean');
        }
        if (value) {
          return (value2) => {
            let message = `Object can not safely be stringified. Received type ${typeof value2}`;
            if (typeof value2 !== "function") message += ` (${value2.toString()})`;
            throw new Error(message);
          };
        }
      }
    }
    function configure(options) {
      options = { ...options };
      const fail = getStrictOption(options);
      if (fail) {
        if (options.bigint === void 0) {
          options.bigint = false;
        }
        if (!("circularValue" in options)) {
          options.circularValue = Error;
        }
      }
      const circularValue = getCircularValueOption(options);
      const bigint = getBooleanOption(options, "bigint");
      const deterministic = getDeterministicOption(options);
      const comparator = typeof deterministic === "function" ? deterministic : void 0;
      const maximumDepth = getPositiveIntegerOption(options, "maximumDepth");
      const maximumBreadth = getPositiveIntegerOption(options, "maximumBreadth");
      function stringifyFnReplacer(key, parent, stack, replacer, spacer, indentation) {
        let value = parent[key];
        if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
          value = value.toJSON(key);
        }
        value = replacer.call(parent, key, value);
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = "";
            let join = ",";
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== "") {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += join;
              }
              const tmp = stringifyFnReplacer(String(i), value, stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== "") {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let whitespace = "";
            let separator = "";
            if (spacer !== "") {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = " ";
            }
            const maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (deterministic && !isTypedArrayWithEntries(value)) {
              keys = sort(keys, comparator);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyFnReplacer(key2, value, stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":${whitespace}"${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (spacer !== "" && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          // fallthrough
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyArrayReplacer(key, value, stack, replacer, spacer, indentation) {
        if (typeof value === "object" && value !== null && typeof value.toJSON === "function") {
          value = value.toJSON(key);
        }
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            let res = "";
            let join = ",";
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              if (spacer !== "") {
                indentation += spacer;
                res += `
${indentation}`;
                join = `,
${indentation}`;
              }
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += join;
              }
              const tmp = stringifyArrayReplacer(String(i), value[i], stack, replacer, spacer, indentation);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `${join}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              if (spacer !== "") {
                res += `
${originalIndentation}`;
              }
              stack.pop();
              return `[${res}]`;
            }
            stack.push(value);
            let whitespace = "";
            if (spacer !== "") {
              indentation += spacer;
              join = `,
${indentation}`;
              whitespace = " ";
            }
            let separator = "";
            for (const key2 of replacer) {
              const tmp = stringifyArrayReplacer(key2, value[key2], stack, replacer, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${whitespace}${tmp}`;
                separator = join;
              }
            }
            if (spacer !== "" && separator.length > 1) {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          // fallthrough
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifyIndent(key, value, stack, spacer, indentation) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (typeof value.toJSON === "function") {
              value = value.toJSON(key);
              if (typeof value !== "object") {
                return stringifyIndent(key, value, stack, spacer, indentation);
              }
              if (value === null) {
                return "null";
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            const originalIndentation = indentation;
            if (Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              indentation += spacer;
              let res2 = `
${indentation}`;
              const join2 = `,
${indentation}`;
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifyIndent(String(i), value[i], stack, spacer, indentation);
                res2 += tmp2 !== void 0 ? tmp2 : "null";
                res2 += join2;
              }
              const tmp = stringifyIndent(String(i), value[i], stack, spacer, indentation);
              res2 += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res2 += `${join2}"... ${getItemCount(removedKeys)} not stringified"`;
              }
              res2 += `
${originalIndentation}`;
              stack.pop();
              return `[${res2}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            indentation += spacer;
            const join = `,
${indentation}`;
            let res = "";
            let separator = "";
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, join, maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = join;
            }
            if (deterministic) {
              keys = sort(keys, comparator);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifyIndent(key2, value[key2], stack, spacer, indentation);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}: ${tmp}`;
                separator = join;
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...": "${getItemCount(removedKeys)} not stringified"`;
              separator = join;
            }
            if (separator !== "") {
              res = `
${indentation}${res}
${originalIndentation}`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          // fallthrough
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringifySimple(key, value, stack) {
        switch (typeof value) {
          case "string":
            return strEscape(value);
          case "object": {
            if (value === null) {
              return "null";
            }
            if (typeof value.toJSON === "function") {
              value = value.toJSON(key);
              if (typeof value !== "object") {
                return stringifySimple(key, value, stack);
              }
              if (value === null) {
                return "null";
              }
            }
            if (stack.indexOf(value) !== -1) {
              return circularValue;
            }
            let res = "";
            const hasLength = value.length !== void 0;
            if (hasLength && Array.isArray(value)) {
              if (value.length === 0) {
                return "[]";
              }
              if (maximumDepth < stack.length + 1) {
                return '"[Array]"';
              }
              stack.push(value);
              const maximumValuesToStringify = Math.min(value.length, maximumBreadth);
              let i = 0;
              for (; i < maximumValuesToStringify - 1; i++) {
                const tmp2 = stringifySimple(String(i), value[i], stack);
                res += tmp2 !== void 0 ? tmp2 : "null";
                res += ",";
              }
              const tmp = stringifySimple(String(i), value[i], stack);
              res += tmp !== void 0 ? tmp : "null";
              if (value.length - 1 > maximumBreadth) {
                const removedKeys = value.length - maximumBreadth - 1;
                res += `,"... ${getItemCount(removedKeys)} not stringified"`;
              }
              stack.pop();
              return `[${res}]`;
            }
            let keys = Object.keys(value);
            const keyLength = keys.length;
            if (keyLength === 0) {
              return "{}";
            }
            if (maximumDepth < stack.length + 1) {
              return '"[Object]"';
            }
            let separator = "";
            let maximumPropertiesToStringify = Math.min(keyLength, maximumBreadth);
            if (hasLength && isTypedArrayWithEntries(value)) {
              res += stringifyTypedArray(value, ",", maximumBreadth);
              keys = keys.slice(value.length);
              maximumPropertiesToStringify -= value.length;
              separator = ",";
            }
            if (deterministic) {
              keys = sort(keys, comparator);
            }
            stack.push(value);
            for (let i = 0; i < maximumPropertiesToStringify; i++) {
              const key2 = keys[i];
              const tmp = stringifySimple(key2, value[key2], stack);
              if (tmp !== void 0) {
                res += `${separator}${strEscape(key2)}:${tmp}`;
                separator = ",";
              }
            }
            if (keyLength > maximumBreadth) {
              const removedKeys = keyLength - maximumBreadth;
              res += `${separator}"...":"${getItemCount(removedKeys)} not stringified"`;
            }
            stack.pop();
            return `{${res}}`;
          }
          case "number":
            return isFinite(value) ? String(value) : fail ? fail(value) : "null";
          case "boolean":
            return value === true ? "true" : "false";
          case "undefined":
            return void 0;
          case "bigint":
            if (bigint) {
              return String(value);
            }
          // fallthrough
          default:
            return fail ? fail(value) : void 0;
        }
      }
      function stringify2(value, replacer, space) {
        if (arguments.length > 1) {
          let spacer = "";
          if (typeof space === "number") {
            spacer = " ".repeat(Math.min(space, 10));
          } else if (typeof space === "string") {
            spacer = space.slice(0, 10);
          }
          if (replacer != null) {
            if (typeof replacer === "function") {
              return stringifyFnReplacer("", { "": value }, [], replacer, spacer, "");
            }
            if (Array.isArray(replacer)) {
              return stringifyArrayReplacer("", value, [], getUniqueReplacerSet(replacer), spacer, "");
            }
          }
          if (spacer.length !== 0) {
            return stringifyIndent("", value, [], spacer, "");
          }
        }
        return stringifySimple("", value, []);
      }
      return stringify2;
    }
  }
});

// ../../node_modules/logform/json.js
var require_json = __commonJS({
  "../../node_modules/logform/json.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    var { MESSAGE } = require_triple_beam();
    var stringify = require_safe_stable_stringify();
    function replacer(key, value) {
      if (typeof value === "bigint")
        return value.toString();
      return value;
    }
    module2.exports = format((info, opts) => {
      const jsonStringify = stringify.configure(opts);
      info[MESSAGE] = jsonStringify(info, opts.replacer || replacer, opts.space);
      return info;
    });
  }
});

// ../../node_modules/logform/label.js
var require_label = __commonJS({
  "../../node_modules/logform/label.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    module2.exports = format((info, opts) => {
      if (opts.message) {
        info.message = `[${opts.label}] ${info.message}`;
        return info;
      }
      info.label = opts.label;
      return info;
    });
  }
});

// ../../node_modules/logform/logstash.js
var require_logstash = __commonJS({
  "../../node_modules/logform/logstash.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    var { MESSAGE } = require_triple_beam();
    var jsonStringify = require_safe_stable_stringify();
    module2.exports = format((info) => {
      const logstash = {};
      if (info.message) {
        logstash["@message"] = info.message;
        delete info.message;
      }
      if (info.timestamp) {
        logstash["@timestamp"] = info.timestamp;
        delete info.timestamp;
      }
      logstash["@fields"] = info;
      info[MESSAGE] = jsonStringify(logstash);
      return info;
    });
  }
});

// ../../node_modules/logform/metadata.js
var require_metadata = __commonJS({
  "../../node_modules/logform/metadata.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    function fillExcept(info, fillExceptKeys, metadataKey) {
      const savedKeys = fillExceptKeys.reduce((acc, key) => {
        acc[key] = info[key];
        delete info[key];
        return acc;
      }, {});
      const metadata = Object.keys(info).reduce((acc, key) => {
        acc[key] = info[key];
        delete info[key];
        return acc;
      }, {});
      Object.assign(info, savedKeys, {
        [metadataKey]: metadata
      });
      return info;
    }
    function fillWith(info, fillWithKeys, metadataKey) {
      info[metadataKey] = fillWithKeys.reduce((acc, key) => {
        acc[key] = info[key];
        delete info[key];
        return acc;
      }, {});
      return info;
    }
    module2.exports = format((info, opts = {}) => {
      let metadataKey = "metadata";
      if (opts.key) {
        metadataKey = opts.key;
      }
      let fillExceptKeys = [];
      if (!opts.fillExcept && !opts.fillWith) {
        fillExceptKeys.push("level");
        fillExceptKeys.push("message");
      }
      if (opts.fillExcept) {
        fillExceptKeys = opts.fillExcept;
      }
      if (fillExceptKeys.length > 0) {
        return fillExcept(info, fillExceptKeys, metadataKey);
      }
      if (opts.fillWith) {
        return fillWith(info, opts.fillWith, metadataKey);
      }
      return info;
    });
  }
});

// ../../node_modules/ms/index.js
var require_ms = __commonJS({
  "../../node_modules/ms/index.js"(exports2, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// ../../node_modules/logform/ms.js
var require_ms2 = __commonJS({
  "../../node_modules/logform/ms.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    var ms = require_ms();
    module2.exports = format((info) => {
      const curr = +/* @__PURE__ */ new Date();
      exports2.diff = curr - (exports2.prevTime || curr);
      exports2.prevTime = curr;
      info.ms = `+${ms(exports2.diff)}`;
      return info;
    });
  }
});

// ../../node_modules/logform/pretty-print.js
var require_pretty_print = __commonJS({
  "../../node_modules/logform/pretty-print.js"(exports2, module2) {
    "use strict";
    var inspect = require("util").inspect;
    var format = require_format();
    var { LEVEL, MESSAGE, SPLAT } = require_triple_beam();
    module2.exports = format((info, opts = {}) => {
      const stripped = Object.assign({}, info);
      delete stripped[LEVEL];
      delete stripped[MESSAGE];
      delete stripped[SPLAT];
      info[MESSAGE] = inspect(stripped, false, opts.depth || null, opts.colorize);
      return info;
    });
  }
});

// ../../node_modules/logform/printf.js
var require_printf = __commonJS({
  "../../node_modules/logform/printf.js"(exports2, module2) {
    "use strict";
    var { MESSAGE } = require_triple_beam();
    var Printf = class {
      constructor(templateFn) {
        this.template = templateFn;
      }
      transform(info) {
        info[MESSAGE] = this.template(info);
        return info;
      }
    };
    module2.exports = (opts) => new Printf(opts);
    module2.exports.Printf = module2.exports.Format = Printf;
  }
});

// ../../node_modules/logform/simple.js
var require_simple = __commonJS({
  "../../node_modules/logform/simple.js"(exports2, module2) {
    "use strict";
    var format = require_format();
    var { MESSAGE } = require_triple_beam();
    var jsonStringify = require_safe_stable_stringify();
    module2.exports = format((info) => {
      const stringifiedRest = jsonStringify(Object.assign({}, info, {
        level: void 0,
        message: void 0,
        splat: void 0
      }));
      const padding = info.padding && info.padding[info.level] || "";
      if (stringifiedRest !== "{}") {
        info[MESSAGE] = `${info.level}:${padding} ${info.message} ${stringifiedRest}`;
      } else {
        info[MESSAGE] = `${info.level}:${padding} ${info.message}`;
      }
      return info;
    });
  }
});

// ../../node_modules/logform/splat.js
var require_splat = __commonJS({
  "../../node_modules/logform/splat.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var { SPLAT } = require_triple_beam();
    var formatRegExp = /%[scdjifoO%]/g;
    var escapedPercent = /%%/g;
    var Splatter = class {
      constructor(opts) {
        this.options = opts;
      }
      /**
         * Check to see if tokens <= splat.length, assign { splat, meta } into the
         * `info` accordingly, and write to this instance.
         *
         * @param  {Info} info Logform info message.
         * @param  {String[]} tokens Set of string interpolation tokens.
         * @returns {Info} Modified info message
         * @private
         */
      _splat(info, tokens) {
        const msg = info.message;
        const splat = info[SPLAT] || info.splat || [];
        const percents = msg.match(escapedPercent);
        const escapes = percents && percents.length || 0;
        const expectedSplat = tokens.length - escapes;
        const extraSplat = expectedSplat - splat.length;
        const metas = extraSplat < 0 ? splat.splice(extraSplat, -1 * extraSplat) : [];
        const metalen = metas.length;
        if (metalen) {
          for (let i = 0; i < metalen; i++) {
            Object.assign(info, metas[i]);
          }
        }
        info.message = util.format(msg, ...splat);
        return info;
      }
      /**
        * Transforms the `info` message by using `util.format` to complete
        * any `info.message` provided it has string interpolation tokens.
        * If no tokens exist then `info` is immutable.
        *
        * @param  {Info} info Logform info message.
        * @param  {Object} opts Options for this instance.
        * @returns {Info} Modified info message
        */
      transform(info) {
        const msg = info.message;
        const splat = info[SPLAT] || info.splat;
        if (!splat || !splat.length) {
          return info;
        }
        const tokens = msg && msg.match && msg.match(formatRegExp);
        if (!tokens && (splat || splat.length)) {
          const metas = splat.length > 1 ? splat.splice(0) : splat;
          const metalen = metas.length;
          if (metalen) {
            for (let i = 0; i < metalen; i++) {
              Object.assign(info, metas[i]);
            }
          }
          return info;
        }
        if (tokens) {
          return this._splat(info, tokens);
        }
        return info;
      }
    };
    module2.exports = (opts) => new Splatter(opts);
  }
});

// ../../node_modules/fecha/lib/fecha.umd.js
var require_fecha_umd = __commonJS({
  "../../node_modules/fecha/lib/fecha.umd.js"(exports2, module2) {
    (function(global2, factory) {
      typeof exports2 === "object" && typeof module2 !== "undefined" ? factory(exports2) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global2.fecha = {});
    })(exports2, function(exports3) {
      "use strict";
      var token = /d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
      var twoDigitsOptional = "\\d\\d?";
      var twoDigits = "\\d\\d";
      var threeDigits = "\\d{3}";
      var fourDigits = "\\d{4}";
      var word = "[^\\s]+";
      var literal = /\[([^]*?)\]/gm;
      function shorten(arr, sLen) {
        var newArr = [];
        for (var i = 0, len = arr.length; i < len; i++) {
          newArr.push(arr[i].substr(0, sLen));
        }
        return newArr;
      }
      var monthUpdate = function(arrName) {
        return function(v, i18n) {
          var lowerCaseArr = i18n[arrName].map(function(v2) {
            return v2.toLowerCase();
          });
          var index = lowerCaseArr.indexOf(v.toLowerCase());
          if (index > -1) {
            return index;
          }
          return null;
        };
      };
      function assign(origObj) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments[_i];
        }
        for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
          var obj = args_1[_a];
          for (var key in obj) {
            origObj[key] = obj[key];
          }
        }
        return origObj;
      }
      var dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var monthNamesShort = shorten(monthNames, 3);
      var dayNamesShort = shorten(dayNames, 3);
      var defaultI18n = {
        dayNamesShort,
        dayNames,
        monthNamesShort,
        monthNames,
        amPm: ["am", "pm"],
        DoFn: function(dayOfMonth) {
          return dayOfMonth + ["th", "st", "nd", "rd"][dayOfMonth % 10 > 3 ? 0 : (dayOfMonth - dayOfMonth % 10 !== 10 ? 1 : 0) * dayOfMonth % 10];
        }
      };
      var globalI18n = assign({}, defaultI18n);
      var setGlobalDateI18n = function(i18n) {
        return globalI18n = assign(globalI18n, i18n);
      };
      var regexEscape = function(str) {
        return str.replace(/[|\\{()[^$+*?.-]/g, "\\$&");
      };
      var pad = function(val, len) {
        if (len === void 0) {
          len = 2;
        }
        val = String(val);
        while (val.length < len) {
          val = "0" + val;
        }
        return val;
      };
      var formatFlags = {
        D: function(dateObj) {
          return String(dateObj.getDate());
        },
        DD: function(dateObj) {
          return pad(dateObj.getDate());
        },
        Do: function(dateObj, i18n) {
          return i18n.DoFn(dateObj.getDate());
        },
        d: function(dateObj) {
          return String(dateObj.getDay());
        },
        dd: function(dateObj) {
          return pad(dateObj.getDay());
        },
        ddd: function(dateObj, i18n) {
          return i18n.dayNamesShort[dateObj.getDay()];
        },
        dddd: function(dateObj, i18n) {
          return i18n.dayNames[dateObj.getDay()];
        },
        M: function(dateObj) {
          return String(dateObj.getMonth() + 1);
        },
        MM: function(dateObj) {
          return pad(dateObj.getMonth() + 1);
        },
        MMM: function(dateObj, i18n) {
          return i18n.monthNamesShort[dateObj.getMonth()];
        },
        MMMM: function(dateObj, i18n) {
          return i18n.monthNames[dateObj.getMonth()];
        },
        YY: function(dateObj) {
          return pad(String(dateObj.getFullYear()), 4).substr(2);
        },
        YYYY: function(dateObj) {
          return pad(dateObj.getFullYear(), 4);
        },
        h: function(dateObj) {
          return String(dateObj.getHours() % 12 || 12);
        },
        hh: function(dateObj) {
          return pad(dateObj.getHours() % 12 || 12);
        },
        H: function(dateObj) {
          return String(dateObj.getHours());
        },
        HH: function(dateObj) {
          return pad(dateObj.getHours());
        },
        m: function(dateObj) {
          return String(dateObj.getMinutes());
        },
        mm: function(dateObj) {
          return pad(dateObj.getMinutes());
        },
        s: function(dateObj) {
          return String(dateObj.getSeconds());
        },
        ss: function(dateObj) {
          return pad(dateObj.getSeconds());
        },
        S: function(dateObj) {
          return String(Math.round(dateObj.getMilliseconds() / 100));
        },
        SS: function(dateObj) {
          return pad(Math.round(dateObj.getMilliseconds() / 10), 2);
        },
        SSS: function(dateObj) {
          return pad(dateObj.getMilliseconds(), 3);
        },
        a: function(dateObj, i18n) {
          return dateObj.getHours() < 12 ? i18n.amPm[0] : i18n.amPm[1];
        },
        A: function(dateObj, i18n) {
          return dateObj.getHours() < 12 ? i18n.amPm[0].toUpperCase() : i18n.amPm[1].toUpperCase();
        },
        ZZ: function(dateObj) {
          var offset = dateObj.getTimezoneOffset();
          return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60) * 100 + Math.abs(offset) % 60, 4);
        },
        Z: function(dateObj) {
          var offset = dateObj.getTimezoneOffset();
          return (offset > 0 ? "-" : "+") + pad(Math.floor(Math.abs(offset) / 60), 2) + ":" + pad(Math.abs(offset) % 60, 2);
        }
      };
      var monthParse = function(v) {
        return +v - 1;
      };
      var emptyDigits = [null, twoDigitsOptional];
      var emptyWord = [null, word];
      var amPm = [
        "isPm",
        word,
        function(v, i18n) {
          var val = v.toLowerCase();
          if (val === i18n.amPm[0]) {
            return 0;
          } else if (val === i18n.amPm[1]) {
            return 1;
          }
          return null;
        }
      ];
      var timezoneOffset = [
        "timezoneOffset",
        "[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",
        function(v) {
          var parts = (v + "").match(/([+-]|\d\d)/gi);
          if (parts) {
            var minutes = +parts[1] * 60 + parseInt(parts[2], 10);
            return parts[0] === "+" ? minutes : -minutes;
          }
          return 0;
        }
      ];
      var parseFlags = {
        D: ["day", twoDigitsOptional],
        DD: ["day", twoDigits],
        Do: ["day", twoDigitsOptional + word, function(v) {
          return parseInt(v, 10);
        }],
        M: ["month", twoDigitsOptional, monthParse],
        MM: ["month", twoDigits, monthParse],
        YY: [
          "year",
          twoDigits,
          function(v) {
            var now = /* @__PURE__ */ new Date();
            var cent = +("" + now.getFullYear()).substr(0, 2);
            return +("" + (+v > 68 ? cent - 1 : cent) + v);
          }
        ],
        h: ["hour", twoDigitsOptional, void 0, "isPm"],
        hh: ["hour", twoDigits, void 0, "isPm"],
        H: ["hour", twoDigitsOptional],
        HH: ["hour", twoDigits],
        m: ["minute", twoDigitsOptional],
        mm: ["minute", twoDigits],
        s: ["second", twoDigitsOptional],
        ss: ["second", twoDigits],
        YYYY: ["year", fourDigits],
        S: ["millisecond", "\\d", function(v) {
          return +v * 100;
        }],
        SS: ["millisecond", twoDigits, function(v) {
          return +v * 10;
        }],
        SSS: ["millisecond", threeDigits],
        d: emptyDigits,
        dd: emptyDigits,
        ddd: emptyWord,
        dddd: emptyWord,
        MMM: ["month", word, monthUpdate("monthNamesShort")],
        MMMM: ["month", word, monthUpdate("monthNames")],
        a: amPm,
        A: amPm,
        ZZ: timezoneOffset,
        Z: timezoneOffset
      };
      var globalMasks = {
        default: "ddd MMM DD YYYY HH:mm:ss",
        shortDate: "M/D/YY",
        mediumDate: "MMM D, YYYY",
        longDate: "MMMM D, YYYY",
        fullDate: "dddd, MMMM D, YYYY",
        isoDate: "YYYY-MM-DD",
        isoDateTime: "YYYY-MM-DDTHH:mm:ssZ",
        shortTime: "HH:mm",
        mediumTime: "HH:mm:ss",
        longTime: "HH:mm:ss.SSS"
      };
      var setGlobalDateMasks = function(masks) {
        return assign(globalMasks, masks);
      };
      var format = function(dateObj, mask, i18n) {
        if (mask === void 0) {
          mask = globalMasks["default"];
        }
        if (i18n === void 0) {
          i18n = {};
        }
        if (typeof dateObj === "number") {
          dateObj = new Date(dateObj);
        }
        if (Object.prototype.toString.call(dateObj) !== "[object Date]" || isNaN(dateObj.getTime())) {
          throw new Error("Invalid Date pass to format");
        }
        mask = globalMasks[mask] || mask;
        var literals = [];
        mask = mask.replace(literal, function($0, $1) {
          literals.push($1);
          return "@@@";
        });
        var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
        mask = mask.replace(token, function($0) {
          return formatFlags[$0](dateObj, combinedI18nSettings);
        });
        return mask.replace(/@@@/g, function() {
          return literals.shift();
        });
      };
      function parse(dateStr, format2, i18n) {
        if (i18n === void 0) {
          i18n = {};
        }
        if (typeof format2 !== "string") {
          throw new Error("Invalid format in fecha parse");
        }
        format2 = globalMasks[format2] || format2;
        if (dateStr.length > 1e3) {
          return null;
        }
        var today = /* @__PURE__ */ new Date();
        var dateInfo = {
          year: today.getFullYear(),
          month: 0,
          day: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
          isPm: null,
          timezoneOffset: null
        };
        var parseInfo = [];
        var literals = [];
        var newFormat = format2.replace(literal, function($0, $1) {
          literals.push(regexEscape($1));
          return "@@@";
        });
        var specifiedFields = {};
        var requiredFields = {};
        newFormat = regexEscape(newFormat).replace(token, function($0) {
          var info = parseFlags[$0];
          var field2 = info[0], regex = info[1], requiredField = info[3];
          if (specifiedFields[field2]) {
            throw new Error("Invalid format. " + field2 + " specified twice in format");
          }
          specifiedFields[field2] = true;
          if (requiredField) {
            requiredFields[requiredField] = true;
          }
          parseInfo.push(info);
          return "(" + regex + ")";
        });
        Object.keys(requiredFields).forEach(function(field2) {
          if (!specifiedFields[field2]) {
            throw new Error("Invalid format. " + field2 + " is required in specified format");
          }
        });
        newFormat = newFormat.replace(/@@@/g, function() {
          return literals.shift();
        });
        var matches = dateStr.match(new RegExp(newFormat, "i"));
        if (!matches) {
          return null;
        }
        var combinedI18nSettings = assign(assign({}, globalI18n), i18n);
        for (var i = 1; i < matches.length; i++) {
          var _a = parseInfo[i - 1], field = _a[0], parser = _a[2];
          var value = parser ? parser(matches[i], combinedI18nSettings) : +matches[i];
          if (value == null) {
            return null;
          }
          dateInfo[field] = value;
        }
        if (dateInfo.isPm === 1 && dateInfo.hour != null && +dateInfo.hour !== 12) {
          dateInfo.hour = +dateInfo.hour + 12;
        } else if (dateInfo.isPm === 0 && +dateInfo.hour === 12) {
          dateInfo.hour = 0;
        }
        var dateTZ;
        if (dateInfo.timezoneOffset == null) {
          dateTZ = new Date(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute, dateInfo.second, dateInfo.millisecond);
          var validateFields = [
            ["month", "getMonth"],
            ["day", "getDate"],
            ["hour", "getHours"],
            ["minute", "getMinutes"],
            ["second", "getSeconds"]
          ];
          for (var i = 0, len = validateFields.length; i < len; i++) {
            if (specifiedFields[validateFields[i][0]] && dateInfo[validateFields[i][0]] !== dateTZ[validateFields[i][1]]()) {
              return null;
            }
          }
        } else {
          dateTZ = new Date(Date.UTC(dateInfo.year, dateInfo.month, dateInfo.day, dateInfo.hour, dateInfo.minute - dateInfo.timezoneOffset, dateInfo.second, dateInfo.millisecond));
          if (dateInfo.month > 11 || dateInfo.month < 0 || dateInfo.day > 31 || dateInfo.day < 1 || dateInfo.hour > 23 || dateInfo.hour < 0 || dateInfo.minute > 59 || dateInfo.minute < 0 || dateInfo.second > 59 || dateInfo.second < 0) {
            return null;
          }
        }
        return dateTZ;
      }
      var fecha = {
        format,
        parse,
        defaultI18n,
        setGlobalDateI18n,
        setGlobalDateMasks
      };
      exports3.assign = assign;
      exports3.default = fecha;
      exports3.format = format;
      exports3.parse = parse;
      exports3.defaultI18n = defaultI18n;
      exports3.setGlobalDateI18n = setGlobalDateI18n;
      exports3.setGlobalDateMasks = setGlobalDateMasks;
      Object.defineProperty(exports3, "__esModule", { value: true });
    });
  }
});

// ../../node_modules/logform/timestamp.js
var require_timestamp = __commonJS({
  "../../node_modules/logform/timestamp.js"(exports2, module2) {
    "use strict";
    var fecha = require_fecha_umd();
    var format = require_format();
    module2.exports = format((info, opts = {}) => {
      if (opts.format) {
        info.timestamp = typeof opts.format === "function" ? opts.format() : fecha.format(/* @__PURE__ */ new Date(), opts.format);
      }
      if (!info.timestamp) {
        info.timestamp = (/* @__PURE__ */ new Date()).toISOString();
      }
      if (opts.alias) {
        info[opts.alias] = info.timestamp;
      }
      return info;
    });
  }
});

// ../../node_modules/logform/uncolorize.js
var require_uncolorize = __commonJS({
  "../../node_modules/logform/uncolorize.js"(exports2, module2) {
    "use strict";
    var colors = require_safe();
    var format = require_format();
    var { MESSAGE } = require_triple_beam();
    module2.exports = format((info, opts) => {
      if (opts.level !== false) {
        info.level = colors.strip(info.level);
      }
      if (opts.message !== false) {
        info.message = colors.strip(String(info.message));
      }
      if (opts.raw !== false && info[MESSAGE]) {
        info[MESSAGE] = colors.strip(String(info[MESSAGE]));
      }
      return info;
    });
  }
});

// ../../node_modules/logform/index.js
var require_logform = __commonJS({
  "../../node_modules/logform/index.js"(exports2) {
    "use strict";
    var format = exports2.format = require_format();
    exports2.levels = require_levels();
    function exposeFormat(name, requireFormat) {
      Object.defineProperty(format, name, {
        get() {
          return requireFormat();
        },
        configurable: true
      });
    }
    exposeFormat("align", function() {
      return require_align();
    });
    exposeFormat("errors", function() {
      return require_errors();
    });
    exposeFormat("cli", function() {
      return require_cli2();
    });
    exposeFormat("combine", function() {
      return require_combine();
    });
    exposeFormat("colorize", function() {
      return require_colorize();
    });
    exposeFormat("json", function() {
      return require_json();
    });
    exposeFormat("label", function() {
      return require_label();
    });
    exposeFormat("logstash", function() {
      return require_logstash();
    });
    exposeFormat("metadata", function() {
      return require_metadata();
    });
    exposeFormat("ms", function() {
      return require_ms2();
    });
    exposeFormat("padLevels", function() {
      return require_pad_levels();
    });
    exposeFormat("prettyPrint", function() {
      return require_pretty_print();
    });
    exposeFormat("printf", function() {
      return require_printf();
    });
    exposeFormat("simple", function() {
      return require_simple();
    });
    exposeFormat("splat", function() {
      return require_splat();
    });
    exposeFormat("timestamp", function() {
      return require_timestamp();
    });
    exposeFormat("uncolorize", function() {
      return require_uncolorize();
    });
  }
});

// ../../node_modules/winston/lib/winston/common.js
var require_common = __commonJS({
  "../../node_modules/winston/lib/winston/common.js"(exports2) {
    "use strict";
    var { format } = require("util");
    exports2.warn = {
      deprecated(prop) {
        return () => {
          throw new Error(format("{ %s } was removed in winston@3.0.0.", prop));
        };
      },
      useFormat(prop) {
        return () => {
          throw new Error([
            format("{ %s } was removed in winston@3.0.0.", prop),
            "Use a custom winston.format = winston.format(function) instead."
          ].join("\n"));
        };
      },
      forFunctions(obj, type, props) {
        props.forEach((prop) => {
          obj[prop] = exports2.warn[type](prop);
        });
      },
      forProperties(obj, type, props) {
        props.forEach((prop) => {
          const notice = exports2.warn[type](prop);
          Object.defineProperty(obj, prop, {
            get: notice,
            set: notice
          });
        });
      }
    };
  }
});

// ../../node_modules/winston/package.json
var require_package = __commonJS({
  "../../node_modules/winston/package.json"(exports2, module2) {
    module2.exports = {
      name: "winston",
      description: "A logger for just about everything.",
      version: "3.17.0",
      author: "Charlie Robbins <charlie.robbins@gmail.com>",
      maintainers: [
        "David Hyde <dabh@alumni.stanford.edu>"
      ],
      repository: {
        type: "git",
        url: "https://github.com/winstonjs/winston.git"
      },
      keywords: [
        "winston",
        "logger",
        "logging",
        "logs",
        "sysadmin",
        "bunyan",
        "pino",
        "loglevel",
        "tools",
        "json",
        "stream"
      ],
      dependencies: {
        "@dabh/diagnostics": "^2.0.2",
        "@colors/colors": "^1.6.0",
        async: "^3.2.3",
        "is-stream": "^2.0.0",
        logform: "^2.7.0",
        "one-time": "^1.0.0",
        "readable-stream": "^3.4.0",
        "safe-stable-stringify": "^2.3.1",
        "stack-trace": "0.0.x",
        "triple-beam": "^1.3.0",
        "winston-transport": "^4.9.0"
      },
      devDependencies: {
        "@babel/cli": "^7.23.9",
        "@babel/core": "^7.24.0",
        "@babel/preset-env": "^7.24.0",
        "@dabh/eslint-config-populist": "^4.4.0",
        "@types/node": "^20.11.24",
        "abstract-winston-transport": "^0.5.1",
        assume: "^2.2.0",
        "cross-spawn-async": "^2.2.5",
        eslint: "^8.57.0",
        hock: "^1.4.1",
        mocha: "^10.3.0",
        nyc: "^17.1.0",
        rimraf: "5.0.1",
        split2: "^4.1.0",
        "std-mocks": "^2.0.0",
        through2: "^4.0.2",
        "winston-compat": "^0.1.5"
      },
      main: "./lib/winston.js",
      browser: "./dist/winston",
      types: "./index.d.ts",
      scripts: {
        lint: "eslint lib/*.js lib/winston/*.js lib/winston/**/*.js --resolve-plugins-relative-to ./node_modules/@dabh/eslint-config-populist",
        test: "rimraf test/fixtures/logs/* && mocha",
        "test:coverage": "nyc npm run test:unit",
        "test:unit": "mocha test/unit",
        "test:integration": "mocha test/integration",
        build: "rimraf dist && babel lib -d dist",
        prepublishOnly: "npm run build"
      },
      engines: {
        node: ">= 12.0.0"
      },
      license: "MIT"
    };
  }
});

// ../../node_modules/util-deprecate/node.js
var require_node = __commonJS({
  "../../node_modules/util-deprecate/node.js"(exports2, module2) {
    module2.exports = require("util").deprecate;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream2 = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/stream.js"(exports2, module2) {
    module2.exports = require("stream");
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/destroy.js"(exports2, module2) {
    "use strict";
    function destroy(err, cb) {
      var _this = this;
      var readableDestroyed = this._readableState && this._readableState.destroyed;
      var writableDestroyed = this._writableState && this._writableState.destroyed;
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err);
        } else if (err) {
          if (!this._writableState) {
            process.nextTick(emitErrorNT, this, err);
          } else if (!this._writableState.errorEmitted) {
            this._writableState.errorEmitted = true;
            process.nextTick(emitErrorNT, this, err);
          }
        }
        return this;
      }
      if (this._readableState) {
        this._readableState.destroyed = true;
      }
      if (this._writableState) {
        this._writableState.destroyed = true;
      }
      this._destroy(err || null, function(err2) {
        if (!cb && err2) {
          if (!_this._writableState) {
            process.nextTick(emitErrorAndCloseNT, _this, err2);
          } else if (!_this._writableState.errorEmitted) {
            _this._writableState.errorEmitted = true;
            process.nextTick(emitErrorAndCloseNT, _this, err2);
          } else {
            process.nextTick(emitCloseNT, _this);
          }
        } else if (cb) {
          process.nextTick(emitCloseNT, _this);
          cb(err2);
        } else {
          process.nextTick(emitCloseNT, _this);
        }
      });
      return this;
    }
    function emitErrorAndCloseNT(self2, err) {
      emitErrorNT(self2, err);
      emitCloseNT(self2);
    }
    function emitCloseNT(self2) {
      if (self2._writableState && !self2._writableState.emitClose) return;
      if (self2._readableState && !self2._readableState.emitClose) return;
      self2.emit("close");
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false;
        this._readableState.reading = false;
        this._readableState.ended = false;
        this._readableState.endEmitted = false;
      }
      if (this._writableState) {
        this._writableState.destroyed = false;
        this._writableState.ended = false;
        this._writableState.ending = false;
        this._writableState.finalCalled = false;
        this._writableState.prefinished = false;
        this._writableState.finished = false;
        this._writableState.errorEmitted = false;
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit("error", err);
    }
    function errorOrDestroy(stream, err) {
      var rState = stream._readableState;
      var wState = stream._writableState;
      if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);
      else stream.emit("error", err);
    }
    module2.exports = {
      destroy,
      undestroy,
      errorOrDestroy
    };
  }
});

// ../../node_modules/readable-stream/errors.js
var require_errors2 = __commonJS({
  "../../node_modules/readable-stream/errors.js"(exports2, module2) {
    "use strict";
    var codes = {};
    function createErrorType(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      function getMessage(arg1, arg2, arg3) {
        if (typeof message === "string") {
          return message;
        } else {
          return message(arg1, arg2, arg3);
        }
      }
      class NodeError extends Base {
        constructor(arg1, arg2, arg3) {
          super(getMessage(arg1, arg2, arg3));
        }
      }
      NodeError.prototype.name = Base.name;
      NodeError.prototype.code = code;
      codes[code] = NodeError;
    }
    function oneOf(expected, thing) {
      if (Array.isArray(expected)) {
        const len = expected.length;
        expected = expected.map((i) => String(i));
        if (len > 2) {
          return `one of ${thing} ${expected.slice(0, len - 1).join(", ")}, or ` + expected[len - 1];
        } else if (len === 2) {
          return `one of ${thing} ${expected[0]} or ${expected[1]}`;
        } else {
          return `of ${thing} ${expected[0]}`;
        }
      } else {
        return `of ${thing} ${String(expected)}`;
      }
    }
    function startsWith(str, search, pos) {
      return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    }
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function includes(str, search, start) {
      if (typeof start !== "number") {
        start = 0;
      }
      if (start + search.length > str.length) {
        return false;
      } else {
        return str.indexOf(search, start) !== -1;
      }
    }
    createErrorType("ERR_INVALID_OPT_VALUE", function(name, value) {
      return 'The value "' + value + '" is invalid for option "' + name + '"';
    }, TypeError);
    createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
      let determiner;
      if (typeof expected === "string" && startsWith(expected, "not ")) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
      } else {
        determiner = "must be";
      }
      let msg;
      if (endsWith(name, " argument")) {
        msg = `The ${name} ${determiner} ${oneOf(expected, "type")}`;
      } else {
        const type = includes(name, ".") ? "property" : "argument";
        msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, "type")}`;
      }
      msg += `. Received type ${typeof actual}`;
      return msg;
    }, TypeError);
    createErrorType("ERR_STREAM_PUSH_AFTER_EOF", "stream.push() after EOF");
    createErrorType("ERR_METHOD_NOT_IMPLEMENTED", function(name) {
      return "The " + name + " method is not implemented";
    });
    createErrorType("ERR_STREAM_PREMATURE_CLOSE", "Premature close");
    createErrorType("ERR_STREAM_DESTROYED", function(name) {
      return "Cannot call " + name + " after a stream was destroyed";
    });
    createErrorType("ERR_MULTIPLE_CALLBACK", "Callback called multiple times");
    createErrorType("ERR_STREAM_CANNOT_PIPE", "Cannot pipe, not readable");
    createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");
    createErrorType("ERR_STREAM_NULL_VALUES", "May not write null values to stream", TypeError);
    createErrorType("ERR_UNKNOWN_ENCODING", function(arg) {
      return "Unknown encoding: " + arg;
    }, TypeError);
    createErrorType("ERR_STREAM_UNSHIFT_AFTER_END_EVENT", "stream.unshift() after end event");
    module2.exports.codes = codes;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/state.js
var require_state = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/state.js"(exports2, module2) {
    "use strict";
    var ERR_INVALID_OPT_VALUE = require_errors2().codes.ERR_INVALID_OPT_VALUE;
    function highWaterMarkFrom(options, isDuplex, duplexKey) {
      return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
    }
    function getHighWaterMark(state, options, duplexKey, isDuplex) {
      var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
      if (hwm != null) {
        if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
          var name = isDuplex ? duplexKey : "highWaterMark";
          throw new ERR_INVALID_OPT_VALUE(name, hwm);
        }
        return Math.floor(hwm);
      }
      return state.objectMode ? 16 : 16 * 1024;
    }
    module2.exports = {
      getHighWaterMark
    };
  }
});

// ../../node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "../../node_modules/inherits/inherits_browser.js"(exports2, module2) {
    if (typeof Object.create === "function") {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// ../../node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  "../../node_modules/inherits/inherits.js"(exports2, module2) {
    try {
      util = require("util");
      if (typeof util.inherits !== "function") throw "";
      module2.exports = util.inherits;
    } catch (e) {
      module2.exports = require_inherits_browser();
    }
    var util;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/buffer_list.js
var require_buffer_list = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/buffer_list.js"(exports2, module2) {
    "use strict";
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", { writable: false });
      return Constructor;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var _require = require("buffer");
    var Buffer2 = _require.Buffer;
    var _require2 = require("util");
    var inspect = _require2.inspect;
    var custom = inspect && inspect.custom || "inspect";
    function copyBuffer(src, target, offset) {
      Buffer2.prototype.copy.call(src, target, offset);
    }
    module2.exports = /* @__PURE__ */ function() {
      function BufferList() {
        _classCallCheck(this, BufferList);
        this.head = null;
        this.tail = null;
        this.length = 0;
      }
      _createClass(BufferList, [{
        key: "push",
        value: function push(v) {
          var entry = {
            data: v,
            next: null
          };
          if (this.length > 0) this.tail.next = entry;
          else this.head = entry;
          this.tail = entry;
          ++this.length;
        }
      }, {
        key: "unshift",
        value: function unshift(v) {
          var entry = {
            data: v,
            next: this.head
          };
          if (this.length === 0) this.tail = entry;
          this.head = entry;
          ++this.length;
        }
      }, {
        key: "shift",
        value: function shift() {
          if (this.length === 0) return;
          var ret = this.head.data;
          if (this.length === 1) this.head = this.tail = null;
          else this.head = this.head.next;
          --this.length;
          return ret;
        }
      }, {
        key: "clear",
        value: function clear() {
          this.head = this.tail = null;
          this.length = 0;
        }
      }, {
        key: "join",
        value: function join(s) {
          if (this.length === 0) return "";
          var p = this.head;
          var ret = "" + p.data;
          while (p = p.next) ret += s + p.data;
          return ret;
        }
      }, {
        key: "concat",
        value: function concat(n) {
          if (this.length === 0) return Buffer2.alloc(0);
          var ret = Buffer2.allocUnsafe(n >>> 0);
          var p = this.head;
          var i = 0;
          while (p) {
            copyBuffer(p.data, ret, i);
            i += p.data.length;
            p = p.next;
          }
          return ret;
        }
        // Consumes a specified amount of bytes or characters from the buffered data.
      }, {
        key: "consume",
        value: function consume(n, hasStrings) {
          var ret;
          if (n < this.head.data.length) {
            ret = this.head.data.slice(0, n);
            this.head.data = this.head.data.slice(n);
          } else if (n === this.head.data.length) {
            ret = this.shift();
          } else {
            ret = hasStrings ? this._getString(n) : this._getBuffer(n);
          }
          return ret;
        }
      }, {
        key: "first",
        value: function first() {
          return this.head.data;
        }
        // Consumes a specified amount of characters from the buffered data.
      }, {
        key: "_getString",
        value: function _getString(n) {
          var p = this.head;
          var c = 1;
          var ret = p.data;
          n -= ret.length;
          while (p = p.next) {
            var str = p.data;
            var nb = n > str.length ? str.length : n;
            if (nb === str.length) ret += str;
            else ret += str.slice(0, n);
            n -= nb;
            if (n === 0) {
              if (nb === str.length) {
                ++c;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                this.head = p;
                p.data = str.slice(nb);
              }
              break;
            }
            ++c;
          }
          this.length -= c;
          return ret;
        }
        // Consumes a specified amount of bytes from the buffered data.
      }, {
        key: "_getBuffer",
        value: function _getBuffer(n) {
          var ret = Buffer2.allocUnsafe(n);
          var p = this.head;
          var c = 1;
          p.data.copy(ret);
          n -= p.data.length;
          while (p = p.next) {
            var buf = p.data;
            var nb = n > buf.length ? buf.length : n;
            buf.copy(ret, ret.length - n, 0, nb);
            n -= nb;
            if (n === 0) {
              if (nb === buf.length) {
                ++c;
                if (p.next) this.head = p.next;
                else this.head = this.tail = null;
              } else {
                this.head = p;
                p.data = buf.slice(nb);
              }
              break;
            }
            ++c;
          }
          this.length -= c;
          return ret;
        }
        // Make sure the linked list only shows the minimal necessary information.
      }, {
        key: custom,
        value: function value(_, options) {
          return inspect(this, _objectSpread(_objectSpread({}, options), {}, {
            // Only inspect one level.
            depth: 0,
            // It should not recurse.
            customInspect: false
          }));
        }
      }]);
      return BufferList;
    }();
  }
});

// ../../node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "../../node_modules/safe-buffer/index.js"(exports2, module2) {
    var buffer = require("buffer");
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer;
    } else {
      copyProps(buffer, exports2);
      exports2.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// ../../node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "../../node_modules/string_decoder/lib/string_decoder.js"(exports2) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc) return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried) return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc))) throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports2.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0) return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0) return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0;
      else if (byte >> 5 === 6) return 2;
      else if (byte >> 4 === 14) return 3;
      else if (byte >> 3 === 30) return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1;
      if (j < i) return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2) return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0;
          else self2.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0;
        return "\uFFFD";
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1;
          return "\uFFFD";
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0) return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed) return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0) return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/end-of-stream.js
var require_end_of_stream = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/end-of-stream.js"(exports2, module2) {
    "use strict";
    var ERR_STREAM_PREMATURE_CLOSE = require_errors2().codes.ERR_STREAM_PREMATURE_CLOSE;
    function once(callback) {
      var called = false;
      return function() {
        if (called) return;
        called = true;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        callback.apply(this, args);
      };
    }
    function noop() {
    }
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    function eos(stream, opts, callback) {
      if (typeof opts === "function") return eos(stream, null, opts);
      if (!opts) opts = {};
      callback = once(callback || noop);
      var readable = opts.readable || opts.readable !== false && stream.readable;
      var writable = opts.writable || opts.writable !== false && stream.writable;
      var onlegacyfinish = function onlegacyfinish2() {
        if (!stream.writable) onfinish();
      };
      var writableEnded = stream._writableState && stream._writableState.finished;
      var onfinish = function onfinish2() {
        writable = false;
        writableEnded = true;
        if (!readable) callback.call(stream);
      };
      var readableEnded = stream._readableState && stream._readableState.endEmitted;
      var onend = function onend2() {
        readable = false;
        readableEnded = true;
        if (!writable) callback.call(stream);
      };
      var onerror = function onerror2(err) {
        callback.call(stream, err);
      };
      var onclose = function onclose2() {
        var err;
        if (readable && !readableEnded) {
          if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
          return callback.call(stream, err);
        }
        if (writable && !writableEnded) {
          if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
          return callback.call(stream, err);
        }
      };
      var onrequest = function onrequest2() {
        stream.req.on("finish", onfinish);
      };
      if (isRequest(stream)) {
        stream.on("complete", onfinish);
        stream.on("abort", onclose);
        if (stream.req) onrequest();
        else stream.on("request", onrequest);
      } else if (writable && !stream._writableState) {
        stream.on("end", onlegacyfinish);
        stream.on("close", onlegacyfinish);
      }
      stream.on("end", onend);
      stream.on("finish", onfinish);
      if (opts.error !== false) stream.on("error", onerror);
      stream.on("close", onclose);
      return function() {
        stream.removeListener("complete", onfinish);
        stream.removeListener("abort", onclose);
        stream.removeListener("request", onrequest);
        if (stream.req) stream.req.removeListener("finish", onfinish);
        stream.removeListener("end", onlegacyfinish);
        stream.removeListener("close", onlegacyfinish);
        stream.removeListener("finish", onfinish);
        stream.removeListener("end", onend);
        stream.removeListener("error", onerror);
        stream.removeListener("close", onclose);
      };
    }
    module2.exports = eos;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/async_iterator.js
var require_async_iterator = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/async_iterator.js"(exports2, module2) {
    "use strict";
    var _Object$setPrototypeO;
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var finished = require_end_of_stream();
    var kLastResolve = Symbol("lastResolve");
    var kLastReject = Symbol("lastReject");
    var kError = Symbol("error");
    var kEnded = Symbol("ended");
    var kLastPromise = Symbol("lastPromise");
    var kHandlePromise = Symbol("handlePromise");
    var kStream = Symbol("stream");
    function createIterResult(value, done) {
      return {
        value,
        done
      };
    }
    function readAndResolve(iter) {
      var resolve = iter[kLastResolve];
      if (resolve !== null) {
        var data = iter[kStream].read();
        if (data !== null) {
          iter[kLastPromise] = null;
          iter[kLastResolve] = null;
          iter[kLastReject] = null;
          resolve(createIterResult(data, false));
        }
      }
    }
    function onReadable(iter) {
      process.nextTick(readAndResolve, iter);
    }
    function wrapForNext(lastPromise, iter) {
      return function(resolve, reject) {
        lastPromise.then(function() {
          if (iter[kEnded]) {
            resolve(createIterResult(void 0, true));
            return;
          }
          iter[kHandlePromise](resolve, reject);
        }, reject);
      };
    }
    var AsyncIteratorPrototype = Object.getPrototypeOf(function() {
    });
    var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
      get stream() {
        return this[kStream];
      },
      next: function next() {
        var _this = this;
        var error = this[kError];
        if (error !== null) {
          return Promise.reject(error);
        }
        if (this[kEnded]) {
          return Promise.resolve(createIterResult(void 0, true));
        }
        if (this[kStream].destroyed) {
          return new Promise(function(resolve, reject) {
            process.nextTick(function() {
              if (_this[kError]) {
                reject(_this[kError]);
              } else {
                resolve(createIterResult(void 0, true));
              }
            });
          });
        }
        var lastPromise = this[kLastPromise];
        var promise;
        if (lastPromise) {
          promise = new Promise(wrapForNext(lastPromise, this));
        } else {
          var data = this[kStream].read();
          if (data !== null) {
            return Promise.resolve(createIterResult(data, false));
          }
          promise = new Promise(this[kHandlePromise]);
        }
        this[kLastPromise] = promise;
        return promise;
      }
    }, _defineProperty(_Object$setPrototypeO, Symbol.asyncIterator, function() {
      return this;
    }), _defineProperty(_Object$setPrototypeO, "return", function _return() {
      var _this2 = this;
      return new Promise(function(resolve, reject) {
        _this2[kStream].destroy(null, function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(createIterResult(void 0, true));
        });
      });
    }), _Object$setPrototypeO), AsyncIteratorPrototype);
    var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator2(stream) {
      var _Object$create;
      var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty(_Object$create, kStream, {
        value: stream,
        writable: true
      }), _defineProperty(_Object$create, kLastResolve, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kLastReject, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kError, {
        value: null,
        writable: true
      }), _defineProperty(_Object$create, kEnded, {
        value: stream._readableState.endEmitted,
        writable: true
      }), _defineProperty(_Object$create, kHandlePromise, {
        value: function value(resolve, reject) {
          var data = iterator[kStream].read();
          if (data) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            resolve(createIterResult(data, false));
          } else {
            iterator[kLastResolve] = resolve;
            iterator[kLastReject] = reject;
          }
        },
        writable: true
      }), _Object$create));
      iterator[kLastPromise] = null;
      finished(stream, function(err) {
        if (err && err.code !== "ERR_STREAM_PREMATURE_CLOSE") {
          var reject = iterator[kLastReject];
          if (reject !== null) {
            iterator[kLastPromise] = null;
            iterator[kLastResolve] = null;
            iterator[kLastReject] = null;
            reject(err);
          }
          iterator[kError] = err;
          return;
        }
        var resolve = iterator[kLastResolve];
        if (resolve !== null) {
          iterator[kLastPromise] = null;
          iterator[kLastResolve] = null;
          iterator[kLastReject] = null;
          resolve(createIterResult(void 0, true));
        }
        iterator[kEnded] = true;
      });
      stream.on("readable", onReadable.bind(null, iterator));
      return iterator;
    };
    module2.exports = createReadableStreamAsyncIterator;
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/from.js
var require_from = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/from.js"(exports2, module2) {
    "use strict";
    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }
      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }
    function _asyncToGenerator(fn) {
      return function() {
        var self2 = this, args = arguments;
        return new Promise(function(resolve, reject) {
          var gen = fn.apply(self2, args);
          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }
          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }
          _next(void 0);
        });
      };
    }
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);
      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function(sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }
      return keys;
    }
    function _objectSpread(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
      return target;
    }
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return typeof key === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (typeof input !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (typeof res !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    var ERR_INVALID_ARG_TYPE = require_errors2().codes.ERR_INVALID_ARG_TYPE;
    function from(Readable, iterable, opts) {
      var iterator;
      if (iterable && typeof iterable.next === "function") {
        iterator = iterable;
      } else if (iterable && iterable[Symbol.asyncIterator]) iterator = iterable[Symbol.asyncIterator]();
      else if (iterable && iterable[Symbol.iterator]) iterator = iterable[Symbol.iterator]();
      else throw new ERR_INVALID_ARG_TYPE("iterable", ["Iterable"], iterable);
      var readable = new Readable(_objectSpread({
        objectMode: true
      }, opts));
      var reading = false;
      readable._read = function() {
        if (!reading) {
          reading = true;
          next();
        }
      };
      function next() {
        return _next2.apply(this, arguments);
      }
      function _next2() {
        _next2 = _asyncToGenerator(function* () {
          try {
            var _yield$iterator$next = yield iterator.next(), value = _yield$iterator$next.value, done = _yield$iterator$next.done;
            if (done) {
              readable.push(null);
            } else if (readable.push(yield value)) {
              next();
            } else {
              reading = false;
            }
          } catch (err) {
            readable.destroy(err);
          }
        });
        return _next2.apply(this, arguments);
      }
      return readable;
    }
    module2.exports = from;
  }
});

// ../../node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_readable.js"(exports2, module2) {
    "use strict";
    module2.exports = Readable;
    var Duplex;
    Readable.ReadableState = ReadableState;
    var EE = require("events").EventEmitter;
    var EElistenerCount = function EElistenerCount2(emitter, type) {
      return emitter.listeners(type).length;
    };
    var Stream = require_stream2();
    var Buffer2 = require("buffer").Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var debugUtil = require("util");
    var debug;
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog("stream");
    } else {
      debug = function debug2() {
      };
    }
    var BufferList = require_buffer_list();
    var destroyImpl = require_destroy();
    var _require = require_state();
    var getHighWaterMark = _require.getHighWaterMark;
    var _require$codes = require_errors2().codes;
    var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
    var ERR_STREAM_PUSH_AFTER_EOF = _require$codes.ERR_STREAM_PUSH_AFTER_EOF;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes.ERR_STREAM_UNSHIFT_AFTER_END_EVENT;
    var StringDecoder;
    var createReadableStreamAsyncIterator;
    var from;
    require_inherits()(Readable, Stream);
    var errorOrDestroy = destroyImpl.errorOrDestroy;
    var kProxyEvents = ["error", "close", "destroy", "pause", "resume"];
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === "function") return emitter.prependListener(event, fn);
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
      else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);
      else emitter._events[event] = [fn, emitter._events[event]];
    }
    function ReadableState(options, stream, isDuplex) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;
      this.highWaterMark = getHighWaterMark(this, options, "readableHighWaterMark", isDuplex);
      this.buffer = new BufferList();
      this.length = 0;
      this.pipes = null;
      this.pipesCount = 0;
      this.flowing = null;
      this.ended = false;
      this.endEmitted = false;
      this.reading = false;
      this.sync = true;
      this.needReadable = false;
      this.emittedReadable = false;
      this.readableListening = false;
      this.resumeScheduled = false;
      this.paused = true;
      this.emitClose = options.emitClose !== false;
      this.autoDestroy = !!options.autoDestroy;
      this.destroyed = false;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.awaitDrain = 0;
      this.readingMore = false;
      this.decoder = null;
      this.encoding = null;
      if (options.encoding) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
        this.decoder = new StringDecoder(options.encoding);
        this.encoding = options.encoding;
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex();
      if (!(this instanceof Readable)) return new Readable(options);
      var isDuplex = this instanceof Duplex;
      this._readableState = new ReadableState(options, this, isDuplex);
      this.readable = true;
      if (options) {
        if (typeof options.read === "function") this._read = options.read;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
      }
      Stream.call(this);
    }
    Object.defineProperty(Readable.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._readableState === void 0) {
          return false;
        }
        return this._readableState.destroyed;
      },
      set: function set(value) {
        if (!this._readableState) {
          return;
        }
        this._readableState.destroyed = value;
      }
    });
    Readable.prototype.destroy = destroyImpl.destroy;
    Readable.prototype._undestroy = destroyImpl.undestroy;
    Readable.prototype._destroy = function(err, cb) {
      cb(err);
    };
    Readable.prototype.push = function(chunk, encoding) {
      var state = this._readableState;
      var skipChunkCheck;
      if (!state.objectMode) {
        if (typeof chunk === "string") {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding);
            encoding = "";
          }
          skipChunkCheck = true;
        }
      } else {
        skipChunkCheck = true;
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
    };
    Readable.prototype.unshift = function(chunk) {
      return readableAddChunk(this, chunk, null, true, false);
    };
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      debug("readableAddChunk", chunk);
      var state = stream._readableState;
      if (chunk === null) {
        state.reading = false;
        onEofChunk(stream, state);
      } else {
        var er;
        if (!skipChunkCheck) er = chunkInvalid(state, chunk);
        if (er) {
          errorOrDestroy(stream, er);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (typeof chunk !== "string" && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk);
          }
          if (addToFront) {
            if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
            else addChunk(stream, state, chunk, true);
          } else if (state.ended) {
            errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
          } else if (state.destroyed) {
            return false;
          } else {
            state.reading = false;
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk);
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
              else maybeReadMore(stream, state);
            } else {
              addChunk(stream, state, chunk, false);
            }
          }
        } else if (!addToFront) {
          state.reading = false;
          maybeReadMore(stream, state);
        }
      }
      return !state.ended && (state.length < state.highWaterMark || state.length === 0);
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        state.awaitDrain = 0;
        stream.emit("data", chunk);
      } else {
        state.length += state.objectMode ? 1 : chunk.length;
        if (addToFront) state.buffer.unshift(chunk);
        else state.buffer.push(chunk);
        if (state.needReadable) emitReadable(stream);
      }
      maybeReadMore(stream, state);
    }
    function chunkInvalid(state, chunk) {
      var er;
      if (!_isUint8Array(chunk) && typeof chunk !== "string" && chunk !== void 0 && !state.objectMode) {
        er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer", "Uint8Array"], chunk);
      }
      return er;
    }
    Readable.prototype.isPaused = function() {
      return this._readableState.flowing === false;
    };
    Readable.prototype.setEncoding = function(enc) {
      if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder;
      var decoder = new StringDecoder(enc);
      this._readableState.decoder = decoder;
      this._readableState.encoding = this._readableState.decoder.encoding;
      var p = this._readableState.buffer.head;
      var content = "";
      while (p !== null) {
        content += decoder.write(p.data);
        p = p.next;
      }
      this._readableState.buffer.clear();
      if (content !== "") this._readableState.buffer.push(content);
      this._readableState.length = content.length;
      return this;
    };
    var MAX_HWM = 1073741824;
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM;
      } else {
        n--;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        n++;
      }
      return n;
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || state.length === 0 && state.ended) return 0;
      if (state.objectMode) return 1;
      if (n !== n) {
        if (state.flowing && state.length) return state.buffer.head.data.length;
        else return state.length;
      }
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
      if (n <= state.length) return n;
      if (!state.ended) {
        state.needReadable = true;
        return 0;
      }
      return state.length;
    }
    Readable.prototype.read = function(n) {
      debug("read", n);
      n = parseInt(n, 10);
      var state = this._readableState;
      var nOrig = n;
      if (n !== 0) state.emittedReadable = false;
      if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
        debug("read: emitReadable", state.length, state.ended);
        if (state.length === 0 && state.ended) endReadable(this);
        else emitReadable(this);
        return null;
      }
      n = howMuchToRead(n, state);
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this);
        return null;
      }
      var doRead = state.needReadable;
      debug("need readable", doRead);
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true;
        debug("length less than watermark", doRead);
      }
      if (state.ended || state.reading) {
        doRead = false;
        debug("reading or ended", doRead);
      } else if (doRead) {
        debug("do read");
        state.reading = true;
        state.sync = true;
        if (state.length === 0) state.needReadable = true;
        this._read(state.highWaterMark);
        state.sync = false;
        if (!state.reading) n = howMuchToRead(nOrig, state);
      }
      var ret;
      if (n > 0) ret = fromList(n, state);
      else ret = null;
      if (ret === null) {
        state.needReadable = state.length <= state.highWaterMark;
        n = 0;
      } else {
        state.length -= n;
        state.awaitDrain = 0;
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true;
        if (nOrig !== n && state.ended) endReadable(this);
      }
      if (ret !== null) this.emit("data", ret);
      return ret;
    };
    function onEofChunk(stream, state) {
      debug("onEofChunk");
      if (state.ended) return;
      if (state.decoder) {
        var chunk = state.decoder.end();
        if (chunk && chunk.length) {
          state.buffer.push(chunk);
          state.length += state.objectMode ? 1 : chunk.length;
        }
      }
      state.ended = true;
      if (state.sync) {
        emitReadable(stream);
      } else {
        state.needReadable = false;
        if (!state.emittedReadable) {
          state.emittedReadable = true;
          emitReadable_(stream);
        }
      }
    }
    function emitReadable(stream) {
      var state = stream._readableState;
      debug("emitReadable", state.needReadable, state.emittedReadable);
      state.needReadable = false;
      if (!state.emittedReadable) {
        debug("emitReadable", state.flowing);
        state.emittedReadable = true;
        process.nextTick(emitReadable_, stream);
      }
    }
    function emitReadable_(stream) {
      var state = stream._readableState;
      debug("emitReadable_", state.destroyed, state.length, state.ended);
      if (!state.destroyed && (state.length || state.ended)) {
        stream.emit("readable");
        state.emittedReadable = false;
      }
      state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
      flow(stream);
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true;
        process.nextTick(maybeReadMore_, stream, state);
      }
    }
    function maybeReadMore_(stream, state) {
      while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
        var len = state.length;
        debug("maybeReadMore read 0");
        stream.read(0);
        if (len === state.length)
          break;
      }
      state.readingMore = false;
    }
    Readable.prototype._read = function(n) {
      errorOrDestroy(this, new ERR_METHOD_NOT_IMPLEMENTED("_read()"));
    };
    Readable.prototype.pipe = function(dest, pipeOpts) {
      var src = this;
      var state = this._readableState;
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest;
          break;
        case 1:
          state.pipes = [state.pipes, dest];
          break;
        default:
          state.pipes.push(dest);
          break;
      }
      state.pipesCount += 1;
      debug("pipe count=%d opts=%j", state.pipesCount, pipeOpts);
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
      var endFn = doEnd ? onend : unpipe;
      if (state.endEmitted) process.nextTick(endFn);
      else src.once("end", endFn);
      dest.on("unpipe", onunpipe);
      function onunpipe(readable, unpipeInfo) {
        debug("onunpipe");
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true;
            cleanup();
          }
        }
      }
      function onend() {
        debug("onend");
        dest.end();
      }
      var ondrain = pipeOnDrain(src);
      dest.on("drain", ondrain);
      var cleanedUp = false;
      function cleanup() {
        debug("cleanup");
        dest.removeListener("close", onclose);
        dest.removeListener("finish", onfinish);
        dest.removeListener("drain", ondrain);
        dest.removeListener("error", onerror);
        dest.removeListener("unpipe", onunpipe);
        src.removeListener("end", onend);
        src.removeListener("end", unpipe);
        src.removeListener("data", ondata);
        cleanedUp = true;
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
      }
      src.on("data", ondata);
      function ondata(chunk) {
        debug("ondata");
        var ret = dest.write(chunk);
        debug("dest.write", ret);
        if (ret === false) {
          if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
            debug("false write response, pause", state.awaitDrain);
            state.awaitDrain++;
          }
          src.pause();
        }
      }
      function onerror(er) {
        debug("onerror", er);
        unpipe();
        dest.removeListener("error", onerror);
        if (EElistenerCount(dest, "error") === 0) errorOrDestroy(dest, er);
      }
      prependListener(dest, "error", onerror);
      function onclose() {
        dest.removeListener("finish", onfinish);
        unpipe();
      }
      dest.once("close", onclose);
      function onfinish() {
        debug("onfinish");
        dest.removeListener("close", onclose);
        unpipe();
      }
      dest.once("finish", onfinish);
      function unpipe() {
        debug("unpipe");
        src.unpipe(dest);
      }
      dest.emit("pipe", src);
      if (!state.flowing) {
        debug("pipe resume");
        src.resume();
      }
      return dest;
    };
    function pipeOnDrain(src) {
      return function pipeOnDrainFunctionResult() {
        var state = src._readableState;
        debug("pipeOnDrain", state.awaitDrain);
        if (state.awaitDrain) state.awaitDrain--;
        if (state.awaitDrain === 0 && EElistenerCount(src, "data")) {
          state.flowing = true;
          flow(src);
        }
      };
    }
    Readable.prototype.unpipe = function(dest) {
      var state = this._readableState;
      var unpipeInfo = {
        hasUnpiped: false
      };
      if (state.pipesCount === 0) return this;
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes) return this;
        if (!dest) dest = state.pipes;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        if (dest) dest.emit("unpipe", this, unpipeInfo);
        return this;
      }
      if (!dest) {
        var dests = state.pipes;
        var len = state.pipesCount;
        state.pipes = null;
        state.pipesCount = 0;
        state.flowing = false;
        for (var i = 0; i < len; i++) dests[i].emit("unpipe", this, {
          hasUnpiped: false
        });
        return this;
      }
      var index = indexOf(state.pipes, dest);
      if (index === -1) return this;
      state.pipes.splice(index, 1);
      state.pipesCount -= 1;
      if (state.pipesCount === 1) state.pipes = state.pipes[0];
      dest.emit("unpipe", this, unpipeInfo);
      return this;
    };
    Readable.prototype.on = function(ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn);
      var state = this._readableState;
      if (ev === "data") {
        state.readableListening = this.listenerCount("readable") > 0;
        if (state.flowing !== false) this.resume();
      } else if (ev === "readable") {
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true;
          state.flowing = false;
          state.emittedReadable = false;
          debug("on readable", state.length, state.reading);
          if (state.length) {
            emitReadable(this);
          } else if (!state.reading) {
            process.nextTick(nReadingNextTick, this);
          }
        }
      }
      return res;
    };
    Readable.prototype.addListener = Readable.prototype.on;
    Readable.prototype.removeListener = function(ev, fn) {
      var res = Stream.prototype.removeListener.call(this, ev, fn);
      if (ev === "readable") {
        process.nextTick(updateReadableListening, this);
      }
      return res;
    };
    Readable.prototype.removeAllListeners = function(ev) {
      var res = Stream.prototype.removeAllListeners.apply(this, arguments);
      if (ev === "readable" || ev === void 0) {
        process.nextTick(updateReadableListening, this);
      }
      return res;
    };
    function updateReadableListening(self2) {
      var state = self2._readableState;
      state.readableListening = self2.listenerCount("readable") > 0;
      if (state.resumeScheduled && !state.paused) {
        state.flowing = true;
      } else if (self2.listenerCount("data") > 0) {
        self2.resume();
      }
    }
    function nReadingNextTick(self2) {
      debug("readable nexttick read 0");
      self2.read(0);
    }
    Readable.prototype.resume = function() {
      var state = this._readableState;
      if (!state.flowing) {
        debug("resume");
        state.flowing = !state.readableListening;
        resume(this, state);
      }
      state.paused = false;
      return this;
    };
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true;
        process.nextTick(resume_, stream, state);
      }
    }
    function resume_(stream, state) {
      debug("resume", state.reading);
      if (!state.reading) {
        stream.read(0);
      }
      state.resumeScheduled = false;
      stream.emit("resume");
      flow(stream);
      if (state.flowing && !state.reading) stream.read(0);
    }
    Readable.prototype.pause = function() {
      debug("call pause flowing=%j", this._readableState.flowing);
      if (this._readableState.flowing !== false) {
        debug("pause");
        this._readableState.flowing = false;
        this.emit("pause");
      }
      this._readableState.paused = true;
      return this;
    };
    function flow(stream) {
      var state = stream._readableState;
      debug("flow", state.flowing);
      while (state.flowing && stream.read() !== null) ;
    }
    Readable.prototype.wrap = function(stream) {
      var _this = this;
      var state = this._readableState;
      var paused = false;
      stream.on("end", function() {
        debug("wrapped end");
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) _this.push(chunk);
        }
        _this.push(null);
      });
      stream.on("data", function(chunk) {
        debug("wrapped data");
        if (state.decoder) chunk = state.decoder.write(chunk);
        if (state.objectMode && (chunk === null || chunk === void 0)) return;
        else if (!state.objectMode && (!chunk || !chunk.length)) return;
        var ret = _this.push(chunk);
        if (!ret) {
          paused = true;
          stream.pause();
        }
      });
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === "function") {
          this[i] = /* @__PURE__ */ function methodWrap(method) {
            return function methodWrapReturnFunction() {
              return stream[method].apply(stream, arguments);
            };
          }(i);
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
      }
      this._read = function(n2) {
        debug("wrapped _read", n2);
        if (paused) {
          paused = false;
          stream.resume();
        }
      };
      return this;
    };
    if (typeof Symbol === "function") {
      Readable.prototype[Symbol.asyncIterator] = function() {
        if (createReadableStreamAsyncIterator === void 0) {
          createReadableStreamAsyncIterator = require_async_iterator();
        }
        return createReadableStreamAsyncIterator(this);
      };
    }
    Object.defineProperty(Readable.prototype, "readableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.highWaterMark;
      }
    });
    Object.defineProperty(Readable.prototype, "readableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState && this._readableState.buffer;
      }
    });
    Object.defineProperty(Readable.prototype, "readableFlowing", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.flowing;
      },
      set: function set(state) {
        if (this._readableState) {
          this._readableState.flowing = state;
        }
      }
    });
    Readable._fromList = fromList;
    Object.defineProperty(Readable.prototype, "readableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._readableState.length;
      }
    });
    function fromList(n, state) {
      if (state.length === 0) return null;
      var ret;
      if (state.objectMode) ret = state.buffer.shift();
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join("");
        else if (state.buffer.length === 1) ret = state.buffer.first();
        else ret = state.buffer.concat(state.length);
        state.buffer.clear();
      } else {
        ret = state.buffer.consume(n, state.decoder);
      }
      return ret;
    }
    function endReadable(stream) {
      var state = stream._readableState;
      debug("endReadable", state.endEmitted);
      if (!state.endEmitted) {
        state.ended = true;
        process.nextTick(endReadableNT, state, stream);
      }
    }
    function endReadableNT(state, stream) {
      debug("endReadableNT", state.endEmitted, state.length);
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true;
        stream.readable = false;
        stream.emit("end");
        if (state.autoDestroy) {
          var wState = stream._writableState;
          if (!wState || wState.autoDestroy && wState.finished) {
            stream.destroy();
          }
        }
      }
    }
    if (typeof Symbol === "function") {
      Readable.from = function(iterable, opts) {
        if (from === void 0) {
          from = require_from();
        }
        return from(Readable, iterable, opts);
      };
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i;
      }
      return -1;
    }
  }
});

// ../../node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_duplex.js"(exports2, module2) {
    "use strict";
    var objectKeys = Object.keys || function(obj) {
      var keys2 = [];
      for (var key in obj) keys2.push(key);
      return keys2;
    };
    module2.exports = Duplex;
    var Readable = require_stream_readable();
    var Writable = require_stream_writable();
    require_inherits()(Duplex, Readable);
    {
      keys = objectKeys(Writable.prototype);
      for (v = 0; v < keys.length; v++) {
        method = keys[v];
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
      }
    }
    var keys;
    var method;
    var v;
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);
      Readable.call(this, options);
      Writable.call(this, options);
      this.allowHalfOpen = true;
      if (options) {
        if (options.readable === false) this.readable = false;
        if (options.writable === false) this.writable = false;
        if (options.allowHalfOpen === false) {
          this.allowHalfOpen = false;
          this.once("end", onend);
        }
      }
    }
    Object.defineProperty(Duplex.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.highWaterMark;
      }
    });
    Object.defineProperty(Duplex.prototype, "writableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState && this._writableState.getBuffer();
      }
    });
    Object.defineProperty(Duplex.prototype, "writableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.length;
      }
    });
    function onend() {
      if (this._writableState.ended) return;
      process.nextTick(onEndNT, this);
    }
    function onEndNT(self2) {
      self2.end();
    }
    Object.defineProperty(Duplex.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false;
        }
        return this._readableState.destroyed && this._writableState.destroyed;
      },
      set: function set(value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return;
        }
        this._readableState.destroyed = value;
        this._writableState.destroyed = value;
      }
    });
  }
});

// ../../node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_writable.js"(exports2, module2) {
    "use strict";
    module2.exports = Writable;
    function CorkedRequest(state) {
      var _this = this;
      this.next = null;
      this.entry = null;
      this.finish = function() {
        onCorkedFinish(_this, state);
      };
    }
    var Duplex;
    Writable.WritableState = WritableState;
    var internalUtil = {
      deprecate: require_node()
    };
    var Stream = require_stream2();
    var Buffer2 = require("buffer").Buffer;
    var OurUint8Array = (typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : typeof self !== "undefined" ? self : {}).Uint8Array || function() {
    };
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk);
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array;
    }
    var destroyImpl = require_destroy();
    var _require = require_state();
    var getHighWaterMark = _require.getHighWaterMark;
    var _require$codes = require_errors2().codes;
    var ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
    var ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE;
    var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
    var ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES;
    var ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END;
    var ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;
    var errorOrDestroy = destroyImpl.errorOrDestroy;
    require_inherits()(Writable, Stream);
    function nop() {
    }
    function WritableState(options, stream, isDuplex) {
      Duplex = Duplex || require_stream_duplex();
      options = options || {};
      if (typeof isDuplex !== "boolean") isDuplex = stream instanceof Duplex;
      this.objectMode = !!options.objectMode;
      if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;
      this.highWaterMark = getHighWaterMark(this, options, "writableHighWaterMark", isDuplex);
      this.finalCalled = false;
      this.needDrain = false;
      this.ending = false;
      this.ended = false;
      this.finished = false;
      this.destroyed = false;
      var noDecode = options.decodeStrings === false;
      this.decodeStrings = !noDecode;
      this.defaultEncoding = options.defaultEncoding || "utf8";
      this.length = 0;
      this.writing = false;
      this.corked = 0;
      this.sync = true;
      this.bufferProcessing = false;
      this.onwrite = function(er) {
        onwrite(stream, er);
      };
      this.writecb = null;
      this.writelen = 0;
      this.bufferedRequest = null;
      this.lastBufferedRequest = null;
      this.pendingcb = 0;
      this.prefinished = false;
      this.errorEmitted = false;
      this.emitClose = options.emitClose !== false;
      this.autoDestroy = !!options.autoDestroy;
      this.bufferedRequestCount = 0;
      this.corkedRequestsFree = new CorkedRequest(this);
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest;
      var out = [];
      while (current) {
        out.push(current);
        current = current.next;
      }
      return out;
    };
    (function() {
      try {
        Object.defineProperty(WritableState.prototype, "buffer", {
          get: internalUtil.deprecate(function writableStateBufferGetter() {
            return this.getBuffer();
          }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.", "DEP0003")
        });
      } catch (_) {
      }
    })();
    var realHasInstance;
    if (typeof Symbol === "function" && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === "function") {
      realHasInstance = Function.prototype[Symbol.hasInstance];
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function value(object) {
          if (realHasInstance.call(this, object)) return true;
          if (this !== Writable) return false;
          return object && object._writableState instanceof WritableState;
        }
      });
    } else {
      realHasInstance = function realHasInstance2(object) {
        return object instanceof this;
      };
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex();
      var isDuplex = this instanceof Duplex;
      if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
      this._writableState = new WritableState(options, this, isDuplex);
      this.writable = true;
      if (options) {
        if (typeof options.write === "function") this._write = options.write;
        if (typeof options.writev === "function") this._writev = options.writev;
        if (typeof options.destroy === "function") this._destroy = options.destroy;
        if (typeof options.final === "function") this._final = options.final;
      }
      Stream.call(this);
    }
    Writable.prototype.pipe = function() {
      errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
    };
    function writeAfterEnd(stream, cb) {
      var er = new ERR_STREAM_WRITE_AFTER_END();
      errorOrDestroy(stream, er);
      process.nextTick(cb, er);
    }
    function validChunk(stream, state, chunk, cb) {
      var er;
      if (chunk === null) {
        er = new ERR_STREAM_NULL_VALUES();
      } else if (typeof chunk !== "string" && !state.objectMode) {
        er = new ERR_INVALID_ARG_TYPE("chunk", ["string", "Buffer"], chunk);
      }
      if (er) {
        errorOrDestroy(stream, er);
        process.nextTick(cb, er);
        return false;
      }
      return true;
    }
    Writable.prototype.write = function(chunk, encoding, cb) {
      var state = this._writableState;
      var ret = false;
      var isBuf = !state.objectMode && _isUint8Array(chunk);
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk);
      }
      if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (isBuf) encoding = "buffer";
      else if (!encoding) encoding = state.defaultEncoding;
      if (typeof cb !== "function") cb = nop;
      if (state.ending) writeAfterEnd(this, cb);
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++;
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
      }
      return ret;
    };
    Writable.prototype.cork = function() {
      this._writableState.corked++;
    };
    Writable.prototype.uncork = function() {
      var state = this._writableState;
      if (state.corked) {
        state.corked--;
        if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
      }
    };
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === "string") encoding = encoding.toLowerCase();
      if (!(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((encoding + "").toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
      this._writableState.defaultEncoding = encoding;
      return this;
    };
    Object.defineProperty(Writable.prototype, "writableBuffer", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState && this._writableState.getBuffer();
      }
    });
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === "string") {
        chunk = Buffer2.from(chunk, encoding);
      }
      return chunk;
    }
    Object.defineProperty(Writable.prototype, "writableHighWaterMark", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.highWaterMark;
      }
    });
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding);
        if (chunk !== newChunk) {
          isBuf = true;
          encoding = "buffer";
          chunk = newChunk;
        }
      }
      var len = state.objectMode ? 1 : chunk.length;
      state.length += len;
      var ret = state.length < state.highWaterMark;
      if (!ret) state.needDrain = true;
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest;
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null
        };
        if (last) {
          last.next = state.lastBufferedRequest;
        } else {
          state.bufferedRequest = state.lastBufferedRequest;
        }
        state.bufferedRequestCount += 1;
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb);
      }
      return ret;
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len;
      state.writecb = cb;
      state.writing = true;
      state.sync = true;
      if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED("write"));
      else if (writev) stream._writev(chunk, state.onwrite);
      else stream._write(chunk, encoding, state.onwrite);
      state.sync = false;
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb;
      if (sync) {
        process.nextTick(cb, er);
        process.nextTick(finishMaybe, stream, state);
        stream._writableState.errorEmitted = true;
        errorOrDestroy(stream, er);
      } else {
        cb(er);
        stream._writableState.errorEmitted = true;
        errorOrDestroy(stream, er);
        finishMaybe(stream, state);
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false;
      state.writecb = null;
      state.length -= state.writelen;
      state.writelen = 0;
    }
    function onwrite(stream, er) {
      var state = stream._writableState;
      var sync = state.sync;
      var cb = state.writecb;
      if (typeof cb !== "function") throw new ERR_MULTIPLE_CALLBACK();
      onwriteStateUpdate(state);
      if (er) onwriteError(stream, state, sync, er, cb);
      else {
        var finished = needFinish(state) || stream.destroyed;
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state);
        }
        if (sync) {
          process.nextTick(afterWrite, stream, state, finished, cb);
        } else {
          afterWrite(stream, state, finished, cb);
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished) onwriteDrain(stream, state);
      state.pendingcb--;
      cb();
      finishMaybe(stream, state);
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false;
        stream.emit("drain");
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true;
      var entry = state.bufferedRequest;
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount;
        var buffer = new Array(l);
        var holder = state.corkedRequestsFree;
        holder.entry = entry;
        var count = 0;
        var allBuffers = true;
        while (entry) {
          buffer[count] = entry;
          if (!entry.isBuf) allBuffers = false;
          entry = entry.next;
          count += 1;
        }
        buffer.allBuffers = allBuffers;
        doWrite(stream, state, true, state.length, buffer, "", holder.finish);
        state.pendingcb++;
        state.lastBufferedRequest = null;
        if (holder.next) {
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          state.corkedRequestsFree = new CorkedRequest(state);
        }
        state.bufferedRequestCount = 0;
      } else {
        while (entry) {
          var chunk = entry.chunk;
          var encoding = entry.encoding;
          var cb = entry.callback;
          var len = state.objectMode ? 1 : chunk.length;
          doWrite(stream, state, false, len, chunk, encoding, cb);
          entry = entry.next;
          state.bufferedRequestCount--;
          if (state.writing) {
            break;
          }
        }
        if (entry === null) state.lastBufferedRequest = null;
      }
      state.bufferedRequest = entry;
      state.bufferProcessing = false;
    }
    Writable.prototype._write = function(chunk, encoding, cb) {
      cb(new ERR_METHOD_NOT_IMPLEMENTED("_write()"));
    };
    Writable.prototype._writev = null;
    Writable.prototype.end = function(chunk, encoding, cb) {
      var state = this._writableState;
      if (typeof chunk === "function") {
        cb = chunk;
        chunk = null;
        encoding = null;
      } else if (typeof encoding === "function") {
        cb = encoding;
        encoding = null;
      }
      if (chunk !== null && chunk !== void 0) this.write(chunk, encoding);
      if (state.corked) {
        state.corked = 1;
        this.uncork();
      }
      if (!state.ending) endWritable(this, state, cb);
      return this;
    };
    Object.defineProperty(Writable.prototype, "writableLength", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        return this._writableState.length;
      }
    });
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
    }
    function callFinal(stream, state) {
      stream._final(function(err) {
        state.pendingcb--;
        if (err) {
          errorOrDestroy(stream, err);
        }
        state.prefinished = true;
        stream.emit("prefinish");
        finishMaybe(stream, state);
      });
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === "function" && !state.destroyed) {
          state.pendingcb++;
          state.finalCalled = true;
          process.nextTick(callFinal, stream, state);
        } else {
          state.prefinished = true;
          stream.emit("prefinish");
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state);
      if (need) {
        prefinish(stream, state);
        if (state.pendingcb === 0) {
          state.finished = true;
          stream.emit("finish");
          if (state.autoDestroy) {
            var rState = stream._readableState;
            if (!rState || rState.autoDestroy && rState.endEmitted) {
              stream.destroy();
            }
          }
        }
      }
      return need;
    }
    function endWritable(stream, state, cb) {
      state.ending = true;
      finishMaybe(stream, state);
      if (cb) {
        if (state.finished) process.nextTick(cb);
        else stream.once("finish", cb);
      }
      state.ended = true;
      stream.writable = false;
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry;
      corkReq.entry = null;
      while (entry) {
        var cb = entry.callback;
        state.pendingcb--;
        cb(err);
        entry = entry.next;
      }
      state.corkedRequestsFree.next = corkReq;
    }
    Object.defineProperty(Writable.prototype, "destroyed", {
      // making it explicit this property is not enumerable
      // because otherwise some prototype manipulation in
      // userland will fail
      enumerable: false,
      get: function get() {
        if (this._writableState === void 0) {
          return false;
        }
        return this._writableState.destroyed;
      },
      set: function set(value) {
        if (!this._writableState) {
          return;
        }
        this._writableState.destroyed = value;
      }
    });
    Writable.prototype.destroy = destroyImpl.destroy;
    Writable.prototype._undestroy = destroyImpl.undestroy;
    Writable.prototype._destroy = function(err, cb) {
      cb(err);
    };
  }
});

// ../../node_modules/winston-transport/modern.js
var require_modern = __commonJS({
  "../../node_modules/winston-transport/modern.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var Writable = require_stream_writable();
    var { LEVEL } = require_triple_beam();
    var TransportStream = module2.exports = function TransportStream2(options = {}) {
      Writable.call(this, { objectMode: true, highWaterMark: options.highWaterMark });
      this.format = options.format;
      this.level = options.level;
      this.handleExceptions = options.handleExceptions;
      this.handleRejections = options.handleRejections;
      this.silent = options.silent;
      if (options.log) this.log = options.log;
      if (options.logv) this.logv = options.logv;
      if (options.close) this.close = options.close;
      this.once("pipe", (logger) => {
        this.levels = logger.levels;
        this.parent = logger;
      });
      this.once("unpipe", (src) => {
        if (src === this.parent) {
          this.parent = null;
          if (this.close) {
            this.close();
          }
        }
      });
    };
    util.inherits(TransportStream, Writable);
    TransportStream.prototype._write = function _write(info, enc, callback) {
      if (this.silent || info.exception === true && !this.handleExceptions) {
        return callback(null);
      }
      const level = this.level || this.parent && this.parent.level;
      if (!level || this.levels[level] >= this.levels[info[LEVEL]]) {
        if (info && !this.format) {
          return this.log(info, callback);
        }
        let errState;
        let transformed;
        try {
          transformed = this.format.transform(Object.assign({}, info), this.format.options);
        } catch (err) {
          errState = err;
        }
        if (errState || !transformed) {
          callback();
          if (errState) throw errState;
          return;
        }
        return this.log(transformed, callback);
      }
      this._writableState.sync = false;
      return callback(null);
    };
    TransportStream.prototype._writev = function _writev(chunks, callback) {
      if (this.logv) {
        const infos = chunks.filter(this._accept, this);
        if (!infos.length) {
          return callback(null);
        }
        return this.logv(infos, callback);
      }
      for (let i = 0; i < chunks.length; i++) {
        if (!this._accept(chunks[i])) continue;
        if (chunks[i].chunk && !this.format) {
          this.log(chunks[i].chunk, chunks[i].callback);
          continue;
        }
        let errState;
        let transformed;
        try {
          transformed = this.format.transform(
            Object.assign({}, chunks[i].chunk),
            this.format.options
          );
        } catch (err) {
          errState = err;
        }
        if (errState || !transformed) {
          chunks[i].callback();
          if (errState) {
            callback(null);
            throw errState;
          }
        } else {
          this.log(transformed, chunks[i].callback);
        }
      }
      return callback(null);
    };
    TransportStream.prototype._accept = function _accept(write) {
      const info = write.chunk;
      if (this.silent) {
        return false;
      }
      const level = this.level || this.parent && this.parent.level;
      if (info.exception === true || !level || this.levels[level] >= this.levels[info[LEVEL]]) {
        if (this.handleExceptions || info.exception !== true) {
          return true;
        }
      }
      return false;
    };
    TransportStream.prototype._nop = function _nop() {
      return void 0;
    };
  }
});

// ../../node_modules/winston-transport/legacy.js
var require_legacy = __commonJS({
  "../../node_modules/winston-transport/legacy.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var { LEVEL } = require_triple_beam();
    var TransportStream = require_modern();
    var LegacyTransportStream = module2.exports = function LegacyTransportStream2(options = {}) {
      TransportStream.call(this, options);
      if (!options.transport || typeof options.transport.log !== "function") {
        throw new Error("Invalid transport, must be an object with a log method.");
      }
      this.transport = options.transport;
      this.level = this.level || options.transport.level;
      this.handleExceptions = this.handleExceptions || options.transport.handleExceptions;
      this._deprecated();
      function transportError(err) {
        this.emit("error", err, this.transport);
      }
      if (!this.transport.__winstonError) {
        this.transport.__winstonError = transportError.bind(this);
        this.transport.on("error", this.transport.__winstonError);
      }
    };
    util.inherits(LegacyTransportStream, TransportStream);
    LegacyTransportStream.prototype._write = function _write(info, enc, callback) {
      if (this.silent || info.exception === true && !this.handleExceptions) {
        return callback(null);
      }
      if (!this.level || this.levels[this.level] >= this.levels[info[LEVEL]]) {
        this.transport.log(info[LEVEL], info.message, info, this._nop);
      }
      callback(null);
    };
    LegacyTransportStream.prototype._writev = function _writev(chunks, callback) {
      for (let i = 0; i < chunks.length; i++) {
        if (this._accept(chunks[i])) {
          this.transport.log(
            chunks[i].chunk[LEVEL],
            chunks[i].chunk.message,
            chunks[i].chunk,
            this._nop
          );
          chunks[i].callback();
        }
      }
      return callback(null);
    };
    LegacyTransportStream.prototype._deprecated = function _deprecated() {
      console.error([
        `${this.transport.name} is a legacy winston transport. Consider upgrading: `,
        "- Upgrade docs: https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md"
      ].join("\n"));
    };
    LegacyTransportStream.prototype.close = function close() {
      if (this.transport.close) {
        this.transport.close();
      }
      if (this.transport.__winstonError) {
        this.transport.removeListener("error", this.transport.__winstonError);
        this.transport.__winstonError = null;
      }
    };
  }
});

// ../../node_modules/winston-transport/index.js
var require_winston_transport = __commonJS({
  "../../node_modules/winston-transport/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_modern();
    module2.exports.LegacyTransportStream = require_legacy();
  }
});

// ../../node_modules/winston/lib/winston/transports/console.js
var require_console = __commonJS({
  "../../node_modules/winston/lib/winston/transports/console.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var { LEVEL, MESSAGE } = require_triple_beam();
    var TransportStream = require_winston_transport();
    module2.exports = class Console extends TransportStream {
      /**
       * Constructor function for the Console transport object responsible for
       * persisting log messages and metadata to a terminal or TTY.
       * @param {!Object} [options={}] - Options for this instance.
       */
      constructor(options = {}) {
        super(options);
        this.name = options.name || "console";
        this.stderrLevels = this._stringArrayToSet(options.stderrLevels);
        this.consoleWarnLevels = this._stringArrayToSet(options.consoleWarnLevels);
        this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
        this.forceConsole = options.forceConsole || false;
        this._consoleLog = console.log.bind(console);
        this._consoleWarn = console.warn.bind(console);
        this._consoleError = console.error.bind(console);
        this.setMaxListeners(30);
      }
      /**
       * Core logging method exposed to Winston.
       * @param {Object} info - TODO: add param description.
       * @param {Function} callback - TODO: add param description.
       * @returns {undefined}
       */
      log(info, callback) {
        setImmediate(() => this.emit("logged", info));
        if (this.stderrLevels[info[LEVEL]]) {
          if (console._stderr && !this.forceConsole) {
            console._stderr.write(`${info[MESSAGE]}${this.eol}`);
          } else {
            this._consoleError(info[MESSAGE]);
          }
          if (callback) {
            callback();
          }
          return;
        } else if (this.consoleWarnLevels[info[LEVEL]]) {
          if (console._stderr && !this.forceConsole) {
            console._stderr.write(`${info[MESSAGE]}${this.eol}`);
          } else {
            this._consoleWarn(info[MESSAGE]);
          }
          if (callback) {
            callback();
          }
          return;
        }
        if (console._stdout && !this.forceConsole) {
          console._stdout.write(`${info[MESSAGE]}${this.eol}`);
        } else {
          this._consoleLog(info[MESSAGE]);
        }
        if (callback) {
          callback();
        }
      }
      /**
       * Returns a Set-like object with strArray's elements as keys (each with the
       * value true).
       * @param {Array} strArray - Array of Set-elements as strings.
       * @param {?string} [errMsg] - Custom error message thrown on invalid input.
       * @returns {Object} - TODO: add return description.
       * @private
       */
      _stringArrayToSet(strArray, errMsg) {
        if (!strArray) return {};
        errMsg = errMsg || "Cannot make set from type other than Array of string elements";
        if (!Array.isArray(strArray)) {
          throw new Error(errMsg);
        }
        return strArray.reduce((set, el) => {
          if (typeof el !== "string") {
            throw new Error(errMsg);
          }
          set[el] = true;
          return set;
        }, {});
      }
    };
  }
});

// ../../node_modules/async/internal/isArrayLike.js
var require_isArrayLike = __commonJS({
  "../../node_modules/async/internal/isArrayLike.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = isArrayLike;
    function isArrayLike(value) {
      return value && typeof value.length === "number" && value.length >= 0 && value.length % 1 === 0;
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/initialParams.js
var require_initialParams = __commonJS({
  "../../node_modules/async/internal/initialParams.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = function(fn) {
      return function(...args) {
        var callback = args.pop();
        return fn.call(this, args, callback);
      };
    };
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/setImmediate.js
var require_setImmediate = __commonJS({
  "../../node_modules/async/internal/setImmediate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.fallback = fallback;
    exports2.wrap = wrap;
    var hasQueueMicrotask = exports2.hasQueueMicrotask = typeof queueMicrotask === "function" && queueMicrotask;
    var hasSetImmediate = exports2.hasSetImmediate = typeof setImmediate === "function" && setImmediate;
    var hasNextTick = exports2.hasNextTick = typeof process === "object" && typeof process.nextTick === "function";
    function fallback(fn) {
      setTimeout(fn, 0);
    }
    function wrap(defer) {
      return (fn, ...args) => defer(() => fn(...args));
    }
    var _defer;
    if (hasQueueMicrotask) {
      _defer = queueMicrotask;
    } else if (hasSetImmediate) {
      _defer = setImmediate;
    } else if (hasNextTick) {
      _defer = process.nextTick;
    } else {
      _defer = fallback;
    }
    exports2.default = wrap(_defer);
  }
});

// ../../node_modules/async/asyncify.js
var require_asyncify = __commonJS({
  "../../node_modules/async/asyncify.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = asyncify;
    var _initialParams = require_initialParams();
    var _initialParams2 = _interopRequireDefault(_initialParams);
    var _setImmediate = require_setImmediate();
    var _setImmediate2 = _interopRequireDefault(_setImmediate);
    var _wrapAsync = require_wrapAsync();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function asyncify(func) {
      if ((0, _wrapAsync.isAsync)(func)) {
        return function(...args) {
          const callback = args.pop();
          const promise = func.apply(this, args);
          return handlePromise(promise, callback);
        };
      }
      return (0, _initialParams2.default)(function(args, callback) {
        var result;
        try {
          result = func.apply(this, args);
        } catch (e) {
          return callback(e);
        }
        if (result && typeof result.then === "function") {
          return handlePromise(result, callback);
        } else {
          callback(null, result);
        }
      });
    }
    function handlePromise(promise, callback) {
      return promise.then((value) => {
        invokeCallback(callback, null, value);
      }, (err) => {
        invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err));
      });
    }
    function invokeCallback(callback, error, value) {
      try {
        callback(error, value);
      } catch (err) {
        (0, _setImmediate2.default)((e) => {
          throw e;
        }, err);
      }
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/wrapAsync.js
var require_wrapAsync = __commonJS({
  "../../node_modules/async/internal/wrapAsync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.isAsyncIterable = exports2.isAsyncGenerator = exports2.isAsync = void 0;
    var _asyncify = require_asyncify();
    var _asyncify2 = _interopRequireDefault(_asyncify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isAsync(fn) {
      return fn[Symbol.toStringTag] === "AsyncFunction";
    }
    function isAsyncGenerator(fn) {
      return fn[Symbol.toStringTag] === "AsyncGenerator";
    }
    function isAsyncIterable(obj) {
      return typeof obj[Symbol.asyncIterator] === "function";
    }
    function wrapAsync(asyncFn) {
      if (typeof asyncFn !== "function") throw new Error("expected a function");
      return isAsync(asyncFn) ? (0, _asyncify2.default)(asyncFn) : asyncFn;
    }
    exports2.default = wrapAsync;
    exports2.isAsync = isAsync;
    exports2.isAsyncGenerator = isAsyncGenerator;
    exports2.isAsyncIterable = isAsyncIterable;
  }
});

// ../../node_modules/async/internal/awaitify.js
var require_awaitify = __commonJS({
  "../../node_modules/async/internal/awaitify.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = awaitify;
    function awaitify(asyncFn, arity) {
      if (!arity) arity = asyncFn.length;
      if (!arity) throw new Error("arity is undefined");
      function awaitable(...args) {
        if (typeof args[arity - 1] === "function") {
          return asyncFn.apply(this, args);
        }
        return new Promise((resolve, reject) => {
          args[arity - 1] = (err, ...cbArgs) => {
            if (err) return reject(err);
            resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
          };
          asyncFn.apply(this, args);
        });
      }
      return awaitable;
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/parallel.js
var require_parallel = __commonJS({
  "../../node_modules/async/internal/parallel.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _isArrayLike = require_isArrayLike();
    var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
    var _wrapAsync = require_wrapAsync();
    var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
    var _awaitify = require_awaitify();
    var _awaitify2 = _interopRequireDefault(_awaitify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports2.default = (0, _awaitify2.default)((eachfn, tasks, callback) => {
      var results = (0, _isArrayLike2.default)(tasks) ? [] : {};
      eachfn(tasks, (task, key, taskCb) => {
        (0, _wrapAsync2.default)(task)((err, ...result) => {
          if (result.length < 2) {
            [result] = result;
          }
          results[key] = result;
          taskCb(err);
        });
      }, (err) => callback(err, results));
    }, 3);
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/once.js
var require_once = __commonJS({
  "../../node_modules/async/internal/once.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = once;
    function once(fn) {
      function wrapper(...args) {
        if (fn === null) return;
        var callFn = fn;
        fn = null;
        callFn.apply(this, args);
      }
      Object.assign(wrapper, fn);
      return wrapper;
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/getIterator.js
var require_getIterator = __commonJS({
  "../../node_modules/async/internal/getIterator.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = function(coll) {
      return coll[Symbol.iterator] && coll[Symbol.iterator]();
    };
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/iterator.js
var require_iterator = __commonJS({
  "../../node_modules/async/internal/iterator.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = createIterator;
    var _isArrayLike = require_isArrayLike();
    var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
    var _getIterator = require_getIterator();
    var _getIterator2 = _interopRequireDefault(_getIterator);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function createArrayIterator(coll) {
      var i = -1;
      var len = coll.length;
      return function next() {
        return ++i < len ? { value: coll[i], key: i } : null;
      };
    }
    function createES2015Iterator(iterator) {
      var i = -1;
      return function next() {
        var item = iterator.next();
        if (item.done) return null;
        i++;
        return { value: item.value, key: i };
      };
    }
    function createObjectIterator(obj) {
      var okeys = obj ? Object.keys(obj) : [];
      var i = -1;
      var len = okeys.length;
      return function next() {
        var key = okeys[++i];
        if (key === "__proto__") {
          return next();
        }
        return i < len ? { value: obj[key], key } : null;
      };
    }
    function createIterator(coll) {
      if ((0, _isArrayLike2.default)(coll)) {
        return createArrayIterator(coll);
      }
      var iterator = (0, _getIterator2.default)(coll);
      return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/onlyOnce.js
var require_onlyOnce = __commonJS({
  "../../node_modules/async/internal/onlyOnce.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = onlyOnce;
    function onlyOnce(fn) {
      return function(...args) {
        if (fn === null) throw new Error("Callback was already called.");
        var callFn = fn;
        fn = null;
        callFn.apply(this, args);
      };
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/breakLoop.js
var require_breakLoop = __commonJS({
  "../../node_modules/async/internal/breakLoop.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var breakLoop = {};
    exports2.default = breakLoop;
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/asyncEachOfLimit.js
var require_asyncEachOfLimit = __commonJS({
  "../../node_modules/async/internal/asyncEachOfLimit.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = asyncEachOfLimit;
    var _breakLoop = require_breakLoop();
    var _breakLoop2 = _interopRequireDefault(_breakLoop);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function asyncEachOfLimit(generator, limit, iteratee, callback) {
      let done = false;
      let canceled = false;
      let awaiting = false;
      let running = 0;
      let idx = 0;
      function replenish() {
        if (running >= limit || awaiting || done) return;
        awaiting = true;
        generator.next().then(({ value, done: iterDone }) => {
          if (canceled || done) return;
          awaiting = false;
          if (iterDone) {
            done = true;
            if (running <= 0) {
              callback(null);
            }
            return;
          }
          running++;
          iteratee(value, idx, iterateeCallback);
          idx++;
          replenish();
        }).catch(handleError);
      }
      function iterateeCallback(err, result) {
        running -= 1;
        if (canceled) return;
        if (err) return handleError(err);
        if (err === false) {
          done = true;
          canceled = true;
          return;
        }
        if (result === _breakLoop2.default || done && running <= 0) {
          done = true;
          return callback(null);
        }
        replenish();
      }
      function handleError(err) {
        if (canceled) return;
        awaiting = false;
        done = true;
        callback(err);
      }
      replenish();
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/eachOfLimit.js
var require_eachOfLimit = __commonJS({
  "../../node_modules/async/internal/eachOfLimit.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _once = require_once();
    var _once2 = _interopRequireDefault(_once);
    var _iterator = require_iterator();
    var _iterator2 = _interopRequireDefault(_iterator);
    var _onlyOnce = require_onlyOnce();
    var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
    var _wrapAsync = require_wrapAsync();
    var _asyncEachOfLimit = require_asyncEachOfLimit();
    var _asyncEachOfLimit2 = _interopRequireDefault(_asyncEachOfLimit);
    var _breakLoop = require_breakLoop();
    var _breakLoop2 = _interopRequireDefault(_breakLoop);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    exports2.default = (limit) => {
      return (obj, iteratee, callback) => {
        callback = (0, _once2.default)(callback);
        if (limit <= 0) {
          throw new RangeError("concurrency limit cannot be less than 1");
        }
        if (!obj) {
          return callback(null);
        }
        if ((0, _wrapAsync.isAsyncGenerator)(obj)) {
          return (0, _asyncEachOfLimit2.default)(obj, limit, iteratee, callback);
        }
        if ((0, _wrapAsync.isAsyncIterable)(obj)) {
          return (0, _asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](), limit, iteratee, callback);
        }
        var nextElem = (0, _iterator2.default)(obj);
        var done = false;
        var canceled = false;
        var running = 0;
        var looping = false;
        function iterateeCallback(err, value) {
          if (canceled) return;
          running -= 1;
          if (err) {
            done = true;
            callback(err);
          } else if (err === false) {
            done = true;
            canceled = true;
          } else if (value === _breakLoop2.default || done && running <= 0) {
            done = true;
            return callback(null);
          } else if (!looping) {
            replenish();
          }
        }
        function replenish() {
          looping = true;
          while (running < limit && !done) {
            var elem = nextElem();
            if (elem === null) {
              done = true;
              if (running <= 0) {
                callback(null);
              }
              return;
            }
            running += 1;
            iteratee(elem.value, elem.key, (0, _onlyOnce2.default)(iterateeCallback));
          }
          looping = false;
        }
        replenish();
      };
    };
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/eachOfLimit.js
var require_eachOfLimit2 = __commonJS({
  "../../node_modules/async/eachOfLimit.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _eachOfLimit2 = require_eachOfLimit();
    var _eachOfLimit3 = _interopRequireDefault(_eachOfLimit2);
    var _wrapAsync = require_wrapAsync();
    var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
    var _awaitify = require_awaitify();
    var _awaitify2 = _interopRequireDefault(_awaitify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function eachOfLimit(coll, limit, iteratee, callback) {
      return (0, _eachOfLimit3.default)(limit)(coll, (0, _wrapAsync2.default)(iteratee), callback);
    }
    exports2.default = (0, _awaitify2.default)(eachOfLimit, 4);
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/eachOfSeries.js
var require_eachOfSeries = __commonJS({
  "../../node_modules/async/eachOfSeries.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _eachOfLimit = require_eachOfLimit2();
    var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
    var _awaitify = require_awaitify();
    var _awaitify2 = _interopRequireDefault(_awaitify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function eachOfSeries(coll, iteratee, callback) {
      return (0, _eachOfLimit2.default)(coll, 1, iteratee, callback);
    }
    exports2.default = (0, _awaitify2.default)(eachOfSeries, 3);
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/series.js
var require_series = __commonJS({
  "../../node_modules/async/series.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = series;
    var _parallel2 = require_parallel();
    var _parallel3 = _interopRequireDefault(_parallel2);
    var _eachOfSeries = require_eachOfSeries();
    var _eachOfSeries2 = _interopRequireDefault(_eachOfSeries);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function series(tasks, callback) {
      return (0, _parallel3.default)(_eachOfSeries2.default, tasks, callback);
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_transform.js"(exports2, module2) {
    "use strict";
    module2.exports = Transform;
    var _require$codes = require_errors2().codes;
    var ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED;
    var ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK;
    var ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes.ERR_TRANSFORM_ALREADY_TRANSFORMING;
    var ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes.ERR_TRANSFORM_WITH_LENGTH_0;
    var Duplex = require_stream_duplex();
    require_inherits()(Transform, Duplex);
    function afterTransform(er, data) {
      var ts = this._transformState;
      ts.transforming = false;
      var cb = ts.writecb;
      if (cb === null) {
        return this.emit("error", new ERR_MULTIPLE_CALLBACK());
      }
      ts.writechunk = null;
      ts.writecb = null;
      if (data != null)
        this.push(data);
      cb(er);
      var rs = this._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark);
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);
      Duplex.call(this, options);
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null
      };
      this._readableState.needReadable = true;
      this._readableState.sync = false;
      if (options) {
        if (typeof options.transform === "function") this._transform = options.transform;
        if (typeof options.flush === "function") this._flush = options.flush;
      }
      this.on("prefinish", prefinish);
    }
    function prefinish() {
      var _this = this;
      if (typeof this._flush === "function" && !this._readableState.destroyed) {
        this._flush(function(er, data) {
          done(_this, er, data);
        });
      } else {
        done(this, null, null);
      }
    }
    Transform.prototype.push = function(chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };
    Transform.prototype._transform = function(chunk, encoding, cb) {
      cb(new ERR_METHOD_NOT_IMPLEMENTED("_transform()"));
    };
    Transform.prototype._write = function(chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
      }
    };
    Transform.prototype._read = function(n) {
      var ts = this._transformState;
      if (ts.writechunk !== null && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        ts.needTransform = true;
      }
    };
    Transform.prototype._destroy = function(err, cb) {
      Duplex.prototype._destroy.call(this, err, function(err2) {
        cb(err2);
      });
    };
    function done(stream, er, data) {
      if (er) return stream.emit("error", er);
      if (data != null)
        stream.push(data);
      if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
      if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
      return stream.push(null);
    }
  }
});

// ../../node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  "../../node_modules/readable-stream/lib/_stream_passthrough.js"(exports2, module2) {
    "use strict";
    module2.exports = PassThrough;
    var Transform = require_stream_transform();
    require_inherits()(PassThrough, Transform);
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);
      Transform.call(this, options);
    }
    PassThrough.prototype._transform = function(chunk, encoding, cb) {
      cb(null, chunk);
    };
  }
});

// ../../node_modules/readable-stream/lib/internal/streams/pipeline.js
var require_pipeline = __commonJS({
  "../../node_modules/readable-stream/lib/internal/streams/pipeline.js"(exports2, module2) {
    "use strict";
    var eos;
    function once(callback) {
      var called = false;
      return function() {
        if (called) return;
        called = true;
        callback.apply(void 0, arguments);
      };
    }
    var _require$codes = require_errors2().codes;
    var ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
    var ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED;
    function noop(err) {
      if (err) throw err;
    }
    function isRequest(stream) {
      return stream.setHeader && typeof stream.abort === "function";
    }
    function destroyer(stream, reading, writing, callback) {
      callback = once(callback);
      var closed = false;
      stream.on("close", function() {
        closed = true;
      });
      if (eos === void 0) eos = require_end_of_stream();
      eos(stream, {
        readable: reading,
        writable: writing
      }, function(err) {
        if (err) return callback(err);
        closed = true;
        callback();
      });
      var destroyed = false;
      return function(err) {
        if (closed) return;
        if (destroyed) return;
        destroyed = true;
        if (isRequest(stream)) return stream.abort();
        if (typeof stream.destroy === "function") return stream.destroy();
        callback(err || new ERR_STREAM_DESTROYED("pipe"));
      };
    }
    function call(fn) {
      fn();
    }
    function pipe(from, to) {
      return from.pipe(to);
    }
    function popCallback(streams) {
      if (!streams.length) return noop;
      if (typeof streams[streams.length - 1] !== "function") return noop;
      return streams.pop();
    }
    function pipeline() {
      for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
        streams[_key] = arguments[_key];
      }
      var callback = popCallback(streams);
      if (Array.isArray(streams[0])) streams = streams[0];
      if (streams.length < 2) {
        throw new ERR_MISSING_ARGS("streams");
      }
      var error;
      var destroys = streams.map(function(stream, i) {
        var reading = i < streams.length - 1;
        var writing = i > 0;
        return destroyer(stream, reading, writing, function(err) {
          if (!error) error = err;
          if (err) destroys.forEach(call);
          if (reading) return;
          destroys.forEach(call);
          callback(error);
        });
      });
      return streams.reduce(pipe);
    }
    module2.exports = pipeline;
  }
});

// ../../node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  "../../node_modules/readable-stream/readable.js"(exports2, module2) {
    var Stream = require("stream");
    if (process.env.READABLE_STREAM === "disable" && Stream) {
      module2.exports = Stream.Readable;
      Object.assign(module2.exports, Stream);
      module2.exports.Stream = Stream;
    } else {
      exports2 = module2.exports = require_stream_readable();
      exports2.Stream = Stream || exports2;
      exports2.Readable = exports2;
      exports2.Writable = require_stream_writable();
      exports2.Duplex = require_stream_duplex();
      exports2.Transform = require_stream_transform();
      exports2.PassThrough = require_stream_passthrough();
      exports2.finished = require_end_of_stream();
      exports2.pipeline = require_pipeline();
    }
  }
});

// ../../node_modules/@dabh/diagnostics/diagnostics.js
var require_diagnostics = __commonJS({
  "../../node_modules/@dabh/diagnostics/diagnostics.js"(exports2, module2) {
    var adapters = [];
    var modifiers = [];
    var logger = function devnull() {
    };
    function use(adapter) {
      if (~adapters.indexOf(adapter)) return false;
      adapters.push(adapter);
      return true;
    }
    function set(custom) {
      logger = custom;
    }
    function enabled(namespace) {
      var async = [];
      for (var i = 0; i < adapters.length; i++) {
        if (adapters[i].async) {
          async.push(adapters[i]);
          continue;
        }
        if (adapters[i](namespace)) return true;
      }
      if (!async.length) return false;
      return new Promise(function pinky(resolve) {
        Promise.all(
          async.map(function prebind(fn) {
            return fn(namespace);
          })
        ).then(function resolved(values) {
          resolve(values.some(Boolean));
        });
      });
    }
    function modify(fn) {
      if (~modifiers.indexOf(fn)) return false;
      modifiers.push(fn);
      return true;
    }
    function write() {
      logger.apply(logger, arguments);
    }
    function process2(message) {
      for (var i = 0; i < modifiers.length; i++) {
        message = modifiers[i].apply(modifiers[i], arguments);
      }
      return message;
    }
    function introduce(fn, options) {
      var has = Object.prototype.hasOwnProperty;
      for (var key in options) {
        if (has.call(options, key)) {
          fn[key] = options[key];
        }
      }
      return fn;
    }
    function nope(options) {
      options.enabled = false;
      options.modify = modify;
      options.set = set;
      options.use = use;
      return introduce(function diagnopes() {
        return false;
      }, options);
    }
    function yep(options) {
      function diagnostics() {
        var args = Array.prototype.slice.call(arguments, 0);
        write.call(write, options, process2(args, options));
        return true;
      }
      options.enabled = true;
      options.modify = modify;
      options.set = set;
      options.use = use;
      return introduce(diagnostics, options);
    }
    module2.exports = function create(diagnostics) {
      diagnostics.introduce = introduce;
      diagnostics.enabled = enabled;
      diagnostics.process = process2;
      diagnostics.modify = modify;
      diagnostics.write = write;
      diagnostics.nope = nope;
      diagnostics.yep = yep;
      diagnostics.set = set;
      diagnostics.use = use;
      return diagnostics;
    };
  }
});

// ../../node_modules/@dabh/diagnostics/node/production.js
var require_production = __commonJS({
  "../../node_modules/@dabh/diagnostics/node/production.js"(exports2, module2) {
    var create = require_diagnostics();
    var diagnostics = create(function prod(namespace, options) {
      options = options || {};
      options.namespace = namespace;
      options.prod = true;
      options.dev = false;
      if (!(options.force || prod.force)) return prod.nope(options);
      return prod.yep(options);
    });
    module2.exports = diagnostics;
  }
});

// ../../node_modules/color-name/index.js
var require_color_name = __commonJS({
  "../../node_modules/color-name/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// ../../node_modules/simple-swizzle/node_modules/is-arrayish/index.js
var require_is_arrayish = __commonJS({
  "../../node_modules/simple-swizzle/node_modules/is-arrayish/index.js"(exports2, module2) {
    module2.exports = function isArrayish(obj) {
      if (!obj || typeof obj === "string") {
        return false;
      }
      return obj instanceof Array || Array.isArray(obj) || obj.length >= 0 && (obj.splice instanceof Function || Object.getOwnPropertyDescriptor(obj, obj.length - 1) && obj.constructor.name !== "String");
    };
  }
});

// ../../node_modules/simple-swizzle/index.js
var require_simple_swizzle = __commonJS({
  "../../node_modules/simple-swizzle/index.js"(exports2, module2) {
    "use strict";
    var isArrayish = require_is_arrayish();
    var concat = Array.prototype.concat;
    var slice = Array.prototype.slice;
    var swizzle = module2.exports = function swizzle2(args) {
      var results = [];
      for (var i = 0, len = args.length; i < len; i++) {
        var arg = args[i];
        if (isArrayish(arg)) {
          results = concat.call(results, slice.call(arg));
        } else {
          results.push(arg);
        }
      }
      return results;
    };
    swizzle.wrap = function(fn) {
      return function() {
        return fn(swizzle(arguments));
      };
    };
  }
});

// ../../node_modules/color-string/index.js
var require_color_string = __commonJS({
  "../../node_modules/color-string/index.js"(exports2, module2) {
    var colorNames = require_color_name();
    var swizzle = require_simple_swizzle();
    var hasOwnProperty = Object.hasOwnProperty;
    var reverseNames = /* @__PURE__ */ Object.create(null);
    for (name in colorNames) {
      if (hasOwnProperty.call(colorNames, name)) {
        reverseNames[colorNames[name]] = name;
      }
    }
    var name;
    var cs = module2.exports = {
      to: {},
      get: {}
    };
    cs.get = function(string) {
      var prefix = string.substring(0, 3).toLowerCase();
      var val;
      var model;
      switch (prefix) {
        case "hsl":
          val = cs.get.hsl(string);
          model = "hsl";
          break;
        case "hwb":
          val = cs.get.hwb(string);
          model = "hwb";
          break;
        default:
          val = cs.get.rgb(string);
          model = "rgb";
          break;
      }
      if (!val) {
        return null;
      }
      return { model, value: val };
    };
    cs.get.rgb = function(string) {
      if (!string) {
        return null;
      }
      var abbr = /^#([a-f0-9]{3,4})$/i;
      var hex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
      var rgba = /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var per = /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
      var keyword = /^(\w+)$/;
      var rgb = [0, 0, 0, 1];
      var match;
      var i;
      var hexAlpha;
      if (match = string.match(hex)) {
        hexAlpha = match[2];
        match = match[1];
        for (i = 0; i < 3; i++) {
          var i2 = i * 2;
          rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha, 16) / 255;
        }
      } else if (match = string.match(abbr)) {
        match = match[1];
        hexAlpha = match[3];
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i] + match[i], 16);
        }
        if (hexAlpha) {
          rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
        }
      } else if (match = string.match(rgba)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = parseInt(match[i + 1], 0);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(per)) {
        for (i = 0; i < 3; i++) {
          rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
        }
        if (match[4]) {
          if (match[5]) {
            rgb[3] = parseFloat(match[4]) * 0.01;
          } else {
            rgb[3] = parseFloat(match[4]);
          }
        }
      } else if (match = string.match(keyword)) {
        if (match[1] === "transparent") {
          return [0, 0, 0, 0];
        }
        if (!hasOwnProperty.call(colorNames, match[1])) {
          return null;
        }
        rgb = colorNames[match[1]];
        rgb[3] = 1;
        return rgb;
      } else {
        return null;
      }
      for (i = 0; i < 3; i++) {
        rgb[i] = clamp(rgb[i], 0, 255);
      }
      rgb[3] = clamp(rgb[3], 0, 1);
      return rgb;
    };
    cs.get.hsl = function(string) {
      if (!string) {
        return null;
      }
      var hsl = /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hsl);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var s = clamp(parseFloat(match[2]), 0, 100);
        var l = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, s, l, a];
      }
      return null;
    };
    cs.get.hwb = function(string) {
      if (!string) {
        return null;
      }
      var hwb = /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
      var match = string.match(hwb);
      if (match) {
        var alpha = parseFloat(match[4]);
        var h = (parseFloat(match[1]) % 360 + 360) % 360;
        var w = clamp(parseFloat(match[2]), 0, 100);
        var b = clamp(parseFloat(match[3]), 0, 100);
        var a = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
        return [h, w, b, a];
      }
      return null;
    };
    cs.to.hex = function() {
      var rgba = swizzle(arguments);
      return "#" + hexDouble(rgba[0]) + hexDouble(rgba[1]) + hexDouble(rgba[2]) + (rgba[3] < 1 ? hexDouble(Math.round(rgba[3] * 255)) : "");
    };
    cs.to.rgb = function() {
      var rgba = swizzle(arguments);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ")" : "rgba(" + Math.round(rgba[0]) + ", " + Math.round(rgba[1]) + ", " + Math.round(rgba[2]) + ", " + rgba[3] + ")";
    };
    cs.to.rgb.percent = function() {
      var rgba = swizzle(arguments);
      var r = Math.round(rgba[0] / 255 * 100);
      var g = Math.round(rgba[1] / 255 * 100);
      var b = Math.round(rgba[2] / 255 * 100);
      return rgba.length < 4 || rgba[3] === 1 ? "rgb(" + r + "%, " + g + "%, " + b + "%)" : "rgba(" + r + "%, " + g + "%, " + b + "%, " + rgba[3] + ")";
    };
    cs.to.hsl = function() {
      var hsla = swizzle(arguments);
      return hsla.length < 4 || hsla[3] === 1 ? "hsl(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%)" : "hsla(" + hsla[0] + ", " + hsla[1] + "%, " + hsla[2] + "%, " + hsla[3] + ")";
    };
    cs.to.hwb = function() {
      var hwba = swizzle(arguments);
      var a = "";
      if (hwba.length >= 4 && hwba[3] !== 1) {
        a = ", " + hwba[3];
      }
      return "hwb(" + hwba[0] + ", " + hwba[1] + "%, " + hwba[2] + "%" + a + ")";
    };
    cs.to.keyword = function(rgb) {
      return reverseNames[rgb.slice(0, 3)];
    };
    function clamp(num, min, max) {
      return Math.min(Math.max(min, num), max);
    }
    function hexDouble(num) {
      var str = Math.round(num).toString(16).toUpperCase();
      return str.length < 2 ? "0" + str : str;
    }
  }
});

// ../../node_modules/color/node_modules/color-name/index.js
var require_color_name2 = __commonJS({
  "../../node_modules/color/node_modules/color-name/index.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      "aliceblue": [240, 248, 255],
      "antiquewhite": [250, 235, 215],
      "aqua": [0, 255, 255],
      "aquamarine": [127, 255, 212],
      "azure": [240, 255, 255],
      "beige": [245, 245, 220],
      "bisque": [255, 228, 196],
      "black": [0, 0, 0],
      "blanchedalmond": [255, 235, 205],
      "blue": [0, 0, 255],
      "blueviolet": [138, 43, 226],
      "brown": [165, 42, 42],
      "burlywood": [222, 184, 135],
      "cadetblue": [95, 158, 160],
      "chartreuse": [127, 255, 0],
      "chocolate": [210, 105, 30],
      "coral": [255, 127, 80],
      "cornflowerblue": [100, 149, 237],
      "cornsilk": [255, 248, 220],
      "crimson": [220, 20, 60],
      "cyan": [0, 255, 255],
      "darkblue": [0, 0, 139],
      "darkcyan": [0, 139, 139],
      "darkgoldenrod": [184, 134, 11],
      "darkgray": [169, 169, 169],
      "darkgreen": [0, 100, 0],
      "darkgrey": [169, 169, 169],
      "darkkhaki": [189, 183, 107],
      "darkmagenta": [139, 0, 139],
      "darkolivegreen": [85, 107, 47],
      "darkorange": [255, 140, 0],
      "darkorchid": [153, 50, 204],
      "darkred": [139, 0, 0],
      "darksalmon": [233, 150, 122],
      "darkseagreen": [143, 188, 143],
      "darkslateblue": [72, 61, 139],
      "darkslategray": [47, 79, 79],
      "darkslategrey": [47, 79, 79],
      "darkturquoise": [0, 206, 209],
      "darkviolet": [148, 0, 211],
      "deeppink": [255, 20, 147],
      "deepskyblue": [0, 191, 255],
      "dimgray": [105, 105, 105],
      "dimgrey": [105, 105, 105],
      "dodgerblue": [30, 144, 255],
      "firebrick": [178, 34, 34],
      "floralwhite": [255, 250, 240],
      "forestgreen": [34, 139, 34],
      "fuchsia": [255, 0, 255],
      "gainsboro": [220, 220, 220],
      "ghostwhite": [248, 248, 255],
      "gold": [255, 215, 0],
      "goldenrod": [218, 165, 32],
      "gray": [128, 128, 128],
      "green": [0, 128, 0],
      "greenyellow": [173, 255, 47],
      "grey": [128, 128, 128],
      "honeydew": [240, 255, 240],
      "hotpink": [255, 105, 180],
      "indianred": [205, 92, 92],
      "indigo": [75, 0, 130],
      "ivory": [255, 255, 240],
      "khaki": [240, 230, 140],
      "lavender": [230, 230, 250],
      "lavenderblush": [255, 240, 245],
      "lawngreen": [124, 252, 0],
      "lemonchiffon": [255, 250, 205],
      "lightblue": [173, 216, 230],
      "lightcoral": [240, 128, 128],
      "lightcyan": [224, 255, 255],
      "lightgoldenrodyellow": [250, 250, 210],
      "lightgray": [211, 211, 211],
      "lightgreen": [144, 238, 144],
      "lightgrey": [211, 211, 211],
      "lightpink": [255, 182, 193],
      "lightsalmon": [255, 160, 122],
      "lightseagreen": [32, 178, 170],
      "lightskyblue": [135, 206, 250],
      "lightslategray": [119, 136, 153],
      "lightslategrey": [119, 136, 153],
      "lightsteelblue": [176, 196, 222],
      "lightyellow": [255, 255, 224],
      "lime": [0, 255, 0],
      "limegreen": [50, 205, 50],
      "linen": [250, 240, 230],
      "magenta": [255, 0, 255],
      "maroon": [128, 0, 0],
      "mediumaquamarine": [102, 205, 170],
      "mediumblue": [0, 0, 205],
      "mediumorchid": [186, 85, 211],
      "mediumpurple": [147, 112, 219],
      "mediumseagreen": [60, 179, 113],
      "mediumslateblue": [123, 104, 238],
      "mediumspringgreen": [0, 250, 154],
      "mediumturquoise": [72, 209, 204],
      "mediumvioletred": [199, 21, 133],
      "midnightblue": [25, 25, 112],
      "mintcream": [245, 255, 250],
      "mistyrose": [255, 228, 225],
      "moccasin": [255, 228, 181],
      "navajowhite": [255, 222, 173],
      "navy": [0, 0, 128],
      "oldlace": [253, 245, 230],
      "olive": [128, 128, 0],
      "olivedrab": [107, 142, 35],
      "orange": [255, 165, 0],
      "orangered": [255, 69, 0],
      "orchid": [218, 112, 214],
      "palegoldenrod": [238, 232, 170],
      "palegreen": [152, 251, 152],
      "paleturquoise": [175, 238, 238],
      "palevioletred": [219, 112, 147],
      "papayawhip": [255, 239, 213],
      "peachpuff": [255, 218, 185],
      "peru": [205, 133, 63],
      "pink": [255, 192, 203],
      "plum": [221, 160, 221],
      "powderblue": [176, 224, 230],
      "purple": [128, 0, 128],
      "rebeccapurple": [102, 51, 153],
      "red": [255, 0, 0],
      "rosybrown": [188, 143, 143],
      "royalblue": [65, 105, 225],
      "saddlebrown": [139, 69, 19],
      "salmon": [250, 128, 114],
      "sandybrown": [244, 164, 96],
      "seagreen": [46, 139, 87],
      "seashell": [255, 245, 238],
      "sienna": [160, 82, 45],
      "silver": [192, 192, 192],
      "skyblue": [135, 206, 235],
      "slateblue": [106, 90, 205],
      "slategray": [112, 128, 144],
      "slategrey": [112, 128, 144],
      "snow": [255, 250, 250],
      "springgreen": [0, 255, 127],
      "steelblue": [70, 130, 180],
      "tan": [210, 180, 140],
      "teal": [0, 128, 128],
      "thistle": [216, 191, 216],
      "tomato": [255, 99, 71],
      "turquoise": [64, 224, 208],
      "violet": [238, 130, 238],
      "wheat": [245, 222, 179],
      "white": [255, 255, 255],
      "whitesmoke": [245, 245, 245],
      "yellow": [255, 255, 0],
      "yellowgreen": [154, 205, 50]
    };
  }
});

// ../../node_modules/color/node_modules/color-convert/conversions.js
var require_conversions = __commonJS({
  "../../node_modules/color/node_modules/color-convert/conversions.js"(exports2, module2) {
    var cssKeywords = require_color_name2();
    var reverseKeywords = {};
    for (key in cssKeywords) {
      if (cssKeywords.hasOwnProperty(key)) {
        reverseKeywords[cssKeywords[key]] = key;
      }
    }
    var key;
    var convert = module2.exports = {
      rgb: { channels: 3, labels: "rgb" },
      hsl: { channels: 3, labels: "hsl" },
      hsv: { channels: 3, labels: "hsv" },
      hwb: { channels: 3, labels: "hwb" },
      cmyk: { channels: 4, labels: "cmyk" },
      xyz: { channels: 3, labels: "xyz" },
      lab: { channels: 3, labels: "lab" },
      lch: { channels: 3, labels: "lch" },
      hex: { channels: 1, labels: ["hex"] },
      keyword: { channels: 1, labels: ["keyword"] },
      ansi16: { channels: 1, labels: ["ansi16"] },
      ansi256: { channels: 1, labels: ["ansi256"] },
      hcg: { channels: 3, labels: ["h", "c", "g"] },
      apple: { channels: 3, labels: ["r16", "g16", "b16"] },
      gray: { channels: 1, labels: ["gray"] }
    };
    for (model in convert) {
      if (convert.hasOwnProperty(model)) {
        if (!("channels" in convert[model])) {
          throw new Error("missing channels property: " + model);
        }
        if (!("labels" in convert[model])) {
          throw new Error("missing channel labels property: " + model);
        }
        if (convert[model].labels.length !== convert[model].channels) {
          throw new Error("channel and label counts mismatch: " + model);
        }
        channels = convert[model].channels;
        labels = convert[model].labels;
        delete convert[model].channels;
        delete convert[model].labels;
        Object.defineProperty(convert[model], "channels", { value: channels });
        Object.defineProperty(convert[model], "labels", { value: labels });
      }
    }
    var channels;
    var labels;
    var model;
    convert.rgb.hsl = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h;
      var s;
      var l;
      if (max === min) {
        h = 0;
      } else if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h = Math.min(h * 60, 360);
      if (h < 0) {
        h += 360;
      }
      l = (min + max) / 2;
      if (max === min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }
      return [h, s * 100, l * 100];
    };
    convert.rgb.hsv = function(rgb) {
      var rdif;
      var gdif;
      var bdif;
      var h;
      var s;
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var v = Math.max(r, g, b);
      var diff = v - Math.min(r, g, b);
      var diffc = function(c) {
        return (v - c) / 6 / diff + 1 / 2;
      };
      if (diff === 0) {
        h = s = 0;
      } else {
        s = diff / v;
        rdif = diffc(r);
        gdif = diffc(g);
        bdif = diffc(b);
        if (r === v) {
          h = bdif - gdif;
        } else if (g === v) {
          h = 1 / 3 + rdif - bdif;
        } else if (b === v) {
          h = 2 / 3 + gdif - rdif;
        }
        if (h < 0) {
          h += 1;
        } else if (h > 1) {
          h -= 1;
        }
      }
      return [
        h * 360,
        s * 100,
        v * 100
      ];
    };
    convert.rgb.hwb = function(rgb) {
      var r = rgb[0];
      var g = rgb[1];
      var b = rgb[2];
      var h = convert.rgb.hsl(rgb)[0];
      var w = 1 / 255 * Math.min(r, Math.min(g, b));
      b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));
      return [h, w * 100, b * 100];
    };
    convert.rgb.cmyk = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var c;
      var m;
      var y;
      var k;
      k = Math.min(1 - r, 1 - g, 1 - b);
      c = (1 - r - k) / (1 - k) || 0;
      m = (1 - g - k) / (1 - k) || 0;
      y = (1 - b - k) / (1 - k) || 0;
      return [c * 100, m * 100, y * 100, k * 100];
    };
    function comparativeDistance(x, y) {
      return Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2) + Math.pow(x[2] - y[2], 2);
    }
    convert.rgb.keyword = function(rgb) {
      var reversed = reverseKeywords[rgb];
      if (reversed) {
        return reversed;
      }
      var currentClosestDistance = Infinity;
      var currentClosestKeyword;
      for (var keyword in cssKeywords) {
        if (cssKeywords.hasOwnProperty(keyword)) {
          var value = cssKeywords[keyword];
          var distance = comparativeDistance(rgb, value);
          if (distance < currentClosestDistance) {
            currentClosestDistance = distance;
            currentClosestKeyword = keyword;
          }
        }
      }
      return currentClosestKeyword;
    };
    convert.keyword.rgb = function(keyword) {
      return cssKeywords[keyword];
    };
    convert.rgb.xyz = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
      g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
      b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
      var x = r * 0.4124 + g * 0.3576 + b * 0.1805;
      var y = r * 0.2126 + g * 0.7152 + b * 0.0722;
      var z = r * 0.0193 + g * 0.1192 + b * 0.9505;
      return [x * 100, y * 100, z * 100];
    };
    convert.rgb.lab = function(rgb) {
      var xyz = convert.rgb.xyz(rgb);
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.hsl.rgb = function(hsl) {
      var h = hsl[0] / 360;
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var t1;
      var t2;
      var t3;
      var rgb;
      var val;
      if (s === 0) {
        val = l * 255;
        return [val, val, val];
      }
      if (l < 0.5) {
        t2 = l * (1 + s);
      } else {
        t2 = l + s - l * s;
      }
      t1 = 2 * l - t2;
      rgb = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        if (t3 < 0) {
          t3++;
        }
        if (t3 > 1) {
          t3--;
        }
        if (6 * t3 < 1) {
          val = t1 + (t2 - t1) * 6 * t3;
        } else if (2 * t3 < 1) {
          val = t2;
        } else if (3 * t3 < 2) {
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        } else {
          val = t1;
        }
        rgb[i] = val * 255;
      }
      return rgb;
    };
    convert.hsl.hsv = function(hsl) {
      var h = hsl[0];
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var smin = s;
      var lmin = Math.max(l, 0.01);
      var sv;
      var v;
      l *= 2;
      s *= l <= 1 ? l : 2 - l;
      smin *= lmin <= 1 ? lmin : 2 - lmin;
      v = (l + s) / 2;
      sv = l === 0 ? 2 * smin / (lmin + smin) : 2 * s / (l + s);
      return [h, sv * 100, v * 100];
    };
    convert.hsv.rgb = function(hsv) {
      var h = hsv[0] / 60;
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var p = 255 * v * (1 - s);
      var q = 255 * v * (1 - s * f);
      var t = 255 * v * (1 - s * (1 - f));
      v *= 255;
      switch (hi) {
        case 0:
          return [v, t, p];
        case 1:
          return [q, v, p];
        case 2:
          return [p, v, t];
        case 3:
          return [p, q, v];
        case 4:
          return [t, p, v];
        case 5:
          return [v, p, q];
      }
    };
    convert.hsv.hsl = function(hsv) {
      var h = hsv[0];
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var vmin = Math.max(v, 0.01);
      var lmin;
      var sl;
      var l;
      l = (2 - s) * v;
      lmin = (2 - s) * vmin;
      sl = s * vmin;
      sl /= lmin <= 1 ? lmin : 2 - lmin;
      sl = sl || 0;
      l /= 2;
      return [h, sl * 100, l * 100];
    };
    convert.hwb.rgb = function(hwb) {
      var h = hwb[0] / 360;
      var wh = hwb[1] / 100;
      var bl = hwb[2] / 100;
      var ratio = wh + bl;
      var i;
      var v;
      var f;
      var n;
      if (ratio > 1) {
        wh /= ratio;
        bl /= ratio;
      }
      i = Math.floor(6 * h);
      v = 1 - bl;
      f = 6 * h - i;
      if ((i & 1) !== 0) {
        f = 1 - f;
      }
      n = wh + f * (v - wh);
      var r;
      var g;
      var b;
      switch (i) {
        default:
        case 6:
        case 0:
          r = v;
          g = n;
          b = wh;
          break;
        case 1:
          r = n;
          g = v;
          b = wh;
          break;
        case 2:
          r = wh;
          g = v;
          b = n;
          break;
        case 3:
          r = wh;
          g = n;
          b = v;
          break;
        case 4:
          r = n;
          g = wh;
          b = v;
          break;
        case 5:
          r = v;
          g = wh;
          b = n;
          break;
      }
      return [r * 255, g * 255, b * 255];
    };
    convert.cmyk.rgb = function(cmyk) {
      var c = cmyk[0] / 100;
      var m = cmyk[1] / 100;
      var y = cmyk[2] / 100;
      var k = cmyk[3] / 100;
      var r;
      var g;
      var b;
      r = 1 - Math.min(1, c * (1 - k) + k);
      g = 1 - Math.min(1, m * (1 - k) + k);
      b = 1 - Math.min(1, y * (1 - k) + k);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.rgb = function(xyz) {
      var x = xyz[0] / 100;
      var y = xyz[1] / 100;
      var z = xyz[2] / 100;
      var r;
      var g;
      var b;
      r = x * 3.2406 + y * -1.5372 + z * -0.4986;
      g = x * -0.9689 + y * 1.8758 + z * 0.0415;
      b = x * 0.0557 + y * -0.204 + z * 1.057;
      r = r > 31308e-7 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : r * 12.92;
      g = g > 31308e-7 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : g * 12.92;
      b = b > 31308e-7 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : b * 12.92;
      r = Math.min(Math.max(0, r), 1);
      g = Math.min(Math.max(0, g), 1);
      b = Math.min(Math.max(0, b), 1);
      return [r * 255, g * 255, b * 255];
    };
    convert.xyz.lab = function(xyz) {
      var x = xyz[0];
      var y = xyz[1];
      var z = xyz[2];
      var l;
      var a;
      var b;
      x /= 95.047;
      y /= 100;
      z /= 108.883;
      x = x > 8856e-6 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
      y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
      z = z > 8856e-6 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
      l = 116 * y - 16;
      a = 500 * (x - y);
      b = 200 * (y - z);
      return [l, a, b];
    };
    convert.lab.xyz = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var x;
      var y;
      var z;
      y = (l + 16) / 116;
      x = a / 500 + y;
      z = y - b / 200;
      var y2 = Math.pow(y, 3);
      var x2 = Math.pow(x, 3);
      var z2 = Math.pow(z, 3);
      y = y2 > 8856e-6 ? y2 : (y - 16 / 116) / 7.787;
      x = x2 > 8856e-6 ? x2 : (x - 16 / 116) / 7.787;
      z = z2 > 8856e-6 ? z2 : (z - 16 / 116) / 7.787;
      x *= 95.047;
      y *= 100;
      z *= 108.883;
      return [x, y, z];
    };
    convert.lab.lch = function(lab) {
      var l = lab[0];
      var a = lab[1];
      var b = lab[2];
      var hr;
      var h;
      var c;
      hr = Math.atan2(b, a);
      h = hr * 360 / 2 / Math.PI;
      if (h < 0) {
        h += 360;
      }
      c = Math.sqrt(a * a + b * b);
      return [l, c, h];
    };
    convert.lch.lab = function(lch) {
      var l = lch[0];
      var c = lch[1];
      var h = lch[2];
      var a;
      var b;
      var hr;
      hr = h / 360 * 2 * Math.PI;
      a = c * Math.cos(hr);
      b = c * Math.sin(hr);
      return [l, a, b];
    };
    convert.rgb.ansi16 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2];
      value = Math.round(value / 50);
      if (value === 0) {
        return 30;
      }
      var ansi = 30 + (Math.round(b / 255) << 2 | Math.round(g / 255) << 1 | Math.round(r / 255));
      if (value === 2) {
        ansi += 60;
      }
      return ansi;
    };
    convert.hsv.ansi16 = function(args) {
      return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
    };
    convert.rgb.ansi256 = function(args) {
      var r = args[0];
      var g = args[1];
      var b = args[2];
      if (r === g && g === b) {
        if (r < 8) {
          return 16;
        }
        if (r > 248) {
          return 231;
        }
        return Math.round((r - 8) / 247 * 24) + 232;
      }
      var ansi = 16 + 36 * Math.round(r / 255 * 5) + 6 * Math.round(g / 255 * 5) + Math.round(b / 255 * 5);
      return ansi;
    };
    convert.ansi16.rgb = function(args) {
      var color = args % 10;
      if (color === 0 || color === 7) {
        if (args > 50) {
          color += 3.5;
        }
        color = color / 10.5 * 255;
        return [color, color, color];
      }
      var mult = (~~(args > 50) + 1) * 0.5;
      var r = (color & 1) * mult * 255;
      var g = (color >> 1 & 1) * mult * 255;
      var b = (color >> 2 & 1) * mult * 255;
      return [r, g, b];
    };
    convert.ansi256.rgb = function(args) {
      if (args >= 232) {
        var c = (args - 232) * 10 + 8;
        return [c, c, c];
      }
      args -= 16;
      var rem;
      var r = Math.floor(args / 36) / 5 * 255;
      var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
      var b = rem % 6 / 5 * 255;
      return [r, g, b];
    };
    convert.rgb.hex = function(args) {
      var integer = ((Math.round(args[0]) & 255) << 16) + ((Math.round(args[1]) & 255) << 8) + (Math.round(args[2]) & 255);
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.hex.rgb = function(args) {
      var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
      if (!match) {
        return [0, 0, 0];
      }
      var colorString = match[0];
      if (match[0].length === 3) {
        colorString = colorString.split("").map(function(char) {
          return char + char;
        }).join("");
      }
      var integer = parseInt(colorString, 16);
      var r = integer >> 16 & 255;
      var g = integer >> 8 & 255;
      var b = integer & 255;
      return [r, g, b];
    };
    convert.rgb.hcg = function(rgb) {
      var r = rgb[0] / 255;
      var g = rgb[1] / 255;
      var b = rgb[2] / 255;
      var max = Math.max(Math.max(r, g), b);
      var min = Math.min(Math.min(r, g), b);
      var chroma = max - min;
      var grayscale;
      var hue;
      if (chroma < 1) {
        grayscale = min / (1 - chroma);
      } else {
        grayscale = 0;
      }
      if (chroma <= 0) {
        hue = 0;
      } else if (max === r) {
        hue = (g - b) / chroma % 6;
      } else if (max === g) {
        hue = 2 + (b - r) / chroma;
      } else {
        hue = 4 + (r - g) / chroma + 4;
      }
      hue /= 6;
      hue %= 1;
      return [hue * 360, chroma * 100, grayscale * 100];
    };
    convert.hsl.hcg = function(hsl) {
      var s = hsl[1] / 100;
      var l = hsl[2] / 100;
      var c = 1;
      var f = 0;
      if (l < 0.5) {
        c = 2 * s * l;
      } else {
        c = 2 * s * (1 - l);
      }
      if (c < 1) {
        f = (l - 0.5 * c) / (1 - c);
      }
      return [hsl[0], c * 100, f * 100];
    };
    convert.hsv.hcg = function(hsv) {
      var s = hsv[1] / 100;
      var v = hsv[2] / 100;
      var c = s * v;
      var f = 0;
      if (c < 1) {
        f = (v - c) / (1 - c);
      }
      return [hsv[0], c * 100, f * 100];
    };
    convert.hcg.rgb = function(hcg) {
      var h = hcg[0] / 360;
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      if (c === 0) {
        return [g * 255, g * 255, g * 255];
      }
      var pure = [0, 0, 0];
      var hi = h % 1 * 6;
      var v = hi % 1;
      var w = 1 - v;
      var mg = 0;
      switch (Math.floor(hi)) {
        case 0:
          pure[0] = 1;
          pure[1] = v;
          pure[2] = 0;
          break;
        case 1:
          pure[0] = w;
          pure[1] = 1;
          pure[2] = 0;
          break;
        case 2:
          pure[0] = 0;
          pure[1] = 1;
          pure[2] = v;
          break;
        case 3:
          pure[0] = 0;
          pure[1] = w;
          pure[2] = 1;
          break;
        case 4:
          pure[0] = v;
          pure[1] = 0;
          pure[2] = 1;
          break;
        default:
          pure[0] = 1;
          pure[1] = 0;
          pure[2] = w;
      }
      mg = (1 - c) * g;
      return [
        (c * pure[0] + mg) * 255,
        (c * pure[1] + mg) * 255,
        (c * pure[2] + mg) * 255
      ];
    };
    convert.hcg.hsv = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      var f = 0;
      if (v > 0) {
        f = c / v;
      }
      return [hcg[0], f * 100, v * 100];
    };
    convert.hcg.hsl = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var l = g * (1 - c) + 0.5 * c;
      var s = 0;
      if (l > 0 && l < 0.5) {
        s = c / (2 * l);
      } else if (l >= 0.5 && l < 1) {
        s = c / (2 * (1 - l));
      }
      return [hcg[0], s * 100, l * 100];
    };
    convert.hcg.hwb = function(hcg) {
      var c = hcg[1] / 100;
      var g = hcg[2] / 100;
      var v = c + g * (1 - c);
      return [hcg[0], (v - c) * 100, (1 - v) * 100];
    };
    convert.hwb.hcg = function(hwb) {
      var w = hwb[1] / 100;
      var b = hwb[2] / 100;
      var v = 1 - b;
      var c = v - w;
      var g = 0;
      if (c < 1) {
        g = (v - c) / (1 - c);
      }
      return [hwb[0], c * 100, g * 100];
    };
    convert.apple.rgb = function(apple) {
      return [apple[0] / 65535 * 255, apple[1] / 65535 * 255, apple[2] / 65535 * 255];
    };
    convert.rgb.apple = function(rgb) {
      return [rgb[0] / 255 * 65535, rgb[1] / 255 * 65535, rgb[2] / 255 * 65535];
    };
    convert.gray.rgb = function(args) {
      return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
    };
    convert.gray.hsl = convert.gray.hsv = function(args) {
      return [0, 0, args[0]];
    };
    convert.gray.hwb = function(gray) {
      return [0, 100, gray[0]];
    };
    convert.gray.cmyk = function(gray) {
      return [0, 0, 0, gray[0]];
    };
    convert.gray.lab = function(gray) {
      return [gray[0], 0, 0];
    };
    convert.gray.hex = function(gray) {
      var val = Math.round(gray[0] / 100 * 255) & 255;
      var integer = (val << 16) + (val << 8) + val;
      var string = integer.toString(16).toUpperCase();
      return "000000".substring(string.length) + string;
    };
    convert.rgb.gray = function(rgb) {
      var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
      return [val / 255 * 100];
    };
  }
});

// ../../node_modules/color/node_modules/color-convert/route.js
var require_route = __commonJS({
  "../../node_modules/color/node_modules/color-convert/route.js"(exports2, module2) {
    var conversions = require_conversions();
    function buildGraph() {
      var graph = {};
      var models = Object.keys(conversions);
      for (var len = models.length, i = 0; i < len; i++) {
        graph[models[i]] = {
          // http://jsperf.com/1-vs-infinity
          // micro-opt, but this is simple.
          distance: -1,
          parent: null
        };
      }
      return graph;
    }
    function deriveBFS(fromModel) {
      var graph = buildGraph();
      var queue = [fromModel];
      graph[fromModel].distance = 0;
      while (queue.length) {
        var current = queue.pop();
        var adjacents = Object.keys(conversions[current]);
        for (var len = adjacents.length, i = 0; i < len; i++) {
          var adjacent = adjacents[i];
          var node = graph[adjacent];
          if (node.distance === -1) {
            node.distance = graph[current].distance + 1;
            node.parent = current;
            queue.unshift(adjacent);
          }
        }
      }
      return graph;
    }
    function link(from, to) {
      return function(args) {
        return to(from(args));
      };
    }
    function wrapConversion(toModel, graph) {
      var path = [graph[toModel].parent, toModel];
      var fn = conversions[graph[toModel].parent][toModel];
      var cur = graph[toModel].parent;
      while (graph[cur].parent) {
        path.unshift(graph[cur].parent);
        fn = link(conversions[graph[cur].parent][cur], fn);
        cur = graph[cur].parent;
      }
      fn.conversion = path;
      return fn;
    }
    module2.exports = function(fromModel) {
      var graph = deriveBFS(fromModel);
      var conversion = {};
      var models = Object.keys(graph);
      for (var len = models.length, i = 0; i < len; i++) {
        var toModel = models[i];
        var node = graph[toModel];
        if (node.parent === null) {
          continue;
        }
        conversion[toModel] = wrapConversion(toModel, graph);
      }
      return conversion;
    };
  }
});

// ../../node_modules/color/node_modules/color-convert/index.js
var require_color_convert = __commonJS({
  "../../node_modules/color/node_modules/color-convert/index.js"(exports2, module2) {
    var conversions = require_conversions();
    var route = require_route();
    var convert = {};
    var models = Object.keys(conversions);
    function wrapRaw(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        return fn(args);
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    function wrapRounded(fn) {
      var wrappedFn = function(args) {
        if (args === void 0 || args === null) {
          return args;
        }
        if (arguments.length > 1) {
          args = Array.prototype.slice.call(arguments);
        }
        var result = fn(args);
        if (typeof result === "object") {
          for (var len = result.length, i = 0; i < len; i++) {
            result[i] = Math.round(result[i]);
          }
        }
        return result;
      };
      if ("conversion" in fn) {
        wrappedFn.conversion = fn.conversion;
      }
      return wrappedFn;
    }
    models.forEach(function(fromModel) {
      convert[fromModel] = {};
      Object.defineProperty(convert[fromModel], "channels", { value: conversions[fromModel].channels });
      Object.defineProperty(convert[fromModel], "labels", { value: conversions[fromModel].labels });
      var routes = route(fromModel);
      var routeModels = Object.keys(routes);
      routeModels.forEach(function(toModel) {
        var fn = routes[toModel];
        convert[fromModel][toModel] = wrapRounded(fn);
        convert[fromModel][toModel].raw = wrapRaw(fn);
      });
    });
    module2.exports = convert;
  }
});

// ../../node_modules/color/index.js
var require_color = __commonJS({
  "../../node_modules/color/index.js"(exports2, module2) {
    "use strict";
    var colorString = require_color_string();
    var convert = require_color_convert();
    var _slice = [].slice;
    var skippedModels = [
      // to be honest, I don't really feel like keyword belongs in color convert, but eh.
      "keyword",
      // gray conflicts with some method names, and has its own method defined.
      "gray",
      // shouldn't really be in color-convert either...
      "hex"
    ];
    var hashedModelKeys = {};
    Object.keys(convert).forEach(function(model) {
      hashedModelKeys[_slice.call(convert[model].labels).sort().join("")] = model;
    });
    var limiters = {};
    function Color(obj, model) {
      if (!(this instanceof Color)) {
        return new Color(obj, model);
      }
      if (model && model in skippedModels) {
        model = null;
      }
      if (model && !(model in convert)) {
        throw new Error("Unknown model: " + model);
      }
      var i;
      var channels;
      if (obj == null) {
        this.model = "rgb";
        this.color = [0, 0, 0];
        this.valpha = 1;
      } else if (obj instanceof Color) {
        this.model = obj.model;
        this.color = obj.color.slice();
        this.valpha = obj.valpha;
      } else if (typeof obj === "string") {
        var result = colorString.get(obj);
        if (result === null) {
          throw new Error("Unable to parse color from string: " + obj);
        }
        this.model = result.model;
        channels = convert[this.model].channels;
        this.color = result.value.slice(0, channels);
        this.valpha = typeof result.value[channels] === "number" ? result.value[channels] : 1;
      } else if (obj.length) {
        this.model = model || "rgb";
        channels = convert[this.model].channels;
        var newArr = _slice.call(obj, 0, channels);
        this.color = zeroArray(newArr, channels);
        this.valpha = typeof obj[channels] === "number" ? obj[channels] : 1;
      } else if (typeof obj === "number") {
        obj &= 16777215;
        this.model = "rgb";
        this.color = [
          obj >> 16 & 255,
          obj >> 8 & 255,
          obj & 255
        ];
        this.valpha = 1;
      } else {
        this.valpha = 1;
        var keys = Object.keys(obj);
        if ("alpha" in obj) {
          keys.splice(keys.indexOf("alpha"), 1);
          this.valpha = typeof obj.alpha === "number" ? obj.alpha : 0;
        }
        var hashedKeys = keys.sort().join("");
        if (!(hashedKeys in hashedModelKeys)) {
          throw new Error("Unable to parse color from object: " + JSON.stringify(obj));
        }
        this.model = hashedModelKeys[hashedKeys];
        var labels = convert[this.model].labels;
        var color = [];
        for (i = 0; i < labels.length; i++) {
          color.push(obj[labels[i]]);
        }
        this.color = zeroArray(color);
      }
      if (limiters[this.model]) {
        channels = convert[this.model].channels;
        for (i = 0; i < channels; i++) {
          var limit = limiters[this.model][i];
          if (limit) {
            this.color[i] = limit(this.color[i]);
          }
        }
      }
      this.valpha = Math.max(0, Math.min(1, this.valpha));
      if (Object.freeze) {
        Object.freeze(this);
      }
    }
    Color.prototype = {
      toString: function() {
        return this.string();
      },
      toJSON: function() {
        return this[this.model]();
      },
      string: function(places) {
        var self2 = this.model in colorString.to ? this : this.rgb();
        self2 = self2.round(typeof places === "number" ? places : 1);
        var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
        return colorString.to[self2.model](args);
      },
      percentString: function(places) {
        var self2 = this.rgb().round(typeof places === "number" ? places : 1);
        var args = self2.valpha === 1 ? self2.color : self2.color.concat(this.valpha);
        return colorString.to.rgb.percent(args);
      },
      array: function() {
        return this.valpha === 1 ? this.color.slice() : this.color.concat(this.valpha);
      },
      object: function() {
        var result = {};
        var channels = convert[this.model].channels;
        var labels = convert[this.model].labels;
        for (var i = 0; i < channels; i++) {
          result[labels[i]] = this.color[i];
        }
        if (this.valpha !== 1) {
          result.alpha = this.valpha;
        }
        return result;
      },
      unitArray: function() {
        var rgb = this.rgb().color;
        rgb[0] /= 255;
        rgb[1] /= 255;
        rgb[2] /= 255;
        if (this.valpha !== 1) {
          rgb.push(this.valpha);
        }
        return rgb;
      },
      unitObject: function() {
        var rgb = this.rgb().object();
        rgb.r /= 255;
        rgb.g /= 255;
        rgb.b /= 255;
        if (this.valpha !== 1) {
          rgb.alpha = this.valpha;
        }
        return rgb;
      },
      round: function(places) {
        places = Math.max(places || 0, 0);
        return new Color(this.color.map(roundToPlace(places)).concat(this.valpha), this.model);
      },
      alpha: function(val) {
        if (arguments.length) {
          return new Color(this.color.concat(Math.max(0, Math.min(1, val))), this.model);
        }
        return this.valpha;
      },
      // rgb
      red: getset("rgb", 0, maxfn(255)),
      green: getset("rgb", 1, maxfn(255)),
      blue: getset("rgb", 2, maxfn(255)),
      hue: getset(["hsl", "hsv", "hsl", "hwb", "hcg"], 0, function(val) {
        return (val % 360 + 360) % 360;
      }),
      // eslint-disable-line brace-style
      saturationl: getset("hsl", 1, maxfn(100)),
      lightness: getset("hsl", 2, maxfn(100)),
      saturationv: getset("hsv", 1, maxfn(100)),
      value: getset("hsv", 2, maxfn(100)),
      chroma: getset("hcg", 1, maxfn(100)),
      gray: getset("hcg", 2, maxfn(100)),
      white: getset("hwb", 1, maxfn(100)),
      wblack: getset("hwb", 2, maxfn(100)),
      cyan: getset("cmyk", 0, maxfn(100)),
      magenta: getset("cmyk", 1, maxfn(100)),
      yellow: getset("cmyk", 2, maxfn(100)),
      black: getset("cmyk", 3, maxfn(100)),
      x: getset("xyz", 0, maxfn(100)),
      y: getset("xyz", 1, maxfn(100)),
      z: getset("xyz", 2, maxfn(100)),
      l: getset("lab", 0, maxfn(100)),
      a: getset("lab", 1),
      b: getset("lab", 2),
      keyword: function(val) {
        if (arguments.length) {
          return new Color(val);
        }
        return convert[this.model].keyword(this.color);
      },
      hex: function(val) {
        if (arguments.length) {
          return new Color(val);
        }
        return colorString.to.hex(this.rgb().round().color);
      },
      rgbNumber: function() {
        var rgb = this.rgb().color;
        return (rgb[0] & 255) << 16 | (rgb[1] & 255) << 8 | rgb[2] & 255;
      },
      luminosity: function() {
        var rgb = this.rgb().color;
        var lum = [];
        for (var i = 0; i < rgb.length; i++) {
          var chan = rgb[i] / 255;
          lum[i] = chan <= 0.03928 ? chan / 12.92 : Math.pow((chan + 0.055) / 1.055, 2.4);
        }
        return 0.2126 * lum[0] + 0.7152 * lum[1] + 0.0722 * lum[2];
      },
      contrast: function(color2) {
        var lum1 = this.luminosity();
        var lum2 = color2.luminosity();
        if (lum1 > lum2) {
          return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
      },
      level: function(color2) {
        var contrastRatio = this.contrast(color2);
        if (contrastRatio >= 7.1) {
          return "AAA";
        }
        return contrastRatio >= 4.5 ? "AA" : "";
      },
      isDark: function() {
        var rgb = this.rgb().color;
        var yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3;
        return yiq < 128;
      },
      isLight: function() {
        return !this.isDark();
      },
      negate: function() {
        var rgb = this.rgb();
        for (var i = 0; i < 3; i++) {
          rgb.color[i] = 255 - rgb.color[i];
        }
        return rgb;
      },
      lighten: function(ratio) {
        var hsl = this.hsl();
        hsl.color[2] += hsl.color[2] * ratio;
        return hsl;
      },
      darken: function(ratio) {
        var hsl = this.hsl();
        hsl.color[2] -= hsl.color[2] * ratio;
        return hsl;
      },
      saturate: function(ratio) {
        var hsl = this.hsl();
        hsl.color[1] += hsl.color[1] * ratio;
        return hsl;
      },
      desaturate: function(ratio) {
        var hsl = this.hsl();
        hsl.color[1] -= hsl.color[1] * ratio;
        return hsl;
      },
      whiten: function(ratio) {
        var hwb = this.hwb();
        hwb.color[1] += hwb.color[1] * ratio;
        return hwb;
      },
      blacken: function(ratio) {
        var hwb = this.hwb();
        hwb.color[2] += hwb.color[2] * ratio;
        return hwb;
      },
      grayscale: function() {
        var rgb = this.rgb().color;
        var val = rgb[0] * 0.3 + rgb[1] * 0.59 + rgb[2] * 0.11;
        return Color.rgb(val, val, val);
      },
      fade: function(ratio) {
        return this.alpha(this.valpha - this.valpha * ratio);
      },
      opaquer: function(ratio) {
        return this.alpha(this.valpha + this.valpha * ratio);
      },
      rotate: function(degrees) {
        var hsl = this.hsl();
        var hue = hsl.color[0];
        hue = (hue + degrees) % 360;
        hue = hue < 0 ? 360 + hue : hue;
        hsl.color[0] = hue;
        return hsl;
      },
      mix: function(mixinColor, weight) {
        if (!mixinColor || !mixinColor.rgb) {
          throw new Error('Argument to "mix" was not a Color instance, but rather an instance of ' + typeof mixinColor);
        }
        var color1 = mixinColor.rgb();
        var color2 = this.rgb();
        var p = weight === void 0 ? 0.5 : weight;
        var w = 2 * p - 1;
        var a = color1.alpha() - color2.alpha();
        var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
        var w2 = 1 - w1;
        return Color.rgb(
          w1 * color1.red() + w2 * color2.red(),
          w1 * color1.green() + w2 * color2.green(),
          w1 * color1.blue() + w2 * color2.blue(),
          color1.alpha() * p + color2.alpha() * (1 - p)
        );
      }
    };
    Object.keys(convert).forEach(function(model) {
      if (skippedModels.indexOf(model) !== -1) {
        return;
      }
      var channels = convert[model].channels;
      Color.prototype[model] = function() {
        if (this.model === model) {
          return new Color(this);
        }
        if (arguments.length) {
          return new Color(arguments, model);
        }
        var newAlpha = typeof arguments[channels] === "number" ? channels : this.valpha;
        return new Color(assertArray(convert[this.model][model].raw(this.color)).concat(newAlpha), model);
      };
      Color[model] = function(color) {
        if (typeof color === "number") {
          color = zeroArray(_slice.call(arguments), channels);
        }
        return new Color(color, model);
      };
    });
    function roundTo(num, places) {
      return Number(num.toFixed(places));
    }
    function roundToPlace(places) {
      return function(num) {
        return roundTo(num, places);
      };
    }
    function getset(model, channel, modifier) {
      model = Array.isArray(model) ? model : [model];
      model.forEach(function(m) {
        (limiters[m] || (limiters[m] = []))[channel] = modifier;
      });
      model = model[0];
      return function(val) {
        var result;
        if (arguments.length) {
          if (modifier) {
            val = modifier(val);
          }
          result = this[model]();
          result.color[channel] = val;
          return result;
        }
        result = this[model]().color[channel];
        if (modifier) {
          result = modifier(result);
        }
        return result;
      };
    }
    function maxfn(max) {
      return function(v) {
        return Math.max(0, Math.min(max, v));
      };
    }
    function assertArray(val) {
      return Array.isArray(val) ? val : [val];
    }
    function zeroArray(arr, length) {
      for (var i = 0; i < length; i++) {
        if (typeof arr[i] !== "number") {
          arr[i] = 0;
        }
      }
      return arr;
    }
    module2.exports = Color;
  }
});

// ../../node_modules/text-hex/index.js
var require_text_hex = __commonJS({
  "../../node_modules/text-hex/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function hex(str) {
      for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash)) ;
      var color = Math.floor(
        Math.abs(
          Math.sin(hash) * 1e4 % 1 * 16777216
        )
      ).toString(16);
      return "#" + Array(6 - color.length + 1).join("0") + color;
    };
  }
});

// ../../node_modules/colorspace/index.js
var require_colorspace = __commonJS({
  "../../node_modules/colorspace/index.js"(exports2, module2) {
    "use strict";
    var color = require_color();
    var hex = require_text_hex();
    module2.exports = function colorspace(namespace, delimiter) {
      var split = namespace.split(delimiter || ":");
      var base = hex(split[0]);
      if (!split.length) return base;
      for (var i = 0, l = split.length - 1; i < l; i++) {
        base = color(base).mix(color(hex(split[i + 1]))).saturate(1).hex();
      }
      return base;
    };
  }
});

// ../../node_modules/kuler/index.js
var require_kuler = __commonJS({
  "../../node_modules/kuler/index.js"(exports2, module2) {
    "use strict";
    function Kuler(text, color) {
      if (color) return new Kuler(text).style(color);
      if (!(this instanceof Kuler)) return new Kuler(text);
      this.text = text;
    }
    Kuler.prototype.prefix = "\x1B[";
    Kuler.prototype.suffix = "m";
    Kuler.prototype.hex = function hex(color) {
      color = color[0] === "#" ? color.substring(1) : color;
      if (color.length === 3) {
        color = color.split("");
        color[5] = color[2];
        color[4] = color[2];
        color[3] = color[1];
        color[2] = color[1];
        color[1] = color[0];
        color = color.join("");
      }
      var r = color.substring(0, 2), g = color.substring(2, 4), b = color.substring(4, 6);
      return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    };
    Kuler.prototype.rgb = function rgb(r, g, b) {
      var red = r / 255 * 5, green = g / 255 * 5, blue = b / 255 * 5;
      return this.ansi(red, green, blue);
    };
    Kuler.prototype.ansi = function ansi(r, g, b) {
      var red = Math.round(r), green = Math.round(g), blue = Math.round(b);
      return 16 + red * 36 + green * 6 + blue;
    };
    Kuler.prototype.reset = function reset() {
      return this.prefix + "39;49" + this.suffix;
    };
    Kuler.prototype.style = function style(color) {
      return this.prefix + "38;5;" + this.rgb.apply(this, this.hex(color)) + this.suffix + this.text + this.reset();
    };
    module2.exports = Kuler;
  }
});

// ../../node_modules/@dabh/diagnostics/modifiers/namespace-ansi.js
var require_namespace_ansi = __commonJS({
  "../../node_modules/@dabh/diagnostics/modifiers/namespace-ansi.js"(exports2, module2) {
    var colorspace = require_colorspace();
    var kuler = require_kuler();
    module2.exports = function ansiModifier(args, options) {
      var namespace = options.namespace;
      var ansi = options.colors !== false ? kuler(namespace + ":", colorspace(namespace)) : namespace + ":";
      args[0] = ansi + " " + args[0];
      return args;
    };
  }
});

// ../../node_modules/enabled/index.js
var require_enabled = __commonJS({
  "../../node_modules/enabled/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function enabled(name, variable) {
      if (!variable) return false;
      var variables = variable.split(/[\s,]+/), i = 0;
      for (; i < variables.length; i++) {
        variable = variables[i].replace("*", ".*?");
        if ("-" === variable.charAt(0)) {
          if (new RegExp("^" + variable.substr(1) + "$").test(name)) {
            return false;
          }
          continue;
        }
        if (new RegExp("^" + variable + "$").test(name)) {
          return true;
        }
      }
      return false;
    };
  }
});

// ../../node_modules/@dabh/diagnostics/adapters/index.js
var require_adapters = __commonJS({
  "../../node_modules/@dabh/diagnostics/adapters/index.js"(exports2, module2) {
    var enabled = require_enabled();
    module2.exports = function create(fn) {
      return function adapter(namespace) {
        try {
          return enabled(namespace, fn());
        } catch (e) {
        }
        return false;
      };
    };
  }
});

// ../../node_modules/@dabh/diagnostics/adapters/process.env.js
var require_process_env = __commonJS({
  "../../node_modules/@dabh/diagnostics/adapters/process.env.js"(exports2, module2) {
    var adapter = require_adapters();
    module2.exports = adapter(function processenv() {
      return process.env.DEBUG || process.env.DIAGNOSTICS;
    });
  }
});

// ../../node_modules/@dabh/diagnostics/logger/console.js
var require_console2 = __commonJS({
  "../../node_modules/@dabh/diagnostics/logger/console.js"(exports2, module2) {
    module2.exports = function(meta, messages) {
      try {
        Function.prototype.apply.call(console.log, console, messages);
      } catch (e) {
      }
    };
  }
});

// ../../node_modules/@dabh/diagnostics/node/development.js
var require_development = __commonJS({
  "../../node_modules/@dabh/diagnostics/node/development.js"(exports2, module2) {
    var create = require_diagnostics();
    var tty = require("tty").isatty(1);
    var diagnostics = create(function dev(namespace, options) {
      options = options || {};
      options.colors = "colors" in options ? options.colors : tty;
      options.namespace = namespace;
      options.prod = false;
      options.dev = true;
      if (!dev.enabled(namespace) && !(options.force || dev.force)) {
        return dev.nope(options);
      }
      return dev.yep(options);
    });
    diagnostics.modify(require_namespace_ansi());
    diagnostics.use(require_process_env());
    diagnostics.set(require_console2());
    module2.exports = diagnostics;
  }
});

// ../../node_modules/@dabh/diagnostics/node/index.js
var require_node2 = __commonJS({
  "../../node_modules/@dabh/diagnostics/node/index.js"(exports2, module2) {
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_production();
    } else {
      module2.exports = require_development();
    }
  }
});

// ../../node_modules/winston/lib/winston/tail-file.js
var require_tail_file = __commonJS({
  "../../node_modules/winston/lib/winston/tail-file.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var { StringDecoder } = require("string_decoder");
    var { Stream } = require_readable();
    function noop() {
    }
    module2.exports = (options, iter) => {
      const buffer = Buffer.alloc(64 * 1024);
      const decode = new StringDecoder("utf8");
      const stream = new Stream();
      let buff = "";
      let pos = 0;
      let row = 0;
      if (options.start === -1) {
        delete options.start;
      }
      stream.readable = true;
      stream.destroy = () => {
        stream.destroyed = true;
        stream.emit("end");
        stream.emit("close");
      };
      fs.open(options.file, "a+", "0644", (err, fd) => {
        if (err) {
          if (!iter) {
            stream.emit("error", err);
          } else {
            iter(err);
          }
          stream.destroy();
          return;
        }
        (function read() {
          if (stream.destroyed) {
            fs.close(fd, noop);
            return;
          }
          return fs.read(fd, buffer, 0, buffer.length, pos, (error, bytes) => {
            if (error) {
              if (!iter) {
                stream.emit("error", error);
              } else {
                iter(error);
              }
              stream.destroy();
              return;
            }
            if (!bytes) {
              if (buff) {
                if (options.start == null || row > options.start) {
                  if (!iter) {
                    stream.emit("line", buff);
                  } else {
                    iter(null, buff);
                  }
                }
                row++;
                buff = "";
              }
              return setTimeout(read, 1e3);
            }
            let data = decode.write(buffer.slice(0, bytes));
            if (!iter) {
              stream.emit("data", data);
            }
            data = (buff + data).split(/\n+/);
            const l = data.length - 1;
            let i = 0;
            for (; i < l; i++) {
              if (options.start == null || row > options.start) {
                if (!iter) {
                  stream.emit("line", data[i]);
                } else {
                  iter(null, data[i]);
                }
              }
              row++;
            }
            buff = data[l];
            pos += bytes;
            return read();
          });
        })();
      });
      if (!iter) {
        return stream;
      }
      return stream.destroy;
    };
  }
});

// ../../node_modules/winston/lib/winston/transports/file.js
var require_file = __commonJS({
  "../../node_modules/winston/lib/winston/transports/file.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var asyncSeries = require_series();
    var zlib = require("zlib");
    var { MESSAGE } = require_triple_beam();
    var { Stream, PassThrough } = require_readable();
    var TransportStream = require_winston_transport();
    var debug = require_node2()("winston:file");
    var os = require("os");
    var tailFile = require_tail_file();
    module2.exports = class File extends TransportStream {
      /**
       * Constructor function for the File transport object responsible for
       * persisting log messages and metadata to one or more files.
       * @param {Object} options - Options for this instance.
       */
      constructor(options = {}) {
        super(options);
        this.name = options.name || "file";
        function throwIf(target, ...args) {
          args.slice(1).forEach((name) => {
            if (options[name]) {
              throw new Error(`Cannot set ${name} and ${target} together`);
            }
          });
        }
        this._stream = new PassThrough();
        this._stream.setMaxListeners(30);
        this._onError = this._onError.bind(this);
        if (options.filename || options.dirname) {
          throwIf("filename or dirname", "stream");
          this._basename = this.filename = options.filename ? path.basename(options.filename) : "winston.log";
          this.dirname = options.dirname || path.dirname(options.filename);
          this.options = options.options || { flags: "a" };
        } else if (options.stream) {
          console.warn("options.stream will be removed in winston@4. Use winston.transports.Stream");
          throwIf("stream", "filename", "maxsize");
          this._dest = this._stream.pipe(this._setupStream(options.stream));
          this.dirname = path.dirname(this._dest.path);
        } else {
          throw new Error("Cannot log to file without filename or stream.");
        }
        this.maxsize = options.maxsize || null;
        this.rotationFormat = options.rotationFormat || false;
        this.zippedArchive = options.zippedArchive || false;
        this.maxFiles = options.maxFiles || null;
        this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
        this.tailable = options.tailable || false;
        this.lazy = options.lazy || false;
        this._size = 0;
        this._pendingSize = 0;
        this._created = 0;
        this._drain = false;
        this._opening = false;
        this._ending = false;
        this._fileExist = false;
        if (this.dirname) this._createLogDirIfNotExist(this.dirname);
        if (!this.lazy) this.open();
      }
      finishIfEnding() {
        if (this._ending) {
          if (this._opening) {
            this.once("open", () => {
              this._stream.once("finish", () => this.emit("finish"));
              setImmediate(() => this._stream.end());
            });
          } else {
            this._stream.once("finish", () => this.emit("finish"));
            setImmediate(() => this._stream.end());
          }
        }
      }
      /**
       * Core logging method exposed to Winston. Metadata is optional.
       * @param {Object} info - TODO: add param description.
       * @param {Function} callback - TODO: add param description.
       * @returns {undefined}
       */
      log(info, callback = () => {
      }) {
        if (this.silent) {
          callback();
          return true;
        }
        if (this._drain) {
          this._stream.once("drain", () => {
            this._drain = false;
            this.log(info, callback);
          });
          return;
        }
        if (this._rotate) {
          this._stream.once("rotate", () => {
            this._rotate = false;
            this.log(info, callback);
          });
          return;
        }
        if (this.lazy) {
          if (!this._fileExist) {
            if (!this._opening) {
              this.open();
            }
            this.once("open", () => {
              this._fileExist = true;
              this.log(info, callback);
              return;
            });
            return;
          }
          if (this._needsNewFile(this._pendingSize)) {
            this._dest.once("close", () => {
              if (!this._opening) {
                this.open();
              }
              this.once("open", () => {
                this.log(info, callback);
                return;
              });
              return;
            });
            return;
          }
        }
        const output = `${info[MESSAGE]}${this.eol}`;
        const bytes = Buffer.byteLength(output);
        function logged() {
          this._size += bytes;
          this._pendingSize -= bytes;
          debug("logged %s %s", this._size, output);
          this.emit("logged", info);
          if (this._rotate) {
            return;
          }
          if (this._opening) {
            return;
          }
          if (!this._needsNewFile()) {
            return;
          }
          if (this.lazy) {
            this._endStream(() => {
              this.emit("fileclosed");
            });
            return;
          }
          this._rotate = true;
          this._endStream(() => this._rotateFile());
        }
        this._pendingSize += bytes;
        if (this._opening && !this.rotatedWhileOpening && this._needsNewFile(this._size + this._pendingSize)) {
          this.rotatedWhileOpening = true;
        }
        const written = this._stream.write(output, logged.bind(this));
        if (!written) {
          this._drain = true;
          this._stream.once("drain", () => {
            this._drain = false;
            callback();
          });
        } else {
          callback();
        }
        debug("written", written, this._drain);
        this.finishIfEnding();
        return written;
      }
      /**
       * Query the transport. Options object is optional.
       * @param {Object} options - Loggly-like query options for this instance.
       * @param {function} callback - Continuation to respond to when complete.
       * TODO: Refactor me.
       */
      query(options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        options = normalizeQuery(options);
        const file = path.join(this.dirname, this.filename);
        let buff = "";
        let results = [];
        let row = 0;
        const stream = fs.createReadStream(file, {
          encoding: "utf8"
        });
        stream.on("error", (err) => {
          if (stream.readable) {
            stream.destroy();
          }
          if (!callback) {
            return;
          }
          return err.code !== "ENOENT" ? callback(err) : callback(null, results);
        });
        stream.on("data", (data) => {
          data = (buff + data).split(/\n+/);
          const l = data.length - 1;
          let i = 0;
          for (; i < l; i++) {
            if (!options.start || row >= options.start) {
              add(data[i]);
            }
            row++;
          }
          buff = data[l];
        });
        stream.on("close", () => {
          if (buff) {
            add(buff, true);
          }
          if (options.order === "desc") {
            results = results.reverse();
          }
          if (callback) callback(null, results);
        });
        function add(buff2, attempt) {
          try {
            const log = JSON.parse(buff2);
            if (check(log)) {
              push(log);
            }
          } catch (e) {
            if (!attempt) {
              stream.emit("error", e);
            }
          }
        }
        function push(log) {
          if (options.rows && results.length >= options.rows && options.order !== "desc") {
            if (stream.readable) {
              stream.destroy();
            }
            return;
          }
          if (options.fields) {
            log = options.fields.reduce((obj, key) => {
              obj[key] = log[key];
              return obj;
            }, {});
          }
          if (options.order === "desc") {
            if (results.length >= options.rows) {
              results.shift();
            }
          }
          results.push(log);
        }
        function check(log) {
          if (!log) {
            return;
          }
          if (typeof log !== "object") {
            return;
          }
          const time = new Date(log.timestamp);
          if (options.from && time < options.from || options.until && time > options.until || options.level && options.level !== log.level) {
            return;
          }
          return true;
        }
        function normalizeQuery(options2) {
          options2 = options2 || {};
          options2.rows = options2.rows || options2.limit || 10;
          options2.start = options2.start || 0;
          options2.until = options2.until || /* @__PURE__ */ new Date();
          if (typeof options2.until !== "object") {
            options2.until = new Date(options2.until);
          }
          options2.from = options2.from || options2.until - 24 * 60 * 60 * 1e3;
          if (typeof options2.from !== "object") {
            options2.from = new Date(options2.from);
          }
          options2.order = options2.order || "desc";
          return options2;
        }
      }
      /**
       * Returns a log stream for this transport. Options object is optional.
       * @param {Object} options - Stream options for this instance.
       * @returns {Stream} - TODO: add return description.
       * TODO: Refactor me.
       */
      stream(options = {}) {
        const file = path.join(this.dirname, this.filename);
        const stream = new Stream();
        const tail = {
          file,
          start: options.start
        };
        stream.destroy = tailFile(tail, (err, line) => {
          if (err) {
            return stream.emit("error", err);
          }
          try {
            stream.emit("data", line);
            line = JSON.parse(line);
            stream.emit("log", line);
          } catch (e) {
            stream.emit("error", e);
          }
        });
        return stream;
      }
      /**
       * Checks to see the filesize of.
       * @returns {undefined}
       */
      open() {
        if (!this.filename) return;
        if (this._opening) return;
        this._opening = true;
        this.stat((err, size) => {
          if (err) {
            return this.emit("error", err);
          }
          debug("stat done: %s { size: %s }", this.filename, size);
          this._size = size;
          this._dest = this._createStream(this._stream);
          this._opening = false;
          this.once("open", () => {
            if (!this._stream.emit("rotate")) {
              this._rotate = false;
            }
          });
        });
      }
      /**
       * Stat the file and assess information in order to create the proper stream.
       * @param {function} callback - TODO: add param description.
       * @returns {undefined}
       */
      stat(callback) {
        const target = this._getFile();
        const fullpath = path.join(this.dirname, target);
        fs.stat(fullpath, (err, stat) => {
          if (err && err.code === "ENOENT") {
            debug("ENOENT\xA0ok", fullpath);
            this.filename = target;
            return callback(null, 0);
          }
          if (err) {
            debug(`err ${err.code} ${fullpath}`);
            return callback(err);
          }
          if (!stat || this._needsNewFile(stat.size)) {
            return this._incFile(() => this.stat(callback));
          }
          this.filename = target;
          callback(null, stat.size);
        });
      }
      /**
       * Closes the stream associated with this instance.
       * @param {function} cb - TODO: add param description.
       * @returns {undefined}
       */
      close(cb) {
        if (!this._stream) {
          return;
        }
        this._stream.end(() => {
          if (cb) {
            cb();
          }
          this.emit("flush");
          this.emit("closed");
        });
      }
      /**
       * TODO: add method description.
       * @param {number} size - TODO: add param description.
       * @returns {undefined}
       */
      _needsNewFile(size) {
        size = size || this._size;
        return this.maxsize && size >= this.maxsize;
      }
      /**
       * TODO: add method description.
       * @param {Error} err - TODO: add param description.
       * @returns {undefined}
       */
      _onError(err) {
        this.emit("error", err);
      }
      /**
       * TODO: add method description.
       * @param {Stream} stream - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       */
      _setupStream(stream) {
        stream.on("error", this._onError);
        return stream;
      }
      /**
       * TODO: add method description.
       * @param {Stream} stream - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       */
      _cleanupStream(stream) {
        stream.removeListener("error", this._onError);
        stream.destroy();
        return stream;
      }
      /**
       * TODO: add method description.
       */
      _rotateFile() {
        this._incFile(() => this.open());
      }
      /**
       * Unpipe from the stream that has been marked as full and end it so it
       * flushes to disk.
       *
       * @param {function} callback - Callback for when the current file has closed.
       * @private
       */
      _endStream(callback = () => {
      }) {
        if (this._dest) {
          this._stream.unpipe(this._dest);
          this._dest.end(() => {
            this._cleanupStream(this._dest);
            callback();
          });
        } else {
          callback();
        }
      }
      /**
       * Returns the WritableStream for the active file on this instance. If we
       * should gzip the file then a zlib stream is returned.
       *
       * @param {ReadableStream} source –PassThrough to pipe to the file when open.
       * @returns {WritableStream} Stream that writes to disk for the active file.
       */
      _createStream(source) {
        const fullpath = path.join(this.dirname, this.filename);
        debug("create stream start", fullpath, this.options);
        const dest = fs.createWriteStream(fullpath, this.options).on("error", (err) => debug(err)).on("close", () => debug("close", dest.path, dest.bytesWritten)).on("open", () => {
          debug("file open ok", fullpath);
          this.emit("open", fullpath);
          source.pipe(dest);
          if (this.rotatedWhileOpening) {
            this._stream = new PassThrough();
            this._stream.setMaxListeners(30);
            this._rotateFile();
            this.rotatedWhileOpening = false;
            this._cleanupStream(dest);
            source.end();
          }
        });
        debug("create stream ok", fullpath);
        return dest;
      }
      /**
       * TODO: add method description.
       * @param {function} callback - TODO: add param description.
       * @returns {undefined}
       */
      _incFile(callback) {
        debug("_incFile", this.filename);
        const ext = path.extname(this._basename);
        const basename = path.basename(this._basename, ext);
        const tasks = [];
        if (this.zippedArchive) {
          tasks.push(
            function(cb) {
              const num = this._created > 0 && !this.tailable ? this._created : "";
              this._compressFile(
                path.join(this.dirname, `${basename}${num}${ext}`),
                path.join(this.dirname, `${basename}${num}${ext}.gz`),
                cb
              );
            }.bind(this)
          );
        }
        tasks.push(
          function(cb) {
            if (!this.tailable) {
              this._created += 1;
              this._checkMaxFilesIncrementing(ext, basename, cb);
            } else {
              this._checkMaxFilesTailable(ext, basename, cb);
            }
          }.bind(this)
        );
        asyncSeries(tasks, callback);
      }
      /**
       * Gets the next filename to use for this instance in the case that log
       * filesizes are being capped.
       * @returns {string} - TODO: add return description.
       * @private
       */
      _getFile() {
        const ext = path.extname(this._basename);
        const basename = path.basename(this._basename, ext);
        const isRotation = this.rotationFormat ? this.rotationFormat() : this._created;
        return !this.tailable && this._created ? `${basename}${isRotation}${ext}` : `${basename}${ext}`;
      }
      /**
       * Increment the number of files created or checked by this instance.
       * @param {mixed} ext - TODO: add param description.
       * @param {mixed} basename - TODO: add param description.
       * @param {mixed} callback - TODO: add param description.
       * @returns {undefined}
       * @private
       */
      _checkMaxFilesIncrementing(ext, basename, callback) {
        if (!this.maxFiles || this._created < this.maxFiles) {
          return setImmediate(callback);
        }
        const oldest = this._created - this.maxFiles;
        const isOldest = oldest !== 0 ? oldest : "";
        const isZipped = this.zippedArchive ? ".gz" : "";
        const filePath = `${basename}${isOldest}${ext}${isZipped}`;
        const target = path.join(this.dirname, filePath);
        fs.unlink(target, callback);
      }
      /**
       * Roll files forward based on integer, up to maxFiles. e.g. if base if
       * file.log and it becomes oversized, roll to file1.log, and allow file.log
       * to be re-used. If file is oversized again, roll file1.log to file2.log,
       * roll file.log to file1.log, and so on.
       * @param {mixed} ext - TODO: add param description.
       * @param {mixed} basename - TODO: add param description.
       * @param {mixed} callback - TODO: add param description.
       * @returns {undefined}
       * @private
       */
      _checkMaxFilesTailable(ext, basename, callback) {
        const tasks = [];
        if (!this.maxFiles) {
          return;
        }
        const isZipped = this.zippedArchive ? ".gz" : "";
        for (let x = this.maxFiles - 1; x > 1; x--) {
          tasks.push(function(i, cb) {
            let fileName = `${basename}${i - 1}${ext}${isZipped}`;
            const tmppath = path.join(this.dirname, fileName);
            fs.exists(tmppath, (exists) => {
              if (!exists) {
                return cb(null);
              }
              fileName = `${basename}${i}${ext}${isZipped}`;
              fs.rename(tmppath, path.join(this.dirname, fileName), cb);
            });
          }.bind(this, x));
        }
        asyncSeries(tasks, () => {
          fs.rename(
            path.join(this.dirname, `${basename}${ext}${isZipped}`),
            path.join(this.dirname, `${basename}1${ext}${isZipped}`),
            callback
          );
        });
      }
      /**
       * Compresses src to dest with gzip and unlinks src
       * @param {string} src - path to source file.
       * @param {string} dest - path to zipped destination file.
       * @param {Function} callback - callback called after file has been compressed.
       * @returns {undefined}
       * @private
       */
      _compressFile(src, dest, callback) {
        fs.access(src, fs.F_OK, (err) => {
          if (err) {
            return callback();
          }
          var gzip = zlib.createGzip();
          var inp = fs.createReadStream(src);
          var out = fs.createWriteStream(dest);
          out.on("finish", () => {
            fs.unlink(src, callback);
          });
          inp.pipe(gzip).pipe(out);
        });
      }
      _createLogDirIfNotExist(dirPath) {
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/transports/http.js
var require_http = __commonJS({
  "../../node_modules/winston/lib/winston/transports/http.js"(exports2, module2) {
    "use strict";
    var http = require("http");
    var https = require("https");
    var { Stream } = require_readable();
    var TransportStream = require_winston_transport();
    var { configure } = require_safe_stable_stringify();
    module2.exports = class Http extends TransportStream {
      /**
       * Constructor function for the Http transport object responsible for
       * persisting log messages and metadata to a terminal or TTY.
       * @param {!Object} [options={}] - Options for this instance.
       */
      // eslint-disable-next-line max-statements
      constructor(options = {}) {
        super(options);
        this.options = options;
        this.name = options.name || "http";
        this.ssl = !!options.ssl;
        this.host = options.host || "localhost";
        this.port = options.port;
        this.auth = options.auth;
        this.path = options.path || "";
        this.maximumDepth = options.maximumDepth;
        this.agent = options.agent;
        this.headers = options.headers || {};
        this.headers["content-type"] = "application/json";
        this.batch = options.batch || false;
        this.batchInterval = options.batchInterval || 5e3;
        this.batchCount = options.batchCount || 10;
        this.batchOptions = [];
        this.batchTimeoutID = -1;
        this.batchCallback = {};
        if (!this.port) {
          this.port = this.ssl ? 443 : 80;
        }
      }
      /**
       * Core logging method exposed to Winston.
       * @param {Object} info - TODO: add param description.
       * @param {function} callback - TODO: add param description.
       * @returns {undefined}
       */
      log(info, callback) {
        this._request(info, null, null, (err, res) => {
          if (res && res.statusCode !== 200) {
            err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
          }
          if (err) {
            this.emit("warn", err);
          } else {
            this.emit("logged", info);
          }
        });
        if (callback) {
          setImmediate(callback);
        }
      }
      /**
       * Query the transport. Options object is optional.
       * @param {Object} options -  Loggly-like query options for this instance.
       * @param {function} callback - Continuation to respond to when complete.
       * @returns {undefined}
       */
      query(options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        options = {
          method: "query",
          params: this.normalizeQuery(options)
        };
        const auth = options.params.auth || null;
        delete options.params.auth;
        const path = options.params.path || null;
        delete options.params.path;
        this._request(options, auth, path, (err, res, body) => {
          if (res && res.statusCode !== 200) {
            err = new Error(`Invalid HTTP Status Code: ${res.statusCode}`);
          }
          if (err) {
            return callback(err);
          }
          if (typeof body === "string") {
            try {
              body = JSON.parse(body);
            } catch (e) {
              return callback(e);
            }
          }
          callback(null, body);
        });
      }
      /**
       * Returns a log stream for this transport. Options object is optional.
       * @param {Object} options - Stream options for this instance.
       * @returns {Stream} - TODO: add return description
       */
      stream(options = {}) {
        const stream = new Stream();
        options = {
          method: "stream",
          params: options
        };
        const path = options.params.path || null;
        delete options.params.path;
        const auth = options.params.auth || null;
        delete options.params.auth;
        let buff = "";
        const req = this._request(options, auth, path);
        stream.destroy = () => req.destroy();
        req.on("data", (data) => {
          data = (buff + data).split(/\n+/);
          const l = data.length - 1;
          let i = 0;
          for (; i < l; i++) {
            try {
              stream.emit("log", JSON.parse(data[i]));
            } catch (e) {
              stream.emit("error", e);
            }
          }
          buff = data[l];
        });
        req.on("error", (err) => stream.emit("error", err));
        return stream;
      }
      /**
       * Make a request to a winstond server or any http server which can
       * handle json-rpc.
       * @param {function} options - Options to sent the request.
       * @param {Object?} auth - authentication options
       * @param {string} path - request path
       * @param {function} callback - Continuation to respond to when complete.
       */
      _request(options, auth, path, callback) {
        options = options || {};
        auth = auth || this.auth;
        path = path || this.path || "";
        if (this.batch) {
          this._doBatch(options, callback, auth, path);
        } else {
          this._doRequest(options, callback, auth, path);
        }
      }
      /**
       * Send or memorize the options according to batch configuration
       * @param {function} options - Options to sent the request.
       * @param {function} callback - Continuation to respond to when complete.
       * @param {Object?} auth - authentication options
       * @param {string} path - request path
       */
      _doBatch(options, callback, auth, path) {
        this.batchOptions.push(options);
        if (this.batchOptions.length === 1) {
          const me = this;
          this.batchCallback = callback;
          this.batchTimeoutID = setTimeout(function() {
            me.batchTimeoutID = -1;
            me._doBatchRequest(me.batchCallback, auth, path);
          }, this.batchInterval);
        }
        if (this.batchOptions.length === this.batchCount) {
          this._doBatchRequest(this.batchCallback, auth, path);
        }
      }
      /**
       * Initiate a request with the memorized batch options, stop the batch timeout
       * @param {function} callback - Continuation to respond to when complete.
       * @param {Object?} auth - authentication options
       * @param {string} path - request path
       */
      _doBatchRequest(callback, auth, path) {
        if (this.batchTimeoutID > 0) {
          clearTimeout(this.batchTimeoutID);
          this.batchTimeoutID = -1;
        }
        const batchOptionsCopy = this.batchOptions.slice();
        this.batchOptions = [];
        this._doRequest(batchOptionsCopy, callback, auth, path);
      }
      /**
       * Make a request to a winstond server or any http server which can
       * handle json-rpc.
       * @param {function} options - Options to sent the request.
       * @param {function} callback - Continuation to respond to when complete.
       * @param {Object?} auth - authentication options
       * @param {string} path - request path
       */
      _doRequest(options, callback, auth, path) {
        const headers = Object.assign({}, this.headers);
        if (auth && auth.bearer) {
          headers.Authorization = `Bearer ${auth.bearer}`;
        }
        const req = (this.ssl ? https : http).request({
          ...this.options,
          method: "POST",
          host: this.host,
          port: this.port,
          path: `/${path.replace(/^\//, "")}`,
          headers,
          auth: auth && auth.username && auth.password ? `${auth.username}:${auth.password}` : "",
          agent: this.agent
        });
        req.on("error", callback);
        req.on("response", (res) => res.on("end", () => callback(null, res)).resume());
        const jsonStringify = configure({
          ...this.maximumDepth && { maximumDepth: this.maximumDepth }
        });
        req.end(Buffer.from(jsonStringify(options, this.options.replacer), "utf8"));
      }
    };
  }
});

// ../../node_modules/winston/node_modules/is-stream/index.js
var require_is_stream = __commonJS({
  "../../node_modules/winston/node_modules/is-stream/index.js"(exports2, module2) {
    "use strict";
    var isStream = (stream) => stream !== null && typeof stream === "object" && typeof stream.pipe === "function";
    isStream.writable = (stream) => isStream(stream) && stream.writable !== false && typeof stream._write === "function" && typeof stream._writableState === "object";
    isStream.readable = (stream) => isStream(stream) && stream.readable !== false && typeof stream._read === "function" && typeof stream._readableState === "object";
    isStream.duplex = (stream) => isStream.writable(stream) && isStream.readable(stream);
    isStream.transform = (stream) => isStream.duplex(stream) && typeof stream._transform === "function";
    module2.exports = isStream;
  }
});

// ../../node_modules/winston/lib/winston/transports/stream.js
var require_stream3 = __commonJS({
  "../../node_modules/winston/lib/winston/transports/stream.js"(exports2, module2) {
    "use strict";
    var isStream = require_is_stream();
    var { MESSAGE } = require_triple_beam();
    var os = require("os");
    var TransportStream = require_winston_transport();
    module2.exports = class Stream extends TransportStream {
      /**
       * Constructor function for the Console transport object responsible for
       * persisting log messages and metadata to a terminal or TTY.
       * @param {!Object} [options={}] - Options for this instance.
       */
      constructor(options = {}) {
        super(options);
        if (!options.stream || !isStream(options.stream)) {
          throw new Error("options.stream is required.");
        }
        this._stream = options.stream;
        this._stream.setMaxListeners(Infinity);
        this.isObjectMode = options.stream._writableState.objectMode;
        this.eol = typeof options.eol === "string" ? options.eol : os.EOL;
      }
      /**
       * Core logging method exposed to Winston.
       * @param {Object} info - TODO: add param description.
       * @param {Function} callback - TODO: add param description.
       * @returns {undefined}
       */
      log(info, callback) {
        setImmediate(() => this.emit("logged", info));
        if (this.isObjectMode) {
          this._stream.write(info);
          if (callback) {
            callback();
          }
          return;
        }
        this._stream.write(`${info[MESSAGE]}${this.eol}`);
        if (callback) {
          callback();
        }
        return;
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/transports/index.js
var require_transports = __commonJS({
  "../../node_modules/winston/lib/winston/transports/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "Console", {
      configurable: true,
      enumerable: true,
      get() {
        return require_console();
      }
    });
    Object.defineProperty(exports2, "File", {
      configurable: true,
      enumerable: true,
      get() {
        return require_file();
      }
    });
    Object.defineProperty(exports2, "Http", {
      configurable: true,
      enumerable: true,
      get() {
        return require_http();
      }
    });
    Object.defineProperty(exports2, "Stream", {
      configurable: true,
      enumerable: true,
      get() {
        return require_stream3();
      }
    });
  }
});

// ../../node_modules/winston/lib/winston/config/index.js
var require_config2 = __commonJS({
  "../../node_modules/winston/lib/winston/config/index.js"(exports2) {
    "use strict";
    var logform = require_logform();
    var { configs } = require_triple_beam();
    exports2.cli = logform.levels(configs.cli);
    exports2.npm = logform.levels(configs.npm);
    exports2.syslog = logform.levels(configs.syslog);
    exports2.addColors = logform.levels;
  }
});

// ../../node_modules/async/eachOf.js
var require_eachOf = __commonJS({
  "../../node_modules/async/eachOf.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _isArrayLike = require_isArrayLike();
    var _isArrayLike2 = _interopRequireDefault(_isArrayLike);
    var _breakLoop = require_breakLoop();
    var _breakLoop2 = _interopRequireDefault(_breakLoop);
    var _eachOfLimit = require_eachOfLimit2();
    var _eachOfLimit2 = _interopRequireDefault(_eachOfLimit);
    var _once = require_once();
    var _once2 = _interopRequireDefault(_once);
    var _onlyOnce = require_onlyOnce();
    var _onlyOnce2 = _interopRequireDefault(_onlyOnce);
    var _wrapAsync = require_wrapAsync();
    var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
    var _awaitify = require_awaitify();
    var _awaitify2 = _interopRequireDefault(_awaitify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function eachOfArrayLike(coll, iteratee, callback) {
      callback = (0, _once2.default)(callback);
      var index = 0, completed = 0, { length } = coll, canceled = false;
      if (length === 0) {
        callback(null);
      }
      function iteratorCallback(err, value) {
        if (err === false) {
          canceled = true;
        }
        if (canceled === true) return;
        if (err) {
          callback(err);
        } else if (++completed === length || value === _breakLoop2.default) {
          callback(null);
        }
      }
      for (; index < length; index++) {
        iteratee(coll[index], index, (0, _onlyOnce2.default)(iteratorCallback));
      }
    }
    function eachOfGeneric(coll, iteratee, callback) {
      return (0, _eachOfLimit2.default)(coll, Infinity, iteratee, callback);
    }
    function eachOf(coll, iteratee, callback) {
      var eachOfImplementation = (0, _isArrayLike2.default)(coll) ? eachOfArrayLike : eachOfGeneric;
      return eachOfImplementation(coll, (0, _wrapAsync2.default)(iteratee), callback);
    }
    exports2.default = (0, _awaitify2.default)(eachOf, 3);
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/internal/withoutIndex.js
var require_withoutIndex = __commonJS({
  "../../node_modules/async/internal/withoutIndex.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    exports2.default = _withoutIndex;
    function _withoutIndex(iteratee) {
      return (value, index, callback) => iteratee(value, callback);
    }
    module2.exports = exports2.default;
  }
});

// ../../node_modules/async/forEach.js
var require_forEach = __commonJS({
  "../../node_modules/async/forEach.js"(exports2, module2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", {
      value: true
    });
    var _eachOf = require_eachOf();
    var _eachOf2 = _interopRequireDefault(_eachOf);
    var _withoutIndex = require_withoutIndex();
    var _withoutIndex2 = _interopRequireDefault(_withoutIndex);
    var _wrapAsync = require_wrapAsync();
    var _wrapAsync2 = _interopRequireDefault(_wrapAsync);
    var _awaitify = require_awaitify();
    var _awaitify2 = _interopRequireDefault(_awaitify);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function eachLimit(coll, iteratee, callback) {
      return (0, _eachOf2.default)(coll, (0, _withoutIndex2.default)((0, _wrapAsync2.default)(iteratee)), callback);
    }
    exports2.default = (0, _awaitify2.default)(eachLimit, 3);
    module2.exports = exports2.default;
  }
});

// ../../node_modules/fn.name/index.js
var require_fn = __commonJS({
  "../../node_modules/fn.name/index.js"(exports2, module2) {
    "use strict";
    var toString = Object.prototype.toString;
    module2.exports = function name(fn) {
      if ("string" === typeof fn.displayName && fn.constructor.name) {
        return fn.displayName;
      } else if ("string" === typeof fn.name && fn.name) {
        return fn.name;
      }
      if ("object" === typeof fn && fn.constructor && "string" === typeof fn.constructor.name) return fn.constructor.name;
      var named = fn.toString(), type = toString.call(fn).slice(8, -1);
      if ("Function" === type) {
        named = named.substring(named.indexOf("(") + 1, named.indexOf(")"));
      } else {
        named = type;
      }
      return named || "anonymous";
    };
  }
});

// ../../node_modules/one-time/index.js
var require_one_time = __commonJS({
  "../../node_modules/one-time/index.js"(exports2, module2) {
    "use strict";
    var name = require_fn();
    module2.exports = function one(fn) {
      var called = 0, value;
      function onetime() {
        if (called) return value;
        called = 1;
        value = fn.apply(this, arguments);
        fn = null;
        return value;
      }
      onetime.displayName = name(fn);
      return onetime;
    };
  }
});

// ../../node_modules/stack-trace/lib/stack-trace.js
var require_stack_trace = __commonJS({
  "../../node_modules/stack-trace/lib/stack-trace.js"(exports2) {
    exports2.get = function(belowFn) {
      var oldLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = Infinity;
      var dummyObject = {};
      var v8Handler = Error.prepareStackTrace;
      Error.prepareStackTrace = function(dummyObject2, v8StackTrace2) {
        return v8StackTrace2;
      };
      Error.captureStackTrace(dummyObject, belowFn || exports2.get);
      var v8StackTrace = dummyObject.stack;
      Error.prepareStackTrace = v8Handler;
      Error.stackTraceLimit = oldLimit;
      return v8StackTrace;
    };
    exports2.parse = function(err) {
      if (!err.stack) {
        return [];
      }
      var self2 = this;
      var lines = err.stack.split("\n").slice(1);
      return lines.map(function(line) {
        if (line.match(/^\s*[-]{4,}$/)) {
          return self2._createParsedCallSite({
            fileName: line,
            lineNumber: null,
            functionName: null,
            typeName: null,
            methodName: null,
            columnNumber: null,
            "native": null
          });
        }
        var lineMatch = line.match(/at (?:(.+)\s+\()?(?:(.+?):(\d+)(?::(\d+))?|([^)]+))\)?/);
        if (!lineMatch) {
          return;
        }
        var object = null;
        var method = null;
        var functionName = null;
        var typeName = null;
        var methodName = null;
        var isNative = lineMatch[5] === "native";
        if (lineMatch[1]) {
          functionName = lineMatch[1];
          var methodStart = functionName.lastIndexOf(".");
          if (functionName[methodStart - 1] == ".")
            methodStart--;
          if (methodStart > 0) {
            object = functionName.substr(0, methodStart);
            method = functionName.substr(methodStart + 1);
            var objectEnd = object.indexOf(".Module");
            if (objectEnd > 0) {
              functionName = functionName.substr(objectEnd + 1);
              object = object.substr(0, objectEnd);
            }
          }
          typeName = null;
        }
        if (method) {
          typeName = object;
          methodName = method;
        }
        if (method === "<anonymous>") {
          methodName = null;
          functionName = null;
        }
        var properties = {
          fileName: lineMatch[2] || null,
          lineNumber: parseInt(lineMatch[3], 10) || null,
          functionName,
          typeName,
          methodName,
          columnNumber: parseInt(lineMatch[4], 10) || null,
          "native": isNative
        };
        return self2._createParsedCallSite(properties);
      }).filter(function(callSite) {
        return !!callSite;
      });
    };
    function CallSite(properties) {
      for (var property in properties) {
        this[property] = properties[property];
      }
    }
    var strProperties = [
      "this",
      "typeName",
      "functionName",
      "methodName",
      "fileName",
      "lineNumber",
      "columnNumber",
      "function",
      "evalOrigin"
    ];
    var boolProperties = [
      "topLevel",
      "eval",
      "native",
      "constructor"
    ];
    strProperties.forEach(function(property) {
      CallSite.prototype[property] = null;
      CallSite.prototype["get" + property[0].toUpperCase() + property.substr(1)] = function() {
        return this[property];
      };
    });
    boolProperties.forEach(function(property) {
      CallSite.prototype[property] = false;
      CallSite.prototype["is" + property[0].toUpperCase() + property.substr(1)] = function() {
        return this[property];
      };
    });
    exports2._createParsedCallSite = function(properties) {
      return new CallSite(properties);
    };
  }
});

// ../../node_modules/winston/lib/winston/exception-stream.js
var require_exception_stream = __commonJS({
  "../../node_modules/winston/lib/winston/exception-stream.js"(exports2, module2) {
    "use strict";
    var { Writable } = require_readable();
    module2.exports = class ExceptionStream extends Writable {
      /**
       * Constructor function for the ExceptionStream responsible for wrapping a
       * TransportStream; only allowing writes of `info` objects with
       * `info.exception` set to true.
       * @param {!TransportStream} transport - Stream to filter to exceptions
       */
      constructor(transport) {
        super({ objectMode: true });
        if (!transport) {
          throw new Error("ExceptionStream requires a TransportStream instance.");
        }
        this.handleExceptions = true;
        this.transport = transport;
      }
      /**
       * Writes the info object to our transport instance if (and only if) the
       * `exception` property is set on the info.
       * @param {mixed} info - TODO: add param description.
       * @param {mixed} enc - TODO: add param description.
       * @param {mixed} callback - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       * @private
       */
      _write(info, enc, callback) {
        if (info.exception) {
          return this.transport.log(info, callback);
        }
        callback();
        return true;
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/exception-handler.js
var require_exception_handler = __commonJS({
  "../../node_modules/winston/lib/winston/exception-handler.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var asyncForEach = require_forEach();
    var debug = require_node2()("winston:exception");
    var once = require_one_time();
    var stackTrace = require_stack_trace();
    var ExceptionStream = require_exception_stream();
    module2.exports = class ExceptionHandler {
      /**
       * TODO: add contructor description
       * @param {!Logger} logger - TODO: add param description
       */
      constructor(logger) {
        if (!logger) {
          throw new Error("Logger is required to handle exceptions");
        }
        this.logger = logger;
        this.handlers = /* @__PURE__ */ new Map();
      }
      /**
       * Handles `uncaughtException` events for the current process by adding any
       * handlers passed in.
       * @returns {undefined}
       */
      handle(...args) {
        args.forEach((arg) => {
          if (Array.isArray(arg)) {
            return arg.forEach((handler) => this._addHandler(handler));
          }
          this._addHandler(arg);
        });
        if (!this.catcher) {
          this.catcher = this._uncaughtException.bind(this);
          process.on("uncaughtException", this.catcher);
        }
      }
      /**
       * Removes any handlers to `uncaughtException` events for the current
       * process. This does not modify the state of the `this.handlers` set.
       * @returns {undefined}
       */
      unhandle() {
        if (this.catcher) {
          process.removeListener("uncaughtException", this.catcher);
          this.catcher = false;
          Array.from(this.handlers.values()).forEach((wrapper) => this.logger.unpipe(wrapper));
        }
      }
      /**
       * TODO: add method description
       * @param {Error} err - Error to get information about.
       * @returns {mixed} - TODO: add return description.
       */
      getAllInfo(err) {
        let message = null;
        if (err) {
          message = typeof err === "string" ? err : err.message;
        }
        return {
          error: err,
          // TODO (indexzero): how do we configure this?
          level: "error",
          message: [
            `uncaughtException: ${message || "(no error message)"}`,
            err && err.stack || "  No stack trace"
          ].join("\n"),
          stack: err && err.stack,
          exception: true,
          date: (/* @__PURE__ */ new Date()).toString(),
          process: this.getProcessInfo(),
          os: this.getOsInfo(),
          trace: this.getTrace(err)
        };
      }
      /**
       * Gets all relevant process information for the currently running process.
       * @returns {mixed} - TODO: add return description.
       */
      getProcessInfo() {
        return {
          pid: process.pid,
          uid: process.getuid ? process.getuid() : null,
          gid: process.getgid ? process.getgid() : null,
          cwd: process.cwd(),
          execPath: process.execPath,
          version: process.version,
          argv: process.argv,
          memoryUsage: process.memoryUsage()
        };
      }
      /**
       * Gets all relevant OS information for the currently running process.
       * @returns {mixed} - TODO: add return description.
       */
      getOsInfo() {
        return {
          loadavg: os.loadavg(),
          uptime: os.uptime()
        };
      }
      /**
       * Gets a stack trace for the specified error.
       * @param {mixed} err - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       */
      getTrace(err) {
        const trace = err ? stackTrace.parse(err) : stackTrace.get();
        return trace.map((site) => {
          return {
            column: site.getColumnNumber(),
            file: site.getFileName(),
            function: site.getFunctionName(),
            line: site.getLineNumber(),
            method: site.getMethodName(),
            native: site.isNative()
          };
        });
      }
      /**
       * Helper method to add a transport as an exception handler.
       * @param {Transport} handler - The transport to add as an exception handler.
       * @returns {void}
       */
      _addHandler(handler) {
        if (!this.handlers.has(handler)) {
          handler.handleExceptions = true;
          const wrapper = new ExceptionStream(handler);
          this.handlers.set(handler, wrapper);
          this.logger.pipe(wrapper);
        }
      }
      /**
       * Logs all relevant information around the `err` and exits the current
       * process.
       * @param {Error} err - Error to handle
       * @returns {mixed} - TODO: add return description.
       * @private
       */
      _uncaughtException(err) {
        const info = this.getAllInfo(err);
        const handlers = this._getExceptionHandlers();
        let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
        let timeout;
        if (!handlers.length && doExit) {
          console.warn("winston: exitOnError cannot be true with no exception handlers.");
          console.warn("winston: not exiting process.");
          doExit = false;
        }
        function gracefulExit() {
          debug("doExit", doExit);
          debug("process._exiting", process._exiting);
          if (doExit && !process._exiting) {
            if (timeout) {
              clearTimeout(timeout);
            }
            process.exit(1);
          }
        }
        if (!handlers || handlers.length === 0) {
          return process.nextTick(gracefulExit);
        }
        asyncForEach(handlers, (handler, next) => {
          const done = once(next);
          const transport = handler.transport || handler;
          function onDone(event) {
            return () => {
              debug(event);
              done();
            };
          }
          transport._ending = true;
          transport.once("finish", onDone("finished"));
          transport.once("error", onDone("error"));
        }, () => doExit && gracefulExit());
        this.logger.log(info);
        if (doExit) {
          timeout = setTimeout(gracefulExit, 3e3);
        }
      }
      /**
       * Returns the list of transports and exceptionHandlers for this instance.
       * @returns {Array} - List of transports and exceptionHandlers for this
       * instance.
       * @private
       */
      _getExceptionHandlers() {
        return this.logger.transports.filter((wrap) => {
          const transport = wrap.transport || wrap;
          return transport.handleExceptions;
        });
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/rejection-stream.js
var require_rejection_stream = __commonJS({
  "../../node_modules/winston/lib/winston/rejection-stream.js"(exports2, module2) {
    "use strict";
    var { Writable } = require_readable();
    module2.exports = class RejectionStream extends Writable {
      /**
       * Constructor function for the RejectionStream responsible for wrapping a
       * TransportStream; only allowing writes of `info` objects with
       * `info.rejection` set to true.
       * @param {!TransportStream} transport - Stream to filter to rejections
       */
      constructor(transport) {
        super({ objectMode: true });
        if (!transport) {
          throw new Error("RejectionStream requires a TransportStream instance.");
        }
        this.handleRejections = true;
        this.transport = transport;
      }
      /**
       * Writes the info object to our transport instance if (and only if) the
       * `rejection` property is set on the info.
       * @param {mixed} info - TODO: add param description.
       * @param {mixed} enc - TODO: add param description.
       * @param {mixed} callback - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       * @private
       */
      _write(info, enc, callback) {
        if (info.rejection) {
          return this.transport.log(info, callback);
        }
        callback();
        return true;
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/rejection-handler.js
var require_rejection_handler = __commonJS({
  "../../node_modules/winston/lib/winston/rejection-handler.js"(exports2, module2) {
    "use strict";
    var os = require("os");
    var asyncForEach = require_forEach();
    var debug = require_node2()("winston:rejection");
    var once = require_one_time();
    var stackTrace = require_stack_trace();
    var RejectionStream = require_rejection_stream();
    module2.exports = class RejectionHandler {
      /**
       * TODO: add contructor description
       * @param {!Logger} logger - TODO: add param description
       */
      constructor(logger) {
        if (!logger) {
          throw new Error("Logger is required to handle rejections");
        }
        this.logger = logger;
        this.handlers = /* @__PURE__ */ new Map();
      }
      /**
       * Handles `unhandledRejection` events for the current process by adding any
       * handlers passed in.
       * @returns {undefined}
       */
      handle(...args) {
        args.forEach((arg) => {
          if (Array.isArray(arg)) {
            return arg.forEach((handler) => this._addHandler(handler));
          }
          this._addHandler(arg);
        });
        if (!this.catcher) {
          this.catcher = this._unhandledRejection.bind(this);
          process.on("unhandledRejection", this.catcher);
        }
      }
      /**
       * Removes any handlers to `unhandledRejection` events for the current
       * process. This does not modify the state of the `this.handlers` set.
       * @returns {undefined}
       */
      unhandle() {
        if (this.catcher) {
          process.removeListener("unhandledRejection", this.catcher);
          this.catcher = false;
          Array.from(this.handlers.values()).forEach(
            (wrapper) => this.logger.unpipe(wrapper)
          );
        }
      }
      /**
       * TODO: add method description
       * @param {Error} err - Error to get information about.
       * @returns {mixed} - TODO: add return description.
       */
      getAllInfo(err) {
        let message = null;
        if (err) {
          message = typeof err === "string" ? err : err.message;
        }
        return {
          error: err,
          // TODO (indexzero): how do we configure this?
          level: "error",
          message: [
            `unhandledRejection: ${message || "(no error message)"}`,
            err && err.stack || "  No stack trace"
          ].join("\n"),
          stack: err && err.stack,
          rejection: true,
          date: (/* @__PURE__ */ new Date()).toString(),
          process: this.getProcessInfo(),
          os: this.getOsInfo(),
          trace: this.getTrace(err)
        };
      }
      /**
       * Gets all relevant process information for the currently running process.
       * @returns {mixed} - TODO: add return description.
       */
      getProcessInfo() {
        return {
          pid: process.pid,
          uid: process.getuid ? process.getuid() : null,
          gid: process.getgid ? process.getgid() : null,
          cwd: process.cwd(),
          execPath: process.execPath,
          version: process.version,
          argv: process.argv,
          memoryUsage: process.memoryUsage()
        };
      }
      /**
       * Gets all relevant OS information for the currently running process.
       * @returns {mixed} - TODO: add return description.
       */
      getOsInfo() {
        return {
          loadavg: os.loadavg(),
          uptime: os.uptime()
        };
      }
      /**
       * Gets a stack trace for the specified error.
       * @param {mixed} err - TODO: add param description.
       * @returns {mixed} - TODO: add return description.
       */
      getTrace(err) {
        const trace = err ? stackTrace.parse(err) : stackTrace.get();
        return trace.map((site) => {
          return {
            column: site.getColumnNumber(),
            file: site.getFileName(),
            function: site.getFunctionName(),
            line: site.getLineNumber(),
            method: site.getMethodName(),
            native: site.isNative()
          };
        });
      }
      /**
       * Helper method to add a transport as an exception handler.
       * @param {Transport} handler - The transport to add as an exception handler.
       * @returns {void}
       */
      _addHandler(handler) {
        if (!this.handlers.has(handler)) {
          handler.handleRejections = true;
          const wrapper = new RejectionStream(handler);
          this.handlers.set(handler, wrapper);
          this.logger.pipe(wrapper);
        }
      }
      /**
       * Logs all relevant information around the `err` and exits the current
       * process.
       * @param {Error} err - Error to handle
       * @returns {mixed} - TODO: add return description.
       * @private
       */
      _unhandledRejection(err) {
        const info = this.getAllInfo(err);
        const handlers = this._getRejectionHandlers();
        let doExit = typeof this.logger.exitOnError === "function" ? this.logger.exitOnError(err) : this.logger.exitOnError;
        let timeout;
        if (!handlers.length && doExit) {
          console.warn("winston: exitOnError cannot be true with no rejection handlers.");
          console.warn("winston: not exiting process.");
          doExit = false;
        }
        function gracefulExit() {
          debug("doExit", doExit);
          debug("process._exiting", process._exiting);
          if (doExit && !process._exiting) {
            if (timeout) {
              clearTimeout(timeout);
            }
            process.exit(1);
          }
        }
        if (!handlers || handlers.length === 0) {
          return process.nextTick(gracefulExit);
        }
        asyncForEach(
          handlers,
          (handler, next) => {
            const done = once(next);
            const transport = handler.transport || handler;
            function onDone(event) {
              return () => {
                debug(event);
                done();
              };
            }
            transport._ending = true;
            transport.once("finish", onDone("finished"));
            transport.once("error", onDone("error"));
          },
          () => doExit && gracefulExit()
        );
        this.logger.log(info);
        if (doExit) {
          timeout = setTimeout(gracefulExit, 3e3);
        }
      }
      /**
       * Returns the list of transports and exceptionHandlers for this instance.
       * @returns {Array} - List of transports and exceptionHandlers for this
       * instance.
       * @private
       */
      _getRejectionHandlers() {
        return this.logger.transports.filter((wrap) => {
          const transport = wrap.transport || wrap;
          return transport.handleRejections;
        });
      }
    };
  }
});

// ../../node_modules/winston/lib/winston/profiler.js
var require_profiler = __commonJS({
  "../../node_modules/winston/lib/winston/profiler.js"(exports2, module2) {
    "use strict";
    var Profiler = class {
      /**
       * Constructor function for the Profiler instance used by
       * `Logger.prototype.startTimer`. When done is called the timer will finish
       * and log the duration.
       * @param {!Logger} logger - TODO: add param description.
       * @private
       */
      constructor(logger) {
        const Logger2 = require_logger();
        if (typeof logger !== "object" || Array.isArray(logger) || !(logger instanceof Logger2)) {
          throw new Error("Logger is required for profiling");
        } else {
          this.logger = logger;
          this.start = Date.now();
        }
      }
      /**
       * Ends the current timer (i.e. Profiler) instance and logs the `msg` along
       * with the duration since creation.
       * @returns {mixed} - TODO: add return description.
       * @private
       */
      done(...args) {
        if (typeof args[args.length - 1] === "function") {
          console.warn("Callback function no longer supported as of winston@3.0.0");
          args.pop();
        }
        const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
        info.level = info.level || "info";
        info.durationMs = Date.now() - this.start;
        return this.logger.write(info);
      }
    };
    module2.exports = Profiler;
  }
});

// ../../node_modules/winston/lib/winston/logger.js
var require_logger = __commonJS({
  "../../node_modules/winston/lib/winston/logger.js"(exports2, module2) {
    "use strict";
    var { Stream, Transform } = require_readable();
    var asyncForEach = require_forEach();
    var { LEVEL, SPLAT } = require_triple_beam();
    var isStream = require_is_stream();
    var ExceptionHandler = require_exception_handler();
    var RejectionHandler = require_rejection_handler();
    var LegacyTransportStream = require_legacy();
    var Profiler = require_profiler();
    var { warn } = require_common();
    var config = require_config2();
    var formatRegExp = /%[scdjifoO%]/g;
    var Logger2 = class extends Transform {
      /**
       * Constructor function for the Logger object responsible for persisting log
       * messages and metadata to one or more transports.
       * @param {!Object} options - foo
       */
      constructor(options) {
        super({ objectMode: true });
        this.configure(options);
      }
      child(defaultRequestMetadata) {
        const logger = this;
        return Object.create(logger, {
          write: {
            value: function(info) {
              const infoClone = Object.assign(
                {},
                defaultRequestMetadata,
                info
              );
              if (info instanceof Error) {
                infoClone.stack = info.stack;
                infoClone.message = info.message;
              }
              logger.write(infoClone);
            }
          }
        });
      }
      /**
       * This will wholesale reconfigure this instance by:
       * 1. Resetting all transports. Older transports will be removed implicitly.
       * 2. Set all other options including levels, colors, rewriters, filters,
       *    exceptionHandlers, etc.
       * @param {!Object} options - TODO: add param description.
       * @returns {undefined}
       */
      configure({
        silent,
        format,
        defaultMeta,
        levels,
        level = "info",
        exitOnError = true,
        transports,
        colors,
        emitErrs,
        formatters,
        padLevels,
        rewriters,
        stripColors,
        exceptionHandlers,
        rejectionHandlers
      } = {}) {
        if (this.transports.length) {
          this.clear();
        }
        this.silent = silent;
        this.format = format || this.format || require_json()();
        this.defaultMeta = defaultMeta || null;
        this.levels = levels || this.levels || config.npm.levels;
        this.level = level;
        if (this.exceptions) {
          this.exceptions.unhandle();
        }
        if (this.rejections) {
          this.rejections.unhandle();
        }
        this.exceptions = new ExceptionHandler(this);
        this.rejections = new RejectionHandler(this);
        this.profilers = {};
        this.exitOnError = exitOnError;
        if (transports) {
          transports = Array.isArray(transports) ? transports : [transports];
          transports.forEach((transport) => this.add(transport));
        }
        if (colors || emitErrs || formatters || padLevels || rewriters || stripColors) {
          throw new Error(
            [
              "{ colors, emitErrs, formatters, padLevels, rewriters, stripColors } were removed in winston@3.0.0.",
              "Use a custom winston.format(function) instead.",
              "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
            ].join("\n")
          );
        }
        if (exceptionHandlers) {
          this.exceptions.handle(exceptionHandlers);
        }
        if (rejectionHandlers) {
          this.rejections.handle(rejectionHandlers);
        }
      }
      isLevelEnabled(level) {
        const givenLevelValue = getLevelValue(this.levels, level);
        if (givenLevelValue === null) {
          return false;
        }
        const configuredLevelValue = getLevelValue(this.levels, this.level);
        if (configuredLevelValue === null) {
          return false;
        }
        if (!this.transports || this.transports.length === 0) {
          return configuredLevelValue >= givenLevelValue;
        }
        const index = this.transports.findIndex((transport) => {
          let transportLevelValue = getLevelValue(this.levels, transport.level);
          if (transportLevelValue === null) {
            transportLevelValue = configuredLevelValue;
          }
          return transportLevelValue >= givenLevelValue;
        });
        return index !== -1;
      }
      /* eslint-disable valid-jsdoc */
      /**
       * Ensure backwards compatibility with a `log` method
       * @param {mixed} level - Level the log message is written at.
       * @param {mixed} msg - TODO: add param description.
       * @param {mixed} meta - TODO: add param description.
       * @returns {Logger} - TODO: add return description.
       *
       * @example
       *    // Supports the existing API:
       *    logger.log('info', 'Hello world', { custom: true });
       *    logger.log('info', new Error('Yo, it\'s on fire'));
       *
       *    // Requires winston.format.splat()
       *    logger.log('info', '%s %d%%', 'A string', 50, { thisIsMeta: true });
       *
       *    // And the new API with a single JSON literal:
       *    logger.log({ level: 'info', message: 'Hello world', custom: true });
       *    logger.log({ level: 'info', message: new Error('Yo, it\'s on fire') });
       *
       *    // Also requires winston.format.splat()
       *    logger.log({
       *      level: 'info',
       *      message: '%s %d%%',
       *      [SPLAT]: ['A string', 50],
       *      meta: { thisIsMeta: true }
       *    });
       *
       */
      /* eslint-enable valid-jsdoc */
      log(level, msg, ...splat) {
        if (arguments.length === 1) {
          level[LEVEL] = level.level;
          this._addDefaultMeta(level);
          this.write(level);
          return this;
        }
        if (arguments.length === 2) {
          if (msg && typeof msg === "object") {
            msg[LEVEL] = msg.level = level;
            this._addDefaultMeta(msg);
            this.write(msg);
            return this;
          }
          msg = { [LEVEL]: level, level, message: msg };
          this._addDefaultMeta(msg);
          this.write(msg);
          return this;
        }
        const [meta] = splat;
        if (typeof meta === "object" && meta !== null) {
          const tokens = msg && msg.match && msg.match(formatRegExp);
          if (!tokens) {
            const info = Object.assign({}, this.defaultMeta, meta, {
              [LEVEL]: level,
              [SPLAT]: splat,
              level,
              message: msg
            });
            if (meta.message) info.message = `${info.message} ${meta.message}`;
            if (meta.stack) info.stack = meta.stack;
            if (meta.cause) info.cause = meta.cause;
            this.write(info);
            return this;
          }
        }
        this.write(Object.assign({}, this.defaultMeta, {
          [LEVEL]: level,
          [SPLAT]: splat,
          level,
          message: msg
        }));
        return this;
      }
      /**
       * Pushes data so that it can be picked up by all of our pipe targets.
       * @param {mixed} info - TODO: add param description.
       * @param {mixed} enc - TODO: add param description.
       * @param {mixed} callback - Continues stream processing.
       * @returns {undefined}
       * @private
       */
      _transform(info, enc, callback) {
        if (this.silent) {
          return callback();
        }
        if (!info[LEVEL]) {
          info[LEVEL] = info.level;
        }
        if (!this.levels[info[LEVEL]] && this.levels[info[LEVEL]] !== 0) {
          console.error("[winston] Unknown logger level: %s", info[LEVEL]);
        }
        if (!this._readableState.pipes) {
          console.error(
            "[winston] Attempt to write logs with no transports, which can increase memory usage: %j",
            info
          );
        }
        try {
          this.push(this.format.transform(info, this.format.options));
        } finally {
          this._writableState.sync = false;
          callback();
        }
      }
      /**
       * Delays the 'finish' event until all transport pipe targets have
       * also emitted 'finish' or are already finished.
       * @param {mixed} callback - Continues stream processing.
       */
      _final(callback) {
        const transports = this.transports.slice();
        asyncForEach(
          transports,
          (transport, next) => {
            if (!transport || transport.finished) return setImmediate(next);
            transport.once("finish", next);
            transport.end();
          },
          callback
        );
      }
      /**
       * Adds the transport to this logger instance by piping to it.
       * @param {mixed} transport - TODO: add param description.
       * @returns {Logger} - TODO: add return description.
       */
      add(transport) {
        const target = !isStream(transport) || transport.log.length > 2 ? new LegacyTransportStream({ transport }) : transport;
        if (!target._writableState || !target._writableState.objectMode) {
          throw new Error(
            "Transports must WritableStreams in objectMode. Set { objectMode: true }."
          );
        }
        this._onEvent("error", target);
        this._onEvent("warn", target);
        this.pipe(target);
        if (transport.handleExceptions) {
          this.exceptions.handle();
        }
        if (transport.handleRejections) {
          this.rejections.handle();
        }
        return this;
      }
      /**
       * Removes the transport from this logger instance by unpiping from it.
       * @param {mixed} transport - TODO: add param description.
       * @returns {Logger} - TODO: add return description.
       */
      remove(transport) {
        if (!transport) return this;
        let target = transport;
        if (!isStream(transport) || transport.log.length > 2) {
          target = this.transports.filter(
            (match) => match.transport === transport
          )[0];
        }
        if (target) {
          this.unpipe(target);
        }
        return this;
      }
      /**
       * Removes all transports from this logger instance.
       * @returns {Logger} - TODO: add return description.
       */
      clear() {
        this.unpipe();
        return this;
      }
      /**
       * Cleans up resources (streams, event listeners) for all transports
       * associated with this instance (if necessary).
       * @returns {Logger} - TODO: add return description.
       */
      close() {
        this.exceptions.unhandle();
        this.rejections.unhandle();
        this.clear();
        this.emit("close");
        return this;
      }
      /**
       * Sets the `target` levels specified on this instance.
       * @param {Object} Target levels to use on this instance.
       */
      setLevels() {
        warn.deprecated("setLevels");
      }
      /**
       * Queries the all transports for this instance with the specified `options`.
       * This will aggregate each transport's results into one object containing
       * a property per transport.
       * @param {Object} options - Query options for this instance.
       * @param {function} callback - Continuation to respond to when complete.
       */
      query(options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = {};
        }
        options = options || {};
        const results = {};
        const queryObject = Object.assign({}, options.query || {});
        function queryTransport(transport, next) {
          if (options.query && typeof transport.formatQuery === "function") {
            options.query = transport.formatQuery(queryObject);
          }
          transport.query(options, (err, res) => {
            if (err) {
              return next(err);
            }
            if (typeof transport.formatResults === "function") {
              res = transport.formatResults(res, options.format);
            }
            next(null, res);
          });
        }
        function addResults(transport, next) {
          queryTransport(transport, (err, result) => {
            if (next) {
              result = err || result;
              if (result) {
                results[transport.name] = result;
              }
              next();
            }
            next = null;
          });
        }
        asyncForEach(
          this.transports.filter((transport) => !!transport.query),
          addResults,
          () => callback(null, results)
        );
      }
      /**
       * Returns a log stream for all transports. Options object is optional.
       * @param{Object} options={} - Stream options for this instance.
       * @returns {Stream} - TODO: add return description.
       */
      stream(options = {}) {
        const out = new Stream();
        const streams = [];
        out._streams = streams;
        out.destroy = () => {
          let i = streams.length;
          while (i--) {
            streams[i].destroy();
          }
        };
        this.transports.filter((transport) => !!transport.stream).forEach((transport) => {
          const str = transport.stream(options);
          if (!str) {
            return;
          }
          streams.push(str);
          str.on("log", (log) => {
            log.transport = log.transport || [];
            log.transport.push(transport.name);
            out.emit("log", log);
          });
          str.on("error", (err) => {
            err.transport = err.transport || [];
            err.transport.push(transport.name);
            out.emit("error", err);
          });
        });
        return out;
      }
      /**
       * Returns an object corresponding to a specific timing. When done is called
       * the timer will finish and log the duration. e.g.:
       * @returns {Profile} - TODO: add return description.
       * @example
       *    const timer = winston.startTimer()
       *    setTimeout(() => {
       *      timer.done({
       *        message: 'Logging message'
       *      });
       *    }, 1000);
       */
      startTimer() {
        return new Profiler(this);
      }
      /**
       * Tracks the time inbetween subsequent calls to this method with the same
       * `id` parameter. The second call to this method will log the difference in
       * milliseconds along with the message.
       * @param {string} id Unique id of the profiler
       * @returns {Logger} - TODO: add return description.
       */
      profile(id, ...args) {
        const time = Date.now();
        if (this.profilers[id]) {
          const timeEnd = this.profilers[id];
          delete this.profilers[id];
          if (typeof args[args.length - 2] === "function") {
            console.warn(
              "Callback function no longer supported as of winston@3.0.0"
            );
            args.pop();
          }
          const info = typeof args[args.length - 1] === "object" ? args.pop() : {};
          info.level = info.level || "info";
          info.durationMs = time - timeEnd;
          info.message = info.message || id;
          return this.write(info);
        }
        this.profilers[id] = time;
        return this;
      }
      /**
       * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
       * @returns {undefined}
       * @deprecated
       */
      handleExceptions(...args) {
        console.warn(
          "Deprecated: .handleExceptions() will be removed in winston@4. Use .exceptions.handle()"
        );
        this.exceptions.handle(...args);
      }
      /**
       * Backwards compatibility to `exceptions.handle` in winston < 3.0.0.
       * @returns {undefined}
       * @deprecated
       */
      unhandleExceptions(...args) {
        console.warn(
          "Deprecated: .unhandleExceptions() will be removed in winston@4. Use .exceptions.unhandle()"
        );
        this.exceptions.unhandle(...args);
      }
      /**
       * Throw a more meaningful deprecation notice
       * @throws {Error} - TODO: add throws description.
       */
      cli() {
        throw new Error(
          [
            "Logger.cli() was removed in winston@3.0.0",
            "Use a custom winston.formats.cli() instead.",
            "See: https://github.com/winstonjs/winston/tree/master/UPGRADE-3.0.md"
          ].join("\n")
        );
      }
      /**
       * Bubbles the `event` that occured on the specified `transport` up
       * from this instance.
       * @param {string} event - The event that occured
       * @param {Object} transport - Transport on which the event occured
       * @private
       */
      _onEvent(event, transport) {
        function transportEvent(err) {
          if (event === "error" && !this.transports.includes(transport)) {
            this.add(transport);
          }
          this.emit(event, err, transport);
        }
        if (!transport["__winston" + event]) {
          transport["__winston" + event] = transportEvent.bind(this);
          transport.on(event, transport["__winston" + event]);
        }
      }
      _addDefaultMeta(msg) {
        if (this.defaultMeta) {
          Object.assign(msg, this.defaultMeta);
        }
      }
    };
    function getLevelValue(levels, level) {
      const value = levels[level];
      if (!value && value !== 0) {
        return null;
      }
      return value;
    }
    Object.defineProperty(Logger2.prototype, "transports", {
      configurable: false,
      enumerable: true,
      get() {
        const { pipes } = this._readableState;
        return !Array.isArray(pipes) ? [pipes].filter(Boolean) : pipes;
      }
    });
    module2.exports = Logger2;
  }
});

// ../../node_modules/winston/lib/winston/create-logger.js
var require_create_logger = __commonJS({
  "../../node_modules/winston/lib/winston/create-logger.js"(exports2, module2) {
    "use strict";
    var { LEVEL } = require_triple_beam();
    var config = require_config2();
    var Logger2 = require_logger();
    var debug = require_node2()("winston:create-logger");
    function isLevelEnabledFunctionName(level) {
      return "is" + level.charAt(0).toUpperCase() + level.slice(1) + "Enabled";
    }
    module2.exports = function(opts = {}) {
      opts.levels = opts.levels || config.npm.levels;
      class DerivedLogger extends Logger2 {
        /**
         * Create a new class derived logger for which the levels can be attached to
         * the prototype of. This is a V8 optimization that is well know to increase
         * performance of prototype functions.
         * @param {!Object} options - Options for the created logger.
         */
        constructor(options) {
          super(options);
        }
      }
      const logger = new DerivedLogger(opts);
      Object.keys(opts.levels).forEach(function(level) {
        debug('Define prototype method for "%s"', level);
        if (level === "log") {
          console.warn('Level "log" not defined: conflicts with the method "log". Use a different level name.');
          return;
        }
        DerivedLogger.prototype[level] = function(...args) {
          const self2 = this || logger;
          if (args.length === 1) {
            const [msg] = args;
            const info = msg && msg.message && msg || { message: msg };
            info.level = info[LEVEL] = level;
            self2._addDefaultMeta(info);
            self2.write(info);
            return this || logger;
          }
          if (args.length === 0) {
            self2.log(level, "");
            return self2;
          }
          return self2.log(level, ...args);
        };
        DerivedLogger.prototype[isLevelEnabledFunctionName(level)] = function() {
          return (this || logger).isLevelEnabled(level);
        };
      });
      return logger;
    };
  }
});

// ../../node_modules/winston/lib/winston/container.js
var require_container = __commonJS({
  "../../node_modules/winston/lib/winston/container.js"(exports2, module2) {
    "use strict";
    var createLogger = require_create_logger();
    module2.exports = class Container {
      /**
       * Constructor function for the Container object responsible for managing a
       * set of `winston.Logger` instances based on string ids.
       * @param {!Object} [options={}] - Default pass-thru options for Loggers.
       */
      constructor(options = {}) {
        this.loggers = /* @__PURE__ */ new Map();
        this.options = options;
      }
      /**
       * Retrieves a `winston.Logger` instance for the specified `id`. If an
       * instance does not exist, one is created.
       * @param {!string} id - The id of the Logger to get.
       * @param {?Object} [options] - Options for the Logger instance.
       * @returns {Logger} - A configured Logger instance with a specified id.
       */
      add(id, options) {
        if (!this.loggers.has(id)) {
          options = Object.assign({}, options || this.options);
          const existing = options.transports || this.options.transports;
          if (existing) {
            options.transports = Array.isArray(existing) ? existing.slice() : [existing];
          } else {
            options.transports = [];
          }
          const logger = createLogger(options);
          logger.on("close", () => this._delete(id));
          this.loggers.set(id, logger);
        }
        return this.loggers.get(id);
      }
      /**
       * Retreives a `winston.Logger` instance for the specified `id`. If
       * an instance does not exist, one is created.
       * @param {!string} id - The id of the Logger to get.
       * @param {?Object} [options] - Options for the Logger instance.
       * @returns {Logger} - A configured Logger instance with a specified id.
       */
      get(id, options) {
        return this.add(id, options);
      }
      /**
       * Check if the container has a logger with the id.
       * @param {?string} id - The id of the Logger instance to find.
       * @returns {boolean} - Boolean value indicating if this instance has a
       * logger with the specified `id`.
       */
      has(id) {
        return !!this.loggers.has(id);
      }
      /**
       * Closes a `Logger` instance with the specified `id` if it exists.
       * If no `id` is supplied then all Loggers are closed.
       * @param {?string} id - The id of the Logger instance to close.
       * @returns {undefined}
       */
      close(id) {
        if (id) {
          return this._removeLogger(id);
        }
        this.loggers.forEach((val, key) => this._removeLogger(key));
      }
      /**
       * Remove a logger based on the id.
       * @param {!string} id - The id of the logger to remove.
       * @returns {undefined}
       * @private
       */
      _removeLogger(id) {
        if (!this.loggers.has(id)) {
          return;
        }
        const logger = this.loggers.get(id);
        logger.close();
        this._delete(id);
      }
      /**
       * Deletes a `Logger` instance with the specified `id`.
       * @param {!string} id - The id of the Logger instance to delete from
       * container.
       * @returns {undefined}
       * @private
       */
      _delete(id) {
        this.loggers.delete(id);
      }
    };
  }
});

// ../../node_modules/winston/lib/winston.js
var require_winston = __commonJS({
  "../../node_modules/winston/lib/winston.js"(exports2) {
    "use strict";
    var logform = require_logform();
    var { warn } = require_common();
    exports2.version = require_package().version;
    exports2.transports = require_transports();
    exports2.config = require_config2();
    exports2.addColors = logform.levels;
    exports2.format = logform.format;
    exports2.createLogger = require_create_logger();
    exports2.Logger = require_logger();
    exports2.ExceptionHandler = require_exception_handler();
    exports2.RejectionHandler = require_rejection_handler();
    exports2.Container = require_container();
    exports2.Transport = require_winston_transport();
    exports2.loggers = new exports2.Container();
    var defaultLogger = exports2.createLogger();
    Object.keys(exports2.config.npm.levels).concat([
      "log",
      "query",
      "stream",
      "add",
      "remove",
      "clear",
      "profile",
      "startTimer",
      "handleExceptions",
      "unhandleExceptions",
      "handleRejections",
      "unhandleRejections",
      "configure",
      "child"
    ]).forEach(
      (method) => exports2[method] = (...args) => defaultLogger[method](...args)
    );
    Object.defineProperty(exports2, "level", {
      get() {
        return defaultLogger.level;
      },
      set(val) {
        defaultLogger.level = val;
      }
    });
    Object.defineProperty(exports2, "exceptions", {
      get() {
        return defaultLogger.exceptions;
      }
    });
    Object.defineProperty(exports2, "rejections", {
      get() {
        return defaultLogger.rejections;
      }
    });
    ["exitOnError"].forEach((prop) => {
      Object.defineProperty(exports2, prop, {
        get() {
          return defaultLogger[prop];
        },
        set(val) {
          defaultLogger[prop] = val;
        }
      });
    });
    Object.defineProperty(exports2, "default", {
      get() {
        return {
          exceptionHandlers: defaultLogger.exceptionHandlers,
          rejectionHandlers: defaultLogger.rejectionHandlers,
          transports: defaultLogger.transports
        };
      }
    });
    warn.deprecated(exports2, "setLevels");
    warn.forFunctions(exports2, "useFormat", ["cli"]);
    warn.forProperties(exports2, "useFormat", ["padLevels", "stripColors"]);
    warn.forFunctions(exports2, "deprecated", [
      "addRewriter",
      "addFilter",
      "clone",
      "extend"
    ]);
    warn.forProperties(exports2, "deprecated", ["emitErrs", "levelLength"]);
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_LOGIC_COMPONENTS: () => DATASOURCE_LOGIC_COMPONENTS
});
module.exports = __toCommonJS(index_exports);

// ../datasource-types/dist/index.mjs
var DATASOURCE_TYPES = {
  POSTGRESQL: {
    name: "PostgreSQL",
    value: "postgresql"
  },
  MYSQL: {
    name: "MySQL",
    value: "mysql"
  },
  MSSQL: {
    name: "MSSQL",
    value: "mssql"
  },
  RESTAPI: {
    name: "REST API",
    value: "restapi"
  }
};

// ../../node_modules/pg/esm/index.mjs
var import_lib = __toESM(require_lib2(), 1);
var Client = import_lib.default.Client;
var Pool = import_lib.default.Pool;
var Connection = import_lib.default.Connection;
var types = import_lib.default.types;
var Query = import_lib.default.Query;
var DatabaseError = import_lib.default.DatabaseError;
var escapeIdentifier = import_lib.default.escapeIdentifier;
var escapeLiteral = import_lib.default.escapeLiteral;
var Result = import_lib.default.Result;
var TypeOverrides = import_lib.default.TypeOverrides;
var defaults = import_lib.default.defaults;

// src/config/winston.config.js
var winston = require_winston();
var appLogLevels = {
  levels: {
    error: 2,
    warning: 3,
    success: 4,
    info: 5
  },
  colors: {
    error: "red",
    warning: "yellow",
    success: "green",
    info: "cyan"
  }
};
winston.addColors(appLogLevels.colors);
var logFormatLogFormat = winston.format((info) => {
  const { message } = info;
  if (info.data) {
    info.message = `${message} |====| ${JSON.stringify(info.data)}`;
    delete info.data;
  }
  return info;
})();
var winstonLogger = winston.createLogger({
  levels: appLogLevels.levels,
  format: winston.format.combine(
    winston.format.colorize({
      all: true
    }),
    winston.format.label({
      label: "package:datasources"
    }),
    winston.format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss"
    }),
    logFormatLogFormat,
    winston.format.printf(
      (info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// src/utils/logger.js
var logLevels = Object.freeze({
  info: "info",
  error: "error",
  success: "success",
  warning: "warning"
});
var Logger = class {
  static pageLogger = (page, obj) => {
    obj ? console.log(`-----> : ${page} |=====|`, obj) : console.log(`-----> : ${page}`);
  };
  /**
   *
   * @param {('info'|'error'|'success'|'warning')} status
   * @param {*} param1
   */
  static log = (status = "info", { message, params }) => {
    try {
      const statusArray = String(status).split(":");
      statusArray.forEach((s) => {
        if (s === logLevels.error) {
          console.log(s, message, params);
        }
        switch (s.toLowerCase()) {
          case logLevels.info: {
            winstonLogger.info(message, { data: params });
            break;
          }
          case logLevels.success: {
            winstonLogger.success(message, { data: params });
            break;
          }
          case logLevels.warning: {
            winstonLogger.warning(message, { data: params });
            break;
          }
          case logLevels.error: {
            winstonLogger.error(message, { data: params });
            break;
          }
          default: {
            winstonLogger.error("log level error", {
              data: { s, message, ...params }
            });
            break;
          }
        }
      });
    } catch (error) {
    }
  };
};

// src/components/postgresql/logic/connection.js
var testConnection = async ({ connectionString, connectionData }) => {
  try {
    Logger.log("info", {
      message: "postgresql:testConnection:params",
      params: { connectionString, connectionData }
    });
    const client = connectionString ? new Client(connectionString) : new Client({
      host: connectionData.host,
      port: connectionData.port,
      database: connectionData.database,
      user: connectionData.user,
      password: connectionData.password
    });
    await client.connect();
    Logger.log("info", {
      message: "postgresql:testConnection:connected",
      params: { connectionString, connectionData }
    });
    await client.end();
    Logger.log("info", {
      message: "postgresql:testConnection:disconnected",
      params: { connectionString, connectionData }
    });
    return true;
  } catch (error) {
    Logger.log("error", {
      message: "postgresql:testConnection:catch-1",
      params: { error }
    });
    return false;
  }
};

// src/index.js
var DATASOURCE_LOGIC_COMPONENTS = {
  [DATASOURCE_TYPES.POSTGRESQL.value]: {
    testConnection: async ({ datasourceOptions }) => {
      return await testConnection({
        connectionString: datasourceOptions.connectionString,
        connectionData: {
          host: datasourceOptions.host,
          port: datasourceOptions.port,
          database: datasourceOptions.database,
          user: datasourceOptions.user,
          password: datasourceOptions.password
        }
      });
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DATASOURCE_LOGIC_COMPONENTS
});
/*! Bundled license information:

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=index.cjs.map
