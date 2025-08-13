// OpenRouter AI utilities

/**
 * Generate AI response using OpenRouter
 */
export async function generateAIResponse(messages, options = {}) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  const payload = {
    model: options.model || 'openai/gpt-3.5-turbo',
    messages: messages,
    max_tokens: options.maxTokens || 500,
    temperature: options.temperature || 0.7,
    ...options
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://telegram-ai-chatbot.vercel.app',
        'X-Title': 'Telegram AI Chatbot'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Return fallback message
    return 'Sorry, I\'m experiencing technical difficulties. Please try again in a moment.';
  }
}

/**
 * Available models on OpenRouter (free tier)
 */
export const FREE_MODELS = {
  GPT_3_5_TURBO: 'openai/gpt-3.5-turbo',
  GPT_4O_MINI: 'openai/gpt-4o-mini',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',
  LLAMA_3_1_8B: 'meta-llama/llama-3.1-8b-instruct:free'
};

/**
 * System prompts for different bot personalities
 */
export const SYSTEM_PROMPTS = {
  HELPFUL: 'You are a helpful AI assistant. Be friendly, helpful, and concise in your responses.',
  CREATIVE: 'You are a creative AI assistant who loves to help with writing, brainstorming, and artistic projects.',
  TECHNICAL: 'You are a technical AI assistant specializing in programming, technology, and problem-solving.',
  CASUAL: 'You are a casual, friendly AI companion. Keep conversations light and fun!'
};