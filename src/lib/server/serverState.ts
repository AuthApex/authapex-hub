import 'server-only';
import { MongoClient } from 'mongodb';
import { getMongoDbClient } from '@/lib/clients/getMongoDbClient';
import { OAuth2Client } from 'google-auth-library';
import { getGoogleClient } from '@/lib/clients/getGoogleClient';
import { CloudflareClient } from 'cloudflare-images';
import { getCloudflareImagesClient } from '@/lib/clients/getCloudflareImagesClient';

declare global {
  var serverState: ServerState;
}

export interface ServerState {
  sessionSecret: Uint8Array<ArrayBufferLike>;
  mongoClient: MongoClient;
  mongoDbName: string;
  googleClient: OAuth2Client;
  cloudflareImages: CloudflareClient;
}

export function getServerState(): ServerState {
  if (globalThis.serverState == null) {
    if (!process.env.SESSION_SECRET || !process.env.MONGODB_DB_NAME) {
      throw new Error('Env properties are not defined.');
    }
    globalThis.serverState = {
      sessionSecret: new TextEncoder().encode(process.env.SESSION_SECRET),
      mongoClient: getMongoDbClient(),
      mongoDbName: process.env.MONGODB_DB_NAME,
      googleClient: getGoogleClient(),
      cloudflareImages: getCloudflareImagesClient(),
    };
  }
  return globalThis.serverState;
}
