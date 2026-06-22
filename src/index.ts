import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

if (!process.env.BOT_TOKEN) {
  console.error('❌ BOT_TOKEN не найден в .env');
  process.exit(1);
}

import bot from './bot';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), bot: 'food-bot' });
});

app.post('/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('❌ Ошибка вебхука:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/', (req, res) => {
  res.json({ name: 'Food Bot', version: '1.0.0', endpoints: { webhook: '/webhook', health: '/health' } });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Бот запущен на порту ${PORT}`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📮 Webhook: http://localhost:${PORT}/webhook`);
});

export default app;
