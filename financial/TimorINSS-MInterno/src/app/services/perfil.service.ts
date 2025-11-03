import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { FilterRequest } from "../request-models/utils-request";
import { Observable } from 'rxjs';
import { PerfisAtivosListagemResponse, PerfisListagemResponse } from '../response-models/perfis-response';
import { PerfilRequest, PerfilListagemRequest, PerfilUpdateRequest } from '../request-models/perfil-request';
import { SelectDescriptionResponse } from '../response-models/utils-response';



@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getAllPerfis(request: PerfilListagemRequest): Observable<PerfisListagemResponse>
  {
    return this.http.post<PerfisListagemResponse>(`${environment.apiUrl}/perfil/GetAllPerfis`, request);
  }

  public updatePerfil(entity: PerfilUpdateRequest) {
    return this.http.post(`${environment.apiUrl}/perfil/UpdatePerfil`, entity);
  }

  public addPerfil(entity: PerfilRequest) {
    return this.http.post(`${environment.apiUrl}/perfil/AddPerfil`, entity);
  }

  public editPerfil(entity: PerfilRequest) {
    return this.http.post(`${environment.apiUrl}/perfil/EditPerfil`, entity);
  }

  public getAllPerfisAtivo(): Observable<SelectDescriptionResponse>
  {
    return this.http.get<SelectDescriptionResponse>(`${environment.apiUrl}/perfil/GetAllPerfisAtivo`);
  }

  public getPerfisByUserId(id: number): Observable<PerfisListagemResponse>
  {
    return this.http.post<PerfisListagemResponse>(`${environment.apiUrl}/relUtilizadorPerfil/GetPerfisByUserId`, id);
  }
}
