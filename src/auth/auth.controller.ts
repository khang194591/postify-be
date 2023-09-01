import { Body, Controller, Post, Res } from '@nestjs/common';
import { Public } from './auth.decorator';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './auth.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @Public()
  async signIn(
    @Body() body: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { user, token } = await this.authService.signIn(body);
    response.cookie('token', token, {
      httpOnly: true,
      secure: true,
    });
    return { user };
  }

  @Post('sign-up')
  @Public()
  async signUp(@Body() body: SignUpDto) {
    const result = await this.authService.signUp(body);
    return result;
  }
}
