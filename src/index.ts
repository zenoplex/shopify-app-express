import { config } from 'dotenv';
config();
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import { createRedisStore } from './storages/redis';
import _app from './routes/app';
import shopify from './routes/shopify';
import cors from 'cors';

const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
const port = Number(process.env.PORT) || 3000;
const redisUrl = process.env.REDIS_URL;

const app = express();
app.use(morgan('dev'));
app.use(cors());
// https://github.com/expressjs/session#cookiesecure
app.set('trust proxy', true);
app.use(
  // Should use external store strategy in production
  session({
    secret: shopifyApiSecretKey,
    // sameSite: 'none', secure required for ngrok
    cookie: { sameSite: 'none', secure: true },
    resave: false,
    saveUninitialized: true,
    store: redisUrl ? createRedisStore(session, redisUrl) : undefined,
  }),
);
app.use('/app', _app);
app.use('/shopify', shopify);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Server listening on Port', port);
});
