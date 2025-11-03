import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { BalancoRelatoriosRequest, DeletePagamentoRequest, EditPagamentoExecutadoRequest, FornecedoresRelatoriosRequest, GetDestinatarioPagamentoRequest, GetOrdensPagamentoRelatoriosRequest, GetPagamentoExecutadoRequest, ListagemPagamentosProcessoRequest, ReportsDropdownContasOGERequest, SaveClassificacaoContabilisticaExecucaoRequest, SavePagamentoExecutadoRequest } from '../request-models/pagamentoExecutado-request';
import { DestinatarioPagamentoExecutadosResponse, ListagemPagamentosProcessoResponse, RelatoriosOrdensPagamentoListagemResponse } from '../response-models/pagamentosExecutados-response';
import { FilterRequest } from '../request-models/utils-request';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { GetExecucaoOrcamentalRelatoriosRequest } from '../request-models/agrupamentoConfig-request';
import { RelatoriosExecucaoOrcamentalListagemResponse } from '../response-models/agrupamentoConfig-response';
import { BalancoResponse, ClassificacaoContabilisticaResponse, FornecedoresResponse } from '../models/pagamentos_executados';

@Injectable({
  providedIn: 'root'
})
export class PagamentoExecutadoService {

  constructor(
      private http: HttpClient
  ) {}

  public SavePagamentoExecutado(entity: SavePagamentoExecutadoRequest){
    return this.http.post(`${environment.apiUrl}/pagamentoExecutado/SavePagamentoExecutado`, entity);
  }

  public GetDestinatariosPagamentoByNumPagamento(request: GetDestinatarioPagamentoRequest): Observable<DestinatarioPagamentoExecutadosResponse>
  {
    return this.http.post<DestinatarioPagamentoExecutadosResponse>(`${environment.apiUrl}/pagamentoExecutado/GetDestinatariosPagamentoByNumPagamento`, request);
  }

  public DeletePagamento(request: DeletePagamentoRequest) {
    return this.http.post(`${environment.apiUrl}/pagamentoExecutado/DeletePagamento`, request);
  }

  public GetPagamentosExecutadosByIdDestinatario(request: GetPagamentoExecutadoRequest): Observable<DestinatarioPagamentoExecutadosResponse>
  {
    return this.http.post<DestinatarioPagamentoExecutadosResponse>(`${environment.apiUrl}/pagamentoExecutado/GetPagamentosExecutadosByIdDestinatario`, request);
  }

  public GetListaPagamentoExcel(request: ListagemPagamentosProcessoRequest): Observable<DestinatarioPagamentoExecutadosResponse>
  {
    return this.http.post<DestinatarioPagamentoExecutadosResponse>(`${environment.apiUrl}/pagamentoExecutado/GetListaPagamentoExcel`, request);
  }

  public EditPagamentoExecutado(entity: EditPagamentoExecutadoRequest){
    return this.http.post(`${environment.apiUrl}/pagamentoExecutado/EditPagamentoExecutado`, entity);
  }

  public GetOrdensPagamentoRelatoriosGrouped(request: GetOrdensPagamentoRelatoriosRequest): Observable<RelatoriosOrdensPagamentoListagemResponse> {
    return this.http.post<RelatoriosOrdensPagamentoListagemResponse>(`${environment.apiUrl}/pagamentoExecutado/GetPagamentosRelatoriosGrouped`, request);
  }

  public GetOrdensPagamentoRelatorios(request: GetOrdensPagamentoRelatoriosRequest): Observable<RelatoriosOrdensPagamentoListagemResponse> {
    return this.http.post<RelatoriosOrdensPagamentoListagemResponse>(`${environment.apiUrl}/pagamentoExecutado/GetPagamentosRelatorios`, request);
  }

  public ExtractToExcelRelatorios(request: GetOrdensPagamentoRelatoriosRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/ExtractToExcelRelatorios`, request);
  }

  public GetDropdownContasOGE(request: ReportsDropdownContasOGERequest): Observable<SelectDescriptionResponse> {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/GetDropdownContasOGE`, request);
  }

  public GetCentrosCusto(request: FilterRequest): Observable<SelectDescriptionResponse> {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/GetCentrosCusto`, request);
  }

  public GetExecucaoOrcamental(request: GetExecucaoOrcamentalRelatoriosRequest): Observable<RelatoriosExecucaoOrcamentalListagemResponse> {
    return this.http.post<RelatoriosExecucaoOrcamentalListagemResponse>(`${environment.apiUrl}/pagamentoExecutado/GetExecucaoOrcamental`, request);
  }

  public GetExecucaoOrcamentalExcel(request: GetExecucaoOrcamentalRelatoriosRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/GetExecucaoOrcamentalExcel`, request);
  }

  public GetListaPagamentosProcesso(request: ListagemPagamentosProcessoRequest): Observable<ListagemPagamentosProcessoResponse>
  {
    return this.http.post<ListagemPagamentosProcessoResponse>(`${environment.apiUrl}/pagamentoExecutado/GetListaPagamentosProcesso`, request);
  }

  public GetPagamentoDetails(request: GetDestinatarioPagamentoRequest): Observable<ListagemPagamentosProcessoResponse>
  {
    return this.http.post<ListagemPagamentosProcessoResponse>(`${environment.apiUrl}/pagamentoExecutado/GetPagamentoDetails`, request);
  }

  public ClassificacaoContabilisticaRelatorio(request: FilterRequest): Observable<ClassificacaoContabilisticaResponse>
  {
    return this.http.post<ClassificacaoContabilisticaResponse>(`${environment.apiUrl}/pagamentoExecutado/ClassificacaoContabilisticaRelatorios`, request);
  }

  public FornecedoresRelatorio(request: FornecedoresRelatoriosRequest): Observable<FornecedoresResponse>
  {
    return this.http.post<FornecedoresResponse>(`${environment.apiUrl}/pagamentoExecutado/FornecedoresRelatorios`, request);
  }

  public FornecedoresRelatorioExcel(request: FornecedoresRelatoriosRequest): Observable<any>
  {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/FornecedoresRelatoriosExcel`, request);
  }

  public ClassificacaoContabilisticaRelatorioExcel(request: FilterRequest): Observable<any>
  {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/ClassificacaoContabilisticaRelatoriosExcel`, request);
  }

  public BalancoRelatorio(request: BalancoRelatoriosRequest): Observable<BalancoResponse>
  {
    return this.http.post<BalancoResponse>(`${environment.apiUrl}/pagamentoExecutado/BalancoRelatorios`, request);
  }

  public BalancoRelatorioExcel(request: BalancoRelatoriosRequest): Observable<any>
  {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/BalancoRelatoriosExcel`, request);
  }

  public SaveClassificacaoExecucao(request: SaveClassificacaoContabilisticaExecucaoRequest): Observable<any>
  {
    return this.http.post<any>(`${environment.apiUrl}/pagamentoExecutado/SaveClassificacaoExecucao`, request);
  }
}
