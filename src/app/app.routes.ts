import { Routes } from '@angular/router';
import { AddBookComponent } from './book/add-book/add-book.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TableComponent } from './table/table.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { AuthGuard } from './auth.guard';
import { ErrorViewComponent } from './layout/error-view/error-view.component';
import { EditBookComponent } from './book/edit-book/edit-book.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [{ path: 'error', component: ErrorViewComponent, title: 'Ошибка...' }],
  },
  {
    path: 'addbook',
    component: AddBookComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'editbook/:id',
    component: EditBookComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'table',
    component: TableComponent,
  },
  {
    path: 'signin',
    component: SignInComponent,
  },
  {
    path: 'signup',
    component: SignUpComponent,
  },
  {
    path: 'error',
    component: ErrorViewComponent,
    title: 'Ошибка...',
  },
  {
    path: '**',
    component: ErrorViewComponent,
    title: 'Страница не найдена',
    data: { message: 'Запрашиваемая вами страница не найдена.' },
  },
];
