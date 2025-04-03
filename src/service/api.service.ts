import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from './user.model';
import { Book } from './book.model';
import { FavoriteBook } from './favorite-book.model';
import { jwtDecode } from 'jwt-decode'; // Убедитесь, что библиотека jwt-decode установлена

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
  private authenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      this.setAuthentication(true); // Устанавливаем состояние аутентификации, если токен существует и актуален
      this.fetchCurrentUser(); // Загружаем текущего пользователя
    }
  }

  // Метод для проверки актуальности токена
  private isTokenValid(token: string): boolean {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime; // Проверяем, не истёк ли срок действия токена
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
        this.token.set(response.token); // Сохраняем токен в сигнал
        this.currentUser.set(response.user); // Устанавливаем текущего пользователя
        localStorage.setItem('jwtToken', response.token); // Сохраняем токен в localStorage
        localStorage.setItem('userName', response.user.name); // Сохраняем имя пользователя в localStorage
        this.setAuthentication(true); // Устанавливаем состояние аутентификации
      }),
      catchError(err => {
        console.error('Error during login:', err);
        return throwError(() => err);
      })
    );
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, { email, password, name }).pipe(
      tap(
        //Логика регистрации
        response => {
          this.token.set(response.token); // Сохраняем токен в сигнал
          this.currentUser.set(response.user); // Устанавливаем текущего пользователя
          localStorage.setItem('jwtToken', response.token); // Сохраняем токен в localStorage
          localStorage.setItem('userName', response.user.name); // Сохраняем имя пользователя в localStorage
          this.setAuthentication(true); // Устанавливаем состояние аутентификации
        }
      ),
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
    this.setAuthentication(false); // Сбрасываем состояние аутентификации
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

  getBooks(filters: { author?: string; isFavorite?: boolean }, sortBy?: string): Observable<Book[]> {
    const params = new HttpParams()
      .set('author_like', filters.author || '')
      .set('isFavorite', filters.isFavorite !== undefined ? filters.isFavorite.toString() : '')
      .set('_sort', sortBy || '');

    return this.http.get<Book[]>(`${this.baseUrl}/books`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching books:', err);
        return throwError(() => err);
      })
    );
  }
  getFavoriteBooks(userId: number): Observable<FavoriteBook[]> {
    return this.http.get<FavoriteBook[]>(`${this.baseUrl}/favorite_books?userId=${userId}`).pipe(
      catchError(err => {
        console.error('Error fetching favorite books:', err);
        return throwError(() => err);
      })
    );
  }

  addFavoriteBook(userId: number, bookId: string): Observable<FavoriteBook> {
    const favoriteBook: FavoriteBook = {
      id: Date.now().toString(),
      userId: userId,
      bookId: bookId,
    };

    console.log('Adding favorite book:', favoriteBook); // Логируем объект

    return this.http.post<FavoriteBook>(`${this.baseUrl}/favorite_books`, favoriteBook).pipe(
      tap(response => {
        console.log('Response from server:', response); // Логируем ответ от сервера
      }),
      catchError(err => {
        console.error('Error adding favorite book:', err);
        return throwError(() => err);
      })
    );
  }

  removeFavoriteBook(userId: number, bookId: string): Observable<void> {
    // Формируем URL с параметрами userId и bookId
    const url = `${this.baseUrl}/favorite_books?userId=${userId}&bookId=${bookId}`;

    return this.http.delete<void>(url).pipe(
      catchError(err => {
        console.error('Error removing favorite book:', err);
        return throwError(() => err);
      })
    );
  }
}
