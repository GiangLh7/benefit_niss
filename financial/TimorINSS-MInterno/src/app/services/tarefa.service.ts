import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { ConfigurarTarefaRequest, EditarTarefaRequest, GetAllTarefasASeguirRequest, GetHistoricoTextoRequest, GetTarefaDataRequest, SwitchTarefaAtivoRequest, TarefaDataRequest, TarefaListagemRequest} from '../request-models/tarefa-request';
import { ComponenteTarefaConfiguradaResponse, TarefaAtivoListagemResponse, TarefaDataResponse, TarefaListagemResponse } from '../response-models/tarefa-response';
import { map } from 'rxjs/operators';
import { ComponenteHistoricoTextoListagemResponse } from '../response-models/componenteTextoRegisto-response';


@Injectable({
  providedIn: 'root'
})
export class TarefaService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllTarefaAtivo(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/tarefa/GetAllTarefaAtivo`);
  }

  public addTarefaConfigurada(entity: ConfigurarTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/AddTarefaConfigurada`, entity);
  }

  public getAllTarefas(request: TarefaListagemRequest): Observable<TarefaListagemResponse>
  {
    return this.http.post<TarefaListagemResponse>(`${environment.apiUrl}/tarefa/GetAllTarefas`, request);
  }

  public getAllComponentesByIdTarefa(id: number) : Observable<ComponenteTarefaConfiguradaResponse>  {
    return this.http.get<ComponenteTarefaConfiguradaResponse>(`${environment.apiUrl}/tarefa/GetAllComponentesByIdTarefa/`+id)
    .pipe(map(x => {
      let response : ComponenteTarefaConfiguradaResponse = <ComponenteTarefaConfiguradaResponse>{
      };
      if(x == null)
        return response;
      response = x;
      return response;
    }))
  }

  public editarTarefa(entity: EditarTarefaRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/EditarTarefa`, entity);
  }

  public GetAllTarefasAtivas(request: TarefaListagemRequest): Observable<TarefaAtivoListagemResponse>
  {
    return this.http.post<TarefaAtivoListagemResponse>(`${environment.apiUrl}/tarefa/GetAllTarefasAtivas`, request);
  }
  
  public LockTarefa(request: SwitchTarefaAtivoRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/LockTarefa`, request);
  }

  public UnlockTarefa(request: SwitchTarefaAtivoRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/UnlockTarefa`, request);
  }

  public GetHistoricoTexto(request: GetHistoricoTextoRequest): Observable<ComponenteHistoricoTextoListagemResponse> {
    return this.http.post<ComponenteHistoricoTextoListagemResponse>(`${environment.apiUrl}/tarefa/GetHistoricoTexto`, request);
  }

  public GetAllTarefasASeguir(request: GetAllTarefasASeguirRequest): Observable<SelectDescriptionResponse>
  {
    return this.http.post<SelectDescriptionResponse>(`${environment.apiUrl}/tarefa/GetAllTarefasASeguir`,request);
  }

  public GetTarefaData(request: GetTarefaDataRequest): Observable<TarefaDataResponse> {
    return this.http.post<TarefaDataResponse>(`${environment.apiUrl}/tarefa/GetTarefaData`,request);
  }

  public SaveTarefaData(entity: TarefaDataRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/SaveTarefaData`, entity);
  }

  public ArquivarTarefa(entity: TarefaDataRequest) {
    return this.http.post(`${environment.apiUrl}/tarefa/ArquivarTarefa`, entity);
  }
}
