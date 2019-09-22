"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _bluebird = _interopRequireDefault(require("bluebird"));

var _uniqid = _interopRequireDefault(require("uniqid"));

var _express = require("express");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _debug = _interopRequireDefault(require("debug"));

var _libs = require("../../libs");

_bluebird["default"].config({
  cancellation: true
});

var debug = (0, _debug["default"])('mailcheck-check');
var router = new _express.Router();
router.post('/', _bodyParser["default"].urlencoded({
  extended: true
}), _bodyParser["default"].json(), function (req, res, next) {
  var _req$body = req.body,
      _req$body$email = _req$body.email,
      email = _req$body$email === void 0 ? null : _req$body$email,
      _req$body$mode = _req$body.mode,
      mode = _req$body$mode === void 0 ? 'default' : _req$body$mode;
  var validModes = ['basic', 'default', 'extended'];

  if (!email || validModes.indexOf(mode) < 0) {
    next();
    return;
  }

  var memoryCache = req.memoryCache;
  var incoming = {
    email: email,
    tests: [],
    mode: mode,
    step: 0,
    memoryCache: memoryCache,
    guessedFirstName: '',
    guessedLastName: ''
  };
  var uniqueId = (0, _uniqid["default"])();
  debug("Email to check: ".concat(email, " in mode ").concat(mode));

  var process = _bluebird["default"].resolve(incoming).then(function (v) {
    if (mode !== 'basic') {
      memoryCache.put("".concat(uniqueId, "*queue"), 'pending', 500 * 1000);
      res.json({
        queued: true,
        queueid: uniqueId
      });
    }

    return v;
  }).then(function (v) {
    return (0, _libs.regexpChecker)(v);
  })["catch"](function (e) {
    debug('Trapped error', e);
    res.json((0, _libs.jsonReply)({
      email: email,
      step: 0,
      tests: ['regexp'],
      valid: false
    }));
    return process.cancel();
  }).then(function (v) {
    return (0, _libs.guessPersonalData)(v);
  }) // Basic Mode ends here
  .then(function (v) {
    return ['extended', 'default'].indexOf(mode) > -1 ? (0, _libs.mxCheck)(v) : v;
  })["catch"](function (e) {
    debug('Trapped error', e);
    memoryCache.put("".concat(uniqueId, "*queue"), (0, _libs.jsonReply)({
      email: email,
      step: 0,
      tests: ['regexp', 'mx'],
      valid: false
    }), 500 * 1000);
    return process.cancel();
  }) // Default Mode ends here
  .then(function (v) {
    return ['extended', 'default'].indexOf(mode) > -1 ? (0, _libs.rcptCheck)(v) : v;
  })["catch"](function (e) {
    debug('Trapped error', e);
    var msg = e.message;
    debug('MSG', msg, msg === 'Unable to connect to any of the delegated exchange servers.');

    if (msg === 'Unable to connect to any of the delegated exchange servers.') {
      memoryCache.put("".concat(uniqueId, "*queue"), (0, _libs.jsonReply)({
        email: email,
        step: 2,
        // Adjust to 2, since we did not connect at all! So maybe it's a network issue
        tests: ['regexp', 'mx', 'catchall', 'rcpt'],
        valid: false
      }), 500 * 1000);
    } else {
      memoryCache.put("".concat(uniqueId, "*queue"), (0, _libs.jsonReply)({
        email: email,
        step: 0,
        // No reason to tell it was 1... if rcpt fails,  no chance the email is valid!
        tests: ['regexp', 'mx', 'catchall', 'rcpt'],
        valid: false
      }), 500 * 1000);
    }

    return process.cancel();
  }).then(function (v) {
    return ['extended'].indexOf(mode) > -1 ? (0, _libs.googleCheck)(v) : v;
  }).then(function (v) {
    if (mode === 'basic') {
      res.json((0, _libs.jsonReply)(v));
    } else {
      debug("Saving result in queue id ".concat(uniqueId));
      memoryCache.put("".concat(uniqueId, "*queue"), (0, _libs.jsonReply)(v), 500 * 1000);
    }
  });
});
var _default = router;
exports["default"] = _default;