import { VerifiedStatus } from '@/lib/getVerifiedStatus';

export function isAppAlreadyAuthorized(
  userAppSessions: { app: string; userId: string; displayName?: string; url?: string; verified: boolean | null }[],
  appName: string,
  status: VerifiedStatus
): boolean {
  if (status === VerifiedStatus.CONFLICT) {
    return false;
  }
  let session;
  if (status === VerifiedStatus.NOT_VERIFIED) {
    session = userAppSessions.some((session) => session.app === appName && session.verified === null);
  } else if (status === VerifiedStatus.VERIFIED) {
    session = userAppSessions.some((session) => session.app === appName && session.verified === true);
  }
  return session != null;
}
