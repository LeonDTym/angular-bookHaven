import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../service/auth.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { httpErrorInterceptor } from '../service/http-error.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes),
      provideAnimationsAsync(),
       provideHttpClient(withInterceptors([authInterceptor,httpErrorInterceptor])),
       {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'}
      ]
};
