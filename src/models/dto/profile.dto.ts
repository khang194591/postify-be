import { $Enums, Profile } from '@prisma/client';

export class ProfileDto implements Profile {
  fName: string;
  lName: string;
  userId: number;
  role: $Enums.Role;
  id: number;
  email: string;
  password: string;
}
