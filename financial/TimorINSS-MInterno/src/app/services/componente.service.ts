import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ComponenteListagemResponse } from '../response-models/componente-response';
import { ComponenteAccaoTarefaRequest, ComponenteClassificacaoSubClassificTarefaRequest, ComponenteConciliacaoMovimentosRequest, ComponenteControloAcessoPerfilTarefaRequest, ComponenteControloAcessoUtilizadorTarefaRequest, ComponenteDespesaRequest, ComponenteDocumentoTarefaRequest, ComponenteOrcamentoRequest, ComponentePrazoTarefaRequest, ComponenteReceitaRequest, ComponenteTextoRequest } from '../request-models/componente-request';


@Injectable({
  providedIn: 'root'
})
export class ComponenteService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllComponentes(): Observable<ComponenteListagemResponse>
  {
    return this.http.get<ComponenteListagemResponse>(`${environment.apiUrl}/componente/GetAllComponentes`);
  }

  public editarComponenteTexto(entity: ComponenteTextoRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteTexto`, entity);
  }

  public editarComponentePrazoTarefa(entity: ComponentePrazoTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponentePrazoTarefa`, entity);
  }

  public editarComponenteAccaoTarefa(entity: ComponenteAccaoTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteAccaoTarefa`, entity);
  }

  public editarComponenteDocumentoTarefa(entity: ComponenteDocumentoTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteDocumentoTarefa`, entity);
  }

  public editarComponenteClassificacaoSubClassifTarefa(entity: ComponenteClassificacaoSubClassificTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteClassificacaoSubClassifTarefa`, entity);
  }

  public editarComponenteControloAcessoPerfilTarefa(entity: ComponenteControloAcessoPerfilTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteControloAcessoPerfilTarefa`, entity);
  }

  public editarComponenteControloAcessoUtilizadorTarefa(entity: ComponenteControloAcessoUtilizadorTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteControloAcessoUtilizadorTarefa`, entity);
  }

  public editarComponenteOrcamento(entity: ComponenteOrcamentoRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteOrcamento`, entity);
  }

  public editarComponenteDespesa(entity: ComponenteDespesaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteDespesa`, entity);
  }

  public editarComponenteConciliacaoMovimentos(entity: ComponenteConciliacaoMovimentosRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteConciliacaoMovimentos`, entity);
  }

  public editarComponenteReceita(entity: ComponenteReceitaRequest) {
    return this.http.post(`${environment.apiUrl}/componente/EditarComponenteReceita`, entity);
  }
}
