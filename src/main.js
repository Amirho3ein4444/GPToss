import { Client, Databases, ID, Query } from 'node-appwrite';

// Environment variables - these will be set in Appwrite Cloud
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const USERS_COLLECTION_ID = process.env.USERS_COLLECTION_ID;
const SESSIONS_COLLECTION_ID = process.env.SESSIONS_COLLECTION_ID;
const CHATS_COLLECTION_ID = process.env.CHATS_COLLECTION_ID;
const DATABASE_ID = 'default'; // Using default database

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Main function handler for Appwrite
export default async ({ req, res, log, error }) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return res.json({}, 200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
    }

    // Only accept POST requests from Telegram
    if (req.method !== 'POST') {
      return res.json({ error: 'Method not allowed' }, 405);
    }

    const update = req.body;
    log('Received update:', JSON.stringify(update));

    // Check if it's a message update
    if (!update.message) {
      log('No message in update');
      return res.json({ ok: true }, 200);
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id.toString();
    const username = message.from.username || '';
    const userMessage = message.text || '';

    log(`Processing message from user ${userId}: ${userMessage}`);

    // Handle /start command
    if (userMessage === '/start') {
      await sendTelegramMessage(chatId, '🤖 Hello! I\'m your AI assistant. Ask me anything!');
      return res.json({ ok: true }, 200);
    }

    // Create or get user
    const user = await createOrGetUser(userId, username);
    log('User found/created:', user.$id);

    // Get or create active session
    const session = await getOrCreateSession(userId);
    log('Session found/created:', session.$id);

    // Save user message to chat history
    await saveChatMessage(session.$id, userId, 'user', userMessage);

    // Get chat history for context
    const chatHistory = await getChatHistory(session.$id);
    
    // Generate AI response using OpenRouter
    const aiResponse = await generateAIResponse(chatHistory);
    
    // Save AI response to chat history
    await saveChatMessage(session.$id, userId, 'assistant', aiResponse);

    // Send response to user via Telegram
    await sendTelegramMessage(chatId, aiResponse);

    return res.json({ ok: true }, 200);

  } catch (err) {
    error('Error processing request:', err);
    return res.json({ error: 'Internal server error' }, 500);
  }
};

// Create or get existing user
async function createOrGetUser(telegramId, username) {
  try {
    // Try to find existing user
    const users = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal('telegramId', telegramId)]
    );

    if (users.documents.length > 0) {
      return users.documents[0];
    }

    // Create new user if doesn't exist
    return await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      {
        telegramId,
        username,
        createdAt: new Date().toISOString()
      }
    );
  } catch (err) {
    console.error('Error in createOrGetUser:', err);
    throw err;
  }
}

// Get or create active session
async function getOrCreateSession(userId) {
  try {
    // Look for active session
    const sessions = await databases.listDocuments(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('active', true)
      ]
    );

    if (sessions.documents.length > 0) {
      return sessions.documents[0];
    }

    // Create new session
    return await databases.createDocument(
      DATABASE_ID,
      SESSIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        active: true,
        createdAt: new Date().toISOString()
      }
    );
  } catch (err) {
    console.error('Error in getOrCreateSession:', err);
    throw err;
  }
}

// Save chat message to history
async function saveChatMessage(sessionId, userId, role, content) {
  try {
    return await databases.createDocument(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      ID.unique(),
      {
        sessionId,
        userId,
        role,
        content,
        createdAt: new Date().toISOString()
      }
    );
  } catch (err) {
    console.error('Error in saveChatMessage:', err);
    throw err;
  }
}

// Get chat history for context
async function getChatHistory(sessionId, limit = 10) {
  try {
    const chats = await databases.listDocuments(
      DATABASE_ID,
      CHATS_COLLECTION_ID,
      [
        Query.equal('sessionId', sessionId),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    );

    // Return in chronological order for AI context
    return chats.documents.reverse().map(chat => ({
      role: chat.role,
      content: chat.content
    }));
  } catch (err) {
    console.error('Error in getChatHistory:', err);
    return [];
  }
}

// Generate AI response using OpenRouter
async function generateAIResponse(chatHistory) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Be friendly, helpful, and concise in your responses.'
      },
      ...chatHistory
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://telegram-ai-chatbot.vercel.app',
        'X-Title': 'Telegram AI Chatbot'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    console.error('Error generating AI response:', err);
    return 'Sorry, I\'m having trouble generating a response right now. Please try again later.';
  }
}

// Send message to Telegram
async function sendTelegramMessage(chatId, text) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error sending Telegram message:', err);
    throw err;
  }
}