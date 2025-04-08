import { Component, effect, signal } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../service/api.service';
import { AuthService } from '../../service/auth.service';
import { Book } from '../../service/models/book.model';
import { FavoriteBook } from '../../service/models/favorite-book.model';
import { RouterModule } from '@angular/router';

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
    MatChipsModule,
    RouterModule,
  ],
})
export class DashboardComponent {
  isAuthenticated = signal(false);
  books = signal<Book[]>([]);
  favoriteBooks = signal<string[]>([]);
  selectedAuthor = '';
  selectedGenre = '';
  showFavorites = false;
  sortBy = '';
  authors: string[] = [];
  genres: string[] = [];
  filteredBooks = signal<Book[]>([]);

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    effect(() => {
      const currentUser = this.authService.currentUser();
      this.isAuthenticated.set(!!currentUser);
      if (currentUser) {
        this.loadFavoriteBooks(currentUser.id);
      }
    });

    this.loadBooks();

    effect(() => {
      this.filteredBooks.set(this.books());
      this.authors = [...new Set(this.books().map(book => book.author))];
      this.genres = [...new Set(this.books().flatMap(book => book.genre))]; // уникальные жанры из массивов
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
        const favoriteBookIds = favoriteBooks.map(fb => fb.bookId);
        this.favoriteBooks.set(favoriteBookIds);
      },
      error: err => console.error('Error fetching favorite books:', err),
    });
  }

  addToFavorites(bookId: string) {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.apiService.addFavoriteBook(currentUser.id, bookId).subscribe({
        next: () => {
          this.loadFavoriteBooks(currentUser.id);
        },
        error: err => console.error('Error adding to favorites:', err),
      });
    }
  }

  removeFromFavorites(bookId: string) {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      if (this.favoriteBooks().includes(bookId)) {
        this.apiService.removeFavoriteBook(currentUser.id, bookId).subscribe({
          next: () => {
            const updatedFavorites = this.favoriteBooks().filter(id => id !== bookId);
            this.favoriteBooks.set(updatedFavorites);
            this.applyFilters();
          },
          error: (err: unknown) => console.error('Error removing from favorites:', err),
        });
      }
    }
  }

  deleteBook(bookId: string) {
    if (confirm('Вы уверены, что хотите удалить эту книгу?')) {
      this.apiService.deleteBook(bookId).subscribe({
        next: () => {
          this.books.set(this.books().filter(book => book.id !== bookId));
        },
        error: (err: unknown) => console.error('Error deleting book:', err),
      });
    }
  }

  applyFilters() {
    let books = [...this.books()];

    if (this.selectedAuthor) {
      books = books.filter(book => book.author === this.selectedAuthor);
    }

    if (this.selectedGenre) {
      // Фильтрация по жанру
      books = books.filter(book => book.genre.includes(this.selectedGenre));
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
