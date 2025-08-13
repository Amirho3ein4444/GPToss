import { Client, Databases, ID, Query } from 'node-appwrite';

// Initialize Appwrite client
function createAppwriteClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    client,
    databases: new Databases(client)
  };
}

// Send message to Telegram
async function sendTelegramMessage(chatId, text, log) {
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  
  if (!TELEGRAM_TOKEN) {
    log('ERROR: TELEGRAM_TOKEN not found');
    return false;
  }

  try {
    log(`Sending message to chat ${chatId}: ${text.substring(0, 100)}...`);
    
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

    const result = await response.json();
    
    if (!response.ok) {
      log(`Telegram API error: ${JSON.stringify(result)}`);
      return false;
    }

    log(`Message sent successfully: ${result.message_id}`);
    return true;
  } catch (error) {
    log(`Error sending Telegram message: ${error.message}`);
    return false;
  }
}

// Generate AI response using OpenRouter
async function generateAIResponse(messages, log) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    log('ERROR: OPENROUTER_API_KEY not found');
    return 'Sorry, AI service is not configured properly.';
  }

  try {
    log(`Generating AI response for ${messages.length} messages`);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://telegram-ai-chatbot.vercel.app',
        'X-Title': 'Telegram AI Chatbot'
      },
      body: JSON.stringify({
        model: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      log(`OpenRouter API error: ${response.status} - ${JSON.stringify(errorData)}`);
      return 'Sorry, I\'m experiencing technical difficulties. Please try again in a moment.';
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    log(`AI response generated: ${aiResponse.substring(0, 100)}...`);
    return aiResponse;

  } catch (error) {
    log(`Error generating AI response: ${error.message}`);
    return 'Sorry, I\'m experiencing technical difficulties. Please try again in a moment.';
  }
}

