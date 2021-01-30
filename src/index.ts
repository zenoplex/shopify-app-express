import { config } from 'dotenv';
config();
import express from 'express';
import session from 'express-session';
import _app from './routes/app';
import shopify from './routes/shopify';
import morgan from 'morgan';

const sessionSecret = process.env.SESSION_SECRET;
const port = Number(process.env.PORT) || 3000;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be defined in env');
}

const app = express();
app.use(morgan('dev'));
// https://github.com/expressjs/session#cookiesecure
app.set('trust proxy', true);
app.use(
  // Should use external store strategy in production
  session({
    secret: sessionSecret,
    // sameSite: 'none', secure required for ngrok
    cookie: { sameSite: 'none', secure: true },
    resave: false,
    saveUninitialized: true,
  }),
);
app.use('/app', _app);
app.use('/shopify', shopify);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on Port', port);
});
