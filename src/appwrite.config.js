// Appwrite configuration helper
import { Client, Databases } from 'node-appwrite';

export function createAppwriteClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    client,
    databases: new Databases(client)
  };
}

export const config = {
  DATABASE_ID: 'default',
  COLLECTIONS: {
    USERS: process.env.USERS_COLLECTION_ID,
    SESSIONS: process.env.SESSIONS_COLLECTION_ID,
    CHATS: process.env.CHATS_COLLECTION_ID
  }
};