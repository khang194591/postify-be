import { $Enums, User } from '@prisma/client';

export class UserDto implements User {
  fName: string;
  lName: string;
  avatarUrl: string;
  role: $Enums.Role;
  accountId: number;
  deleted: Date;
}
