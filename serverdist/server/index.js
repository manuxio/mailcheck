"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _express = _interopRequireDefault(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _memoryCache = _interopRequireDefault(require("memory-cache"));

var _debug = _interopRequireDefault(require("debug"));

var _apis = _interopRequireDefault(require("./apis"));

var debug = (0, _debug["default"])('mailcheck-server');
var app = (0, _express["default"])();
app.use(_express["default"]["static"]('dist'));
app.use((0, _morgan["default"])('dev'));
app.use(function (req, res, next) {
  req.memoryCache = _memoryCache["default"];
  next();
});
app.use(function (req, res, next) {
  debug('Got api request', req.originalUrl);
  next();
});
app.use('/api/check', _apis["default"].check);
app.use('/api/queue', _apis["default"].queue);
app.listen(process.env.PORT || 8080, function () {
  return debug("Api server listening on port ".concat(process.env.PORT || 8080, "!"));
});