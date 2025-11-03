import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { EntidadeEmpregadoraIdRequest, EntidadeEmpregadoraRequest } from '../request-models/entidadeEmpregadora-request';
import { EntidadeEmpregadoraConsultaResponse, EntidadeEmpregadoraDeclaracaoViewResponse } from '../response-models/entidadeEmpregadora-response';
import { map } from 'rxjs/operators';
import { ApiHelperService } from './api-helper.service';






@Injectable({
  providedIn: 'root'
})
export class EntidadeEmpregadoraService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiHelperService
  ) { }


  public getEntidadeEmpregadoraByIdEntidade(id: number) : Observable<EntidadeEmpregadoraConsultaResponse>  {

  const path = `entidadeEmpregadora/GetByIdEntidade/${id}`;
  // Gọi: /api/<base64-url>
  return this.api.get<EntidadeEmpregadoraConsultaResponse>(path)

    // return this.http.get<EntidadeEmpregadoraConsultaResponse>(`${environment.apiUrl}/entidadeEmpregadora/GetByIdEntidade/`+id)
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
   // 1️⃣ Đường dẫn gốc cần gọi
  const rawPath = 'entidadeEmpregadora/UpdateEntidade';

  // 3️⃣ Gửi POST đến /api/<base64> (middleware Core sẽ giải mã)
  return this.api.post<boolean>(rawPath,entity);
    // return this.http.post<boolean>(`${environment.apiUrl}/entidadeEmpregadora/UpdateEntidade`, entity);
  }

  public GetEntidadeInfoForDeclaracao(request: EntidadeEmpregadoraIdRequest) {
    const rawPath = 'entidadeEmpregadora/GetEntidadeInfoForDeclaracao';


  return this.api.post<EntidadeEmpregadoraDeclaracaoViewResponse>(
    rawPath,
    request
  );
    // return this.http.post<EntidadeEmpregadoraDeclaracaoViewResponse>(`${environment.apiUrl}/entidadeEmpregadora/GetEntidadeInfoForDeclaracao`, request);
  }

}



