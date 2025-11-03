import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';

@Injectable({
  providedIn: 'root'
})
export class SucoService {

  constructor(
      private http: HttpClient
  ) {}

  public getAllSuco(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/Suco/getSuco`);
  }

  public getSucoByIdPosto(id: number) : Observable<SelectDescriptionResponse>  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/Suco/getSucoByIdPosto/`+id);

  }
}
