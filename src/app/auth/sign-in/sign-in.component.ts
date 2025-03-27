import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule,ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule, MatIconModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})

export class SignInComponent {
  authForm: FormGroup;
  hide = signal(true);

  constructor(private fb: FormBuilder) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
  
  onSubmit() {
    if (this.authForm.valid) {
      const formData = this.authForm.value;
      console.log('Form Data:', formData);
      alert('Здарова кубаноид');
      // Здесь вы можете добавить логику для отправки данных на сервер
    }
  }
}
