import Promise from 'bluebird';
import myDebugger from 'debug';
import { base64encode } from 'nodejs-base64';

const debug = myDebugger('mailcheck-RegExp');

Promise.config({
  cancellation: true,
});

const regexpChecker = (incoming) => {
  const {
    memoryCache,
    email,
    mode,
    tests
  } = incoming;
  const base64Key = base64encode(`${email}*${mode}*regexp`);
  const cachedResult = memoryCache.get(base64Key);
  if (cachedResult) {
    debug(`Checking address: ${email} in ${mode} mode from cache`);
    tests.push('regexp');
    const retval = Object.assign({}, incoming, {
      valid: true,
      localPart: cachedResult[1],
      domain: cachedResult[5],
      step: incoming.step + 1,
      tests,
      lastTest: 'regexp'
    });
    return Promise.resolve(retval);
  }
  debug(`Checking address: ${email} in ${mode} mode`);
  /*
  This regexp was blatantly stolen from: https://emailregex.com/
  I hope you don't mind...
  Creating such a RegExp from zero would result in either:
    1- one week work!
    2- a much worse result!
  */
  const regexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const match = email.match(regexp);
  if (!match) {
    throw new Error('Email address is syntactically invalid.');
  }
  tests.push('regexp');
  const retval = Object.assign({}, incoming, {
    valid: true,
    localPart: match[1],
    domain: match[5],
    step: incoming.step + 1,
    lastTest: 'regexp',
    tests
  });
  /* Cache for a long time: this result cannot change! */
  memoryCache.put(base64Key, match, 24 * 60 * 60 * 1000);
  return Promise.resolve(retval);
};

export default regexpChecker;
