import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetComponenteReceitaConfigRequest } from '../request-models/componenteReceitaConfig-request';
import { GetComponenteReceitaConfigReponse } from '../response-models/componenteReceitaConfig-response';

@Injectable({
  providedIn: 'root'
})
export class ComponenteReceitaConfigService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getComponenteReceitaConfigByTarefaAtivoId(request: GetComponenteReceitaConfigRequest): Observable<GetComponenteReceitaConfigReponse>
  {
    return this.http.post<GetComponenteReceitaConfigReponse>(`${environment.apiUrl}/componenteReceitaConfig/GetComponenteReceitaConfigByTarefaAtivoId`, request);
  }

}
