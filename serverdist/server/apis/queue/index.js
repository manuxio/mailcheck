"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _debug = _interopRequireDefault(require("debug"));

// import Promise from 'bluebird';
var debug = (0, _debug["default"])('mailcheck-queue');
var router = new _express.Router();
router.get('/:uniqueId', _bodyParser["default"].urlencoded({
  extended: true
}), function (req, res, next) {
  var memoryCache = req.memoryCache;
  var uniqueId = req.params.uniqueId; // debug('Checking queue');

  if (!uniqueId) {
    next();
    return;
  }

  var cacheKey = "".concat(uniqueId, "*queue");
  var retval = memoryCache.get(cacheKey);

  if (retval === null) {
    debug("No result for queue id ".concat(uniqueId));
    next();
  } else if (retval === 'pending') {
    debug("Queue id ".concat(uniqueId, " is still pending"));
    res.json({
      response: null,
      status: 'pending',
      queueid: uniqueId
    });
  } else {
    debug("Got result for queue id ".concat(uniqueId), retval);
    memoryCache.del(cacheKey);
    res.json(retval);
  }
});
var _default = router;
exports["default"] = _default;