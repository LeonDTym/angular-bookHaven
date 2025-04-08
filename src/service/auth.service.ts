import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './models/user.model';
import { jwtDecode } from 'jwt-decode';
import { AuthResponse } from './models/auth-response.model';

type PublicUser = Omit<User, 'password'>;
export type { AuthResponse };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://localhost:3000';
  token = signal<string | null>(null);
  currentUser = signal<PublicUser | null>(null);
  users = signal<User[]>([]);
  private authenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      this.setAuthentication(true);
      this.fetchCurrentUser();
    }
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Invalid token:', error);
      return false;
    }
  }

  isAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  setAuthentication(state: boolean): void {
    this.authenticated.next(state);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        this.token.set(response.token);
        this.currentUser.set(response.user);
        localStorage.setItem('jwtToken', response.token);
        localStorage.setItem('userName', response.user.name);
        this.setAuthentication(true);
      }),
      catchError(err => {
        console.error('Error during login:', err);
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { email, password, name }).pipe(
      tap(response => {
        this.token.set(response.token);
        this.currentUser.set(response.user);
        localStorage.setItem('jwtToken', response.token);
        localStorage.setItem('userName', response.user.name);
        this.setAuthentication(true);
      }),
      catchError(err => {
        console.error('Error during registration:', err);
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('jwtToken');
    this.setAuthentication(false);
  }

  fetchCurrentUser(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    this.http
      .get<PublicUser>(`${this.baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap(user => {
          this.currentUser.set(user);
        }),
        catchError(err => {
          console.error('Error fetching current user:', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getUsers(): void {
    this.http
      .get<User[]>(`${this.baseUrl}/users`)
      .pipe(
        tap(data => this.users.set(data)), // Обновляем сигнал users
        catchError(err => {
          console.error('Error fetching users:', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`).pipe(
      catchError(err => {
        console.error(`Error fetching user with id ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user).pipe(
      catchError(err => {
        console.error('Error adding user:', err);
        return throwError(() => err);
      })
    );
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/users/${id}`, user).pipe(
      catchError(err => {
        console.error(`Error updating user with id ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  deleteUser(id: number): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/users/${id}`).pipe(
      catchError(err => {
        console.error(`Error deleting user with id ${id}:`, err);
        return throwError(() => err);
      })
    );
  }
}
