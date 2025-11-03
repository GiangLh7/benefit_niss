import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetComponenteOrcamentoConfigRequest } from '../request-models/componenteOrcamentoConfig-request';
import { GetComponenteOrcamentoConfigReponse } from '../response-models/componenteOrcamentoConfig-response';

@Injectable({
  providedIn: 'root'
})
export class ComponenteOrcamentoConfigService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getComponenteOrcamentoConfigByTarefaAtivoId(request: GetComponenteOrcamentoConfigRequest): Observable<GetComponenteOrcamentoConfigReponse>
  {
    return this.http.post<GetComponenteOrcamentoConfigReponse>(`${environment.apiUrl}/componenteOrcamentoConfig/GetComponenteOrcamentoConfigByTarefaAtivoId`, request);
  }

}
