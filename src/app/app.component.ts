import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms'; 
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbar } from '@angular/material/toolbar'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, MatSlideToggleModule, FormsModule, MatIconModule, CommonModule, MatToolbar],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  private readonly document = inject(DOCUMENT);

  isDarkTheme = signal(false);

  constructor() {
    effect(() => {
      if (this.isDarkTheme()) {
        this.document.documentElement.classList.add('dark');
      }
      else {
        this.document.documentElement.classList.remove('dark');
      }
    })
  }

  toggleTheme() {
    this.isDarkTheme.update(isDark => !isDark);
  }
}
