# 🤖 Complete Beginner's Guide: Build Your Own Telegram AI Chatbot

This tutorial will walk you through creating a Telegram chatbot powered by AI, completely free! No prior coding experience needed.

## 🎯 What You'll Build

Your chatbot will:
- ✅ Respond intelligently to any message using AI
- ✅ Remember conversations for context
- ✅ Work on Telegram (billions of users!)
- ✅ Store data safely in the cloud
- ✅ Be completely free to run

## 🛠️ Tools We'll Use

- **Appwrite Cloud**: Free cloud database and hosting (like having a computer in the cloud)
- **OpenRouter.ai**: Free AI responses (the "brain" of your bot)
- **Telegram**: Where people will chat with your bot
- **GitHub**: Free code storage and deployment

## 📚 Step-by-Step Tutorial

### Step 1: Set Up Your Appwrite Cloud Account

**What is Appwrite?** Think of it as a free computer in the cloud that stores your bot's data and runs its code.

1. **Open your browser** and go to: https://appwrite.io/
2. **Click "Sign Up"** in the top-right corner
3. **Choose how to sign up:**
   - Click "Sign up with Google" (easiest), OR
   - Use "Sign up with Email" and create a password
4. **Complete verification** (check your email if you used email signup)
5. **Log in** to see your dashboard

### Step 2: Create Your First Project

**What's a project?** It's like a workspace for your chatbot.

1. **Click "Create Project"** (big button in the center)
2. **Name your project:** Type something like `MyChatbot`
3. **Click "Create"**
4. **Save your Project ID:** At the top of the new page, you'll see "Project ID" with a long string like `67f6ead918e72f1f30f4`. Copy this and save it in a text file on your computer!

### Step 3: Set Up Your Database

**What's a database?** It's like filing cabinets where your bot stores information.

#### 3.1 Create the Database
1. **Click "Database"** in the left sidebar (looks like a filing cabinet)
2. You'll see "Create Database" - the default database is fine for now

#### 3.2 Create Collections (Data Tables)

You need 3 collections - think of them as different filing cabinets:

**Collection 1: Users** (stores info about people using your bot)
1. **Click "Add Collection"**
2. **Name:** Type `Users`
3. **Click "Create"**
4. **Add these attributes** (click "Add Attribute" for each):

   **Attribute 1:**
   - Type: `String`
   - Key: `telegramId`
   - Size: `255`
   - ✅ Check "Required"
   - Click "Create"

   **Attribute 2:**
   - Type: `String`
   - Key: `username`
   - Size: `255`
   - ❌ Leave "Required" unchecked
   - Click "Create"

   **Attribute 3:**
   - Type: `DateTime`
   - Key: `createdAt`
   - ✅ Check "Required"
   - Click "Create"

5. **Save the Collection ID:** Copy the long string at the top (e.g., `67f64d80000eb41830cf`) and save it as "Users Collection ID"

**Collection 2: Sessions** (tracks active conversations)
1. **Go back:** Click "Collections" at the top
2. **Click "Add Collection"**
3. **Name:** Type `Sessions`
4. **Add these attributes:**

   **Attribute 1:**
   - Type: `String`
   - Key: `userId`
   - Size: `255`
   - ✅ Check "Required"

   **Attribute 2:**
   - Type: `Boolean`
   - Key: `active`
   - Default: `true`
   - ✅ Check "Required"

   **Attribute 3:**
   - Type: `DateTime`
   - Key: `createdAt`
   - ✅ Check "Required"

5. **Save the Collection ID**

**Collection 3: Chats** (stores all messages)
1. **Go back to Collections**
2. **Click "Add Collection"**
3. **Name:** Type `Chats`
4. **Add these attributes:**

   **Attribute 1:**
   - Type: `String`
   - Key: `sessionId`
   - Size: `255`
   - ✅ Required

   **Attribute 2:**
   - Type: `String`
   - Key: `userId`
   - Size: `255`
   - ✅ Required

   **Attribute 3:**
   - Type: `String`
   - Key: `role`
   - Size: `255`
   - ✅ Required

   **Attribute 4:**
   - Type: `String`
   - Key: `content`
   - Size: `10000`
   - ✅ Required

   **Attribute 5:**
   - Type: `DateTime`
   - Key: `createdAt`
   - ✅ Required

5. **Save the Collection ID**

### Step 4: Get Your AI Power (OpenRouter)

**What's OpenRouter?** It's a free service that gives your bot AI intelligence.

1. **Go to:** https://openrouter.ai/
2. **Click "Sign Up"**
3. **Create account** (use Google or email)
4. **Get your API key:**
   - Click "Keys" in the left menu
   - Click "Create Key"
   - Name it `ChatbotKey`
   - Click "Generate"
   - **IMPORTANT:** Copy the key (starts with `sk-or-`) and save it!

### Step 5: Create Your Telegram Bot

**What's a Telegram bot?** It's like creating a new contact that people can message.

