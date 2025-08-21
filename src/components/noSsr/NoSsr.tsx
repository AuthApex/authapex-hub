import dynamic from 'next/dynamic';
import { PropsWithChildren } from 'react';

function NoSsr({ children }: PropsWithChildren) {
  return <>{children}</>;
}

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false,
});
