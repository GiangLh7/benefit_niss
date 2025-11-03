import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FuncionalidadesListagemResponse } from '../response-models/funcionalidade-response';



@Injectable({
  providedIn: 'root'
})
export class RelPerfilFuncionalidadeService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }


  public getRelPerfilFuncionalidadeByIdPerfil(idPerfil: number): Observable<FuncionalidadesListagemResponse>
  {
    return this.http.post<FuncionalidadesListagemResponse>(`${environment.apiUrl}/relPerfilFuncionalidade/GetRelPerfilFuncionalidadeByIdPerfil`, idPerfil);
  }
}
