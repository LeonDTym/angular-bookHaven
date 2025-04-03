import { Component, effect, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { Book } from '../../service/book.model';
import { FavoriteBook } from '../../service/favorite-book.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
})
export class DashboardComponent {
  isAuthenticated = signal(false);
  books = signal<Book[]>([]); // Сигнал для хранения списка книг
  favoriteBooks = signal<string[]>([]);
  selectedAuthor = '';
  showFavorites = false;
  sortBy = '';
  authors: string[] = [];
  filteredBooks = signal<Book[]>([]);

  constructor(private apiService: ApiService) {
    effect(() => {
      const currentUser = this.apiService.currentUser();
      this.isAuthenticated.set(!!currentUser);
      if (currentUser) {
        this.loadFavoriteBooks(currentUser.id); // Загружаем любимые книги при авторизации
      }
    });

    this.loadBooks(); // Загружаем книги при инициализации

    effect(() => {
      this.filteredBooks.set(this.books());
      this.authors = [...new Set(this.books().map(book => book.author))];
    });
  }

  isBookFavorite(bookId: string): boolean {
    return this.favoriteBooks().includes(bookId);
  }

  loadBooks() {
    this.apiService.getBooks({ author: '' }, '').subscribe({
      next: books => this.books.set(books),
      error: err => console.error('Error fetching books:', err),
    });
  }

  loadFavoriteBooks(userId: number) {
    this.apiService.getFavoriteBooks(userId).subscribe({
      next: (favoriteBooks: FavoriteBook[]) => {
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

  applyFilters() {
    let books = [...this.books()];

    if (this.selectedAuthor) {
      books = books.filter(book => book.author === this.selectedAuthor);
    }

    if (this.showFavorites) {
      books = books.filter(book => this.isBookFavorite(book.id));
    }

    if (this.sortBy) {
      books.sort((a, b) => {
        if (this.sortBy === 'title') {
          return a.title.localeCompare(b.title);
        } else if (this.sortBy === 'publicationDate') {
          return new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime();
        }
        return 0;
      });
    }

    this.filteredBooks.set(books);
  }
}
