"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _debug = _interopRequireDefault(require("debug"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

// import { base64encode } from 'nodejs-base64';

/* This is just a POC ... we know it won't work 100%... maybe not even 50%! */
_bluebird["default"].config({
  cancellation: true
});

var debug = (0, _debug["default"])('mailcheck-guessPersonalData');

var uppercaseFirstLetter = function uppercaseFirstLetter(str) {
  return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}; // eslint-disable-line


var _default = function _default(incoming) {
  var localPart = incoming.localPart;
  var splits = localPart.split(/[.-_ ]/);

  if (splits && splits.length === 2) {
    var _splits = (0, _slicedToArray2["default"])(splits, 2),
        guessedFirstName = _splits[0],
        guessedLastName = _splits[1];

    debug("Discovered first name as ".concat(guessedFirstName, " and lastname as ").concat(guessedLastName, " from ").concat(localPart));
    return _bluebird["default"].resolve(_objectSpread({}, incoming, {
      guessedFirstName: uppercaseFirstLetter(guessedFirstName),
      guessedLastName: uppercaseFirstLetter(guessedLastName)
    }));
  }

  return _bluebird["default"].resolve(_objectSpread({}, incoming, {
    guessedLastName: uppercaseFirstLetter(localPart)
  }));
};

exports["default"] = _default;