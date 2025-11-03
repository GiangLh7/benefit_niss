import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntidadeEmpregadoraIdRequest, EntidadeEmpregadoraNissRequest, EntidadeEmpregadoraRequest, UpsertEntidadeEmpregadoraRequest } from '../request-models/entidadeEmpregadora-request';
import { EntidadeEmpregadoraConsultaResponse, EntidadeEmpregadoraDeclaracaoViewResponse } from '../response-models/entidadeEmpregadora-response';


@Injectable({
  providedIn: 'root'
})
export class EntidadeEmpregadoraService {

  constructor(
    private http: HttpClient
  ) { }


  public getEntidadeEmpregadoraByIdEntidade(id: number) : Observable<EntidadeEmpregadoraConsultaResponse>  {
    return this.http.get<EntidadeEmpregadoraConsultaResponse>(`${environment.apiUrl}/entidadeEmpregadora/GetByIdEntidade/`+id)
    .pipe(map(x => {
      let response : EntidadeEmpregadoraConsultaResponse = {
      };
      if(x == null)
        return response;
      response = x;
      return response;
    }))

  }

  public updateEntidadeEmpregadora(entity: EntidadeEmpregadoraRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/entidadeEmpregadora/UpdateEntidade`, entity);
  }

  public GetEntidadeInfoForDeclaracao(request: EntidadeEmpregadoraIdRequest) {
    return this.http.post<EntidadeEmpregadoraDeclaracaoViewResponse>(`${environment.apiUrl}/entidadeEmpregadora/GetEntidadeInfoForDeclaracao`, request);
  }

  public GetEntidadeByNiss(request: EntidadeEmpregadoraNissRequest) {
    return this.http.post<EntidadeEmpregadoraDeclaracaoViewResponse>(`${environment.apiUrl}/entidadeEmpregadora/GetEntidadeByNiss`, request);
  }

  public upsertEntidadeEmpregadora(request: UpsertEntidadeEmpregadoraRequest) {
    return this.http.post(`${environment.apiUrl}/entidadeEmpregadora/upsert`, request);
  }

}



