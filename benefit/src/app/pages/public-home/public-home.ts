import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-home.html',
  styleUrl: './public-home.scss',
})
export class PublicHome {
  private readonly router = inject(Router);

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
