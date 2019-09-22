"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _debug = _interopRequireDefault(require("debug"));

var _nodejsBase = require("nodejs-base64");

var debug = (0, _debug["default"])('mailcheck-RegExp');

_bluebird["default"].config({
  cancellation: true
});

var regexpChecker = function regexpChecker(incoming) {
  var memoryCache = incoming.memoryCache,
      email = incoming.email,
      mode = incoming.mode,
      tests = incoming.tests;
  var base64Key = (0, _nodejsBase.base64encode)("".concat(email, "*").concat(mode, "*regexp"));
  var cachedResult = memoryCache.get(base64Key);

  if (cachedResult) {
    debug("Checking address: ".concat(email, " in ").concat(mode, " mode from cache"));
    tests.push('regexp');

    var _retval = Object.assign({}, incoming, {
      valid: true,
      localPart: cachedResult[1],
      domain: cachedResult[5],
      step: incoming.step + 1,
      tests: tests,
      lastTest: 'regexp'
    });

    return _bluebird["default"].resolve(_retval);
  }

  debug("Checking address: ".concat(email, " in ").concat(mode, " mode"));
  /*
  This regexp was blatantly stolen from: https://emailregex.com/
  I hope you don't mind...
  Creating such a RegExp from zero would result in either:
    1- one week work!
    2- a much worse result!
  */

  var regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var match = email.match(regexp);

  if (!match) {
    throw new Error('Email address is syntactically invalid.');
  }

  tests.push('regexp');
  var retval = Object.assign({}, incoming, {
    valid: true,
    localPart: match[1],
    domain: match[5],
    step: incoming.step + 1,
    lastTest: 'regexp',
    tests: tests
  });
  /* Cache for a long time: this result cannot change! */

  memoryCache.put(base64Key, match, 24 * 60 * 60 * 1000);
  return _bluebird["default"].resolve(retval);
};

var _default = regexpChecker;
exports["default"] = _default;