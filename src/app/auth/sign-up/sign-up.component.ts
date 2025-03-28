import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../service/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  imports: [CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent implements OnInit {
  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.getUsers(); // Загружаем пользователей
  }

  get users() {
    return this.apiService.users(); // Получаем текущее состояние пользователей
  }
}
