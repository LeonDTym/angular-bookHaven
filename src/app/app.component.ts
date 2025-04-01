import { DOCUMENT } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, MatSlideToggleModule, FormsModule, MatIconModule, CommonModule, MatButton, HttpClientModule, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);

  isDarkTheme = signal(false);
  isAuthenticated = signal(false); // Сигнал для отслеживания состояния авторизации
  userName = signal(''); // Сигнал для хранения имени пользователя
  userEmail = signal(''); // Сигнал для хранения email пользователя

  constructor(private apiService: ApiService) {
    // Инжектируем ApiService
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme) {
      this.isDarkTheme.set(JSON.parse(savedTheme)); // Устанавливаем состояние темы
    }

    // Получаем текущего пользователя из базы данных
    this.apiService.fetchCurrentUser();

    // Подписываемся на изменения текущего пользователя
    effect(() => {
      const currentUser = this.apiService.currentUser();
      if (currentUser) {
        this.isAuthenticated.set(true);
        this.userName.set(currentUser.name); // Устанавливаем имя пользователя
        this.userEmail.set(currentUser.email); // Устанавливаем email пользователя
      } else {
        this.isAuthenticated.set(false);
        this.userName.set('');
        this.userEmail.set(''); // Сбрасываем email пользователя
      }
    });

    effect(() => {
      if (this.isDarkTheme()) {
        this.document.documentElement.classList.add('dark');
      } else {
        this.document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleTheme() {
    this.isDarkTheme.update(isDark => {
      const newTheme = !isDark;
      localStorage.setItem('isDarkTheme', JSON.stringify(newTheme)); // Сохраняем новое состояние в localStorage
      return newTheme;
    });
  }

  logout() {
    this.isAuthenticated.set(false);
    this.userName.set(''); // Сбрасываем имя пользователя
    this.userEmail.set(''); // Сбрасываем email пользователя
    this.apiService.logout(); // Вызываем метод logout из ApiService
    // Дополнительно: перенаправление на страницу входа
  }
}
