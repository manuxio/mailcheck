// AIzaSyBVfjJQWAUOkGaNg4Glxr0x-PXP-P0jLtI
import { google } from 'googleapis';
import Promise from 'bluebird';
import myDebugger from 'debug';
import { base64encode } from 'nodejs-base64';
import config from '../../config.json';

const customsearch = google.customsearch('v1');

Promise.config({
  cancellation: true,
});

const debug = myDebugger('mailcheck-google');

const uppercaseFirstLetter = str => str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1); // eslint-disable-line


export default async (incoming) => {
  const {
    memoryCache, step, email, tests, guessedLastName
  } = incoming;
  let {
    guessedFirstName
  } = incoming;
  const base64Key = base64encode(`${email}*google*cse`);
  tests.push('google');
  /* Return value from cache */
  const hasResults = memoryCache.get(base64Key);
  if (!hasResults) {
    return customsearch.cse.list({
      auth: config.googleCse,
      cx: config.googleCtx,
      q: `"${email}"`
    })
      .then(result => result.data)
      .then((result) => {
        const { items } = result;
        if (items && items.length > 0) {
          debug(`Got ${items.length} google results for ${email}`);
          memoryCache.put(base64Key, items);
          /*
          This is very very experimental!
          */
          if (guessedFirstName.length < 2 && guessedLastName.length > 0) {
            const snippetsAsText = items.reduce((prev, curr) => `${prev} ${curr.title} ${curr.snippet}`, '');
            debug('snippetsAsText', snippetsAsText.replace(/\./g, ' '));
            const firstpart = snippetsAsText.replace(/\./g, ' ').toLowerCase().split(guessedLastName.toLowerCase())[0];
            if (firstpart) {
              debug('First part', firstpart);
              const words = firstpart.trim().split(' ');
              guessedFirstName = uppercaseFirstLetter(words[words.length - 1]);
            }
          }

          /*
          End of experimental... like all the rest it's not an experiment!
          */
          return {
            ...incoming,
            guessedFirstName,
            guessedLastName,
            step: step + 1,
            tests,
            webLinks: items.map(l => ({
              title: l.title,
              snippet: l.snippet,
              link: l.link
            }))
          };
        }
        return {
          guessedFirstName,
          guessedLastName,
          ...incoming,
          tests,
          step
        };
      })
      .catch(
        (e) => {
          debug('Internal google error', e);
          return {
            ...incoming,
            guessedFirstName,
            guessedLastName,
            tests,
            step
          };
        }
      );
  }
  if (guessedFirstName.length < 2 && guessedLastName.length > 0) {
    const snippetsAsText = hasResults.reduce((prev, curr) => `${prev} ${curr.title} ${curr.snippet}`, '');
    debug('snippetsAsText', snippetsAsText.replace(/\./g, ' '));
    const firstpart = snippetsAsText.replace(/\./g, ' ').toLowerCase().split(guessedLastName.toLowerCase())[0];
    if (firstpart) {
      debug('First part', firstpart);
      const words = firstpart.trim().split(' ');
      guessedFirstName = uppercaseFirstLetter(words[words.length - 1]);
    }
  }

  return {
    ...incoming,
    guessedFirstName,
    step: step + 1,
    tests,
    webLinks: hasResults
  };
};
