import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { ApiHelperService } from './api-helper.service';


@Injectable({
  providedIn: 'root'
})
export class NaturezaJuridicaService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiHelperService
  ) { }


  public getAllNaturezaJuridica(): Observable<SelectDescriptionResponse>
  {
    return this.api.get<SelectDescriptionResponse>('NaturezaJuridica/getNaturezaJuridica');
  }
}
