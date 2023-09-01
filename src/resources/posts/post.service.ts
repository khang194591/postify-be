import { Injectable } from '@nestjs/common';
import { Prisma, ReactionType } from '@prisma/client';
import { PrismaService } from 'src/configurations/db/prisma.service';
import { PostDto } from 'src/models/dto/post.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly repository = this.prisma.post;

  private readonly include: Prisma.PostInclude = {
    author: true,
    reactions: {
      include: {
        user: {
          select: {
            fName: true,
            lName: true,
          },
        },
      },
    },
    comments: {
      orderBy: {
        updatedAt: 'desc',
      },
      take: 1,
      include: {
        replies: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    },
    _count: { select: { reactions: true, comments: true } },
  };

  async create(dto: PostDto) {
    return this.repository.create({ data: dto });
  }

  async findAll(cursor?: number, userId?: number) {
    const take = 10;
    const orderBy: Prisma.PostOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { title: 'desc' },
    ];
    const include = this.include;
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
  }

  async findById(id: number, userId?: number) {
    const include = this.include;
    const item = await this.repository.findUnique({
      where: { id },
      include,
    });
    return {
      ...item,
      reacted: Boolean(userId)
        ? item.reactions?.find((item) => item.userId === userId)?.type
        : undefined,
    };
  }

  async update(id: number, data: PostDto) {
    return await this.repository.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await this.repository.delete({ where: { id } });
  }

  async react(postId: number, userId: number, type?: ReactionType) {
    return type
      ? await this.prisma.postReaction.upsert({
          where: { userId_postId: { postId, userId } },
          create: { type, postId, userId },
          update: { type },
        })
      : await this.prisma.postReaction.delete({
          where: { userId_postId: { postId, userId } },
        });
  }
}
