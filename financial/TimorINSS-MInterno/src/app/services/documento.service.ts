import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { DocumentoIdRequest, DocumentoRequest, DocumentosListagemRequest, TarefaDocumentoRequest } from '../request-models/documentos-request';
import { DocumentoResponse, DocumentosListagemResponse, DocumentosTarefaListagemResponse } from '../response-models/documentos-response';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  constructor(
      private router: Router,
      private http: HttpClient
  ) {}


  public getDocumentosByIdTrabalhador(request: DocumentosListagemRequest) : Observable<DocumentosListagemResponse>  {
    return this.http.post<DocumentosListagemResponse>(`${environment.apiUrl}/documentos/GetByIdTrabalhador`,request);
  }

  public getDocumentoById(entity: DocumentoIdRequest) {
    return this.http.post<DocumentoResponse>(`${environment.apiUrl}/documentos/GetDocumentoById`, entity);
  }

  public saveDocumento(entity: DocumentoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/documentos/SaveDocumento`, entity);
  }

  public updateDocumento(entity: DocumentoRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/documentos/UpdateDocumento`, entity);
  }

  public deleteDocumento(entity: DocumentoIdRequest) {
    return this.http.post(`${environment.apiUrl}/documentos/DeleteDocumento`, entity);
  }

  public getDocumentosByIdTarefaAtivo(request: DocumentosListagemRequest) : Observable<DocumentosTarefaListagemResponse>  {
    return this.http.post<DocumentosTarefaListagemResponse>(`${environment.apiUrl}/documentos/getDocumentosByIdTarefaAtivo`,request);
  }

  public getDocumentosByIdProcessoAtivo(request: DocumentosListagemRequest) : Observable<DocumentosTarefaListagemResponse>  {
    return this.http.post<DocumentosTarefaListagemResponse>(`${environment.apiUrl}/documentos/getDocumentosByIdProcessoAtivo`,request);
  }

  public SaveTarefaDocumento(request: TarefaDocumentoRequest) {
    return this.http.post(`${environment.apiUrl}/documentos/SaveTarefaDocumento`, request);
  }

  public deleteDocumentoComponente(entity: DocumentoIdRequest) {
    return this.http.post(`${environment.apiUrl}/documentos/DeleteDocumentoComponente`, entity);
  }
}
