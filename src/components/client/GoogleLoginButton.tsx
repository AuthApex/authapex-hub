'use client';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { signinWithGoogle } from '@/lib/actions/auth';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface GoogleLoginButtonProps {
  className?: string;
}

export function GoogleLoginButton({ className }: GoogleLoginButtonProps) {
  const onError = () => console.error('There was an error with Google auth');

  if (!googleClientId) {
    return null;
  }

  return (
    <div className={className} style={{ colorScheme: 'auto' }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin onSuccess={signinWithGoogle} onError={onError} width={320} theme="filled_black" />
      </GoogleOAuthProvider>
    </div>
  );
}