// Main function
export default async ({ req, res, log, error }) => {
  try {
    // Log all environment variables (without values for security)
    log('Environment check:');
    log(`APPWRITE_ENDPOINT: ${process.env.APPWRITE_ENDPOINT ? 'SET' : 'MISSING'}`);
    log(`APPWRITE_PROJECT_ID: ${process.env.APPWRITE_PROJECT_ID ? 'SET' : 'MISSING'}`);
    log(`APPWRITE_API_KEY: ${process.env.APPWRITE_API_KEY ? 'SET' : 'MISSING'}`);
    log(`OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING'}`);
    log(`TELEGRAM_TOKEN: ${process.env.TELEGRAM_TOKEN ? 'SET' : 'MISSING'}`);
    log(`USERS_COLLECTION_ID: ${process.env.USERS_COLLECTION_ID ? 'SET' : 'MISSING'}`);
    log(`SESSIONS_COLLECTION_ID: ${process.env.SESSIONS_COLLECTION_ID ? 'SET' : 'MISSING'}`);
    log(`CHATS_COLLECTION_ID: ${process.env.CHATS_COLLECTION_ID ? 'SET' : 'MISSING'}`);

    // Handle ping endpoint
    if (req.path === "/ping") {
      log('Ping request received');
      return res.text("Pong");
    }

    // Log the incoming request
    log(`Request method: ${req.method}`);
    log(`Request path: ${req.path}`);
    log(`Request headers: ${JSON.stringify(req.headers)}`);

    // Only handle POST requests (Telegram webhooks)
    if (req.method !== 'POST') {
      log('Non-POST request received, ignoring');
      return res.json({ ok: true }, 200);
    }

    // Parse the request body
    let update;
    try {
      const body = req.body;
      log(`Raw body type: ${typeof body}`);
      log(`Raw body: ${JSON.stringify(body)}`);
      
      if (typeof body === 'string') {
        update = JSON.parse(body);
      } else {
        update = body;
      }
    } catch (parseError) {
      log(`Error parsing request body: ${parseError.message}`);
      return res.json({ ok: false, error: 'Invalid JSON' }, 400);
    }

    // Check if it's a valid Telegram update
    if (!update || !update.message) {
      log('No message in update, ignoring');
      return res.json({ ok: true }, 200);
    }

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id.toString();
    const userMessage = message.text || '';
    const username = message.from.username || message.from.first_name || 'Unknown';

    log(`Processing message from user ${userId} (${username}): ${userMessage}`);

    // Initialize Appwrite
    const { databases } = createAppwriteClient();
    const DATABASE_ID = 'default';

    // Handle /start command
    if (userMessage === '/start') {
      log('Handling /start command');
      
      try {
        // Check if user exists
        const existingUsers = await databases.listDocuments(
          DATABASE_ID,
          process.env.USERS_COLLECTION_ID,
          [Query.equal('telegramId', userId)]
        );

        if (existingUsers.documents.length === 0) {
          // Create new user
          await databases.createDocument(
            DATABASE_ID,
            process.env.USERS_COLLECTION_ID,
            ID.unique(),
            {
              telegramId: userId,
              username: username,
              createdAt: new Date().toISOString()
            }
          );
          log(`Created new user: ${userId}`);
        }

        const welcomeMessage = `🤖 Welcome to your AI Assistant!\n\nI'm here to help you with any questions or tasks. Just send me a message and I'll do my best to assist you!\n\nType anything to get started.`;
        
        await sendTelegramMessage(chatId, welcomeMessage, log);
        return res.json({ ok: true }, 200);
        
      } catch (dbError) {
        log(`Database error in /start: ${dbError.message}`);
        await sendTelegramMessage(chatId, 'Welcome! I\'m your AI assistant. How can I help you today?', log);
        return res.json({ ok: true }, 200);
      }
    }

    // Handle regular messages
    try {
      log('Processing regular message');
      
      // Ensure user exists
      let user;
      try {
        const existingUsers = await databases.listDocuments(
          DATABASE_ID,
          process.env.USERS_COLLECTION_ID,
          [Query.equal('telegramId', userId)]
        );

        if (existingUsers.documents.length === 0) {
          user = await databases.createDocument(
            DATABASE_ID,
            process.env.USERS_COLLECTION_ID,
            ID.unique(),
            {
              telegramId: userId,
              username: username,
              createdAt: new Date().toISOString()
            }
          );
          log(`Created new user: ${userId}`);
        } else {
          user = existingUsers.documents[0];
        }
      } catch (userError) {
        log(`User creation/fetch error: ${userError.message}`);
        // Continue without database user tracking
      }

      // Get or create active session
      let session;
      try {
        const activeSessions = await databases.listDocuments(
          DATABASE_ID,
          process.env.SESSIONS_COLLECTION_ID,
          [
            Query.equal('userId', userId),
            Query.equal('active', true)
          ]
        );

        if (activeSessions.documents.length === 0) {
          session = await databases.createDocument(
            DATABASE_ID,
            process.env.SESSIONS_COLLECTION_ID,
            ID.unique(),
            {
              userId: userId,
              active: true,
              createdAt: new Date().toISOString()
            }
          );
          log(`Created new session: ${session.$id}`);
        } else {
          session = activeSessions.documents[0];
          log(`Using existing session: ${session.$id}`);
        }
      } catch (sessionError) {
        log(`Session error: ${sessionError.message}`);
        // Continue without session tracking
      }

      // Get conversation history
      let conversationHistory = [];
      if (session) {
        try {
          const chatHistory = await databases.listDocuments(
            DATABASE_ID,
            process.env.CHATS_COLLECTION_ID,
            [
              Query.equal('sessionId', session.$id),
              Query.orderDesc('createdAt'),
              Query.limit(10)
            ]
          );

          conversationHistory = chatHistory.documents
            .reverse()
            .map(chat => ({
              role: chat.role,
              content: chat.content
            }));
          
          log(`Retrieved ${conversationHistory.length} previous messages`);
        } catch (historyError) {
          log(`Chat history error: ${historyError.message}`);
        }
      }

      // Store user message
      if (session) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            process.env.CHATS_COLLECTION_ID,
            ID.unique(),
            {
              sessionId: session.$id,
              userId: userId,
              role: 'user',
              content: userMessage,
              createdAt: new Date().toISOString()
            }
          );
          log('Stored user message');
        } catch (storeError) {
          log(`Error storing user message: ${storeError.message}`);
        }
      }

      // Prepare messages for AI
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Be friendly, helpful, and concise in your responses. Keep your answers under 500 characters when possible.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];

      // Generate AI response
      const aiResponse = await generateAIResponse(messages, log);

      // Store AI response
      if (session) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            process.env.CHATS_COLLECTION_ID,
            ID.unique(),
            {
              sessionId: session.$id,
              userId: userId,
              role: 'assistant',
              content: aiResponse,
              createdAt: new Date().toISOString()
            }
          );
          log('Stored AI response');
        } catch (storeError) {
          log(`Error storing AI response: ${storeError.message}`);
        }
      }

      // Send response to user
      await sendTelegramMessage(chatId, aiResponse, log);
      
      return res.json({ ok: true }, 200);

    } catch (processingError) {
      log(`Error processing message: ${processingError.message}`);
      await sendTelegramMessage(chatId, 'Sorry, I encountered an error. Please try again.', log);
      return res.json({ ok: true }, 200);
    }

  } catch (mainError) {
    error(`Main function error: ${mainError.message}`);
    error(`Stack trace: ${mainError.stack}`);
    
    // Try to send error response if we have chat info
    try {
      if (req.body && req.body.message && req.body.message.chat) {
        await sendTelegramMessage(
          req.body.message.chat.id, 
          'Sorry, something went wrong. Please try again later.',
          log
        );
      }
    } catch (errorResponseError) {
      error(`Error sending error response: ${errorResponseError.message}`);
    }
    
    return res.json({ ok: false, error: 'Internal server error' }, 500);
  }
};
