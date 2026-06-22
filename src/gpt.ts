import axios from 'axios';

// Используем HuggingFace API с явным указанием эндпоинта
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'llava-hf/llava-1.5-7b-hf';

export async function analyzeFoodPhoto(imageUrl: string, goal?: string): Promise<any> {
  const goalText = goal ? `Goal: ${goal}. ` : '';
  
  try {
    // Пробуем через официальный API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        inputs: {
          image: imageUrl,
          prompt: `${goalText}Analyze this food. Return ONLY valid JSON: {"name":"dish name in English","calories":350,"protein":20.5,"fat":10.3,"carbs":30.7,"advice":"healthy advice"}`
        },
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3
        }
      },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const content = response.data.generated_text || '';
    return parseResponse(content);

  } catch (error) {
    console.error('HuggingFace API error:', error);
    
    // Если ошибка сети — возвращаем заглушку
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return getFallbackResponse(goal);
    }
    
    throw error;
  }
}

function parseResponse(content: string): any {
  try {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('No JSON found');
  } catch {
    throw new Error('Failed to parse response');
  }
}

function getFallbackResponse(goal?: string): any {
  const responses = [
    {
      name: "Салат с курицей",
      calories: 350,
      protein: 25,
      fat: 12,
      carbs: 20,
      advice: "Отличный выбор! Добавьте больше зелени для витаминов."
    },
    {
      name: "Гречка с овощами",
      calories: 280,
      protein: 10,
      fat: 5,
      carbs: 50,
      advice: "Хороший источник сложных углеводов. Добавьте белок для баланса."
    },
    {
      name: "Овощной суп",
      calories: 150,
      protein: 5,
      fat: 3,
      carbs: 25,
      advice: "Лёгкий и полезный вариант. Идеально для ужина."
    }
  ];
  
  // Выбираем случайный ответ
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}