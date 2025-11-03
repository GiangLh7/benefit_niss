import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ContaCorrenteListagemRequest, GetAllContasStatesFromYearByFilterRequest, ResumoContaCorrenteListagemRequest } from '../request-models/contaCorrente-request';
import { ContaCorrenteListagemResponse, GetAllContasStatesFromYearByFilterResponse, ResumoContaCorrenteListagemResponse, ReumoContaCorrenteListagem } from '../response-models/contaCorrente-response';







@Injectable({
  providedIn: 'root'
})
export class ContaCorrenteService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public getContaCorrenteByIdEntidade(request: ContaCorrenteListagemRequest) : Observable<ContaCorrenteListagemResponse>  {
    return this.http.post<ContaCorrenteListagemResponse>(`${environment.apiUrl}/contaCorrente/GetContaCorrenteByIdEntidade`,request);
  }

  public getResumoContaCorrenteByIdEntidade(request: ResumoContaCorrenteListagemRequest) : Observable<ResumoContaCorrenteListagemResponse>  {
    return this.http.post<ResumoContaCorrenteListagemResponse>(`${environment.apiUrl}/contaCorrente/GetResumoContaCorrenteByIdEntidade`,request);
  }

  public getAllContasStatesFromYearByFilter(entity: GetAllContasStatesFromYearByFilterRequest) {
    return this.http.post<GetAllContasStatesFromYearByFilterResponse>(`${environment.apiUrl}/contaCorrente/GetAllContasStatesFromYearByFilter`, entity);
  }
}



