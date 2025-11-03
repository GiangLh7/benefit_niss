import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetComponenteDespesaConfigRequest } from '../request-models/componenteDespesaConfig-request';
import { GetComponenteDespesaConfigReponse } from '../response-models/componenteDespesaConfig-response';

@Injectable({
  providedIn: 'root'
})
export class ComponenteDespesaConfigService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getComponenteDespesaConfigByTarefaAtivoId(request: GetComponenteDespesaConfigRequest): Observable<GetComponenteDespesaConfigReponse>
  {
    return this.http.post<GetComponenteDespesaConfigReponse>(`${environment.apiUrl}/componenteDespesaConfig/GetComponenteDespesaConfigByTarefaAtivoId`, request);
  }

}
