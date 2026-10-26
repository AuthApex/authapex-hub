'use client';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { signinWithGoogle } from '@/lib/actions/auth';
import { logClientInfo } from '@/lib/monitoring/client';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export interface GoogleLoginButtonProps {
  className?: string;
  flow?: string | null;
}

export function GoogleLoginButton({ className, flow }: GoogleLoginButtonProps) {
  // A cancelled or misconfigured Google popup is a user-driven outcome, not an application error.
  const onError = () => logClientInfo('Google sign in was not completed', { tags: { area: 'google-signin' } });

  if (!googleClientId) {
    return null;
  }

  return (
    <div className={className} style={{ colorScheme: 'auto' }}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <GoogleLogin
          onSuccess={(credentials) => signinWithGoogle(credentials, flow)}
          onError={onError}
          width={320}
          theme="filled_black"
        />
      </GoogleOAuthProvider>
    </div>
  );
}
