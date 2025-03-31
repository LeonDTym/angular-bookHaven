import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';

// Определяем тип для возвращаемого объекта пользователя без пароля
type PublicUser = Omit<User, 'password'>;

export interface AuthResponse {
  token: string;
  user: PublicUser; // Используем PublicUser вместо User
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  // Сигналы для хранения токена, текущего пользователя и пользователей
  token = signal<string | null>(null);
  currentUser = signal<PublicUser | null>(null);
  users = signal<User[]>([]);

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        this.token.set(response.token); // Сохраняем токен в сигнал
        this.currentUser.set(response.user); // Устанавливаем текущего пользователя
        localStorage.setItem('jwtToken', response.token); // Сохраняем токен в localStorage
        localStorage.setItem('userName', response.user.name); // Сохраняем имя пользователя в localStorage
      }),
      catchError(err => {
        console.error('Error during login:', err);
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { email, password, name }).pipe(
      tap(//Логика регистрации
          response =>{
            this.token.set(response.token); // Сохраняем токен в сигнал
            this.currentUser.set(response.user); // Устанавливаем текущего пользователя
            localStorage.setItem('jwtToken', response.token); // Сохраняем токен в localStorage
            localStorage.setItem('userName', response.user.name); // Сохраняем имя пользователя в localStorage
          }),
      catchError(err => {
        console.error('Error during registration:', err);
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken'); // Получаем токен из localStorage
  }

  logout(): void {
    this.token.set(null); // Сбрасываем токен
    this.currentUser.set(null); // Сбрасываем текущего пользователя
    localStorage.removeItem('jwtToken'); // Удаляем токен из localStorage
  }

  getUsers(): void {
    this.http
      .get<User[]>(`${this.baseUrl}/users`)
      .pipe(
        tap(data => this.users.set(data)), // Устанавливаем пользователей в сигнал
        catchError(err => {
          console.error('Error fetching users:', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }

  fetchAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`).pipe(
      catchError(err => {
        console.error('Error fetching users:', err);
        return throwError(() => err);
      })
    );
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

  fetchCurrentUser(): void {
    const token = this.getToken();
    if (!token) {
      console.error('No token found. Cannot fetch current user.');
      return;
    }

    this.http
      .get<PublicUser>(`${this.baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap(user => {
          this.currentUser.set(user); // Устанавливаем текущего пользователя
        }),
        catchError(err => {
          console.error('Error fetching current user:', err);
          return throwError(() => err);
        })
      )
      .subscribe();
  }
}
