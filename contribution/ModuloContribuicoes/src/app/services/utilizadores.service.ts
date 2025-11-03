import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilizadorTrbalhador } from '../models/utilizador';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class UtilizadoresServices {

  constructor(
      private router: Router,
      private http: HttpClient,
      private api: ApiHelperService
  ) {}

  public getById(id: number): Observable<UtilizadorTrbalhador>
  {
    return this.api.get<UtilizadorTrbalhador>('api/Utilizadores/' + id).pipe(map(user =>
      {
        return {
          id: user.id,
          idEntidadeEmpregadora: user.idEntidadeEmpregadora
        };
      }));
  }
}
