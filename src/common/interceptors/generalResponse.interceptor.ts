import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

@Injectable()
export class GeneralResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = GqlExecutionContext.create(context);
    const operation = gqlCtx.getInfo()?.operation?.operation;

    if (operation === 'subscription') {
      return next.handle();
    }

    return next.handle().pipe(
      map((data: any) => {
        const isArray = Array.isArray(data);
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data?.items)
            ? data.data.items
            : [];

        return {
          success: true,
          statusCode: data?.statusCode || 200,
          message: data?.message || 'Request successful',
          timeStamp: new Date().toISOString().split('T'),
          pagination: data?.pagination,
          url: data?.url,
          items,
          data: isArray
            ? data
            : typeof data?.data === 'number' || typeof data?.data === 'string'
              ? data.data
              : typeof data?.data === 'object'
                ? data.data
                : (data?.data ?? null),
        };
      }),

      catchError((error) => {
        return throwError(
          () =>
            new GraphQLError(error.message || 'An error occurred', {
              extensions: {
                success: false,
                statusCode: error?.response?.statusCode || error?.status || 500,
                message:
                  error?.errors?.map((err: any) => err?.message) ||
                  error?.response?.message ||
                  error?.extensions?.message ||
                  'An error occurred',
                timeStamp: new Date().toISOString().split('T')[0],
                error: error?.response?.error || 'Unknown error',
              },
            }),
        );
      }),
    );
  }
}
