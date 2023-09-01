import { Body, Controller, Post, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from 'src/models/dto/comment.dto';
import { Request } from 'express';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  create(@Body() body: CommentDto, @Req() req: Request) {
    // const authorId = req.user.accountId;
    // return this.commentService.create({ ...body });
  }
}
