import { CS } from '@/locales/cs';
import { EN } from '@/locales/en';
import { Translations } from '@/locales/translation';

export function getTranslation(locale: string): Translations {
  if (locale === 'en') {
    return EN;
  }
  return CS;
}
