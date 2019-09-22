import Promise from 'bluebird';
import myDebugger from 'debug';
// import { base64encode } from 'nodejs-base64';

/* This is just a POC ... we know it won't work 100%... maybe not even 50%! */

Promise.config({
  cancellation: true,
});

const debug = myDebugger('mailcheck-guessPersonalData');
const uppercaseFirstLetter = str => str.toLowerCase().charAt(0).toUpperCase() + str.toLowerCase().slice(1); // eslint-disable-line

export default (incoming) => {
  const { localPart } = incoming;
  const splits = localPart.split(/[.-_ ]/);
  if (splits && splits.length === 2) {
    const [guessedFirstName, guessedLastName] = splits;
    debug(`Discovered first name as ${guessedFirstName} and lastname as ${guessedLastName} from ${localPart}`);
    return Promise.resolve({
      ...incoming,
      guessedFirstName: uppercaseFirstLetter(guessedFirstName),
      guessedLastName: uppercaseFirstLetter(guessedLastName)
    });
  }
  return Promise.resolve({
    ...incoming,
    guessedLastName: uppercaseFirstLetter(localPart)
  });
};
