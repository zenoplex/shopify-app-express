import { config } from 'dotenv';
config();
import express from 'express';
import session from 'express-session';
import _app from './routes/app';
import shopify from './routes/shopify';

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be defined in env');
}

const app = express();
// https://github.com/expressjs/session#cookiesecure
app.set('trust proxy', 1);
app.use(
  // Should use external store strategy in production
  session({
    secret: sessionSecret,
    cookie: { secure: process.env.NODE_ENV === 'production' },
    resave: true,
    saveUninitialized: true,
  }),
);
app.use('/app', _app);
app.use('/shopify', shopify);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on Port', port);
});
