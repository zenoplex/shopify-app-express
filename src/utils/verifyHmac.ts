import { Request } from 'express';
import crypto from 'crypto';
import querystring from 'querystring';

const getIsSafeEqual = (a: string, b: string): boolean => {
  const aLen = Buffer.byteLength(a);
  const bLen = Buffer.byteLength(b);

  if (aLen !== bLen) {
    return false;
  }

  const bufferA = Buffer.alloc(aLen, 0, 'utf8');
  bufferA.write(a);
  const bufferB = Buffer.alloc(bLen, 0, 'utf8');
  bufferB.write(b);

  return crypto.timingSafeEqual(bufferA, bufferB);
};

export const verifyHmac = (
  hmac: string,
  secret: string,
  message: Request['query'],
): boolean => {
  // Message format (key must be alphabetical order
  // https://shopify.dev/tutorials/authenticate-with-oauth#verification
  const sortedMessage = Object.keys(message)
    .sort((v1, v2) => v1.localeCompare(v2))
    .reduce((acc, key) => {
      acc[key] = message[key];
      return acc;
    }, {} as Request['query']);

  const generatedHash = crypto
    .createHmac('sha256', secret)
    .update(querystring.stringify(sortedMessage))
    .digest('hex');

  return getIsSafeEqual(hmac, generatedHash);
};
