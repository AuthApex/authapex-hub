'use client';

import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';

export function CopyApiKeyButton({ apiKey, trans }: { apiKey: string; trans: Translations }) {
  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Button size="sm" onClick={() => copyToClipboard(apiKey)}>
      {trans.admin.authorizedApps.copyApiKey}
    </Button>
  );
}
