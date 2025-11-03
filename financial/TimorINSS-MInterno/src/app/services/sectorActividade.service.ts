import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { SelectDescriptionResponse } from '../response-models/utils-response';





@Injectable({
  providedIn: 'root'
})
export class SectorActividadeService {

  constructor(
    private http: HttpClient
  ) { }


  public getAllSectorActividade(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/SectorActividade/getSectorActividade`);
  }
}
