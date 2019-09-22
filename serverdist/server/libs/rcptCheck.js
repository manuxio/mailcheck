"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _faker = _interopRequireDefault(require("faker"));

var _smtpClient = require("smtp-client");

var _debug = _interopRequireDefault(require("debug"));

var _nodejsBase = require("nodejs-base64");

var _config = _interopRequireDefault(require("../../config.json"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

_bluebird["default"].config({
  cancellation: true
});

var debug = (0, _debug["default"])('mailcheck-rcpt');

var getRandomArbitrary = function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
};
/*
  To quickly reply to your question, I believe testing the catch-all before the
  real address has to be done (if cached somehow) because the following
  scenarios can happen:

  a) local-part accepted: need to check for catchall catchall
  b) local-part not accepted: no need to check catchall
  c) catch-all present: no need to check for local-part

  The odds are positive if we run a cache engine.
*/


var _default =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee3(incoming) {
    var domain, mailServers, memoryCache, step, email, tests, base64Key, hasCatchAll, fakeAddress, _tmpCompleted, tmpCatchAllResults, retval, tmpCompleted, tmpMailboxResults, mailboxValid, _retval;

    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            domain = incoming.domain, mailServers = incoming.mailServers, memoryCache = incoming.memoryCache, step = incoming.step, email = incoming.email, tests = incoming.tests;
            base64Key = (0, _nodejsBase.base64encode)("".concat(domain, "*catchall"));
            /* Return value from cache */

            hasCatchAll = memoryCache.get(base64Key);

            if (!(hasCatchAll === null)) {
              _context3.next = 11;
              break;
            }

            /* Do live check */
            fakeAddress = "".concat(_faker["default"].internet.email().split('@')[0], ".").concat(getRandomArbitrary(100, 999), "@").concat(domain);
            debug("Checking catch-all for domain ".concat(domain, " with servers ").concat(mailServers.join(','), ". Fake address: ").concat(fakeAddress));
            _context3.next = 8;
            return _bluebird["default"].mapSeries(mailServers,
            /*#__PURE__*/
            function () {
              var _ref2 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee(host) {
                var s, passedConnect;
                return _regenerator["default"].wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!_tmpCompleted) {
                          _context.next = 2;
                          break;
                        }

                        return _context.abrupt("return", undefined);

                      case 2:
                        debug("Testing server ".concat(host, " for user ").concat(fakeAddress));
                        s = new _smtpClient.SMTPClient({
                          host: host,
                          port: 25
                        });
                        _context.prev = 4;
                        debug("Connecting to ".concat(host));
                        _context.next = 8;
                        return s.connect();

                      case 8:
                        debug("Greeting as ".concat(_config["default"].helo, " to ").concat(host));
                        _context.next = 11;
                        return s.greet({
                          hostname: _config["default"].helo
                        });

                      case 11:
                        debug("Announcing from as ".concat(_config["default"].testMailFrom, " to ").concat(host));
                        _context.next = 14;
                        return s.mail({
                          from: _config["default"].testMailFrom
                        });

                      case 14:
                        debug("Announcing rcpt as ".concat(fakeAddress, " to ").concat(host));
                        passedConnect = true;
                        _context.next = 18;
                        return s.rcpt({
                          to: fakeAddress
                        });

                      case 18:
                        _context.next = 20;
                        return s.quit();

                      case 20:
                        _tmpCompleted = true;
                        return _context.abrupt("return", true);

                      case 24:
                        _context.prev = 24;
                        _context.t0 = _context["catch"](4);
                        debug('Got an error', _context.t0);

                        if (!passedConnect) {
                          _context.next = 29;
                          break;
                        }

                        return _context.abrupt("return", false);

                      case 29:
                        return _context.abrupt("return", null);

                      case 30:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, null, [[4, 24]]);
              }));

              return function (_x2) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 8:
            tmpCatchAllResults = _context3.sent;
            hasCatchAll = tmpCatchAllResults.reduce(function (prev, curr) {
              if (prev === null) {
                return prev;
              }

              return prev || curr;
            } // Reduce to "true" if available, "false" otherwise
            ); // Cache results for 24 hours...

            memoryCache.put(base64Key, hasCatchAll, 24 * 60 * 60 * 1000);

          case 11:
            if (hasCatchAll === true || hasCatchAll === false) {
              if (hasCatchAll) {
                debug("Domain ".concat(domain, " has a catch-all mailbox!"));
              } else {
                debug("Domain ".concat(domain, " has a NO catch-all mailbox!"));
              }
            } else {
              debug("Unsure if domain ".concat(domain, " has a catch-all mailbox!"));
            }

            if (!(hasCatchAll === true)) {
              _context3.next = 17;
              break;
            }

            tests.push('catchall');
            tests.push('rcpt'); // Ok, we have a catch all, no need to check real address - useless!

            retval = _objectSpread({}, incoming, {
              step: step + 1,
              uncertain: true,
              lastTest: 'rcpt'
            });
            /* Should we cache the results? Probably in a professional service yes... */

            return _context3.abrupt("return", _bluebird["default"].resolve(retval));

          case 17:
            tmpCompleted = false;
            _context3.next = 20;
            return _bluebird["default"].mapSeries(mailServers,
            /*#__PURE__*/
            function () {
              var _ref3 = (0, _asyncToGenerator2["default"])(
              /*#__PURE__*/
              _regenerator["default"].mark(function _callee2(host) {
                var s, passedConnect;
                return _regenerator["default"].wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        if (!tmpCompleted) {
                          _context2.next = 2;
                          break;
                        }

                        return _context2.abrupt("return", undefined);

                      case 2:
                        debug("Testing server ".concat(host, " for mailbox ").concat(email));
                        s = new _smtpClient.SMTPClient({
                          host: host,
                          port: 25
                        });
                        _context2.prev = 4;
                        debug("Connecting to ".concat(host));
                        _context2.next = 8;
                        return s.connect();

                      case 8:
                        debug("Greeting as ".concat(_config["default"].helo, " to ").concat(host));
                        _context2.next = 11;
                        return s.greet({
                          hostname: _config["default"].helo
                        });

                      case 11:
                        debug("Announcing from as ".concat(_config["default"].testMailFrom, " to ").concat(host));
                        _context2.next = 14;
                        return s.mail({
                          from: _config["default"].testMailFrom
                        });

                      case 14:
                        debug("Announcing rcpt as ".concat(email, " to ").concat(host));
                        passedConnect = true;
                        _context2.next = 18;
                        return s.rcpt({
                          to: email
                        });

                      case 18:
                        _context2.next = 20;
                        return s.quit();

                      case 20:
                        tmpCompleted = true;
                        return _context2.abrupt("return", true);

                      case 24:
                        _context2.prev = 24;
                        _context2.t0 = _context2["catch"](4);
                        debug('Got an error', _context2.t0);

                        if (!passedConnect) {
                          _context2.next = 29;
                          break;
                        }

                        return _context2.abrupt("return", false);

                      case 29:
                        return _context2.abrupt("return", null);

                      case 30:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[4, 24]]);
              }));

              return function (_x3) {
                return _ref3.apply(this, arguments);
              };
            }());

          case 20:
            tmpMailboxResults = _context3.sent;
            mailboxValid = tmpMailboxResults.reduce(function (prev, curr) {
              if (prev === null) {
                return prev;
              }

              return prev || curr;
            } // Reduce to "true" if available, "false" otherwise
            );

            if (!mailboxValid) {
              _context3.next = 27;
              break;
            }

            tests.push('catchall');
            tests.push('rcpt');
            _retval = _objectSpread({}, incoming, {
              step: step + 2,
              tests: tests,
              lastTest: 'rcpt',
              valid: true
            });
            /* Should we cache the results? Probably in a professional service yes... */

            return _context3.abrupt("return", _bluebird["default"].resolve(_retval));

          case 27:
            if (!(mailboxValid === null)) {
              _context3.next = 29;
              break;
            }

            throw new Error('Unable to connect to any of the delegated exchange servers.');

          case 29:
            throw new Error('Email address does not exist.');

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;