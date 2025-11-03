import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  approveComprovativoPagamentoRequest,
  GetAllGuiasStatesFromYearByFilterRequest, GetGuiasDetailsRequest,
  GetGuiasRelatoriosRequest,
  GuiaPagamentoRequest,
  insertComprovativoPagamentoRequest,
  useCreditInGuiaPagamentoRequest
} from '../request-models/guiaPagamento-request';
import { GuiaListagemResponse, RelatoriosGuiasListagemResponse } from '../response-models/guiaPagamento-response';




@Injectable({
  providedIn: 'root'
})
export class GuiaPagamentoService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public saveGuiaPagamento(entity: GuiaPagamentoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/guiaPagamento/SaveGuiaPagamento`, entity);
  }

  public getAllGuiasByEntidade(entity: GetAllGuiasStatesFromYearByFilterRequest) {
    return this.http.post<GuiaListagemResponse>(`${environment.apiUrl}/guiaPagamento/listGuiasByEntidade`, entity);
  }

  public getGuiasDetailByEntidade(entity: GetGuiasDetailsRequest) {
    return this.http.post<GuiaListagemResponse>(`${environment.apiUrl}/guiaPagamento/guiaPagamentoDetail`, entity);
  }

  public getAllGuiasByEntidadeApprove(entity: GetAllGuiasStatesFromYearByFilterRequest) {
    return this.http.post<GuiaListagemResponse>(`${environment.apiUrl}/guiaPagamento/listGuiasByEntidadeApprove`, entity);
  }

  public useCreditInGuiaPagamento(request: useCreditInGuiaPagamentoRequest) {
    return this.http.post(`${environment.apiUrl}/guiaPagamento/useCreditInGuiaPagamento`, request);
  }

  public insertComprovativoPagamento(request: insertComprovativoPagamentoRequest) {
    return this.http.post(`${environment.apiUrl}/guiaPagamento/insertComprovativoPagamento`, request);
  }

  public approveComprovativoPagamento(request: approveComprovativoPagamentoRequest) {
    return this.http.post(`${environment.apiUrl}/guiaPagamento/approveComprovativoPagamento`, request);
  }

  public GetGuiasRelatorios(request: GetGuiasRelatoriosRequest): Observable<RelatoriosGuiasListagemResponse> {
    return this.http.post<RelatoriosGuiasListagemResponse>(`${environment.apiUrl}/guiaPagamento/GetGuiasPagamentoRelatorios`, request);
}
}
