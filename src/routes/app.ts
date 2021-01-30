import express from 'express';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200).send('Hello world');
});

export default router;
