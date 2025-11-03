import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RegimeCampoEditaveisSaveRequest, ValorCamposEditaveisDeleteRequest, ValorCamposEditaveisRequest, ValorCamposEditaveisSaveRequest } from '../request-models/camposEditaveis-request';
import { CamposEditaveisListagemResponse, ValueCampoEditavelListagemResponse } from '../response-models/camposEditaveis-response';

@Injectable({
  providedIn: 'root'
})
export class CamposEditaveisService {

  constructor(
      private router: Router,
      private http: HttpClient
  ) {}

  public GetAllCamposEditaveis() : Observable<CamposEditaveisListagemResponse> {
    return this.http.get<CamposEditaveisListagemResponse>(`${environment.apiUrl}/camposEditaveis/GetAllCamposEditaveis`);
  }

  public GetValorCampoEditavel(request: ValorCamposEditaveisRequest) : Observable<ValueCampoEditavelListagemResponse> {
    return this.http.post<ValueCampoEditavelListagemResponse>(`${environment.apiUrl}/camposEditaveis/GetValorCampoEditavel`, request);
  }

  public SaveValorCampoEditavel(request: ValorCamposEditaveisSaveRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/camposEditaveis/SaveValorCampoEditavel`, request);
  }

  public DeleteValorCampoEditavel(request: ValorCamposEditaveisDeleteRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/camposEditaveis/DeleteValorCampoEditavel`, request);
  }

  public SaveRegimeCampoEditavel(request: RegimeCampoEditaveisSaveRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/camposEditaveis/SaveRegimeCampoEditavel`, request);
  }
}
