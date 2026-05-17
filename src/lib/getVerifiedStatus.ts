import Fuse from 'fuse.js';

export enum VerifiedStatus {
  NOT_VERIFIED,
  VERIFIED,
  CONFLICT,
}

export interface VerifiedStatusResponse {
  status: VerifiedStatus;
  displayName?: string;
}

export function getVerifiedStatus(
  authorizedApps: { name: string; displayName: string; url: string }[],
  appName: string,
  url: string
): VerifiedStatusResponse {
  const fuse = new Fuse(authorizedApps, {
    keys: ['name'],
    threshold: 0.2,
    ignoreDiacritics: true,
  });

  const verifiedApp = authorizedApps.find((app) => app.name === appName);
  if (verifiedApp == null) {
    const results = fuse.search(appName).map((result) => result.item);
    if (results.length > 0) {
      return {
        status: VerifiedStatus.CONFLICT,
      };
    }
    return {
      status: VerifiedStatus.NOT_VERIFIED,
    };
  }
  return url === verifiedApp.url
    ? { status: VerifiedStatus.VERIFIED, displayName: verifiedApp.displayName }
    : {
        status: VerifiedStatus.CONFLICT,
      };
}
