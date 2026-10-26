import type { Metadata, Viewport } from 'next';
import { getTranslation } from '@/locales/lang';
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import '../globals.css';

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ lang: string }> }>): Promise<Metadata> {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  return {
    title: trans.title,
    description: trans.description,
  };
}
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

const locales = ['en', 'cs'];

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;

  if (!locales.includes(lang)) {
    notFound();
  }

  return (
    <html lang={lang} data-theme="dark">
      <body className="text-base text-base-content bg-neutral md:bg-transparent">{children}</body>
    </html>
  );
}
