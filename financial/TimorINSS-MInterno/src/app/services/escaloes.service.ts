import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';

@Injectable({
  providedIn: 'root'
})
export class EscaloesService {

  constructor(
      private router: Router,
      private http: HttpClient
  ) {}

  public GetAllEscaloes(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/Escaloes/GetAllEscaloes`);
  }
}
