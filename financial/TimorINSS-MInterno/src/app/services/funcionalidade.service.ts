import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FuncionalidadesListagemResponse } from '../response-models/funcionalidade-response';



@Injectable({
  providedIn: 'root'
})
export class FuncionalidadeService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllFuncionalidades(): Observable<FuncionalidadesListagemResponse>
  {
    return this.http.get<FuncionalidadesListagemResponse>(`${environment.apiUrl}/funcionalidade/GetAllFuncionalidades`);
  }

}
