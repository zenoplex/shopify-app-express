import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';

export const createRedisStore = (
  s: typeof session,
  url: string,
): connectRedis.RedisStore => {
  const RedisStore = connectRedis(s);
  const redisClient = redis.createClient({ url });

  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });

  redisClient.on('error', err => {
    console.log('Redis error: ' + err);
  });

  return new RedisStore({ url, client: redisClient });
};
