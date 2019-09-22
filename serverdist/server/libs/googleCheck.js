"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _googleapis = require("googleapis");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _debug = _interopRequireDefault(require("debug"));

var _nodejsBase = require("nodejs-base64");

var _config = _interopRequireDefault(require("../../config.json"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var customsearch = _googleapis.google.customsearch('v1');

_bluebird["default"].config({
  cancellation: true
});

var debug = (0, _debug["default"])('mailcheck-google');

var uppercaseFirstLetter = function uppercaseFirstLetter(str) {
  return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}; // eslint-disable-line


var _default =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(incoming) {
    var memoryCache, step, email, tests, guessedLastName, guessedFirstName, base64Key, hasResults, snippetsAsText, firstpart, words;
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            memoryCache = incoming.memoryCache, step = incoming.step, email = incoming.email, tests = incoming.tests, guessedLastName = incoming.guessedLastName;
            guessedFirstName = incoming.guessedFirstName;
            base64Key = (0, _nodejsBase.base64encode)("".concat(email, "*google*cse"));
            tests.push('google');
            /* Return value from cache */

            hasResults = memoryCache.get(base64Key);

            if (hasResults) {
              _context.next = 7;
              break;
            }

            return _context.abrupt("return", customsearch.cse.list({
              auth: _config["default"].googleCse,
              cx: _config["default"].googleCtx,
              q: "\"".concat(email, "\"")
            }).then(function (result) {
              return result.data;
            }).then(function (result) {
              var items = result.items;

              if (items && items.length > 0) {
                debug("Got ".concat(items.length, " google results for ").concat(email));
                memoryCache.put(base64Key, items);
                /*
                This is very very experimental!
                */

                if (guessedFirstName.length < 2 && guessedLastName.length > 0) {
                  var snippetsAsText = items.reduce(function (prev, curr) {
                    return "".concat(prev, " ").concat(curr.title, " ").concat(curr.snippet);
                  }, '');
                  debug('snippetsAsText', snippetsAsText.replace(/\./g, ' '));
                  var firstpart = snippetsAsText.replace(/\./g, ' ').toLowerCase().split(guessedLastName.toLowerCase())[0];

                  if (firstpart) {
                    debug('First part', firstpart);
                    var words = firstpart.trim().split(' ');
                    guessedFirstName = uppercaseFirstLetter(words[words.length - 1]);
                  }
                }
                /*
                End of experimental... like all the rest it's not an experiment!
                */


                return _objectSpread({}, incoming, {
                  guessedFirstName: guessedFirstName,
                  guessedLastName: guessedLastName,
                  step: step + 1,
                  tests: tests,
                  webLinks: items.map(function (l) {
                    return {
                      title: l.title,
                      snippet: l.snippet,
                      link: l.link
                    };
                  })
                });
              }

              return _objectSpread({
                guessedFirstName: guessedFirstName,
                guessedLastName: guessedLastName
              }, incoming, {
                tests: tests,
                step: step
              });
            })["catch"](function (e) {
              debug('Internal google error', e);
              return _objectSpread({}, incoming, {
                guessedFirstName: guessedFirstName,
                guessedLastName: guessedLastName,
                tests: tests,
                step: step
              });
            }));

          case 7:
            if (guessedFirstName.length < 2 && guessedLastName.length > 0) {
              snippetsAsText = hasResults.reduce(function (prev, curr) {
                return "".concat(prev, " ").concat(curr.title, " ").concat(curr.snippet);
              }, '');
              debug('snippetsAsText', snippetsAsText.replace(/\./g, ' '));
              firstpart = snippetsAsText.replace(/\./g, ' ').toLowerCase().split(guessedLastName.toLowerCase())[0];

              if (firstpart) {
                debug('First part', firstpart);
                words = firstpart.trim().split(' ');
                guessedFirstName = uppercaseFirstLetter(words[words.length - 1]);
              }
            }

            return _context.abrupt("return", _objectSpread({}, incoming, {
              guessedFirstName: guessedFirstName,
              step: step + 1,
              tests: tests,
              webLinks: hasResults
            }));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports["default"] = _default;