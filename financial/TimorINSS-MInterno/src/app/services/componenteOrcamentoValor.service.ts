import { Observable } from 'rxjs';
import { SearchComponentesOrcamentoValorResponse } from './../response-models/componenteOrcamentoValor-response';
import { EliminarComponenteOrcamentoValorRequest, SearchComponenteOrcamentoValorRequest } from './../request-models/componenteOrcamentoValor-request';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { AddComponenteOrcamentoValorRequest } from '../request-models/componenteOrcamentoValor-request';

@Injectable({
  providedIn: 'root'
})
export class componenteOrcamentoValorService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public AddOrcamentoValor(request: AddComponenteOrcamentoValorRequest) {
    return this.http.post(`${environment.apiUrl}/componenteOrcamentoValor/AddOrcamentoValor`, request);
  }

  public SearchOrcamentoValor(request: SearchComponenteOrcamentoValorRequest): Observable<SearchComponentesOrcamentoValorResponse> {
    return this.http.post<SearchComponentesOrcamentoValorResponse>(`${environment.apiUrl}/componenteOrcamentoValor/SearchOrcamentoValor`, request);
  }

  public editarOrcamentoValor(request: AddComponenteOrcamentoValorRequest) {
    return this.http.post<AddComponenteOrcamentoValorRequest>(`${environment.apiUrl}/componenteOrcamentoValor/EditOrcamentoValor`, request);
  }

  public eliminarOrcamentoValor(request: EliminarComponenteOrcamentoValorRequest) {
    return this.http.post<EliminarComponenteOrcamentoValorRequest>(`${environment.apiUrl}/componenteOrcamentoValor/EliminarOrcamentoValor`, request);
  }
}
