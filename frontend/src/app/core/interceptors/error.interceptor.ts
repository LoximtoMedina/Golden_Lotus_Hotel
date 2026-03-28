import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = error?.error?.message ?? error?.message ?? 'Unknown error';
      console.error(`[HTTP ${error.status}]`, message);
      return throwError(() => new Error(message));
    }),
  );
};
