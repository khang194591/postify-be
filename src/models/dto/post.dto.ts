import { Post } from '@prisma/client';

export class PostDto implements Post {
  id: number;
  title: string;
  body: string;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date;
}
