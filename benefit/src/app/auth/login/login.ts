import { CommonModule } from '@angular/common';
import { Component, Signal, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  protected readonly redirectUrl: Signal<string> = computed(() => {
    const target = this.route.snapshot.queryParamMap.get('redirectUrl');
    return target && target.startsWith('/') ? target : '/benefit';
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.auth
      .login(this.form.controls.username.value, this.form.controls.password.value)
      .subscribe((ok) => {
        if (ok) {
          void this.router.navigateByUrl(this.redirectUrl());
        } else {
          this.error.set('Invalid credentials or server error. Please try again.');
          this.submitting.set(false);
        }
      });
  }
}
