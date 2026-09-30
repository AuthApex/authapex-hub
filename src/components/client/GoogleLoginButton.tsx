'use client';

import { useTransition } from 'react';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { signinWithGoogle } from '@/lib/actions/auth';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface GoogleLoginButtonProps {
  className?: string;
  flow?: string | null;
}

export function GoogleLoginButton({ className, flow }: GoogleLoginButtonProps) {
  const [, startTransition] = useTransition();
  const onError = () => console.error('There was an error with Google auth');

  const onSuccess = (credentials: CredentialResponse) => {
    startTransition(async () => {
      await signinWithGoogle(credentials, flow);
    });
  };

  if (!googleClientId) {
    return null;
  }

  return (
    <div className={className} style={{ colorScheme: 'auto' }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin onSuccess={onSuccess} onError={onError} width={320} theme="filled_black" />
      </GoogleOAuthProvider>
    </div>
  );
}
