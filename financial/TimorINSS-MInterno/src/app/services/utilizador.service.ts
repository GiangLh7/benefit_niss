import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DadosUtilizadorRequest, UserUpdateRequest, UtilizadorListagemRequest, UtilizadorRequest } from '../request-models/utilizador-request';
import { UtilizadoresAcessoListagemResponse, UtilizadoresListagemResponse } from '../response-models/utilizadores-response';
import { DadosUtilizadorResponse } from '../response-models/utilizador-response';
import { map } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class UtilizadorService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public GetAllUtilizadoresInterno(request: UtilizadorListagemRequest): Observable<UtilizadoresListagemResponse>
  {
    return this.http.post<UtilizadoresListagemResponse>(`${environment.apiUrl}/utilizadores/GetAllUtilizadoresInterno`, request);
  }

  public GetUtilizadoresInternoByPerfil(request: UtilizadorListagemRequest): Observable<UtilizadoresListagemResponse>
  {
    return this.http.post<UtilizadoresListagemResponse>(`${environment.apiUrl}/utilizadores/GetUtilizadoresInternoByPerfil`, request);
  }

  public GetAllDadosUtilizador(request: DadosUtilizadorRequest) : Observable<DadosUtilizadorResponse>  {
    return this.http.post<DadosUtilizadorResponse>(`${environment.apiUrl}/utilizadores/GetAllDadosUtilizador/`,request)
  }

  public AddUtilizador(request: UtilizadorRequest) {
    return this.http.post(`${environment.apiUrl}/utilizadores/AddUtilizador`, request);
  }

  public GetAllAcessoUtilizadores(request: UtilizadorListagemRequest): Observable<UtilizadoresAcessoListagemResponse>
  {
    return this.http.post<UtilizadoresAcessoListagemResponse>(`${environment.apiUrl}/utilizadores/GetAllAcessoUtilizadores`, request);
  }

  public SwitchUserBlockState(request: UserUpdateRequest) {
    return this.http.post(`${environment.apiUrl}/utilizadores/SwitchUserBlockState`, request);
}
}
