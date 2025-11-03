import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';

@Injectable({
  providedIn: 'root'
})
export class AldeiaService {

  constructor(
      private http: HttpClient
  ) {}

  public getAllAldeia(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/Aldeia/getAldeia`);
  }

  public getAldeiaByIdSuco(id: number) : Observable<SelectDescriptionResponse>  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/Aldeia/getAldeiaByIdSuco/`+id);
  }
}
