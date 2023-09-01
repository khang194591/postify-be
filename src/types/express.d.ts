import { User as UserType } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: UserType;
    }
  }
}
