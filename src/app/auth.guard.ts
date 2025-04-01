import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ApiService } from '../service/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.apiService.isAuthenticated().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true; // Разрешить доступ
        } else {
          this.router.navigate(['/signin']); // Перенаправить на страницу входа
          return false;
        }
      })
    );
  }
}
