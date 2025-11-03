import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { DesvincularTrabalhadorRequest, RelEntidadeTrabalhadorRegimeRequest, RelEntidadeTrabalhadorRequest, TrabalhadorViewListagemRequest } from '../request-models/relEntidadeTrabalhador-request';
import { TrabalhadorViewResponse } from '../response-models/trabalhadores-response';
import { Observable } from 'rxjs';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class RelEntidadeTrabalhadorService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiHelperService
  ) { }


  public saveRelEntidadeTrabalhador(entity: RelEntidadeTrabalhadorRequest) {
    return this.api.post('RelEntidadesTrabalhadores/saveRelEntidadeTrabalhador', entity);
  }

  public desvincularTrabalhador(entity: DesvincularTrabalhadorRequest) {
    return this.api.post('RelEntidadesTrabalhadores/desvincularTrabalhador', entity);
  }

  public editRelEntidadeTrabalhador(entity: RelEntidadeTrabalhadorRequest) {
    return this.api.post('RelEntidadesTrabalhadores/editRelEntidadeTrabalhador', entity);
  }

  public editRelEntidadeTrabalhadorRegime(entity: RelEntidadeTrabalhadorRegimeRequest) {
    return this.api.post('RelEntidadesTrabalhadores/editRelEntidadeTrabalhadorRegime', entity);
  }

  public getTrabalhadorViewById(request: TrabalhadorViewListagemRequest) : Observable<TrabalhadorViewResponse>{
    return this.api.post<TrabalhadorViewResponse>('RelEntidadesTrabalhadores/getTrabalhadorViewById', request);
  }
}



