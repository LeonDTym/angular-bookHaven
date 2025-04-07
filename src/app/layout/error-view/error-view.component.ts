import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-error-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './error-view.component.html',
  styleUrl: './error-view.component.scss',
})
export class ErrorViewComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly route = inject(ActivatedRoute);

  message = '';

  ngOnInit(): void {
    this.message =
      (this.location.getState() as { message: string })?.message ?? this.route.snapshot.data['message'] ?? 'Произошла неизвестная ошибка.';
  }
}
