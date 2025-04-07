import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Book } from './book.model';
import { FavoriteBook } from './favorite-book.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

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

    return this.http.post<FavoriteBook>(`${this.baseUrl}/favorite_books`, favoriteBook).pipe(
      catchError(err => {
        console.error('Error adding favorite book:', err);
        return throwError(() => err);
      })
    );
  }

  removeFavoriteBook(userId: number, bookId: string): Observable<void> {
    const url = `${this.baseUrl}/favorite_books?userId=${userId}&bookId=${bookId}`;
    return this.http.delete<void>(url).pipe(
      catchError(err => {
        console.error('Error removing favorite book:', err);
        return throwError(() => err);
      })
    );
  }

  addBook(book: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/books`, book).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  deleteBook(bookId: string): Observable<void> {
    const url = `${this.baseUrl}/books/${bookId}`;
    return this.http.delete<void>(url).pipe(
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  getBookById(bookId: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/books/${bookId}`).pipe(
      catchError(err => {
        console.error('Error fetching book by ID:', err);
        return throwError(() => err);
      })
    );
  }

  updateBook(book: Book): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/books/${book.id}`, book).pipe(
      catchError(err => {
        console.error('Error updating book:', err);
        return throwError(() => err);
      })
    );
  }
}
