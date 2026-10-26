import 'server-only';
import * as CloudflareImages from 'cloudflare-images';

/**
 * Creates the Cloudflare Images client, or returns `null` when profile image uploads are not configured.
 *
 * Profile image uploads are optional, so a missing account id/api key must not prevent the rest of the hub from
 * working.
 */
export function getCloudflareImagesClient(): CloudflareImages.CloudflareClient | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  if (!accountId || !apiKey) {
    return null;
  }
  return new CloudflareImages.CloudflareClient({ accountId, apiKey });
}
