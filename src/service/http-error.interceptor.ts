import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, NEVER, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error) => {
      if (![500, 404, 403, 0].includes(error.status)) {
        return throwError(() => error.error);
      }

      let message = error.error?.title;

      if (error.status === 500) message = "Произошла внутренняя ошибка. Обратитесь в тех. поддержку.";
      if (error.status === 404) message = "Запрашиваемая вами страница не найдена.";
      if (error.status === 403) message = "Запрашиваемая вами страница не найдена.";
      if (error.status === 0) message = "Сервер не доступен. Попробуйте позже.";

      router.navigateByUrl('/error', { state: { message: message } });
      return NEVER;
    })
  );
};
