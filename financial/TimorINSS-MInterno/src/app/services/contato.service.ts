import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ContatoDeleteRequest, ContatoListagemRequest } from '../request-models/contato-request';
import { ContatoRequest } from '../request-models/contato-request';
import { ContatoListagemResponse } from '../response-models/contato-response';




@Injectable({
  providedIn: 'root'
})
export class ContatoService {

  constructor(
    private http: HttpClient
  ) { }


  public getContatoByIdEntidadeEmpregadora(request: ContatoListagemRequest) : Observable<ContatoListagemResponse>  {
    return this.http.post<ContatoListagemResponse>(`${environment.apiUrl}/contato/GetByIdEntidadeEmpregadora`,request);
  }

  public getContatoByIdTrabalhador(request: ContatoListagemRequest) : Observable<ContatoListagemResponse>  {
    return this.http.post<ContatoListagemResponse>(`${environment.apiUrl}/contato/GetByIdTrabalhador`,request);
  }

  public saveContato(entity: ContatoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/contato/SaveContato`, entity);
  }

  public updateContato(entity: ContatoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/contato/UpdateContato`, entity);
  }

  public deleteContato(entity: ContatoDeleteRequest) {
    return this.http.post(`${environment.apiUrl}/contato/DeleteContato`, entity);
  }
}
