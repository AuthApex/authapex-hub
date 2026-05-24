import { ReadonlyURLSearchParams } from 'next/navigation';

export function createQueryString(searchParams: ReadonlyURLSearchParams, name: string, newValue: string | number) {
  const params = new URLSearchParams(searchParams.toString());

  if (newValue) {
    params.set(name, String(newValue));
  } else {
    params.delete(name);
  }

  return params.toString();
}
