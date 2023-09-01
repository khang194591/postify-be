import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

interface ErrorDto {
  statusCode: HttpStatus;
  message: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response<ErrorDto>>();
    const request = ctx.getRequest<Request>();

    this.logger.log({
      ip: request.ip,
      path: request.url,
      timestamp: new Date().toISOString(),
      exception,
    });

    if (exception instanceof PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          this.logger.debug(exception.stack);
          response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: `Trường ${exception.meta.target[0]} đã được sử dụng`,
          });
          break;
        case 'P2003':
          response.status(HttpStatus.CONFLICT).json({
            statusCode: HttpStatus.CONFLICT,
            message: `Some error happened`,
          });
          break;
        case 'P2025':
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: HttpStatus.NOT_FOUND,
            message: exception.meta?.cause || exception.message,
          });
        default:
          break;
      }
    } else if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        message: exception.message,
        statusCode: exception.getStatus(),
      });
    } else {
      this.logger.error(exception);
    }
  }
}
