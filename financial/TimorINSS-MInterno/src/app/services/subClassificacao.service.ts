import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { GetAllSubClassificacaoByTarefaAtivaIdRequest } from '../request-models/tarefa-request';



@Injectable({
  providedIn: 'root'
})
export class SubClassificacaoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllSubClassificacao(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/subClassificacao/GetAllSubClassificacao`);
  }
  
  public GetAllSubClassificacaoByTarefaAtivaId(request: GetAllSubClassificacaoByTarefaAtivaIdRequest): Observable<SelectDescriptionResponse>
  {
    return this.http.post<SelectDescriptionResponse>(`${environment.apiUrl}/subClassificacao/GetAllSubClassificacaoByTarefaAtivaId`, request);
  }
}