1. **Open Telegram** (app or https://web.telegram.org/)
2. **Find BotFather:** Search for `@BotFather` and click on the official account (has a blue checkmark)
3. **Start the conversation:** Type `/start`
4. **Create your bot:**
   - Type: `/newbot`
   - **Bot name:** Type something like `My AI Assistant`
   - **Bot username:** Type something ending in "Bot" like `MyAIAssistantBot`
   - If taken, try adding numbers: `MyAIAssistantBot123`
5. **Get your token:** BotFather will give you a token like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`. **Copy and save this!**

### Step 6: Set Up GitHub (Code Storage)

**What's GitHub?** It's like Google Drive, but for code.

1. **Go to:** https://github.com/
2. **Click "Sign up"**
3. **Create account** with username, email, and password
4. **Create a repository:**
   - Click the "+" at top-right → "New repository"
   - **Name:** `telegram-ai-chatbot`
   - ✅ Check "Add a README file"
   - ✅ Choose "Public"
   - Click "Create repository"

### Step 7: Upload Your Code to GitHub

1. **In your GitHub repository, click "Add file" → "Create new file"**
2. **File name:** Type `src/main.js`
3. **Copy and paste** the complete main.js code from this project
4. **Scroll down and click "Commit new file"**

Repeat for these files:
- `package.json` (copy the package.json content)
- `README.md` (copy the README content)

### Step 8: Create Your Appwrite Function

**What's a function?** It's the code that runs when someone messages your bot.

1. **In Appwrite, click "Functions"** in the left sidebar
2. **Click "Create Function"**
3. **Function details:**
   - **Name:** `ChatbotFunction`
   - **Runtime:** Choose `Node.js 18`
   - Click "Next"
4. **Connect GitHub:**
   - **Source:** Choose "GitHub"
   - Click "Connect GitHub" and authorize Appwrite
   - **Repository:** Pick your `telegram-ai-chatbot` repository
   - **Branch:** Leave as `main`
   - **Root Directory:** Leave empty
   - Click "Create"

### Step 9: Add Your Secret Keys (Environment Variables)

**What are environment variables?** They're like secret notes your code can read.

1. **In your function, click "Settings"**
2. **Scroll to "Variables"**
3. **Add each variable** by clicking "Add Variable":

```
APPWRITE_ENDPOINT = https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID = [Your Project ID from Step 2]
APPWRITE_API_KEY = [Create this below ⬇️]
OPENROUTER_API_KEY = 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
TELEGRAM_TOKEN = 7737267928:AAHqSR3g9AV2PNPuuamoODbf6aIE4AxEOds
USERS_COLLECTION_ID = [Your Users Collection ID from Step 3]
SESSIONS_COLLECTION_ID = [Your Sessions Collection ID from Step 3]
CHATS_COLLECTION_ID = [Your Chats Collection ID from Step 3]
```

**To get your Appwrite API Key:**
1. Go to "Settings" in left sidebar → "API Keys"
2. Click "Add API Key"
3. **Name:** `ChatbotKey`
4. **Scopes:** Check `databases.read`, `databases.write`, `functions.read`
5. Click "Generate"
6. Copy the key and use it for `APPWRITE_API_KEY`

### Step 10: Connect Telegram to Your Bot

**What's a webhook?** It's like giving Telegram your bot's phone number.

1. **Get your function URL:**
   - In Appwrite → Functions → ChatbotFunction → Settings
   - Copy the "Function Domain" URL (e.g., `https://67f6ead918e72f1f30f4.appwrite.global`)

2. **Set the webhook:**
   - Open a new browser tab
   - Paste this URL, replacing the parts in `< >`:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_FUNCTION_URL>
   ```
   - **Example:**
   ```
   https://api.telegram.org/bot7737267928:AAHqSR3g9AV2PNPuuamoODbf6aIE4AxEOds/setWebhook?url=https://67f6ead918e72f1f30f4.appwrite.global
   ```
   - Press Enter

3. **Check result:** You should see:
   ```json
   {"ok":true,"result":true,"description":"Webhook was set"}
   ```

### Step 11: Test Your Bot! 🎉

1. **Open Telegram**
2. **Search for your bot** (e.g., `@MyAIAssistantBot`)
3. **Click "Start"** or type `/start`
4. **Send a message** like "Hello!"
5. **Wait for response** - your bot should reply with AI-generated text!

## 🐛 Troubleshooting

### Bot not responding?
1. **Check function logs:** Appwrite → Functions → ChatbotFunction → Executions
2. **Verify environment variables** are all set correctly
3. **Check webhook:** Visit the setWebhook URL again

### Getting errors?
1. **Missing variables:** Make sure all 8 environment variables are set
2. **Wrong Collection IDs:** Double-check you copied the right IDs
3. **Function not deployed:** Make sure your code is in GitHub and function shows "Ready"

### AI not working?
1. **Check OpenRouter API key** is correct
2. **Verify you have credits** on OpenRouter (free tier should work)
3. **Try different model** in the code (change `openai/gpt-3.5-turbo` to `meta-llama/llama-3.1-8b-instruct:free`)

## 🎨 Customization Ideas

### Change AI Personality
In `main.js`, find this line:
```javascript
content: 'You are a helpful AI assistant...'
```
Change it to:
```javascript
content: 'You are a funny AI comedian who always makes jokes'
```

### Add Commands
Add this code after the `/start` check:
```javascript
if (userMessage === '/help') {
  await sendTelegramMessage(chatId, '🆘 Available commands:\n/start - Start chatting\n/help - Show this message');
  return res.json({ ok: true }, 200);
}
```

### Use Different AI Models
Change this line in the OpenRouter request:
```javascript
model: 'meta-llama/llama-3.1-8b-instruct:free', // Free alternative
```

## 🎓 What You Learned

Congratulations! You've built a complete AI chatbot and learned:
- ☑️ Cloud databases (Appwrite)
- ☑️ API integration (OpenRouter)
- ☑️ Webhook handling (Telegram)
- ☑️ Serverless functions
- ☑️ Environment variables
- ☑️ Version control (GitHub)

## 🚀 Next Steps

- **Add more features:** File uploads, inline keyboards, group chat support
- **Improve AI:** Better prompts, conversation memory, personality
- **Analytics:** Track usage, popular questions, user satisfaction
- **Monetization:** Premium features, usage limits

## 💬 Get Help

- **Appwrite Discord:** https://appwrite.io/discord
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **OpenRouter Docs:** https://openrouter.ai/docs

**You did it! Share your bot with friends and enjoy your creation! 🎉**