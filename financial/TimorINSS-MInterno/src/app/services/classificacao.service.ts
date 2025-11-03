import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';



@Injectable({
  providedIn: 'root'
})
export class ClassificacaoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllClassificacao(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/classificacao/GetAllClassificacao`);
  }
  
}
