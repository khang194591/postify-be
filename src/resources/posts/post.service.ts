import { Injectable } from '@nestjs/common';
import { Prisma, ReactionType } from '@prisma/client';
import { PrismaService } from 'src/configurations/db/prisma.service';
import { PostDto } from 'src/models/dto/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly repository = this.prisma.post;

  async create(dto: PostDto) {
    try {
      return this.repository.create({ data: dto });
    } catch (error) {
      throw error;
    }
  }

  async findAll(cursor?: number, userId?: number) {
    try {
      const take = 10;
      const orderBy: Prisma.PostOrderByWithRelationInput[] = [
        { createdAt: 'desc' },
        { title: 'desc' },
      ];
      const include: Prisma.PostInclude = {
        author: true,
        reactions: true,
        _count: { select: { reactions: true } },
      };
      const items = await this.repository.findMany({
        take,
        skip: cursor ? 1 : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
        include,
      });
      return {
        items: items.map((item) => ({
          ...item,
          reacted: Boolean(userId)
            ? item.reactions?.find((item) => item.userId === userId)?.type
            : undefined,
        })),
      };
    } catch (error) {
      throw error;
    }
  }

  async findById(id: number) {
    try {
      const item = await this.repository.findUnique({ where: { id } });
      return item;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, data: PostDto) {
    try {
      return await this.repository.update({ where: { id }, data });
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.repository.delete({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async react(postId: number, userId: number, type?: ReactionType) {
    return type
      ? await this.prisma.reaction.upsert({
          where: { userId_postId: { postId, userId } },
          create: { type, postId, userId },
          update: { type },
        })
      : await this.prisma.reaction.delete({
          where: { userId_postId: { postId, userId } },
        });
  }
}
