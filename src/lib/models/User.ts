import { User } from '@authapex/core';
import { UserProvider } from '@/lib/userFilters';

export interface UserWithPassword extends User {
  password: string;
  googleId?: string;
  emailVerified?: boolean;
}

export interface AdminUser extends User {
  provider: UserProvider;
  emailVerified: boolean;
}
