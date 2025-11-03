import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { SuspensaoDeleteRequest, SuspensaoListagemRequest, SuspensaoRequest } from '../request-models/suspensao-request';
import { SuspensaoListagemResponse } from '../response-models/suspensao-response';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SuspensaoService {
  public savedSuccessfully = false;

  constructor(
    private http: HttpClient
  ) { }

  public saveSuspensao(entity: SuspensaoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/suspensao/saveSuspensao`, entity);
  }

  public getSuspensaoByIdEntidadeEmpregadora(request: SuspensaoListagemRequest) : Observable<SuspensaoListagemResponse>  {
    return this.http.post<SuspensaoListagemResponse>(`${environment.apiUrl}/suspensao/GetByIdEntidadeEmpregadora`,request);
  }

  public getSuspensaoByIdTrabalhador(request: SuspensaoListagemRequest) : Observable<SuspensaoListagemResponse>  {
    return this.http.post<SuspensaoListagemResponse>(`${environment.apiUrl}/suspensao/GetByIdTrabalhador`,request);
  }

  public deleteSuspensao(entity: SuspensaoDeleteRequest) {
    return this.http.post(`${environment.apiUrl}/suspensao/DeleteSuspensao`, entity);
  }

}



