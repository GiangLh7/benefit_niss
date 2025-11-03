import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponsavelLegalRequest, ListResponsavelLegal, ResponsavelLegalDeleteRequest } from '../request-models/responsavel-legal-request';
import { ListResponsavelLegalResponse, ResponsavelLegalListagemResponse } from '../response-models/responsavel-legal-response';
import { ApiHelperService } from './api-helper.service';

@Injectable({
    providedIn: 'root'
  })
export class ResponsavelLegalService {

  public savedSuccessfully = false;
  public traceBack = false;

    constructor(
      private http: HttpClient,
      private api: ApiHelperService
    ) {}

    public saveResponsavelLegal(request: ResponsavelLegalRequest) {
      return this.api.post('responsavelLegal/AddReponsavelLegal', request);
    }

    public listResponsavelLegal(request: ListResponsavelLegal) {
      return this.api.post<ListResponsavelLegalResponse>('responsavelLegal/ListReponsavelLegal', request);
    }

    public updateResponsavelLegalRequest(request: ResponsavelLegalRequest) {
      return this.api.post('responsavelLegal/UpdateResponsavelLegal', request);
    }

    public getByIdEntidadeEmpregadora(request: ListResponsavelLegal) : Observable<ResponsavelLegalListagemResponse>  {
      return this.api.post<ResponsavelLegalListagemResponse>('responsavelLegal/GetByIdEntidadeEmpregadora',request);
    }

    public deleteResponsavelLegal(entity: ResponsavelLegalDeleteRequest) {
      return this.api.post('responsavelLegal/DeleteResponsavelLegal', entity);
    }
}