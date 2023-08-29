import { HttpStatus } from '@nestjs/common';

export class ErrorDto {
  exception: string;
  status: HttpStatus;
  message: string;
}
