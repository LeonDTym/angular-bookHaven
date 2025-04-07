import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../service/api.service';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrl: './add-book.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    ReactiveFormsModule,
  ],
})
export class AddBookComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  genres = ['Художественная литература', 'Научно-популярная литература', 'Наука', 'Фэнтези', 'Драма', 'Ужасы', 'Мистика', 'Приключения']; // Список жанров

  bookForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    author: ['', Validators.required],
    publicationDate: ['', Validators.required],
    img: ['', Validators.required],
    genre: [[], Validators.required],
  });

  onSubmit(): void {
    if (this.bookForm.valid) {
      const bookData = {
        title: this.bookForm.value.title?.trim() || '',
        description: this.bookForm.value.description?.trim() || '',
        author: this.bookForm.value.author?.trim() || '',
        publicationDate: this.formatDate(this.bookForm.value.publicationDate),
        img: this.bookForm.value.img?.trim() || '',
        genre: this.bookForm.value.genre || [],
      };

      console.log('Отправка данных на сервер:', bookData);

      this.apiService.addBook(bookData).subscribe({
        next: () => {
          alert('Книга успешно добавлена!');
          this.bookForm.reset();
        },
        error: err => {
          console.error('Ошибка при добавлении книги:', err);
          alert('Не удалось добавить книгу. Проверьте данные и повторите попытку.');
        },
      });
    } else {
      alert('Пожалуйста, заполните все поля формы.');
    }
  }

  private formatDate(date: string | null | undefined): string {
    if (!date) return '';
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = parsedDate.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
