export const PERM_ROLES = {
  user: 0,
  vip: 1,
  moderator: 2,
  admin: 3,
  owner: 4,
};

export type PermRoles = 'user' | 'vip' | 'moderator' | 'admin' | 'owner';

export interface RoleModel {
  application: string;
  role: PermRoles;
}
