import { Post } from '@prisma/client';

export class PostDto implements Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
}
