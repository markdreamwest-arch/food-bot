import { Telegraf, session, Context } from 'telegraf';
import { validatePhoto } from './utils';
import { analyzeFoodPhoto } from './gpt';

interface SessionData {
  goal?: 'lose' | 'maintain' | 'gain';
  premium?: boolean;
}

interface BotContext extends Context {
  session?: SessionData;
}

const bot = new Telegraf<BotContext>(process.env.BOT_TOKEN!);

bot.use(session());

bot.start((ctx) => {
  ctx.replyWithMarkdown(`
🍽 *Привет! Я бот-диетолог*

📸 Отправь фото еды — я проанализирую КБЖУ
🎯 Установи цель: /goal
⭐ Купи премиум: /premium

*Команды:*
/goal [lose|maintain|gain] — установить цель
/premium — премиум-совет (50 Stars)
/help — помощь
  `);
});

bot.help((ctx) => {
  ctx.replyWithMarkdown(`
📖 *Помощь*

*Как это работает:*
1. Отправь фото еды (JPEG, PNG, до 5MB)
2. Бот проанализирует фото через ИИ
3. Получишь карточку с КБЖУ и советом

*Цели:*
/goal lose — похудеть
/goal maintain — поддерживать вес
/goal gain — набрать массу
  `);
});

bot.command('goal', (ctx) => {
  const args = ctx.message.text.split(' ');
  const goal = args[1] as 'lose' | 'maintain' | 'gain';
  
  if (!['lose', 'maintain', 'gain'].includes(goal)) {
    return ctx.replyWithMarkdown(`
❌ *Укажи корректную цель:*
/goal lose — похудеть 🏃
/goal maintain — поддерживать вес ⚖️
/goal gain — набрать массу 💪
    `);
  }

  if (ctx.session) ctx.session.goal = goal;
  
  const goalTexts = {
    lose: 'похудеть 🏃',
    maintain: 'поддерживать вес ⚖️',
    gain: 'набрать массу 💪'
  };

  ctx.replyWithMarkdown(`
✅ *Цель установлена:* ${goalTexts[goal]}
Отправь фото еды для персонализированного анализа.
  `);
});

bot.command('premium', async (ctx) => {
  try {
    await ctx.replyWithInvoice({
      title: '🌟 Премиум-совет диетолога',
      description: 'Расширенный анализ с персональными рекомендациями',
      payload: `premium_${ctx.from.id}_${Date.now()}`,
      provider_token: '',
      currency: 'XTR',
      prices: [{ label: '🌟 Премиум-анализ', amount: 50 }],
      start_parameter: 'premium_payment'
    });
  } catch (error) {
    console.error('Ошибка создания инвойса:', error);
    ctx.reply('❌ Ошибка при создании платежа. Попробуй позже.');
  }
});

bot.on('pre_checkout_query', async (ctx) => {
  try {
    await ctx.answerPreCheckoutQuery(true);
  } catch (error) {
    console.error('Ошибка pre_checkout:', error);
    await ctx.answerPreCheckoutQuery(false);
  }
});

bot.on('successful_payment', async (ctx) => {
  if (ctx.session) ctx.session.premium = true;
  await ctx.replyWithMarkdown(`
🌟 *Премиум-доступ активирован!*
📸 Отправь фото для премиум-анализа!
  `);
});

bot.on('photo', async (ctx) => {
  try {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const file = await ctx.telegram.getFile(photo.file_id);
    
    const validation = validatePhoto(file);
    if (!validation.valid) return ctx.reply(`❌ ${validation.error}`);

    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
    const loadingMsg = await ctx.reply('🔍 *Анализирую фото...*', { parse_mode: 'Markdown' });

    const goal = ctx.session?.goal;
    const isPremium = ctx.session?.premium || false;

    const result = await analyzeFoodPhoto(fileUrl, goal);

    const card = formatFoodCard(result, isPremium, goal);
    
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      loadingMsg.message_id,
      undefined,
      card,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('Ошибка обработки фото:', error);
    ctx.replyWithMarkdown('❌ *Ошибка анализа.* Попробуй другое фото.');
  }
});

function formatFoodCard(data: any, isPremium: boolean, goal?: string): string {
  let card = `
🍽 *${data.name || 'Блюдо'}*

📊 *Пищевая ценность:*
🔥 Калории: *${data.calories || 0}* ккал
💪 Белки: *${data.protein || 0}* г
🧈 Жиры: *${data.fat || 0}* г
🍚 Углеводы: *${data.carbs || 0}* г

💡 *Совет:* ${data.advice || 'Сбалансированное питание — залог здоровья!'}
`;

  if (goal) {
    const goalMap = { lose: 'похудеть 🏃', maintain: 'поддерживать вес ⚖️', gain: 'набрать массу 💪' };
    card += `\n🎯 *Цель:* ${goalMap[goal as keyof typeof goalMap] || goal}`;
  }

  return card;
}

export default bot;
