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
import { ApiService, Book } from '../../service/api.service';

interface CardContent {
  title: string;
  description: string;
  imageUrl: string;
}

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
  cards = signal<CardContent[]>([]);
  
  // private breakpointObserver = inject(BreakpointObserver);

  /** Based on the screen size, switch from standard to one column per row */
  // cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
  //   map(({ matches }) => {
  //     if (matches) {
  //       return [
  //         { title: 'Card 1', cols: 1, rows: 1 },
  //         { title: 'Card 2', cols: 1, rows: 1 },
  //         { title: 'Card 3', cols: 1, rows: 1 },
  //       ];
  //     }

  //     return [
  //       { title: 'Card 1', cols: 1, rows: 1 },
  //       { title: 'Card 2', cols: 1, rows: 1 },
  //       { title: 'Card 3', cols: 1, rows: 1 },
  //     ];
  //   })
  // );

  constructor(private apiService: ApiService) {
    effect(() => {
      const currentUser = this.apiService.currentUser();
      this.isAuthenticated.set(!!currentUser);
    });

    this.loadBooks(); // Загружаем книги при инициализации
  }

  loadBooks() {
    this.apiService.getBooks({}, '').subscribe({
      next: books => this.books.set(books),
      error: err => console.error('Error fetching books:', err),
    });
  }
}
