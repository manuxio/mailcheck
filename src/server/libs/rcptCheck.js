import Promise from 'bluebird';
import faker from 'faker';
import { SMTPClient } from 'smtp-client';
import myDebugger from 'debug';
import { base64encode } from 'nodejs-base64';
import config from '../../config.json';

Promise.config({
  cancellation: true,
});

const debug = myDebugger('mailcheck-rcpt');

const getRandomArbitrary = (min, max) => Math.random() * (max - min) + min;

/*
  To quickly reply to your question, I believe testing the catch-all before the
  real address has to be done (if cached somehow) because the following
  scenarios can happen:

  a) local-part accepted: need to check for catchall catchall
  b) local-part not accepted: no need to check catchall
  c) catch-all present: no need to check for local-part

  The odds are positive if we run a cache engine.
*/

export default async (incoming) => {
  const {
    domain, mailServers, memoryCache, step, email, tests
  } = incoming;
  const base64Key = base64encode(`${domain}*catchall`);
  /* Return value from cache */
  let hasCatchAll = memoryCache.get(base64Key);
  if (hasCatchAll === null) {
    /* Do live check */
    const fakeAddress = `${faker.internet.email().split('@')[0]}.${getRandomArbitrary(100, 999)}@${domain}`;
    debug(`Checking catch-all for domain ${domain} with servers ${mailServers.join(',')}. Fake address: ${fakeAddress}`);
    let tmpCompleted;
    const tmpCatchAllResults = await Promise.mapSeries(mailServers, async (host) => {
      if (tmpCompleted) { // No need to check more! One of the hosts was already tested
        return undefined;
      }
      debug(`Testing server ${host} for user ${fakeAddress}`);
      const s = new SMTPClient({
        host,
        port: 25
      });
      let passedConnect;
      try {
        debug(`Connecting to ${host}`);
        await s.connect();
        debug(`Greeting as ${config.helo} to ${host}`);
        await s.greet({ hostname: config.helo });
        debug(`Announcing from as ${config.testMailFrom} to ${host}`);
        await s.mail({ from: config.testMailFrom });
        debug(`Announcing rcpt as ${fakeAddress} to ${host}`);
        passedConnect = true;
        await s.rcpt({ to: fakeAddress });
        await s.quit();
        tmpCompleted = true;
        return true;
      } catch (e) {
        debug('Got an error', e);
        if (passedConnect) { return false; }
        return null;
      }
    });

    hasCatchAll = tmpCatchAllResults.reduce(
      (prev, curr) => {
        if (prev === null) { return prev; }
        return prev || curr;
      } // Reduce to "true" if available, "false" otherwise
    );
    // Cache results for 24 hours...
    memoryCache.put(base64Key, hasCatchAll, 24 * 60 * 60 * 1000);
  }
  if (hasCatchAll === true || hasCatchAll === false) {
    if (hasCatchAll) {
      debug(`Domain ${domain} has a catch-all mailbox!`);
    } else {
      debug(`Domain ${domain} has a NO catch-all mailbox!`);
    }
  } else {
    debug(`Unsure if domain ${domain} has a catch-all mailbox!`);
  }
  if (hasCatchAll === true) {
    tests.push('catchall');
    tests.push('rcpt');
    // Ok, we have a catch all, no need to check real address - useless!
    const retval = {
      ...incoming,
      step: step + 1,
      uncertain: true,
      lastTest: 'rcpt'
    };
    /* Should we cache the results? Probably in a professional service yes... */
    return Promise.resolve(retval);
  }
  let tmpCompleted = false;
  const tmpMailboxResults = await Promise.mapSeries(mailServers, async (host) => {
    if (tmpCompleted) { // No need to check more! One of the hosts was already tested
      return undefined;
    }
    debug(`Testing server ${host} for mailbox ${email}`);
    const s = new SMTPClient({
      host,
      port: 25
    });
    let passedConnect;
    try {
      debug(`Connecting to ${host}`);
      await s.connect();
      debug(`Greeting as ${config.helo} to ${host}`);
      await s.greet({ hostname: config.helo });
      debug(`Announcing from as ${config.testMailFrom} to ${host}`);
      await s.mail({ from: config.testMailFrom });
      debug(`Announcing rcpt as ${email} to ${host}`);
      passedConnect = true;
      await s.rcpt({ to: email });
      await s.quit();
      tmpCompleted = true;
      return true;
    } catch (e) {
      debug('Got an error', e);
      if (passedConnect) { return false; }
      return null;
    }
  });

  const mailboxValid = tmpMailboxResults.reduce(
    (prev, curr) => {
      if (prev === null) { return prev; }
      return prev || curr;
    } // Reduce to "true" if available, "false" otherwise
  );
  if (mailboxValid) {
    tests.push('catchall');
    tests.push('rcpt');
    const retval = {
      ...incoming,
      step: step + 2,
      tests,
      lastTest: 'rcpt',
      valid: true
    };
    /* Should we cache the results? Probably in a professional service yes... */
    return Promise.resolve(retval);
  }
  if (mailboxValid === null) {
    throw new Error('Unable to connect to any of the delegated exchange servers.');
  }
  throw new Error('Email address does not exist.');
};
