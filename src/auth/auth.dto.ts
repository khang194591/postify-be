import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserDto } from 'src/models/dto/user.dto';

export class SignInDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class SignUpDto extends SignInDto {
  @IsNotEmpty()
  lName: string;
  @IsNotEmpty()
  fName: string;
}

export class AuthResponse {
  token: string;
  user: UserDto;
}
