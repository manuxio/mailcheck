import Promise from 'bluebird';
import uniqid from 'uniqid';
import { Router } from 'express';
import bodyParser from 'body-parser';
import myDebugger from 'debug';
import {
  regexpChecker,
  mxCheck,
  guessPersonalData,
  rcptCheck,
  googleCheck,
  jsonReply
} from '../../libs';

Promise.config({
  cancellation: true,
});

const debug = myDebugger('mailcheck-check');

const router = new Router();

router.post('/', bodyParser.urlencoded({ extended: true }), bodyParser.json(), (req, res, next) => {
  const { email = null, mode = 'default' } = req.body;
  const validModes = ['basic', 'default', 'extended'];
  if (!email || validModes.indexOf(mode) < 0) {
    next();
    return;
  }
  const { memoryCache } = req;
  const incoming = {
    email,
    tests: [],
    mode,
    step: 0,
    memoryCache,
    guessedFirstName: '',
    guessedLastName: ''
  };
  const uniqueId = uniqid();
  debug(`Email to check: ${email} in mode ${mode}`);
  const process = Promise.resolve(incoming)
    .then((v) => {
      if (mode !== 'basic') {
        memoryCache.put(`${uniqueId}*queue`, 'pending', 500 * 1000);
        res.json({
          queued: true,
          queueid: uniqueId
        });
      }
      return v;
    })
    .then(v => regexpChecker(v))
    .catch((e) => {
      debug('Trapped error after regexp check', e.message);
      if (mode !== 'basic') {
        memoryCache.put(`${uniqueId}*queue`, jsonReply({
          email,
          step: 0,
          tests: ['regexp'],
          valid: false
        }), 500 * 1000);
      } else {
        res.json(jsonReply({
          email,
          step: 0,
          tests: ['regexp'],
          valid: false
        }));
      }
      return process.cancel();
    })
    .then(v => guessPersonalData(v))
    // Basic Mode ends here
    .then(v => (['extended', 'default'].indexOf(mode) > -1 ? mxCheck(v) : v))
    .catch((e) => {
      debug('Trapped error after mx check', e.message);
      memoryCache.put(`${uniqueId}*queue`, jsonReply({
        email,
        step: 0,
        tests: ['regexp', 'mx'],
        valid: false
      }), 500 * 1000);
      return process.cancel();
    })
    // Default Mode ends here
    .then(v => (['extended', 'default'].indexOf(mode) > -1 ? rcptCheck(v) : v))
    .catch((e) => {
      debug('Trapped error after rcpt check', e.message);
      const msg = e.message;
      if (msg === 'Unable to connect to any of the delegated exchange servers.') {
        memoryCache.put(`${uniqueId}*queue`, jsonReply({
          email,
          step: 2, // Adjust to 2, since we did not connect at all! So maybe it's a network issue
          tests: ['regexp', 'mx', 'catchall', 'rcpt'],
          valid: false
        }), 500 * 1000);
      } else {
        memoryCache.put(`${uniqueId}*queue`, jsonReply({
          email,
          step: 0, // No reason to tell it was 1... if rcpt fails,  no chance the email is valid!
          tests: ['regexp', 'mx', 'catchall', 'rcpt'],
          valid: false
        }), 500 * 1000);
      }
      return process.cancel();
    })
    .then(v => (['extended'].indexOf(mode) > -1 ? googleCheck(v) : v))
    .then((v) => {
      if (mode === 'basic') {
        res.json(jsonReply(v));
      } else {
        debug(`Saving result in queue id ${uniqueId}`);
        memoryCache.put(`${uniqueId}*queue`, jsonReply(v), 500 * 1000);
      }
    });
});

export default router;
