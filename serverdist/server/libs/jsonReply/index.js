"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var jsonReply = function jsonReply(incoming) {
  var valid = incoming.valid,
      step = incoming.step,
      tests = incoming.tests,
      guessedLastName = incoming.guessedLastName,
      guessedFirstName = incoming.guessedFirstName,
      email = incoming.email,
      mode = incoming.mode,
      webLinks = incoming.webLinks;

  if (valid) {
    // console.log('step', step, 'test', tests);
    var _confidenceLevel = parseInt(step / tests.length * 100, 10);

    return {
      response: {
        valid: valid,
        tests: tests,
        guessedLastName: guessedLastName,
        guessedFirstName: guessedFirstName,
        email: email,
        // localPart,
        // domain,
        mode: mode,
        confidenceLevel: _confidenceLevel,
        webLinks: webLinks
      }
    };
  } // console.log('step', step, 'test', tests);


  var confidenceLevel = 100 - parseInt(step / tests.length * 100, 10);
  return {
    response: {
      valid: false,
      tests: tests,
      email: email,
      confidenceLevel: confidenceLevel
    }
  };
};

var _default = jsonReply;
exports["default"] = _default;