import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { EditTrabalhadorRequest, SaveTrabalhadorRequest, TrabalhadorListagemNissRequest, TrabalhadorListagemRequest } from '../request-models/trabalhadores-request';
import { Observable } from 'rxjs';
import { GetTrabalhadorReponse, TrabalhadorListagemResponse, VincularTrabalhadorListagemResponse } from '../response-models/trabalhadores-response';
import { FilterRequest } from '../request-models/utils-request';

@Injectable({
  providedIn: 'root'
})
export class TrabalhadoresService {

  constructor(
      private http: HttpClient
  ) {}

  public getTrabalhadoresByEntidadeEmpregadora(request: TrabalhadorListagemRequest) : Observable<TrabalhadorListagemResponse>  {
    return this.http.post<TrabalhadorListagemResponse>(`${environment.apiUrl}/trabalhadores/GetByIdEntidadeEmpregadora`,request);
  }

  public getTrabalhadoresByFilter(request: FilterRequest) : Observable<VincularTrabalhadorListagemResponse>  {
    return this.http.post<VincularTrabalhadorListagemResponse>(`${environment.apiUrl}/trabalhadores/getByFilter`,request);
  }

  public saveTrabalhador(entity: SaveTrabalhadorRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/trabalhadores/saveTrabalhador`, entity);
  }

  public getTrabalhadorById(request: TrabalhadorListagemRequest) : Observable<GetTrabalhadorReponse>{
    return this.http.post<GetTrabalhadorReponse>(`${environment.apiUrl}/trabalhadores/getById`, request);
  }

  public getTrabalhadorByNiss(request: TrabalhadorListagemRequest) : Observable<TrabalhadorListagemResponse>{
    return this.http.post<TrabalhadorListagemResponse>(`${environment.apiUrl}/trabalhadores/getTrabalhadoresByNiss`, request);
  }

  public GetSingleByNiss(request: TrabalhadorListagemNissRequest) : Observable<TrabalhadorListagemResponse>{
    return this.http.post<TrabalhadorListagemResponse>(`${environment.apiUrl}/trabalhadores/GetSingleByNiss`, request);
  }

  public editDadosPrincipaisTrabalhador(entity: EditTrabalhadorRequest) {
    return this.http.post<boolean>(`${environment.apiUrl}/trabalhadores/editDadosPrincipais`, entity);
  }
}
