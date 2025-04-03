import { Component, effect, inject, signal } from '@angular/core';
// import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
// import { map } from 'rxjs/operators';
// import { AsyncPipe } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ApiService } from '../../service/api.service';
import { Book } from '../../service/book.model';
import { FavoriteBook } from '../../service/favorite-book.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    // AsyncPipe,
    CommonModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class DashboardComponent {
  private readonly document = inject(DOCUMENT);
  isAuthenticated = signal(false);
  books = signal<Book[]>([]); // Сигнал для хранения списка книг
  favoriteBooks = signal<string[]>([]);

  constructor(private apiService: ApiService) {
    effect(() => {
      const currentUser = this.apiService.currentUser();
      this.isAuthenticated.set(!!currentUser);
      if (currentUser) {
        this.loadFavoriteBooks(currentUser.id); // Загружаем любимые книги при авторизации
      }
    });

    this.loadBooks(); // Загружаем книги при инициализации
  }

  isBookFavorite(bookId: string): boolean {
    return this.favoriteBooks().includes(bookId);
  }

  loadBooks() {
    this.apiService.getBooks({author:''}, '').subscribe({
      next: books => this.books.set(books),
      error: err => console.error('Error fetching books:', err),
    });
  }

  loadFavoriteBooks(userId: number) {
    this.apiService.getFavoriteBooks(userId).subscribe({
      next:  (favoriteBooks: FavoriteBook[]) => {
        // Извлекаем только ID любимых книг
        const favoriteBookIds = favoriteBooks.map(fb => fb.bookId);
        this.favoriteBooks.set(favoriteBookIds);
      },
      error: err => console.error('Error fetching favorite books:', err),
    });
  }

  addToFavorites(bookId: string) {
    const currentUser = this.apiService.currentUser();
    if (currentUser) {
      this.apiService.addFavoriteBook(currentUser.id, bookId).subscribe({
        next: () => {
          // Обновляем список любимых книг
          this.loadFavoriteBooks(currentUser.id);
        },
        error: err => console.error('Error adding to favorites:', err),
      });
    }
  }
removeFromFavorites(bookId: string) {
  const currentUser = this.apiService.currentUser();
  if (currentUser) {
    // Check if the bookId is in the favoriteBooks array
    if (this.favoriteBooks().includes(bookId)) {
      this.apiService.removeFavoriteBook(currentUser.id, bookId).subscribe({
        next: () => {
          // Обновляем список любимых книг
          this.loadFavoriteBooks(currentUser.id);
        },
        error: err => console.error('Error removing from favorites:', err),
      });
    }
  }
}

  
}
