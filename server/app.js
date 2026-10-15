import express from 'express';
import cors from 'cors';
import itemsRouter from './itemsRouter.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);
app.use(express.json({ limit: '10kb' }));

app.use('/api/items', itemsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Errors raised by express.json (malformed JSON, body too large) carry a 4xx status.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }

  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

export default app;
