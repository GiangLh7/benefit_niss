import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { forkJoin, Observable } from 'rxjs';
import { ListagemDominios, ListagemDominiosComGrupos, ListagemRegimesResponse, SingleDominio } from '../response-models/dominios-response';
import { GetTiposDocumentoPorTarefaAtivaRequest } from '../request-models/dominio-request';
import { SelectDescriptionResponse } from '../response-models/utils-response';

@Injectable({
  providedIn: 'root'
})
export class DominiosService {

  constructor(
      private router: Router,
      private http: HttpClient
  ) {}

  public GetAllGruposCamposEditaveis() : Observable<ListagemDominios> {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllGruposCamposEditaveis/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetAllTiposDeRegime(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposDeRegime/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetAllTiposDeDocumentoTarefa(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposDeDocumentoTarefa/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllTiposDeContracto(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposDeContracto/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllNaturezasDeContracto(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllNaturezasDeContracto/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllLeisLaboraisAplicaveis(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllLeisLaboraisAplicaveis/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllTiposDeDocumento(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposDeDocumento/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetAllRegimes() : Observable<ListagemRegimesResponse>  {
    return this.http.get<ListagemRegimesResponse>(`${environment.apiUrl}/dominios/GetAllRegimes/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllProfissoes() : Observable<ListagemDominios> {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllProfissoes/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllEstadosCivis(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllEstadosCivis/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllSexos(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllSexos/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllNacionalidades(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllNacionalidades/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllDominiosForNovoTrabalhador(): Observable<ListagemDominios[]> {
        let tiposDocumento = this.getAllTiposDeDocumento();
        let estadosCivis = this.getAllEstadosCivis();
        let sexos = this.getAllSexos();
        let nacionalidades = this.getAllNacionalidades();
        let tiposContratos = this.getAllTiposDeContracto();
        let naturezasContrato = this.getAllNaturezasDeContracto();
        let leisLabAplicaveis = this.getAllLeisLaboraisAplicaveis();
        let profissoes = this.getAllProfissoes();

    // Observable.forkJoin (RxJS 5) changes to just forkJoin() in RxJS 6
    return forkJoin([tiposDocumento,estadosCivis,sexos,nacionalidades,tiposContratos,naturezasContrato,leisLabAplicaveis,profissoes]);
  }

  public getAllFuncoes() : Observable<ListagemDominios> {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllFuncoes/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetSalarioMinimo() : Observable<SingleDominio>  {
    return this.http.get<SingleDominio>(`${environment.apiUrl}/dominios/GetSalarioMinimo/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetDeclarationDay() : Observable<SingleDominio>  {
    return this.http.get<SingleDominio>(`${environment.apiUrl}/dominios/GetDeclarationDay/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetAllTiposPagamento() : Observable<ListagemDominios> {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposPagamento/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetAllTiposGuia() : Observable<ListagemDominios> {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposGuia/`+ localStorage.getItem('selectedLanguage'));
  }

  public GetTiposDocumentoPorTarefaAtiva(request: GetTiposDocumentoPorTarefaAtivaRequest) : Observable<ListagemDominiosComGrupos> {
    return this.http.post<ListagemDominiosComGrupos>(`${environment.apiUrl}/dominios/GetTiposDocumentoPorTarefaAtiva`, request);
  }

  public getAllCaixas(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/getAllCaixas/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllMovimentosTypes(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/getAllMovimentosTypes/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllTiposConta(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllTiposConta/`+ localStorage.getItem('selectedLanguage'));
  }

  public getAllEstadosPagamento(): Observable<ListagemDominios>
  {
    return this.http.get<ListagemDominios>(`${environment.apiUrl}/dominios/GetAllEstadosPagamento/`+ localStorage.getItem('selectedLanguage'));
  }
}
