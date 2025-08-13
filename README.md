# Telegram AI Chatbot with Appwrite & OpenRouter

A complete Telegram chatbot powered by Appwrite Cloud for data storage and OpenRouter.ai for AI responses.

## 🚀 Features

- **Real-time messaging** via Telegram webhooks
- **AI-powered responses** using OpenRouter.ai
- **Conversation history** stored in Appwrite database
- **Session management** for context-aware conversations
- **User management** with automatic registration
- **Error handling** and logging

## 📋 Prerequisites

- **Telegram account** (download from telegram.org)
- **Appwrite Cloud account** (free at appwrite.io)
- **OpenRouter account** (free at openrouter.ai)
- **GitHub account** (free at github.com)

## 🛠️ Complete Setup Guide

### Step 1: Create Appwrite Project

1. Go to [Appwrite Cloud](https://appwrite.io/) and sign up
2. Click "Create Project" and name it (e.g., "MyChatbot")
3. Note your **Project ID** from the dashboard

### Step 2: Set Up Database Collections

In your Appwrite project, go to **Database** and create these collections:

#### Collection 1: Users
- **Name**: `Users`
- **Attributes**:
  - `telegramId` (String, 255, Required)
  - `username` (String, 255, Optional)
  - `createdAt` (DateTime, Required)

#### Collection 2: Sessions
- **Name**: `Sessions`
- **Attributes**:
  - `userId` (String, 255, Required)
  - `active` (Boolean, Required, Default: true)
  - `createdAt` (DateTime, Required)

#### Collection 3: Chats
- **Name**: `Chats`
- **Attributes**:
  - `sessionId` (String, 255, Required)
  - `userId` (String, 255, Required)
  - `role` (String, 255, Required)
  - `content` (String, 10000, Required)
  - `createdAt` (DateTime, Required)

**Save the Collection IDs** - you'll need them later!

### Step 3: Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/) and sign up
2. Navigate to **Keys** section
3. Click "Create Key" and name it "ChatbotKey"
4. Copy your API key (starts with `sk-or-`)

### Step 4: Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "MyCoolChatbot")
4. Choose a username ending with "Bot" (e.g., "MyCoolChatbotBot")
5. Copy the **bot token** BotFather gives you

### Step 5: Create Appwrite Function

1. In Appwrite, go to **Functions**
2. Click "Create Function"
3. Name it "ChatbotFunction"
4. Select **Node.js 18** runtime
5. Connect to your GitHub repository

### Step 6: Set Environment Variables

In your Appwrite function settings, add these variables:

```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
OPENROUTER_API_KEY=xxx
TELEGRAM_TOKEN=xxx
USERS_COLLECTION_ID=your_users_collection_id
SESSIONS_COLLECTION_ID=your_sessions_collection_id
CHATS_COLLECTION_ID=your_chats_collection_id
```

**To get your Appwrite API Key:**
1. Go to **Settings** → **API Keys**
2. Click "Add API Key"
3. Name it "ChatbotKey"
4. Select scopes: `databases.read`, `databases.write`, `functions.read`
5. Click "Generate"

### Step 7: Deploy and Set Webhook

1. **Deploy your function** by committing code to GitHub
2. **Get your function URL** from Appwrite Functions → Settings → Function Domain
3. **Set Telegram webhook** by visiting this URL in your browser:

```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_FUNCTION_URL>
```

Replace:
- `<YOUR_BOT_TOKEN>` with your Telegram bot token
- `<YOUR_FUNCTION_URL>` with your Appwrite function URL

You should see: `{"ok":true,"result":true,"description":"Webhook was set"}`

### Step 8: Test Your Bot

1. Open Telegram and find your bot (@YourBotUsername)
2. Send `/start` to begin
3. Ask any question and watch your AI respond!

## 🔧 How It Works

1. **User sends message** → Telegram sends webhook to Appwrite function
2. **Function processes message** → Checks/creates user and session in database
3. **Saves message** → Stores user message in chat history
4. **Gets AI response** → Sends chat history to OpenRouter for AI response
5. **Saves AI response** → Stores AI message in chat history
6. **Sends reply** → Returns AI response to user via Telegram

## 🗂️ Database Schema

### Users Collection
Stores Telegram user information:
- `telegramId`: User's Telegram ID
- `username`: Telegram username
- `createdAt`: When user first interacted

### Sessions Collection
Manages conversation sessions:
- `userId`: Reference to user
- `active`: Whether session is currently active
- `createdAt`: Session start time

### Chats Collection
Stores all messages:
- `sessionId`: Reference to session
- `userId`: Reference to user
- `role`: Either "user" or "assistant"
- `content`: The actual message text
- `createdAt`: Message timestamp

## 🐛 Troubleshooting

### Bot not responding?
1. Check **Functions** → **Executions** for errors
2. Verify all environment variables are set correctly
3. Ensure webhook is set properly

### Database errors?
1. Verify collection IDs match your environment variables
2. Check that all required attributes are created
3. Ensure proper permissions are set

### AI responses not working?
1. Verify OpenRouter API key is correct
2. Check function logs for API errors
3. Ensure you have credits/quota on OpenRouter

## 📝 Customization

### Change AI Model
In `main.js`, modify the OpenRouter request:
```javascript
model: 'anthropic/claude-3-haiku', // Change this line
```

### Modify System Prompt
Update the system message in `generateAIResponse()`:
```javascript
{
  role: 'system',
  content: 'Your custom system prompt here'
}
```

### Add Commands
Add new command handling in the main function:
```javascript
if (userMessage === '/help') {
  await sendTelegramMessage(chatId, 'Here are available commands...');
  return res.json({ ok: true }, 200);
}
```

## 📜 License

MIT License - feel free to use and modify!

## 🆘 Support

- **Appwrite Community**: [Discord](https://appwrite.io/discord)
- **Telegram Bots**: [Official Documentation](https://core.telegram.org/bots/api)
- **OpenRouter**: [Documentation](https://openrouter.ai/docs)

---

**Happy chatting! 🤖💬**
