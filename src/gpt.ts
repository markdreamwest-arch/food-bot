import axios from 'axios';

// Используем бесплатный HuggingFace API
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = 'llava-hf/llava-1.5-7b-hf';

export async function analyzeFoodPhoto(imageUrl: string, goal?: string): Promise<any> {
  const goalText = goal ? `Goal: ${goal}. ` : '';
  
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      {
        inputs: {
          image: imageUrl,
          prompt: `${goalText}Analyze this food. Return ONLY valid JSON: {"name":"dish name in English","calories":350,"protein":20.5,"fat":10.3,"carbs":30.7,"advice":"healthy advice"}`
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
    
    // Парсим JSON
    try {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('No JSON found');
    } catch {
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw error;
  }
}
