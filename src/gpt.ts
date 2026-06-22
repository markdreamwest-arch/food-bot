import axios from 'axios';

const HF_TOKEN = process.env.HF_TOKEN;
// Используем актуальный URL
const HF_API_URL = 'https://router.huggingface.co/hf-inference';

export async function analyzeFoodPhoto(imageUrl: string, goal?: string): Promise<any> {
  const goalText = goal ? `Goal: ${goal}. ` : '';

  try {
    console.log('🔍 Отправка запроса к HuggingFace API...');

    const response = await axios.post(
      // Новый URL
      HF_API_URL,
      {
        model: 'llava-hf/llava-1.5-7b-hf',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `${goalText}Analyze this food. Return ONLY valid JSON: {"name":"dish name in English","calories":350,"protein":20.5,"fat":10.3,"carbs":30.7,"advice":"healthy advice"}`
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
        temperature: 0.7
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
    return parseResponse(content);

  } catch (error: any) {
    console.error('❌ HuggingFace API error:', error.message || error);
    // Если ошибка — возвращаем fallback
    return getImprovedFallbackResponse(imageUrl, goal);
  }
}

// Остальные функции (parseResponse, getImprovedFallbackResponse) остаются без изменений