// Debug utility to test your bot configuration
import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    log('=== DEBUG MODE ===');
    
    // Check environment variables
    const envVars = [
      'APPWRITE_ENDPOINT',
      'APPWRITE_PROJECT_ID', 
      'APPWRITE_API_KEY',
      'OPENROUTER_API_KEY',
      'TELEGRAM_TOKEN',
      'USERS_COLLECTION_ID',
      'SESSIONS_COLLECTION_ID',
      'CHATS_COLLECTION_ID'
    ];
    
    log('Environment Variables Check:');
    envVars.forEach(varName => {
      const value = process.env[varName];
      log(`${varName}: ${value ? 'SET ✓' : 'MISSING ✗'}`);
      if (value) {
        log(`  Length: ${value.length} characters`);
        log(`  First 10 chars: ${value.substring(0, 10)}...`);
      }
    });
    
    // Test Appwrite connection
    try {
      log('\nTesting Appwrite connection...');
      const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);
      
      const databases = new Databases(client);
      
      // Try to list collections
      const collections = await databases.listCollections('default');
      log(`Appwrite connection: SUCCESS ✓`);
      log(`Found ${collections.collections.length} collections`);
      
      collections.collections.forEach(collection => {
        log(`  - ${collection.name} (ID: ${collection.$id})`);
      });
      
    } catch (appwriteError) {
      log(`Appwrite connection: FAILED ✗`);
      log(`Error: ${appwriteError.message}`);
    }
    
    // Test OpenRouter connection
    try {
      log('\nTesting OpenRouter connection...');
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        log('OpenRouter connection: SUCCESS ✓');
      } else {
        log(`OpenRouter connection: FAILED ✗ (Status: ${response.status})`);
      }
    } catch (openrouterError) {
      log(`OpenRouter connection: FAILED ✗`);
      log(`Error: ${openrouterError.message}`);
    }
    
    // Test Telegram bot
    try {
      log('\nTesting Telegram bot...');
      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getMe`);
      const botInfo = await response.json();
      
      if (botInfo.ok) {
        log('Telegram bot: SUCCESS ✓');
        log(`Bot name: ${botInfo.result.first_name}`);
        log(`Bot username: @${botInfo.result.username}`);
      } else {
        log(`Telegram bot: FAILED ✗`);
        log(`Error: ${botInfo.description}`);
      }
    } catch (telegramError) {
      log(`Telegram bot: FAILED ✗`);
      log(`Error: ${telegramError.message}`);
    }
    
    log('\n=== DEBUG COMPLETE ===');
    
    return res.json({
      status: 'debug_complete',
      message: 'Check the execution logs for detailed information'
    });
    
  } catch (debugError) {
    error(`Debug error: ${debugError.message}`);
    return res.json({ error: 'Debug failed' }, 500);
  }
};