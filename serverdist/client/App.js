"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

require("bootstrap/dist/css/bootstrap.min.css");

require("./app.css");

// import ReactImage from './athenum.png';
var uppercaseFirstLetter = function uppercaseFirstLetter(str) {
  return str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}; // eslint-disable-line


var App =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2["default"])(App, _Component);

  function App() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, App);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(App)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      // username: null
      queue: [],
      fetching: false,
      lastReply: null,
      email: '',
      // currentMode: 'default',
      availableModes: [{
        name: 'basic',
        label: 'Syntax check only'
      }, {
        name: 'default',
        label: 'Syntax check and SMTP validation'
      }, {
        name: 'extended',
        label: 'Black magic &#174;'
      }]
    });
    return _this;
  }

  (0, _createClass2["default"])(App, [{
    key: "getValidation",
    // componentDidMount() {
    //   fetch('/api/getUsername')
    //     .then(res => res.json())
    //     .then(user => this.setState({ username: user.username }));
    // }
    value: function getValidation(email, mode) {
      var _this2 = this;

      this.setState({
        fetching: true,
        lastReply: null
      }, function () {
        fetch('/api/check', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            email: email,
            mode: mode
          })
        }).then(function (res) {
          return res.json();
        }).then(function (res) {
          _this2.setState({
            fetching: false,
            error: false,
            lastReply: res
          }); // console.log('Result', res);

        })["catch"](function (e) {
          console.error(e);

          _this2.setState({
            fetching: false,
            error: true
          });
        });
      });
    }
  }, {
    key: "makeModeCard",
    value: function makeModeCard(mode) {
      var _this3 = this;

      var _this$state = this.state,
          email = _this$state.email,
          fetching = _this$state.fetching;
      var inputIsValid = 'disabled';
      var textInputIsValid = 'Enter address';

      if (email && email.length > 0 && email.indexOf('@') > -1) {
        inputIsValid = '';
        textInputIsValid = 'Verify address';
      }

      return _react["default"].createElement("div", {
        className: "card mb-4 box-shadow",
        key: mode.name
      }, _react["default"].createElement("div", {
        className: "card-header"
      }, _react["default"].createElement("h4", {
        className: "my-0 font-weight-normal"
      }, uppercaseFirstLetter(mode.name))), _react["default"].createElement("div", {
        className: "card-body"
      }, _react["default"].createElement("ul", {
        className: "list-unstyled mt-3 mb-4"
      }, _react["default"].createElement("li", {
        dangerouslySetInnerHTML: {
          __html: mode.label
        }
      })), _react["default"].createElement("button", {
        type: "button",
        className: "btn btn-lg btn-block btn-outline-primary ".concat(inputIsValid),
        onClick: function onClick() {
          if (inputIsValid === '' && !fetching) {
            _this3.getValidation(email, mode.name);
          }
        }
      }, textInputIsValid)));
    }
  }, {
    key: "makeForm",
    value: function makeForm() {
      var _this4 = this;

      var email = this.state.email;
      return _react["default"].createElement("div", {
        className: "form-group"
      }, _react["default"].createElement("input", {
        type: "email",
        className: "form-control",
        id: "emailAddress",
        "aria-describedby": "emailHelp",
        placeholder: "Enter email to validate",
        value: email,
        onChange: function onChange(e) {
          var val = e.target.value;

          _this4.setState({
            email: val,
            lastReply: null,
            fetching: false
          });
        }
      }), _react["default"].createElement("small", {
        id: "emailHelp",
        className: "form-text text-muted"
      }, "We'll never share your email with anyone else."));
    }
  }, {
    key: "parseQueueResponse",
    value: function parseQueueResponse(queueid) {
      var _this5 = this;

      return _react["default"].createElement("div", {
        className: "alert alert-secondary",
        role: "alert"
      }, _react["default"].createElement("div", null, _react["default"].createElement("div", null, _react["default"].createElement("h5", null, "Patience is a virtue")), _react["default"].createElement("div", null, "Your request has been queued with id:", ' ', queueid, ".", _react["default"].createElement("button", {
        type: "button",
        className: "btn btn-block btn-primary mt-2",
        onClick: function onClick() {
          _this5.setState({
            fetching: true,
            lastReply: null
          }, function () {
            fetch("/api/queue/".concat(queueid), {
              method: 'GET'
            }).then(function (res) {
              return res.json();
            }).then(function (res) {
              _this5.setState({
                fetching: false,
                error: false,
                lastReply: res
              }); // console.log('Result', res);

            })["catch"](function (e) {
              console.error(e);

              _this5.setState({
                fetching: false,
                error: true
              });
            });
          });
        }
      }, "Check if it is ready!"))));
    }
  }, {
    key: "parseReply",
    value: function parseReply() {
      var lastReply = this.state.lastReply;
      console.log('Parsing last reply', lastReply);
      var queueid = lastReply.queueid,
          response = lastReply.response;

      if (response) {
        return this.constructor.parseFinalResponse(response);
      }

      return this.parseQueueResponse(queueid);
    }
  }, {
    key: "render",
    value: function render() {
      var _this6 = this;

      // const { username } = this.state;
      var _this$state2 = this.state,
          fetching = _this$state2.fetching,
          availableModes = _this$state2.availableModes,
          lastReply = _this$state2.lastReply;
      return _react["default"].createElement(_react["default"].Fragment, null, _react["default"].createElement("div", {
        className: "pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center"
      }, _react["default"].createElement("h1", {
        className: "display-4"
      }, "Mail Check"), _react["default"].createElement("p", {
        className: "lead"
      }, "Quickly and precisely check any email address.")), _react["default"].createElement("div", {
        className: "container"
      }, this.makeForm(), fetching ? _react["default"].createElement("div", {
        className: "alert alert-light",
        role: "alert"
      }, _react["default"].createElement("div", {
        className: "d-flex justify-content-center"
      }, _react["default"].createElement("div", {
        className: "spinner-border",
        role: "status"
      }))) : null, lastReply ? this.parseReply() : null, _react["default"].createElement("div", {
        className: "card-deck mb-3 text-center"
      }, availableModes.map(function (v) {
        return _this6.makeModeCard(v);
      }))), _react["default"].createElement("div", {
        className: "pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center"
      }, _react["default"].createElement("h1", {
        className: "display-4"
      }, "Use Mail Check via APIs")), _react["default"].createElement("div", {
        className: "container"
      }, _react["default"].createElement("p", {
        className: "lead"
      }, "Two separate APIs are available, free of charge!"), _react["default"].createElement("h5", null, _react["default"].createElement("u", null, "Check API")), _react["default"].createElement("dl", {
        className: "row"
      }, _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "URL"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, window.location.protocol, '//', window.location.host, '/check'), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Method"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, "POST with url-encoded variables"), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Parameters"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, _react["default"].createElement("ul", null, _react["default"].createElement("li", null, _react["default"].createElement("code", null, "email"), "\xA0 \u2014 \xA0 mandatory \xA0 \u2014 \xA0", _react["default"].createElement("span", null, "The email address to verify")), _react["default"].createElement("li", null, _react["default"].createElement("code", null, "mode "), "\xA0 \u2014 \xA0 optional, defaults to 'default' \xA0 \u2014 \xA0", _react["default"].createElement("span", null, "'default', 'basic' or 'extended'")))), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Reply Mime Type"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, _react["default"].createElement("code", null, "application/json")), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Reply definition"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, _react["default"].createElement("div", null, "In", ' ', _react["default"].createElement("code", null, "basic mode"), ", you will get your reply in realtime. An object will be sent with the following properties:", _react["default"].createElement("br", null), _react["default"].createElement("pre", null, '\r\n', "{", '\r\n', '\t', "\"response\": {", '\n', '\t', '\t', "\"valid\": true, // or false", '\n', '\t', '\t', "\"tests\": [ // the test that were run", '\n', '\t', '\t', '\t', "\"regexp\"", '\n', '\t', '\t', "],", '\n', '\t', '\t', "\"guessedLastName\": \"Doe\",", '\n', '\t', '\t', "\"guessedFirstName\": \"John\",", '\n', '\t', '\t', "\"email\": \"john.doe@gmail.com\",", '\n', '\t', '\t', "\"mode\": \"basic\",", '\n', '\t', '\t', "\"confidenceLevel\": 100", '\n', '\t', "}", '\n', "}", '\n')), _react["default"].createElement("div", null, "In", ' ', _react["default"].createElement("code", null, "default or extended mode"), ", you will get your reply in queued mode. An object will be sent with the following properties:", _react["default"].createElement("br", null), _react["default"].createElement("pre", null, '\r\n', "{", '\r\n', '\t', "\"queued\": true,", '\n', '\t', "\"queueid\": \"9634hv6kk0uzsvfa\"", '\n', "}", '\n'), _react["default"].createElement("i", null, "Some extra fields may be present (Black Magic \xAE)")))), _react["default"].createElement("h5", null, _react["default"].createElement("u", null, "Queue API")), _react["default"].createElement("dl", {
        className: "row"
      }, _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "URL"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, window.location.protocol, '//', window.location.host, '/queue/', _react["default"].createElement("code", null, "queue_id")), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Method"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, "GET with variable in PATH"), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Reply Mime Type"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, _react["default"].createElement("code", null, "application/json")), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Reply definition"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, _react["default"].createElement("div", null, _react["default"].createElement("code", null, "If queued request has been processed"), ' ', "you will receive an object with the following properties:", _react["default"].createElement("br", null), _react["default"].createElement("pre", null, '\r\n', "{", '\r\n', '\t', "\"response\": {", '\n', '\t', '\t', "\"valid\": true, // or false", '\n', '\t', '\t', "\"tests\": [ // the test that were run", '\n', '\t', '\t', '\t', "\"regexp\"", '\n', '\t', '\t', "],", '\n', '\t', '\t', "\"guessedLastName\": \"Doe\",", '\n', '\t', '\t', "\"guessedFirstName\": \"John\",", '\n', '\t', '\t', "\"email\": \"john.doe@gmail.com\",", '\n', '\t', '\t', "\"mode\": \"basic\",", '\n', '\t', '\t', "\"confidenceLevel\": 100", '\n', '\t', "}", '\n', "}", '\n'), _react["default"].createElement("i", null, "Some extra fields may be present (Black Magic \xAE)")), _react["default"].createElement("div", null, _react["default"].createElement("code", null, "If queued request has not been processed"), ' ', "you will receive an object with the following properties", _react["default"].createElement("br", null), _react["default"].createElement("pre", null, '\r\n', "{", '\r\n', '\t', "\"queued\": true,", '\n', '\t', "\"queueid\": \"9634hv6kk0uzsvfa\"", '\n', "}", '\n'))), _react["default"].createElement("dt", {
        className: "col-sm-3"
      }, "Lifetime"), _react["default"].createElement("dd", {
        className: "col-sm-9"
      }, "Queued results are kept in memory for 500 seconds and deleted once consumed. You cannot access the same queue result twice!"))));
    }
  }], [{
    key: "parseFinalResponse",
    value: function parseFinalResponse(response) {
      var valid = response.valid,
          email = response.email,
          tests = response.tests,
          guessedLastName = response.guessedLastName,
          guessedFirstName = response.guessedFirstName,
          confidenceLevel = response.confidenceLevel,
          webLinks = response.webLinks;
      var extraClass = valid ? 'alert-success' : 'alert-danger';
      return _react["default"].createElement("div", {
        className: "alert ".concat(extraClass),
        role: "alert"
      }, _react["default"].createElement("div", {
        className: ""
      }, _react["default"].createElement("div", null, valid ? _react["default"].createElement("h5", null, "Hurray!", ' ', email, ' ', "looks valid.") : _react["default"].createElement("h5", null, "Sorry pal!", ' ', email, ' ', "does not look valid.")), _react["default"].createElement("div", null, _react["default"].createElement("p", null, "The following test were run:", ' ', tests.join(','), "."), _react["default"].createElement("div", {
        className: "progress mb-2"
      }, _react["default"].createElement("div", {
        className: "progress-bar progress-bar-striped bg-warning",
        role: "progressbar",
        style: {
          width: "".concat(confidenceLevel, "%")
        }
      }, "I think I am", ' ', confidenceLevel, "% correct.")), guessedLastName || guessedFirstName ? _react["default"].createElement("p", null, "I also think that this address belongs to someone called:", ' ', "".concat(guessedFirstName, " ").concat(guessedLastName)) : null, webLinks && webLinks.length > 0 ? _react["default"].createElement("div", null, "You can read more about", ' ', ' ', "".concat(guessedFirstName, " ").concat(guessedLastName), ' ', "here:") : null, (webLinks || []).map(function (link) {
        return _react["default"].createElement("li", null, _react["default"].createElement("a", {
          href: link.link,
          target: "_new"
        }, link.title));
      }))));
    }
  }]);
  return App;
}(_react.Component);

exports["default"] = App;