export class SignInDto {
  email: string;
  password: string;
}

export class SignUpDto extends SignInDto {
  lName: string;
  fName: string;
}

export class AuthResponse {
  accessToken: string;
  accessTokenExpiredAt: string;
}
