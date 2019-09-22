"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _dns = require("dns");

var _debug = _interopRequireDefault(require("debug"));

var _nodejsBase = require("nodejs-base64");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

_bluebird["default"].config({
  cancellation: true
});

var debug = (0, _debug["default"])('mailcheck-mx');
var DNSResolver = _dns.promises.Resolver;
var resolver = new DNSResolver();
/*
  There's not point in evaluating other MX server than the one with best (lowest) priority.
  Secondary MX servers are usually configured to relay ALL messages for a certain domain
  without any knowledge of the real users!
*/

var getBestMx = function getBestMx(mx) {
  var bestMx = mx.reduce(function (prev, curr) {
    if (!prev) {
      return curr;
    }

    if (curr.priority < prev.priority) {
      return curr;
    }

    return prev;
  }, null);

  if (bestMx) {
    return _bluebird["default"].resolve(bestMx.exchange);
  }

  throw new Error('Unable to find a valid MX record');
};

var _default = function _default(incoming) {
  var domain = incoming.domain,
      memoryCache = incoming.memoryCache,
      step = incoming.step,
      tests = incoming.tests;
  var base64Key = (0, _nodejsBase.base64encode)("".concat(domain, "*mxrecord"));
  /* Return value from cache */

  var cachedResult = memoryCache.get(base64Key);

  if (cachedResult) {
    tests.push('mx');

    var retval = _objectSpread({}, incoming, {
      tests: tests,
      lastTest: 'mx',
      step: step + 1,
      mailServers: cachedResult
    });

    debug("Checking mx record for domain ".concat(domain, " from cache"));
    return _bluebird["default"].resolve(retval);
  }
  /* Do live check */


  debug("Checking mx record for domain ".concat(domain));
  return resolver.resolve(domain, 'MX').then(function (mxs) {
    return getBestMx(mxs);
  }).then(function (mx) {
    return resolver.resolve(mx);
  }).then(function (ipaddresses) {
    tests.push('mx');

    var retval = _objectSpread({}, incoming, {
      tests: tests,
      step: step + 1,
      lastTest: 'mx',
      mailServers: ipaddresses
    });
    /* Ideally this timeout should match the DNS record timeout, but
    unfortunately the TTL does not come from the resolver library, so
    it would take either a rewrite or a second DNS request, which is probably
    beyond the scope of this service. Let's use a 1 hour default instead */


    memoryCache.put(base64Key, ipaddresses, 60 * 60 * 1000);
    return _bluebird["default"].resolve(retval);
  })["catch"](function (e) {
    debug('Internal Error', e);
    throw new Error("No mail server found for domain ".concat(domain, "!"));
  });
};

exports["default"] = _default;