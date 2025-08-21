import 'server-only';
import { MongoClient } from 'mongodb';
import { getMongoDbClient } from '@/lib/clients/getMongoDbClient';
import { OAuth2Client } from 'google-auth-library';
import { getGoogleClient } from '@/lib/clients/getGoogleClient';

declare global {
  // eslint-disable-next-line no-var
  var serverState: ServerState;
}

export interface ServerState {
  sessionSecret: Uint8Array<ArrayBufferLike>;
  mongoClient: MongoClient;
  mongoDbName: string;
  googleClient: OAuth2Client;
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
    };
  }
  return globalThis.serverState;
}
