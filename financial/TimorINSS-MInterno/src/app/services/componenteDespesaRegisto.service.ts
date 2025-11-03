import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {CompromissoUpsertRequest, DeleteDespesaRequest, DeleteListaDespesaRequest, DeleteRequest, DespesasRelatorioRequest, GetAllDespesaRegistadaRequest, GetDespesasCompromissoRequest, GetValoresDespesaByIdCodigoOrcamentoRequest, RegistoDespesaRequest, UpdateDespesaCabimentadaRequest, UpdateDespesaRequest } from '../request-models/componenteDespesaRegisto-request';
import { GetComponenteDespesaCabimentadaParaExecucaoReponse, GetComponenteDespesaRegistoReponse, GetDespesasCompromissoResponse, GetDespesasRelatorioReponse, GetValoresDespesaByIdCodigoOrcamentoResponse } from '../response-models/componenteDespesaRegisto-response';

@Injectable({
  providedIn: 'root'
})
export class ComponenteDespesaRegistoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public addEditComponenteDespesaRegisto(entity: RegistoDespesaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/AddEditComponenteDespesaRegisto`, entity);
  }

  public GetAllDespesaRegistadaByTarefaAtivoId(request: GetAllDespesaRegistadaRequest): Observable<GetComponenteDespesaRegistoReponse>
  {
    return this.http.post<GetComponenteDespesaRegistoReponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetAllDespesaRegistadaByTarefaAtivoId`, request);
  }

  public deleteDespesa(request: DeleteDespesaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/DeleteDespesa`, request);
  }

  public GetValoresDespesaByIdCodigoOrcamento(request: GetValoresDespesaByIdCodigoOrcamentoRequest): Observable<GetValoresDespesaByIdCodigoOrcamentoResponse>
  {
    return this.http.post<GetValoresDespesaByIdCodigoOrcamentoResponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetValoresDespesaByIdCodigoOrcamento`, request);
  }

  public deleteAllDespesasRegistadas(request: DeleteListaDespesaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/DeleteAllDespesasRegistadas`, request);
  }

  public UpdateDespesa(request: UpdateDespesaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/UpdateDespesa`, request);
  }


  public GetAllDespesaCabimentadasParaExecucaoByTarefaAtivoId(request: GetAllDespesaRegistadaRequest): Observable<GetComponenteDespesaCabimentadaParaExecucaoReponse>
  {
    return this.http.post<GetComponenteDespesaCabimentadaParaExecucaoReponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetAllDespesaCabimentadasParaExecucaoByTarefaAtivoId`, request);
  }


  public GetDespesasRelatorio(request: DespesasRelatorioRequest): Observable<GetDespesasRelatorioReponse>
  {
    return this.http.post<GetDespesasRelatorioReponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetDespesasRelatorios`, request);
  }


  public GetDespesasRelatorioExcel(request: DespesasRelatorioRequest): Observable<any>
  {
    return this.http.post<any>(`${environment.apiUrl}/componenteDespesaRegisto/GetDespesasRelatoriosExcel`, request);
  }

  public GetDespesasCompromissoByTarefaAtivoId(request: GetDespesasCompromissoRequest): Observable<GetDespesasCompromissoResponse>
  {
    return this.http.post<GetDespesasCompromissoResponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetDespesasCompromissoByTarefaAtivoId`, request);
  }

  public deleteCompromisso(request: DeleteRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/DeleteCompromisso`, request);
  }

  public upsertCompromisso(request: CompromissoUpsertRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/UpsertCompromisso`, request);
  }

  public GetAllDespesaCompromissosParaExecucaoByTarefaAtivoId(request: GetAllDespesaRegistadaRequest): Observable<GetComponenteDespesaCabimentadaParaExecucaoReponse>
  {
    return this.http.post<GetComponenteDespesaCabimentadaParaExecucaoReponse>(`${environment.apiUrl}/componenteDespesaRegisto/GetAllDespesaCompromissosParaExecucaoByTarefaAtivoId`, request);
  }

  public UpdateDespesaCabimentada(request: UpdateDespesaCabimentadaRequest) {
    return this.http.post(`${environment.apiUrl}/componenteDespesaRegisto/UpdateDespesaCabimentada`, request);
  }
}
