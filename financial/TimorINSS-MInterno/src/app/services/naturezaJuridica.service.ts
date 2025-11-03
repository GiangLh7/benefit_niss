import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';



@Injectable({
  providedIn: 'root'
})
export class NaturezaJuridicaService {

  constructor(
    private http: HttpClient
  ) { }


  public getAllNaturezaJuridica(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/NaturezaJuridica/getNaturezaJuridica`);
  }
}
