import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { AgrupamentoConfigResponse } from '../response-models/agrupamentoConfig-response';
import { GetAgrupamentoConfigRequest } from '../request-models/agrupamentoConfig-request';





@Injectable({
  providedIn: 'root'
})
export class AgrupamentoConfigService {

  constructor(
    private http: HttpClient
  ) { }


  public getAgrupamentoConfigByIdCodigoContaTipoConta(request: GetAgrupamentoConfigRequest): Observable<AgrupamentoConfigResponse>
  {
    return this.http.post<AgrupamentoConfigResponse>(`${environment.apiUrl}/agrupamentoConfig/GetAgrupamentoConfigByIdCodigoContaTipoConta`, request);
  }
}
