const jsonReply = (incoming) => {
  const {
    valid,
    step,
    tests,
    guessedLastName,
    guessedFirstName,
    email,
    // localPart,
    // domain,
    mode,
    webLinks
  } = incoming;
  if (valid) {
    // console.log('step', step, 'test', tests);
    const confidenceLevel = parseInt(step / tests.length * 100, 10);
    return {
      response: {
        valid,
        tests,
        guessedLastName,
        guessedFirstName,
        email,
        // localPart,
        // domain,
        mode,
        confidenceLevel,
        webLinks
      }
    };
  }
  // console.log('step', step, 'test', tests);
  const confidenceLevel = 100 - parseInt(step / tests.length * 100, 10);
  return {
    response: {
      valid: false,
      tests,
      email,
      confidenceLevel
    }
  };
};

export default jsonReply;
