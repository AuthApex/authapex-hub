'use client';

import { PropsAs } from '@/lib/typeHelpers';
import { ElementType } from 'react';
import NoSsr from '@/components/noSsr/NoSsr';

export interface NoSsrWrapperProps<T extends ElementType> {
  as: T;
}

export function NoSsrWrapper<T extends ElementType>({ children, as, ...props }: PropsAs<NoSsrWrapperProps<T>, T>) {
  const Component = as;
  return (
    <NoSsr>
      {/* @ts-expect-error Props mapping */}
      <Component {...props}>{children}</Component>
    </NoSsr>
  );
}
