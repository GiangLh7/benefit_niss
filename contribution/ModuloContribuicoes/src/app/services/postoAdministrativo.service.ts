import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class PostoAdministrativoService {

  constructor(
      private router: Router,
      private http: HttpClient,
      private api: ApiHelperService
  ) {}

  public getAllPostoAdministrativo(): Observable<SelectDescriptionResponse>
  {
    return this.api.get<SelectDescriptionResponse>('PostoAdministrativo/getPostoAdministrativo');
  }

  public getPostoByIdMunicipio(id: number) : Observable<SelectDescriptionResponse>  {
    return this.api.get<SelectDescriptionResponse>('PostoAdministrativo/getPostoByIdMunicipio/'+id);

  }
}
