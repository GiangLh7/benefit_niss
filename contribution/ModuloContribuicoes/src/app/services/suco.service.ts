import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class SucoService {

  constructor(
      private router: Router,
      private http: HttpClient,
      private api: ApiHelperService
  ) {}

  public getAllSuco(): Observable<SelectDescriptionResponse>
  {
    return this.api.get<SelectDescriptionResponse>('Suco/getSuco');
  }

  public getSucoByIdPosto(id: number) : Observable<SelectDescriptionResponse>  {
    return this.api.get<SelectDescriptionResponse>('Suco/getSucoByIdPosto/'+id);

  }
}
