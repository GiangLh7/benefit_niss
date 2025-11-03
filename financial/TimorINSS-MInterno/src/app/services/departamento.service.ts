import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { DepartamentoListagemResponse } from '../response-models/departamento-response';



@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllDepartamentosAtivo(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/departamento/GetAllDepartamentosAtivo`);
  }

  public getDepartamentosByUserId(id: number): Observable<DepartamentoListagemResponse>
  {
    return this.http.post<DepartamentoListagemResponse>(`${environment.apiUrl}/relUtilizadorDepartamento/GetDepartamentosByUserId`, id);
  }
  
}
