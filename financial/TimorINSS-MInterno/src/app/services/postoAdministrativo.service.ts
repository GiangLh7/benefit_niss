import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';

@Injectable({
  providedIn: 'root'
})
export class PostoAdministrativoService {

  constructor(
      private http: HttpClient
  ) {}

  public getAllPostoAdministrativo(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/PostoAdministrativo/getPostoAdministrativo`);
  }

  public getPostoByIdMunicipio(id: number) : Observable<SelectDescriptionResponse>  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/PostoAdministrativo/getPostoByIdMunicipio/`+id);

  }
}
