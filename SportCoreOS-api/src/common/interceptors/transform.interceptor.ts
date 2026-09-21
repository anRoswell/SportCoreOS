import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Si la data ya tiene formato { success, data }, la respetamos
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return {
            ...data,
            statusCode: data.statusCode || statusCode,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          statusCode,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
