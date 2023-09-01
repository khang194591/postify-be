import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostDto } from 'src/models/dto/post.dto';
import { PostService } from './post.service';
import { PoliciesGuard } from 'src/casl/casl.guard';
import { AppAbility } from 'src/casl/casl-ability.factory';
import { CheckPolicies } from 'src/casl/casl.decorator';
import { Action } from 'src/auth/auth.enum';
import { Public } from 'src/auth/auth.decorator';
import { Request } from 'express';
import { ReactionType } from '@prisma/client';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  create(@Body() body: PostDto, @Req() req: Request) {
    const authorId = req.user.accountId;
    return this.postService.create({ ...body, authorId });
  }

  @Get()
  @Public()
  findAll(@Query('cursor') cursor: string, @Req() req: Request) {
    return this.postService.findAll(+cursor, +req.user?.accountId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: string, @Req() req: Request) {
    return await this.postService.findById(+id, +req.user?.accountId);
  }

  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, PostDto))
  update(@Param('id', ParseIntPipe) id: string, @Body() data: PostDto) {
    return this.postService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, PostDto))
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.postService.delete(+id);
  }

  @Patch(':postId/react')
  react(
    @Param('postId', ParseIntPipe) postId: string,
    @Query('type') type: string,
    @Req() req: Request,
  ) {
    return this.postService.react(
      +postId,
      req.user.accountId,
      type as ReactionType,
    );
  }
}
