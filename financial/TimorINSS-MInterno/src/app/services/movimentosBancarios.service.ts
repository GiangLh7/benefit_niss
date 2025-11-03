import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { ConciliarMovimentosPermissionsListRequest, ConciliarMovimentosRequest, DesfazerConciliacaoRequest, GetMovimentosConciliadosRequest, MovimentosAConciliarConciliacaoFilterRequest, MovimentosAConciliarFilterRequest, MovimentosBancariosConciliacaoFilterRequest, MovimentosDespesaReceitaUpsertRequest, MovimentosListagemRequest, MovimentosUpsertRequest } from '../request-models/movimentosBancarios-request';
import { ContasBancariasListagemResponse, MovimentosListagemResponse, MovimentosDespesaReceitaListagemResponse, MovimentoBancarioDropListResponse, MovimentosConciliadosResponse, SaldoMovimentosResponse, ConciliarMovimentosPermissionsListResponse } from '../response-models/movimentosBancarios-response';
import { ComponenteReceitaRegistoResponse } from '../response-models/componenteReceitaRegisto-response';
import { GetGuiaMovimentoRequest } from '../request-models/componenteOrcamentoRegisto-request';




@Injectable({
  providedIn: 'root'
})
export class movimentosBancariosService {

  constructor(
    private http: HttpClient
  ) { }

  public saveMovimentoBancario(entity: MovimentosUpsertRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/movimentosBancarios/InsertMovimento`, entity);
  }

  public updateMovimentoBancario(entity: MovimentosUpsertRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/movimentosBancarios/UpdateMovimento`, entity);
  }

  public saveMovimentoDespesaReceita(entity: MovimentosDespesaReceitaUpsertRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/movimentosPorConciliar/CreateMovimentoPorConciliar`, entity);
  }

  public updateMovimentoDespesaReceita(entity: MovimentosDespesaReceitaUpsertRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/movimentosPorConciliar/UpdateMovimentoPorConciliar`, entity);
  }

  public listMovimentosBancarios(entity: MovimentosListagemRequest) : Observable<MovimentosListagemResponse> {
    return this.http.post<MovimentosListagemResponse>(`${environment.apiUrl}/movimentosBancarios/ListMovimentos`, entity);
  }

  public ListContasBancarias(incluirSaldo: boolean = false) : Observable<ContasBancariasListagemResponse> {
    return this.http.get<ContasBancariasListagemResponse>(`${environment.apiUrl}/movimentosBancarios/ListContasBancarias?incluirSaldo=${incluirSaldo}`);
  }

  public GetMovimentoBancarioDropList(tipoMovimento: number) : Observable<MovimentoBancarioDropListResponse> {
    return this.http.get<MovimentoBancarioDropListResponse>(`${environment.apiUrl}/movimentosBancarios/getMovimentoBancarioDropList?domainFilterId=${tipoMovimento || ""}`);
  }

  public ListMovimentoDespesaReceita(entity: MovimentosAConciliarFilterRequest) : Observable<MovimentosDespesaReceitaListagemResponse> {
    return this.http.post<MovimentosDespesaReceitaListagemResponse>(`${environment.apiUrl}/movimentosPorConciliar/GetListagem`, entity);
  }

  public ListMovimentosBancariosConciliacao(entity: MovimentosBancariosConciliacaoFilterRequest) : Observable<MovimentosListagemResponse> {
    return this.http.post<MovimentosListagemResponse>(`${environment.apiUrl}/movimentosBancarios/ListMovimentosConciliacao`, entity);
  }

  public ListMovimentoDespesaReceitaConciliacao(entity: MovimentosAConciliarConciliacaoFilterRequest) : Observable<MovimentosDespesaReceitaListagemResponse> {
    return this.http.post<MovimentosDespesaReceitaListagemResponse>(`${environment.apiUrl}/movimentosPorConciliar/GetListagemConciliacao`, entity);
  }

  public DesfazerConciliacao(entity: DesfazerConciliacaoRequest) {
    return this.http.post<DesfazerConciliacaoRequest>(`${environment.apiUrl}/movimentosPorConciliar/DesfazerConciliacao`, entity);
  }

  public GetMovimentosConciliados(request: GetMovimentosConciliadosRequest): Observable<MovimentosConciliadosResponse>
  {
    return this.http.post<MovimentosConciliadosResponse>(`${environment.apiUrl}/movimentosPorConciliar/GetMovimentosConciliados`, request);
  }

  public ListSaldoMovimentos(request: any = {}) : Observable<SaldoMovimentosResponse> {
    return this.http.post<SaldoMovimentosResponse>(`${environment.apiUrl}/movimentosBancarios/ListSaldoMovimentos`, request);
  }

  public ConciliarMovimentos(request: ConciliarMovimentosRequest) {
    return this.http.post(`${environment.apiUrl}/movimentosPorConciliar/ConciliarMovimentos`, request);
  }

  public ListPermissions(request: ConciliarMovimentosPermissionsListRequest): Observable<ConciliarMovimentosPermissionsListResponse> {
    return this.http.post<ConciliarMovimentosPermissionsListResponse>(`${environment.apiUrl}/movimentosBancarios/ListPermissions`, request);
  }

  public listMovimentosBancariosExcel(entity: MovimentosListagemRequest) : Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/movimentosBancarios/ListMovimentosExcel`, entity);
  }

  public getMovimentoGuia(entity: GetGuiaMovimentoRequest) : Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/movimentosPorConciliar/GetMovimentoGuia`, entity);
  }
}
