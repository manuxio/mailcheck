import Promise from 'bluebird';
import { promises as dnsPromises } from 'dns';
import myDebugger from 'debug';
import { base64encode } from 'nodejs-base64';

Promise.config({
  cancellation: true,
});

const debug = myDebugger('mailcheck-mx');

const { Resolver: DNSResolver } = dnsPromises;
const resolver = new DNSResolver();

/*
  There's not point in evaluating other MX server than the one with best (lowest) priority.
  Secondary MX servers are usually configured to relay ALL messages for a certain domain
  without any knowledge of the real users!
*/
const getBestMx = (mx) => {
  const bestMx = mx.reduce((prev, curr) => {
    if (!prev) {
      return curr;
    }
    if (curr.priority < prev.priority) {
      return curr;
    }
    return prev;
  }, null);
  if (bestMx) {
    return Promise.resolve(bestMx.exchange);
  }
  throw new Error('Unable to find a valid MX record');
};
export default (incoming) => {
  const {
    domain, memoryCache, step, tests
  } = incoming;
  const base64Key = base64encode(`${domain}*mxrecord`);
  /* Return value from cache */
  const cachedResult = memoryCache.get(base64Key);
  if (cachedResult) {
    tests.push('mx');
    const retval = {
      ...incoming,
      tests,
      lastTest: 'mx',
      step: step + 1,
      mailServers: cachedResult
    };
    debug(`Checking mx record for domain ${domain} from cache`);
    return Promise.resolve(retval);
  }
  /* Do live check */
  debug(`Checking mx record for domain ${domain}`);
  return resolver.resolve(domain, 'MX')
    .then(
      mxs => getBestMx(mxs)
    )
    .then(
      mx => resolver.resolve(mx)
    )
    .then(
      (ipaddresses) => {
        tests.push('mx');
        const retval = {
          ...incoming,
          tests,
          step: step + 1,
          lastTest: 'mx',
          mailServers: ipaddresses
        };
        /* Ideally this timeout should match the DNS record timeout, but
        unfortunately the TTL does not come from the resolver library, so
        it would take either a rewrite or a second DNS request, which is probably
        beyond the scope of this service. Let's use a 1 hour default instead */
        memoryCache.put(base64Key, ipaddresses, 60 * 60 * 1000);
        return Promise.resolve(retval);
      }
    )
    .catch((e) => {
      debug('Internal Error', e);
      throw new Error(`No mail server found for domain ${domain}!`);
    });
};
