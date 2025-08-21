import 'server-only';
import { MongoClient } from 'mongodb';

export function getMongoDbClient(): MongoClient {
  if (!process.env.MONGODB_URI) {
    throw new Error('Env properties are not defined.');
  }
  return new MongoClient(process.env.MONGODB_URI, {});
}
