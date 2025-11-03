import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { EditTrabalhadorRequest, SaveTrabalhadorRequest, TrabalhadorListagemNissRequest, TrabalhadorListagemRequest } from '../request-models/trabalhadores-request';
import { Observable } from 'rxjs';
import { GetTrabalhadorReponse, TrabalhadorListagemResponse, VincularTrabalhadorListagemResponse } from '../response-models/trabalhadores-response';
import { FilterRequest } from '../request-models/utils-request';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class TrabalhadoresService {

  constructor(
      private http: HttpClient,
      private api: ApiHelperService
  ) {}

  public getTrabalhadoresByEntidadeEmpregadora(request: TrabalhadorListagemRequest) : Observable<TrabalhadorListagemResponse>  {
    return this.api.post<TrabalhadorListagemResponse>('trabalhadores/GetByIdEntidadeEmpregadora',request);
  }

  public getTrabalhadoresByFilter(request: FilterRequest) : Observable<VincularTrabalhadorListagemResponse>  {
    return this.api.post<VincularTrabalhadorListagemResponse>('trabalhadores/getByFilter',request);
  }

  public saveTrabalhador(entity: SaveTrabalhadorRequest) {
    return this.api.post<boolean>('trabalhadores/saveTrabalhador', entity);
  }

  public getTrabalhadorById(request: TrabalhadorListagemRequest) : Observable<GetTrabalhadorReponse>{
    return this.api.post<GetTrabalhadorReponse>('trabalhadores/getById', request);
  }

  public getTrabalhadorByNiss(request: TrabalhadorListagemRequest) : Observable<TrabalhadorListagemResponse>{
    return this.api.post<TrabalhadorListagemResponse>('trabalhadores/getTrabalhadoresByNiss', request);
  }

  public GetSingleByNiss(request: TrabalhadorListagemNissRequest) : Observable<TrabalhadorListagemResponse>{
    return this.api.post<TrabalhadorListagemResponse>('trabalhadores/GetSingleByNiss', request);
  }

  public editDadosPrincipaisTrabalhador(entity: EditTrabalhadorRequest) {
    return this.api.post<boolean>('trabalhadores/editDadosPrincipais', entity);
  }
}
