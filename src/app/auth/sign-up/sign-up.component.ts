import { Component, OnInit, signal } from '@angular/core';
import { ApiService, AuthResponse } from '../../../service/api.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatIconModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent implements OnInit {

  hide = signal(true);
  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  ngOnInit(): void {
    this.apiService.getUsers(); // Загружаем пользователей
  }

  get users() {
    return this.apiService.users(); // Получаем текущее состояние пользователей
  }

  onSubmit() {
    if (this.signUpForm.valid) {
          const { email, password, name } = this.signUpForm.value;
          this.apiService.register(email, password, name).subscribe({
            next: (response: AuthResponse) => {
              console.log('JWT Token:', response.token);
              this.router.navigate(['/']);
            },
            error: err => {
              console.error('Ошибка регистрации:', err.error.message);
              alert('Ошибка регистрации. Проверьте свои учетные данные. ' + err.error.message);
            },
          });
        }
  }
}
