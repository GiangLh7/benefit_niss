import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly storageKey = 'benefit-authenticated';
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly authenticated = signal<boolean>(this.restoreSession());

  readonly isAuthenticated = this.authenticated.asReadonly();

  login(username: string, password: string): Observable<boolean> {
    const url = '/api/login/InternalAuthenticate';
    const body = { Username: username, Password: password };

    return of({ token: 'TEST_ONLY', accessToken: 'TEST_ONLY' }).pipe(
      map((response: any) => {
        // consider token presence as success
        const hasToken = !!(response && (response.token || response.accessToken));
        if (hasToken) {
          sessionStorage.setItem('benefit-token', response.token || response.accessToken);
        }
        sessionStorage.setItem(this.storageKey, hasToken ? 'true' : 'false');
        this.authenticated.set(hasToken);
        return hasToken;
      }),
      finalize(() => of('TEMP_TOKEN')),
      catchError(() => {
        this.authenticated.set(false);
        sessionStorage.removeItem('benefit-token');
        sessionStorage.setItem(this.storageKey, 'false');
        return of(false);
      }),
    );
  }

  logout(): void {
    this.authenticated.set(false);
    sessionStorage.removeItem(this.storageKey);
    void this.router.navigate(['/']);
  }

  hasActiveSession(): boolean {
    return this.authenticated();
  }

  private restoreSession(): boolean {
    return sessionStorage.getItem(this.storageKey) === 'true';
  }
}
