import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiHelperService {
  constructor(private http: HttpClient) {}

  /** 🔹 Hàm encode path chung cho toàn project */
  public encodePath(rawPath: string): string {
    return btoa(unescape(encodeURIComponent(rawPath)))
      .replace(/\+/g, '-')   // Base64 URL-safe (+ → -)
      .replace(/\//g, '_')   // (/ → _)
      .replace(/=+$/, '');   // remove trailing '='
  }

  /** 🔹 POST auto-encode */
  public post<T>(rawPath: string, body: any): Observable<T> {
    const encoded = this.encodePath(rawPath);
    return this.http.post<T>(`${environment.apiUrl}/${encoded}`, body);
  }

  /** 🔹 GET auto-encode */
  public get<T>(rawPath: string): Observable<T> {
    const encoded = this.encodePath(rawPath);
    return this.http.get<T>(`${environment.apiUrl}/${encoded}`);
  }
}
