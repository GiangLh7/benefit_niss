import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DeleteReceitaRequest, GetComponenteReceitaRegistoByIdContaOSSRequest, ReceitasNaoConciliadasRelatorioRequest, RegistoReceitaRequest } from '../request-models/componenteReceitaRegisto-request';
import { ComponenteReceitaRegistoResponse } from '../response-models/componenteReceitaRegisto-response';
import { GetExecucaoOrcamentalRelatoriosRequest } from '../request-models/agrupamentoConfig-request';
import { RelatoriosExecucaoOrcamentalListagemResponse } from '../response-models/agrupamentoConfig-response';
import { FilterRequest } from '../request-models/utils-request';
import { ReceitaNaoConciliadaRelatorioResponse, ReceitaRelatorioResponse } from '../models/componenteReceitaRegisto';

@Injectable({
  providedIn: 'root'
})
export class ComponenteReceitaRegistoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public addEditComponenteReceitaRegisto(entity: RegistoReceitaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteReceitaRegisto/AddEditComponenteReceitaRegisto`, entity);
  }

  public GetComponenteReceitaRegistoByContaOSSId(request: GetComponenteReceitaRegistoByIdContaOSSRequest): Observable<ComponenteReceitaRegistoResponse>
  {
    return this.http.post<ComponenteReceitaRegistoResponse>(`${environment.apiUrl}/componenteReceitaRegisto/GetComponenteReceitaRegistoByContaOSSId`, request);
  }

  public deleteReceita(request: DeleteReceitaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteReceitaRegisto/DeleteReceita`, request);
  }

  public GetExecucaoOrcamental(request: GetExecucaoOrcamentalRelatoriosRequest): Observable<RelatoriosExecucaoOrcamentalListagemResponse> {
    return this.http.post<RelatoriosExecucaoOrcamentalListagemResponse>(`${environment.apiUrl}/componenteReceitaRegisto/GetExecucaoOrcamental`, request);
  }

  public GetExecucaoOrcamentalExcel(request: GetExecucaoOrcamentalRelatoriosRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/componenteReceitaRegisto/GetExecucaoOrcamentalExcel`, request);
  }

  public GetReceitasRelatorio(request: FilterRequest): Observable<ReceitaRelatorioResponse> {
    return this.http.post<ReceitaRelatorioResponse>(`${environment.apiUrl}/componenteReceitaRegisto/ReceitasRelatorios`, request);
  }

  public GetReceitasRelatorioExcel(request: FilterRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/componenteReceitaRegisto/ReceitasRelatoriosExcel`, request);
  }

  public GetReceitasNaoConciliadasRelatorio(request: ReceitasNaoConciliadasRelatorioRequest): Observable<ReceitaNaoConciliadaRelatorioResponse> {
    return this.http.post<ReceitaNaoConciliadaRelatorioResponse>(`${environment.apiUrl}/componenteReceitaRegisto/ReceitasNaoConciliadasRelatorios`, request);
  }

  public GetReceitasNaoConciliadasRelatorioExcel(request: ReceitasNaoConciliadasRelatorioRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/componenteReceitaRegisto/ReceitasNaoConciliadasRelatoriosExcel`, request);
  }



}
