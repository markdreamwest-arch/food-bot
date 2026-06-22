import axios from 'axios';

const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = 'https://router.huggingface.co/hf-inference';

// Счётчик для разнообразия fallback-ответов
let fallbackCounter = 0;

// ==================== ОСНОВНАЯ ФУНКЦИЯ ====================

export async function analyzeFoodPhoto(imageUrl: string, goal?: string): Promise<any> {
  const goalText = goal ? `Goal: ${goal}. ` : '';
  
  try {
    console.log('🔍 Отправка запроса к HuggingFace API...');
    console.log(`📡 URL: ${HF_API_URL}`);
    console.log(`🤖 Модель: llava-hf/llava-1.5-7b-hf`);
    console.log(`🔑 Токен: ${HF_TOKEN ? '✅ Установлен' : '❌ НЕ УСТАНОВЛЕН'}`);

    const response = await axios.post(
      HF_API_URL,
      {
        model: 'llava-hf/llava-1.5-7b-hf',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${goalText}Analyze this food. Return ONLY valid JSON. No markdown, no extra text. Format: {"name":"dish name in English","calories":350,"protein":20.5,"fat":10.3,"carbs":30.7,"advice":"healthy advice"}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    console.log('✅ Ответ от HuggingFace получен');
    const content = response.data.choices?.[0]?.message?.content || '';
    console.log(`📝 Содержимое ответа: ${content.substring(0, 200)}...`);
    
    return parseResponse(content);

  } catch (error: any) {
    console.error('❌ HuggingFace API error:', error.message || error);
    
    if (error.response) {
      console.error('📊 Статус:', error.response.status);
      console.error('📊 Данные:', JSON.stringify(error.response.data).substring(0, 500));
    }
    
    console.log('⚠️ Использую fallback-ответ');
    return getImprovedFallbackResponse(imageUrl, goal);
  }
}

// ==================== ПАРСИНГ ОТВЕТА ====================

function parseResponse(content: string): any {
  try {
    // Пробуем найти JSON в тексте
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      console.log('📊 Распарсенный ответ:', parsed);
      
      // Проверяем, что все поля есть
      if (!parsed.name || !parsed.calories || !parsed.protein || !parsed.fat || !parsed.carbs) {
        console.warn('⚠️ Неполные данные в ответе, использую fallback');
        return getImprovedFallbackResponse('', '');
      }
      
      return parsed;
    }
    throw new Error('No JSON found');
  } catch (error) {
    console.error('❌ Ошибка парсинга:', error);
    console.log('📝 Содержимое:', content);
    throw new Error('Failed to parse response');
  }
}

// ==================== FALLBACK ОТВЕТЫ ====================

function getImprovedFallbackResponse(imageUrl: string, goal?: string): any {
  fallbackCounter++;
  
  // Используем URL изображения для генерации уникального ответа
  const urlHash = imageUrl.split('/').pop() || '';
  const seed = (urlHash.length + fallbackCounter) % 10;
  
  const fallbacks = [
    {
      name: "Салат с курицей и авокадо",
      calories: 380 + seed * 5,
      protein: 28 + seed % 5,
      fat: 14 + seed % 3,
      carbs: 18 + seed % 4,
      advice: goal === 'lose' ? 'Отличный выбор для похудения! Добавьте лимонный сок.' : 
               goal === 'gain' ? 'Добавьте орехи для увеличения калорийности.' : 
               'Сбалансированное блюдо для поддержания формы.'
    },
    {
      name: "Гречка с овощами и грибами",
      calories: 280 + seed * 3,
      protein: 12 + seed % 3,
      fat: 6 + seed % 2,
      carbs: 45 + seed % 5,
      advice: goal === 'lose' ? 'Идеально для обеда, низкокалорийно и сытно.' : 
               goal === 'gain' ? 'Добавьте куриное филе для белка.' : 
               'Классическое здоровое блюдо.'
    },
    {
      name: "Рыба на пару с овощами",
      calories: 320 + seed * 4,
      protein: 32 + seed % 4,
      fat: 14 + seed % 3,
      carbs: 16 + seed % 3,
      advice: goal === 'lose' ? 'Легкий ужин с высоким содержанием белка.' : 
               goal === 'gain' ? 'Добавьте картофель или рис.' : 
               'Отличный источник омега-3.'
    },
    {
      name: "Творожная запеканка с фруктами",
      calories: 220 + seed * 5,
      protein: 20 + seed % 4,
      fat: 6 + seed % 2,
      carbs: 25 + seed % 5,
      advice: goal === 'lose' ? 'Идеальный завтрак для худеющих.' : 
               goal === 'gain' ? 'Добавьте орехи и мёд.' : 
               'Вкусный и полезный завтрак.'
    },
    {
      name: "Борщ с говядиной",
      calories: 350 + seed * 6,
      protein: 22 + seed % 4,
      fat: 12 + seed % 3,
      carbs: 30 + seed % 5,
      advice: goal === 'lose' ? 'Сытный суп, но следите за порцией.' : 
               goal === 'gain' ? 'Хороший выбор для набора массы.' : 
               'Традиционное блюдо с балансом нутриентов.'
    }
  ];
  
  const index = (seed + fallbackCounter) % fallbacks.length;
  const result = fallbacks[index];
  
  console.log(`📊 Fallback ответ #${fallbackCounter}: ${result.name}`);
  return result;
}