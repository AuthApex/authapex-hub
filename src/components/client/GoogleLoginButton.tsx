'use client';

import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { signinWithGoogle } from '@/lib/actions/auth';
import { logClientInfo } from '@/lib/monitoring/client';

export interface GoogleLoginButtonProps {
  className?: string;
  flow?: string | null;
  /** Passed by the server from the runtime `GOOGLE_CLIENT_ID` variable. */
  clientId: string | null;
}

export function GoogleLoginButton({ className, flow, clientId }: GoogleLoginButtonProps) {
  // A cancelled or misconfigured Google popup is a user-driven outcome, not an application error.
  const onError = () => logClientInfo('Google sign in was not completed', { tags: { area: 'google-signin' } });

  if (!clientId) {
    return null;
  }

  return (
    <div className={className} style={{ colorScheme: 'auto' }}>
      <GoogleOAuthProvider clientId={clientId}>
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
