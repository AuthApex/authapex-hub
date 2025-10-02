import 'server-only';
import * as CloudflareImages from 'cloudflare-images';

export function getCloudflareImagesClient(): CloudflareImages.CloudflareClient {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_KEY) {
    throw new Error('Env properties are not defined.');
  }
  return new CloudflareImages.CloudflareClient({
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    apiKey: process.env.CLOUDFLARE_API_KEY,
  });
}
