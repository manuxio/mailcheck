// import Promise from 'bluebird';
import { Router } from 'express';
import bodyParser from 'body-parser';
import myDebugger from 'debug';

const debug = myDebugger('mailcheck-queue');

const router = new Router();

router.get('/:uniqueId', bodyParser.urlencoded({ extended: true }), (req, res, next) => {
  const { memoryCache } = req;
  const { uniqueId } = req.params;
  // debug('Checking queue');
  if (!uniqueId) {
    next();
    return;
  }
  const cacheKey = `${uniqueId}*queue`;
  const retval = memoryCache.get(cacheKey);
  if (retval === null) {
    debug(`No result for queue id ${uniqueId}`);
    next();
  } else if (retval === 'pending') {
    debug(`Queue id ${uniqueId} is still pending`);
    res.json({
      response: null,
      status: 'pending',
      queueid: uniqueId
    });
  } else {
    debug(`Got result for queue id ${uniqueId}`);
    memoryCache.del(cacheKey);
    res.json(retval);
  }
});

export default router;
