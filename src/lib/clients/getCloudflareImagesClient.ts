import 'server-only';
import * as CloudflareImages from 'cloudflare-images';

export function getCloudflareImagesClient(): CloudflareImages.CloudflareClient | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  if (!accountId || !apiKey) {
    return null;
  }
  return new CloudflareImages.CloudflareClient({ accountId, apiKey });
}
