import { RoleModel } from '@/lib/models/Roles';

export interface User {
  userId: string;
  username: string;
  email: string;
  roles: RoleModel[];
  displayName: string;
  profileImageId?: string;
  profileImageUrl?: string;
}

export interface UserWithPassword extends User {
  password: string;
}
