import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { DesvincularTrabalhadorRequest, RelEntidadeTrabalhadorRegimeRequest, RelEntidadeTrabalhadorRequest, TrabalhadorViewListagemRequest } from '../request-models/relEntidadeTrabalhador-request';
import { TrabalhadorViewResponse } from '../response-models/trabalhadores-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RelEntidadeTrabalhadorService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public saveRelEntidadeTrabalhador(entity: RelEntidadeTrabalhadorRequest) {
    return this.http.post(`${environment.apiUrl}/RelEntidadesTrabalhadores/saveRelEntidadeTrabalhador`, entity);
  }

  public desvincularTrabalhador(entity: DesvincularTrabalhadorRequest) {
    return this.http.post(`${environment.apiUrl}/RelEntidadesTrabalhadores/desvincularTrabalhador`, entity);
  }

  public editRelEntidadeTrabalhador(entity: RelEntidadeTrabalhadorRequest) {
    return this.http.post(`${environment.apiUrl}/RelEntidadesTrabalhadores/editRelEntidadeTrabalhador`, entity);
  }

  public editRelEntidadeTrabalhadorRegime(entity: RelEntidadeTrabalhadorRegimeRequest) {
    return this.http.post(`${environment.apiUrl}/RelEntidadesTrabalhadores/editRelEntidadeTrabalhadorRegime`, entity);
  }

  public getTrabalhadorViewById(request: TrabalhadorViewListagemRequest) : Observable<TrabalhadorViewResponse>{
    return this.http.post<TrabalhadorViewResponse>(`${environment.apiUrl}/RelEntidadesTrabalhadores/getTrabalhadorViewById`, request);
  }
}



