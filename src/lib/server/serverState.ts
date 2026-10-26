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
  readonly sessionSecret: Uint8Array<ArrayBufferLike>;
  readonly mongoClient: MongoClient;
  readonly mongoDbName: string;
  readonly googleClient: OAuth2Client | null;
  readonly cloudflareImages: CloudflareClient | null;
}

export function getServerState(): ServerState {
  if (globalThis.serverState == null) {
    if (!process.env.SESSION_SECRET || !process.env.MONGODB_DB_NAME) {
      throw new Error('Env properties are not defined.');
    }

    let googleClient: OAuth2Client | null;
    let cloudflareImages: CloudflareClient | null;

    globalThis.serverState = {
      sessionSecret: new TextEncoder().encode(process.env.SESSION_SECRET),
      mongoClient: getMongoDbClient(),
      mongoDbName: process.env.MONGODB_DB_NAME,
      get googleClient() {
        if (googleClient === undefined) {
          googleClient = getGoogleClient();
        }
        return googleClient;
      },
      get cloudflareImages() {
        if (cloudflareImages === undefined) {
          cloudflareImages = getCloudflareImagesClient();
        }
        return cloudflareImages;
      },
    };
  }
  return globalThis.serverState;
}
