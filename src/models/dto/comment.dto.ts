import { Comment } from '@prisma/client';

export class CommentDto implements Comment {
  id: number;
  body: string;
  authorId: number;
  postId: number;
  replyToId: number;
  createdAt: Date;
  updatedAt: Date;
  deleted: Date;
}
