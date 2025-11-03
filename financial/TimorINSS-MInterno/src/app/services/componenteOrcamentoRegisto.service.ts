import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { GetComponenteOrcamentoRegistoAprovadoRequest, GetComponenteOrcamentoRegistoRequest, OrcamentoExtractRequest, UpdateComponenteOrcamentoRegistoDatesRequest } from '../request-models/componenteOrcamentoRegisto-request';
import { GetComponenteOrcamentoAprovadoRegistoReponse, GetComponenteOrcamentoRegistoReponse, OrcamentoExtractToExcelReponse, OrcamentoExtractToPDFReponse, UpdateComponenteOrcamentoRegistoDatesResponse } from '../response-models/componenteOrcamentoRegisto-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class componenteOrcamentoRegistoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public GetComponenteOrcamento(request: GetComponenteOrcamentoRegistoRequest) : Observable<GetComponenteOrcamentoRegistoReponse> {
    return this.http.post<GetComponenteOrcamentoRegistoReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/GetComponenteOrcamentoRegisto`, request);
  }

  public UpdateComponenteOrcamentoRegistoDates(request: UpdateComponenteOrcamentoRegistoDatesRequest) : Observable<UpdateComponenteOrcamentoRegistoDatesResponse> {
    return this.http.post<UpdateComponenteOrcamentoRegistoDatesResponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/UpdateComponenteOrcamentoRegistoDates`, request);
  }

  public GetOrcamentoAprovadoDespesaByIdTarefaActivo(entity: GetComponenteOrcamentoRegistoAprovadoRequest) : Observable<GetComponenteOrcamentoAprovadoRegistoReponse> {
    return this.http.post<GetComponenteOrcamentoAprovadoRegistoReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/GetOrcamentoAprovadoDespesaByIdTarefaActivo`, entity);
  }

  public RetificarOrcamentoAprovado(entity: UpdateComponenteOrcamentoRegistoDatesRequest) : Observable<GetComponenteOrcamentoRegistoReponse> {
    return this.http.post<GetComponenteOrcamentoRegistoReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/RetificarOrcamentoAprovado`, entity);
  }

  public AprovarOrcamento(request: GetComponenteOrcamentoRegistoRequest) {
    return this.http.post(`${environment.apiUrl}/componenteOrcamentoRegisto/AprovarOrcamento`, request);
  }

  public ExtractToExcel(request: OrcamentoExtractRequest) : Observable<OrcamentoExtractToExcelReponse>  {
    return this.http.post<OrcamentoExtractToExcelReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/ExtractToExcel`, request);
  }

  public ExtractToPDF(request: OrcamentoExtractRequest) : Observable<OrcamentoExtractToPDFReponse>  {
    return this.http.post<OrcamentoExtractToPDFReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/ExtractToPDF`, request);
  }

  public GetOrcamentoAprovadoReceitaByIdTarefaActivo(entity: GetComponenteOrcamentoRegistoAprovadoRequest) : Observable<GetComponenteOrcamentoAprovadoRegistoReponse> {
    return this.http.post<GetComponenteOrcamentoAprovadoRegistoReponse>(`${environment.apiUrl}/componenteOrcamentoRegisto/GetOrcamentoAprovadoReceitaByIdTarefaActivo`, entity);
  }
}
