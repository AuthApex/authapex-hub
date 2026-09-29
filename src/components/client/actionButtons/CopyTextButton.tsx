'use client';

import { Button } from 'gtomy-lib';

export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const copyToClipboard = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Button size="sm" onClick={() => copyToClipboard(text)}>
      {label}
    </Button>
  );
}
