import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { GetAllRelTarefaComponenteByIdTarefaActivoRequest, UpdateRelTarefaComponenteRequest } from '../request-models/relTarefaComponente-request';
import { Observable } from 'rxjs';
import { ComponenteListagemResponse } from '../response-models/componente-response';


@Injectable({
  providedIn: 'root'
})
export class RelTarefaComponenteService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public updateRelTarefaComponente(entity: UpdateRelTarefaComponenteRequest) {
    return this.http.post(`${environment.apiUrl}/relTarefaComponente/UpdateRelTarefaComponente`, entity);
  }

  public getAllRelTarefaComponenteByIdTarefaActivo(request: GetAllRelTarefaComponenteByIdTarefaActivoRequest) : Observable<ComponenteListagemResponse> {
    return this.http.post<ComponenteListagemResponse>(`${environment.apiUrl}/relTarefaComponente/GetAllRelTarefaComponenteByIdTarefaActivo`, request);
  }
}
