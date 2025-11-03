import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GetHistoricoTextoRequest, GetProcessoDataRequest, GetProcessosRelatoriosRequest, ListProcessoConfiRequest, ProcessoConfigRequest, ProcessoUpdateRequest } from '../request-models/processo-request';
import { TarefaListagemRequest } from '../request-models/tarefa-request';
import { ComponenteHistoricoTextoListagemResponse } from '../response-models/componenteTextoRegisto-response';
import { ProcessoConfigResponse, ProcessoDataResponse, ProcessosArquivadosListagemResponse, ProcessosListagemResponse, RelatoriosProcessosListagemResponse, TipoProcessosRelatoriosResponse } from '../response-models/processo-response';
import { SelectDescriptionResponse } from '../response-models/utils-response';


@Injectable({
    providedIn: 'root'
})
export class ProcessoService {

    constructor(
        private http: HttpClient
    ) { }

    public GetAllProcessos(request: TarefaListagemRequest): Observable<ProcessosListagemResponse> {
        return this.http.post<ProcessosListagemResponse>(`${environment.apiUrl}/processos/GetAllProcessos`, request);
    }

    public SwitchProcessoState(request: ProcessoUpdateRequest) {
        return this.http.post(`${environment.apiUrl}/processos/SwitchProcessoState`, request);
    }

    public CreateProcessoConfig(request: ProcessoConfigRequest) {
        return this.http.post(`${environment.apiUrl}/processos/CreateProcessoConfig`, request);
    }

    public GetProcessoConfig(request: ListProcessoConfiRequest): Observable<ProcessoConfigResponse> {
        return this.http.post<ProcessoConfigResponse>(`${environment.apiUrl}/processos/GetProcessoConfig`, request);
    }

    public UpdateProcessoConfig(request: ProcessoConfigRequest) {
        return this.http.post(`${environment.apiUrl}/processos/UpdateProcessoConfig`, request);
    }

    
    public ListIniciarProcessos(request: any): Observable<SelectDescriptionResponse> {
        return this.http.post<SelectDescriptionResponse>(`${environment.apiUrl}/processos/ListIniciarProcessosApprove`, request);
    }

    public GetAllProcessosArquivados(request: any): Observable<ProcessosArquivadosListagemResponse> {
        return this.http.post<ProcessosArquivadosListagemResponse>(`${environment.apiUrl}/processos/GetAllProcessosArquivados`, request);
    }

    public GetProcessoData(request: GetProcessoDataRequest): Observable<ProcessoDataResponse> {
        return this.http.post<ProcessoDataResponse>(`${environment.apiUrl}/processos/GetProcessoData`, request);
    }

    public StartProcess(request: ProcessoUpdateRequest) {
        return this.http.post(`${environment.apiUrl}/processos/StartProcess`, request);
    }

    public GetHistoricoTexto(request: GetHistoricoTextoRequest): Observable<ComponenteHistoricoTextoListagemResponse> {
        return this.http.post<ComponenteHistoricoTextoListagemResponse>(`${environment.apiUrl}/processos/GetHistoricoTexto`, request);
    }

    public GetProcessosRelatorios(request: GetProcessosRelatoriosRequest): Observable<RelatoriosProcessosListagemResponse> {
        return this.http.post<RelatoriosProcessosListagemResponse>(`${environment.apiUrl}/processos/GetProcessosRelatorios`, request);
    }

    public GetTipoProcessosRelatorios(request: any): Observable<TipoProcessosRelatoriosResponse> {
        return this.http.post<TipoProcessosRelatoriosResponse>(`${environment.apiUrl}/processos/GetTipoProcessosRelatorios`, request);
    }

    public ExtractToExcelRelatorios(request: GetProcessosRelatoriosRequest): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/processos/ExtractToExcelRelatorios`, request);
    }
}
