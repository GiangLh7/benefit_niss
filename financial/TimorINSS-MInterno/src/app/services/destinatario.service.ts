import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetDestinatarioRequest, SaveDestinatarioRequest } from '../request-models/destinatario-request';
import { GetDestinatarioResponse } from '../response-models/destinatario-response';

@Injectable({
  providedIn: 'root'
})
export class DestinatarioService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public GetDestinatarioByNissTin(request: GetDestinatarioRequest): Observable<GetDestinatarioResponse>
  {
    return this.http.post<GetDestinatarioResponse>(`${environment.apiUrl}/destinatario/GetDestinatarioByNissTin`, request);
  }

  public SaveDestinatario(entity: SaveDestinatarioRequest){
    return this.http.post(`${environment.apiUrl}/destinatario/SaveDestinatario`, entity);
  }
}
