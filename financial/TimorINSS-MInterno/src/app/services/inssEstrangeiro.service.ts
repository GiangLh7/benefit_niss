import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { InssEstrangeiroRequest } from '../request-models/inssEstrangeiro-request';

@Injectable({
  providedIn: 'root'
})
export class InssEstrangeiroService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  public editINSSEstrangeiro(entity: InssEstrangeiroRequest) {
    return this.http.post(`${environment.apiUrl}/INSSEstrangeiros/editINSSEstrangeiro`, entity);
  }

  public saveINSSEstrangeiro(entity: InssEstrangeiroRequest) {
    return this.http.post(`${environment.apiUrl}/INSSEstrangeiros/saveINSSEstrangeiro`, entity);
  }
}



