import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configurations/db/prisma.service';
import { CommentDto } from 'src/models/dto/comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly repository = this.prisma.comment;

  async create(dto: CommentDto) {
    try {
      return this.repository.create({ data: dto });
    } catch (error) {
      throw error;
    }
  }
}
