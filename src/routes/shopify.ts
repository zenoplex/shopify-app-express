import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import fetch from 'node-fetch';
import { verifyHmac } from '../utils/verifyHmac';
import cookie from 'cookie';

const router = Router();

const CALLBACK_ROUTE = '/callback';

const shopifyApiKey = process.env.SHOPIFY_API_KEY;
const shopifyApiSecretKey = process.env.SHOPIFY_API_SECRET_KEY;
const shopifyAppUrl = process.env.SHOPIFY_APP_URL;
const shopifyAppScope = process.env.SHOPIFY_APP_SCOPE;

if (!shopifyApiKey || !shopifyApiSecretKey || !shopifyAppUrl) {
  throw new Error(`Missing required env variables`);
}

router.get('/install', (req, res) => {
  const { shop } = req.query;
  if (typeof shop === 'string') {
    const state = uuid();
    const redirectUri = `${shopifyAppUrl}${req.baseUrl}${CALLBACK_ROUTE}`;
    // https://shopify.dev/tutorials/authenticate-with-oauth
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${shopifyAppScope}&state=${state}&redirect_uri=${redirectUri}`;

    res
      .cookie('unko', 'test')
      .cookie('state', state, { httpOnly: true, sameSite: 'none' })
      .redirect(installUrl);
    return;
  }

  res.status(400).send();
});

router.get(CALLBACK_ROUTE, async (req, res) => {
  const { shop, hmac, code, state } = req.query;

  console.log(req.headers, req.headers.cookie);
  console.log(
    `session.state: ${
      cookie.parse(req.headers.cookie || '').state
    }, query.state: ${state}`,
  );
  //  State no match
  if (cookie.parse(req.headers.cookie || '').state !== state) {
    res.status(400).send('Invalid state');
    return;
  }

  if (shop && hmac && code) {
    // Removing hmac from query. Using ...rest because request parameters provided by Shopify is subject to change
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hmac: _hmac, ...message } = req.query;

    if (verifyHmac(String(hmac), shopifyApiSecretKey, message)) {
      // exchange the access code for a permanent access token
      try {
        const response = await fetch(
          `https://${shop}/admin/oauth/access_token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // eslint-disable-next-line @typescript-eslint/camelcase
              client_id: shopifyApiKey,
              // eslint-disable-next-line @typescript-eslint/camelcase
              client_secret: shopifyApiSecretKey,
              code,
            }),
          },
        );

        if (response.ok) {
          const json:
            | { access_token: string; scope: string }
            | { size: number; timeout: number } = await response.json();

          if ('access_token' in json) {
            // Make api calls with X-Shopify-Access-Token: {access_token} header
            // redirect to app whereever you wish
            res.redirect(`${shopifyAppUrl}/app?shop=${shop}`);
            return;
          }

          // Auth timeout
          res.status(400).send(response);
          return;
        }

        // in case of client and server errors
        res.status(400).send(response);
      } catch (err) {
        res.status(400).send(err);
      }
    }
    res.status(400).send('Validation failed');
    return;
  }

  res.status(400).send('Missing required parameters');
});

export default router;
