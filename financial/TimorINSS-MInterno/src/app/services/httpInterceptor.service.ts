import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse, HttpHeaders }   from '@angular/common/http';
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { v4 as guid } from "uuid";
import { TokenStorageService } from '../services/token-storage.service';
import { openErrorsDialog, showExpiredError } from "../utils";

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  public errors: string[] = [];

    constructor(
        private tokenStorage: TokenStorageService,
        public translate: TranslateService,
        public errorDialog: MatDialog,
        private spinner: NgxSpinnerService,
        private route: ActivatedRoute
      ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const userToken = this.tokenStorage.getToken();
        const userId = this.tokenStorage.getUser()?.id;
        const requestId = guid();
        const modifiedReq = req.clone({
          headers: new HttpHeaders({
            'Authorization': `Bearer ${userToken}`,
            'Request-Id': requestId,
            'User-Id': `${userId}`,
            'Accept-Language': this.translate.currentLang || 'PT',
          })
        });
        return next.handle(modifiedReq).pipe(
                  catchError((err: any) => {
                      if(err instanceof HttpErrorResponse) {
                        if (err.status == 401){
                          this.spinner.hide();
                          showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
                        } else {
                          return throwError(err);
                        }
                      }
                      return of(err);
                  }));
      }

      public showError()
      {
        const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
        this.spinner.hide();

        dialogRef.afterClosed().subscribe(() => {
          this.errors = [];
        });
      }
}
