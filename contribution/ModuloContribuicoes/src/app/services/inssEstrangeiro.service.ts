import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { InssEstrangeiroRequest } from '../request-models/inssEstrangeiro-request';
import { ApiHelperService } from './api-helper.service';

@Injectable({
  providedIn: 'root'
})
export class InssEstrangeiroService {

  constructor(
    private router: Router,
    private http: HttpClient,
    private api: ApiHelperService
  ) { }

  public editINSSEstrangeiro(entity: InssEstrangeiroRequest) {
    return this.api.post('INSSEstrangeiros/editINSSEstrangeiro', entity);
  }

  public saveINSSEstrangeiro(entity: InssEstrangeiroRequest) {
    return this.api.post('INSSEstrangeiros/saveINSSEstrangeiro', entity);
  }
}



