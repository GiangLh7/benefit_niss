import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponsavelLegalRequest, ListResponsavelLegal, ResponsavelLegalDeleteRequest } from '../request-models/responsavel-legal-request';
import { ListResponsavelLegalResponse, ResponsavelLegalListagemResponse } from '../response-models/responsavel-legal-response';


@Injectable({
    providedIn: 'root'
  })
export class ResponsavelLegalService {

  public savedSuccessfully = false;
  public traceBack = false;

    constructor(
      private http: HttpClient
    ) {}

    public saveResponsavelLegal(request: ResponsavelLegalRequest) {
      return this.http.post(`${environment.apiUrl}/responsavelLegal/AddReponsavelLegal`, request);
    }

    public listResponsavelLegal(request: ListResponsavelLegal) {
      return this.http.post<ListResponsavelLegalResponse>(`${environment.apiUrl}/responsavelLegal/ListReponsavelLegal`, request);
    }

    public updateResponsavelLegalRequest(request: ResponsavelLegalRequest) {
      return this.http.post(`${environment.apiUrl}/responsavelLegal/UpdateResponsavelLegal`, request);
    }

    public getByIdEntidadeEmpregadora(request: ListResponsavelLegal) : Observable<ResponsavelLegalListagemResponse>  {
      return this.http.post<ResponsavelLegalListagemResponse>(`${environment.apiUrl}/responsavelLegal/GetByIdEntidadeEmpregadora`,request);
    }

    public deleteResponsavelLegal(entity: ResponsavelLegalDeleteRequest) {
      return this.http.post(`${environment.apiUrl}/responsavelLegal/DeleteResponsavelLegal`, entity);
    }
}