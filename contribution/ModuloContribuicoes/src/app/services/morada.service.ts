import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { MoradaDeleteRequest, MoradaListagemRequest } from '../request-models/morada-request';
import { MoradaRequest } from '../request-models/morada-request';
import { MoradaListagemResponse } from '../response-models/morada-response';
import { ApiHelperService } from './api-helper.service';



@Injectable({
  providedIn: 'root'
})
export class MoradaService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiHelperService
  ) { }


  public getMoradaByIdEntidadeEmpregadora(request: MoradaListagemRequest) : Observable<MoradaListagemResponse>  {
    return this.api.post<MoradaListagemResponse>('morada/GetByIdEntidadeEmpregadora',request);
  }

  public getMoradaByIdTrabalhador(request: MoradaListagemRequest) : Observable<MoradaListagemResponse>  {
    return this.api.post<MoradaListagemResponse>('morada/GetByIdTrabalhador',request);
  }

  public saveMorada(entity: MoradaRequest) {
    return this.api.post<boolean>('morada/SaveMorada', entity);
  }

  public updateMorada(entity: MoradaRequest) {
    return this.api.post<boolean>('morada/UpdateMorada', entity);
  }

  public deleteMorada(entity: MoradaDeleteRequest) {
    return this.api.post('morada/DeleteMorada', entity);
  }
}
