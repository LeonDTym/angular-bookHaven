// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, NEVER } from 'rxjs';

// export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
  
//   return next(req).pipe(
//     catchError((error) => {
//       let message = error.error?.title;
//       if (error.status === 404) message = "Запрашиваемая вами страница не найдена.";
//       router.navigateByUrl('/error', { state: { message: message } });
//       return NEVER;
//     })
//   );
// };
