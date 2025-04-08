import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../../service/api.service';
import { Book } from '../../../service/models/book.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-book',
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
  ],
})
export class EditBookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  bookForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    author: ['', Validators.required],
    publicationDate: ['', Validators.required],
    img: ['', Validators.required],
    genre: [[], Validators.required],
  });

  bookId: string | null = null;

  genres = ['Художественная литература', 'Научно-популярная литература', 'Наука', 'Фэнтези', 'Драма', 'Ужасы', 'Мистика', 'Приключения']; // Список жанров

  ngOnInit(): void {
    this.bookId = decodeURIComponent(this.route.snapshot.paramMap.get('id') || '');
    console.log(' bookId:', this.bookId);
    if (this.bookId && /^[a-zA-Z0-9_-]+$/.test(this.bookId)) {
      this.apiService.getBookById(this.bookId).subscribe({
        next: (book: Book) => {
          const formattedBook = {
            ...book,
            publicationDate: new Date(book.publicationDate),
          };
          this.bookForm.patchValue(formattedBook);
        },
        error: (err: unknown) => {
          console.error('Ошибка при загрузке книги:', err);
          alert('Книга не найдена.');
          this.router.navigate(['/error'], { state: { message: 'Книга с указанным идентификатором не найдена.' } });
        },
      });
    } else {
      console.error('Некорректный bookId:', this.bookId);
      alert('Некорректный идентификатор книги.');
      this.router.navigate(['/error'], { state: { message: 'Некорректный идентификатор книги.' } });
    }
  }

  onSubmit(): void {
    if (this.bookForm.valid && this.bookId) {
      const updatedBook: Book = {
        ...this.bookForm.value,
        id: this.bookId,
        publicationDate: this.formatDate(this.bookForm.value.publicationDate),
      };
      this.apiService.updateBook(updatedBook).subscribe({
        next: () => {
          alert('Книга успешно обновлена!');
          this.router.navigate(['/']);
        },
        error: (err: unknown) => {
          console.error('Ошибка при обновлении книги:', err);
          alert('Не удалось обновить книгу. Попробуйте снова.');
        },
      });
    } else {
      alert('Пожалуйста, заполните все поля формы.');
    }
  }

  private formatDate(date: string | null | undefined): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${day}.${month}.${year}`;
  }
}
