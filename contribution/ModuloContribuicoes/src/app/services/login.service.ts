import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Utilizador } from '../models/utilizador';
import { LoginRequest } from '../request-models/login-request';
import { RecoverPasswordRequest, RecoverSetPasswordRequest } from '../request-models/recoverPassword-request';
import { ApiHelperService } from './api-helper.service';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(
        private router: Router,
        private http: HttpClient,
        private api: ApiHelperService
    ) { }

    public login(request: LoginRequest): Observable<{ user: Utilizador, token: string, totalCount: number }> {

        return this.api.post('login/Authenticate', request)
            .pipe(map((response: any) => {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                // sessionStorage.setItem('user', JSON.stringify(user));
                // return user;
                return {
                    user:
                    {
                        id: response.user.id,
                        username: response.user.username,
                        niss: response.user.niss,
                        isInternal: false,
                        indActivo: response.user.indActivo,
                        idEntidade: response.user.idEntidade,
                    },
                    token: response.token,
                    totalCount: response.totalCount
                }
            }));
    }

    public recoverPassword(request: RecoverPasswordRequest) {
        return this.api.post('login/RecoverPassword', request)
        .pipe(map((response: any) => {
            return {
                errorCode:response.errors[0]?.errorCode,
                errorMessage:response.errors[0]?.errorMessage
            }
        }));
    }

    public firstAcess(request: RecoverPasswordRequest) {
        return this.api.post('login/FirstAcess', request).pipe(map((response: any) => {
            return {
                errorCode:response.errors[0]?.errorCode,
                errorMessage:response.errors[0]?.errorMessage
            }
        }));
    }

    public setUpPassword(request: RecoverSetPasswordRequest) {
        return this.api.post('login/SetUpPassword', request);
    }

    public createUser(request: RecoverSetPasswordRequest) {
        return this.api.post('login/CreateUser', request);
    }

    public logout() {
        // remove user from local storage and set current user to null
        sessionStorage.removeItem('user');
        this.router.navigate(['']);
    }

    public register(user: Utilizador) {
        return this.api.post('users/register', user);
    }

    public validToken(request: { token: string, isRecover: boolean }) {
        return this.api.post('login/ValidToken', request);
    }
}