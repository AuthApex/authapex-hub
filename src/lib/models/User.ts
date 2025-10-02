import { User } from '@authapex/core';

export interface UserWithPassword extends User {
  password: string;
  googleId?: string;
}
