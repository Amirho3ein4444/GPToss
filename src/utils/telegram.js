// Telegram API utilities

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(chatId, text, options = {}) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: options.parseMode || 'HTML',
    disable_web_page_preview: options.disablePreview || false,
    ...options
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

/**
 * Send typing action to show bot is processing
 */
export async function sendTypingAction(chatId) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing'
      })
    });
  } catch (error) {
    console.error('Error sending typing action:', error);
  }
}

/**
 * Set webhook for Telegram bot
 */
export async function setWebhook(webhookUrl) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });

    const result = await response.json();
    console.log('Webhook set result:', result);
    return result;
  } catch (error) {
    console.error('Error setting webhook:', error);
    throw error;
  }
}