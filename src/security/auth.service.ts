import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compareSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/configurations/db/prisma.service';
import { SignInDto, SignUpDto } from 'src/models/dto/auth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async signIn(dto: SignInDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user && user.password && compareSync(dto.password, user.password)) {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.id },
      });
      const accessToken = this.jwtService.sign(profile);
      const accessTokenExpiredAt =
        Date.now() + Number(this.configService.get('ACCESS_TOKEN_DURATION'));
      return { accessToken, accessTokenExpiredAt, profile };
    } else {
      throw new UnauthorizedException();
    }
  }

  async signUp(dto: SignUpDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (user) {
      throw new HttpException(
        'This email already taken',
        HttpStatus.UNAUTHORIZED,
      );
    } else {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashSync(dto.password, 10),
        },
      });
      const profile = await this.prisma.profile.create({
        data: {
          fName: dto.fName,
          lName: dto.lName,
          userId: user.id,
          role: 'USER',
        },
      });
      const accessToken = this.jwtService.sign(profile);
      const accessTokenExpiredAt =
        Date.now() + Number(this.configService.get('ACCESS_TOKEN_DURATION'));
      return { accessToken, accessTokenExpiredAt, profile };
    }
  }
}
