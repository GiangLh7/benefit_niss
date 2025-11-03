import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { DocumentoIdRequest, DocumentoRequest, DocumentosListagemRequest } from '../request-models/documentos-request';
import { DocumentoResponse, DocumentosListagemResponse } from '../response-models/documentos-response';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  constructor(
      private router: Router,
      private http: HttpClient,
      private api: ApiHelperService
  ) {}


  public getDocumentosByIdTrabalhador(request: DocumentosListagemRequest) : Observable<DocumentosListagemResponse>  {
    return this.api.post<DocumentosListagemResponse>('documentos/GetByIdTrabalhador',request);
  }

  public getDocumentoById(entity: DocumentoIdRequest) {
    return this.api.post<DocumentoResponse>('documentos/GetDocumentoById', entity);
  }

  public saveDocumento(entity: DocumentoRequest) {
    return this.api.post<boolean>('documentos/SaveDocumento', entity);
  }

  public updateDocumento(entity: DocumentoRequest) {
    return this.api.post<boolean>('documentos/UpdateDocumento', entity);
  }

  public deleteDocumento(entity: DocumentoIdRequest) {
    return this.api.post('documentos/DeleteDocumento', entity);
  }
}
