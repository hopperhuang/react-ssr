import express from 'express';
import Loadable from 'react-loadable';
import compression from 'compression';
import cors from 'cors';
import requestHandler from './src/server/index';

const app = express();

app.use(cors());

// use for dev, instead nginx in production
app.use(compression());
// serve static for client side required files
app.use(express.static('dist'));

app.get('/user', (req, res) => { // use as mock test
  res.json({
    user: 'maoyan',
  });
});

app.get('*', async (req, res) => {
  const {
    page: htmlString,
    // eslint-disable-next-line
    context,
    // eslint-disable-next-line
    status,
  } = await requestHandler(req);
  if (status === 404) { // protect here, otherwise serve will get errored
    res.send(404);
    return;
  }
  // todo:
  // 1. may be we should send 302, redirect to the error page
  // when status is 404 for routes is not matched
  res.append('Cache-Control', 'no-store');
  res.send(htmlString);
});

Loadable.preloadAll().then(() => {
  app.listen(3000, () => {
    console.log('Server is listening at port 3000...');
    process.send('ready');
  });
}).catch((err) => {
  console.log(err);
});
