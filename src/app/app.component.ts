import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ApiService } from '../service/api.service';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
     RouterModule,
      MatSlideToggleModule,
       FormsModule, MatIconModule,
        CommonModule, MatButton, MatMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);

  isDarkTheme = signal(false);
  isAuthenticated = signal(false);
  userName = signal('');
  userEmail = signal(''); 

  constructor(private apiService: ApiService, private authService: AuthService) {
    
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme) {
      this.isDarkTheme.set(JSON.parse(savedTheme)); 
    }


    this.authService.fetchCurrentUser();


    effect(() => {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.isAuthenticated.set(true);
        this.userName.set(currentUser.name); 
        this.userEmail.set(currentUser.email);
      } else {
        this.isAuthenticated.set(false);
        this.userName.set('');
        this.userEmail.set(''); 
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
      localStorage.setItem('isDarkTheme', JSON.stringify(newTheme)); 
      return newTheme;
    });
  }

  logout() {
    this.isAuthenticated.set(false);
    this.userName.set('');
    this.userEmail.set('');
    this.authService.logout();
  }
}
