import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservaCreditoListagemRequest } from '../request-models/reservaCredito-request';
import { ReservaCreditoListagemResponse } from '../response-models/reservaCredito-response';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class ReservaCreditoService {

  constructor(
    private http: HttpClient,
    private api: ApiHelperService
  ) { }

  public getReservaCreditoByIdEntidade(request: ReservaCreditoListagemRequest) : Observable<ReservaCreditoListagemResponse>  {
    return this.api.post<ReservaCreditoListagemResponse>('reservaCredito/GetReservaCreditoByIdEntidade',request);
  }

}



