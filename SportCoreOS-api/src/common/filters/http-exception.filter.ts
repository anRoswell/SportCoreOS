import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Error interno del servidor';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || (res as any).error || exception.message;
        errorType = (res as any).error || exception.name;
      } else {
        message = res || exception.message;
        errorType = exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    const errorPayload = {
      success: false,
      statusCode: status,
      error: errorType,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status}`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} - Status: ${status} - Msg: ${JSON.stringify(message)}`);
    }

    response.status(status).json(errorPayload);
  }
}
