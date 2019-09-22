import express from 'express';
import morgan from 'morgan';
import memoryCache from 'memory-cache';
import myDebugger from 'debug';

import apis from './apis';

const debug = myDebugger('mailcheck-server');

const app = express();

app.use(express.static('dist'));
app.use(morgan('dev'));
app.use((req, res, next) => {
  req.memoryCache = memoryCache;
  next();
});
app.use('/api/check', apis.check);
app.use('/api/queue', apis.queue);

app.listen(process.env.PORT || 8080, () => debug(`Api server listening on port ${process.env.PORT || 8080}!`));
