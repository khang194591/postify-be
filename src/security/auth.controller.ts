import { Body, Controller, Post } from '@nestjs/common';
import { SignInDto, SignUpDto } from 'src/models/dto/auth.dto';
import { Public } from './auth.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @Public()
  async signIn(@Body() body: SignInDto) {
    const result = await this.authService.signIn(body);
    return result;
  }

  @Post('sign-up')
  @Public()
  async signUp(@Body() body: SignUpDto) {
    const result = await this.authService.signUp(body);
    return result;
  }
}
