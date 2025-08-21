import { ComponentPropsWithoutRef, ElementType } from 'react';

export type PropsAs<Props, T extends ElementType> = Props & Omit<ComponentPropsWithoutRef<T>, keyof Props>;
