import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';
import { PrismaService } from 'src/configurations/db/prisma.service';
import { AuthResponse, SignInDto, SignUpDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  hashData(data: string) {
    return hashSync(data, 10);
  }

  async getAccountByEmail(email: string) {
    return this.prisma.account.findUnique({
      where: { email },
      include: { user: true },
    });
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    const account = await this.getAccountByEmail(dto.email);
    if (
      account &&
      account.password &&
      compareSync(dto.password, account.password)
    ) {
      const user = await this.prisma.user.findUnique({
        where: { accountId: account.id },
      });
      const token = this.jwtService.sign(user);
      return { user, token };
    } else {
      throw new UnauthorizedException('Bad credentials');
    }
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const password = this.hashData(dto.password);
    const account = await this.prisma.account.create({
      data: {
        email: dto.email,
        password,
        user: {
          create: {
            fName: dto.fName,
            lName: dto.lName,
            role: 'USER',
          },
        },
      },
      include: {
        user: true,
      },
    });
    const user = account.user;
    const token = this.jwtService.sign(user);
    return { user, token };
  }
}
