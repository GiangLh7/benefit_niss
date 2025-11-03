import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { MoradaDeleteRequest, MoradaListagemRequest } from '../request-models/morada-request';
import { MoradaRequest } from '../request-models/morada-request';
import { MoradaListagemResponse } from '../response-models/morada-response';




@Injectable({
  providedIn: 'root'
})
export class MoradaService {

  constructor(
    private http: HttpClient
  ) { }


  public getMoradaByIdEntidadeEmpregadora(request: MoradaListagemRequest) : Observable<MoradaListagemResponse>  {
    return this.http.post<MoradaListagemResponse>(`${environment.apiUrl}/morada/GetByIdEntidadeEmpregadora`,request);
  }

  public getMoradaByIdTrabalhador(request: MoradaListagemRequest) : Observable<MoradaListagemResponse>  {
    return this.http.post<MoradaListagemResponse>(`${environment.apiUrl}/morada/GetByIdTrabalhador`,request);
  }

  public saveMorada(entity: MoradaRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/morada/SaveMorada`, entity);
  }

  public updateMorada(entity: MoradaRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/morada/UpdateMorada`, entity);
  }

  public deleteMorada(entity: MoradaDeleteRequest) {
    return this.http.post(`${environment.apiUrl}/morada/DeleteMorada`, entity);
  }
}
