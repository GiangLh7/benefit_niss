import { Component, OnInit } from '@angular/core';

import { TokenStorageService } from '../services/token-storage.service';
import { LoginRequest } from '../request-models/login-request';
import { LoginService } from '../services/login.service';
import { TranslateService } from '@ngx-translate/core';
import {Router} from "@angular/router"
import { MatDialog } from '@angular/material/dialog';
import { blobZipSaveAs, openErrorsDialog, openSnackBar, RegexPatterns } from "../utils";
import { RecoverPasswordRequest } from '../request-models/recoverPassword-request';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MyErrorStateMatcher } from '../matcher';
import { PopUpWarningComponent } from '../componentes/pop-up-warning/pop-up-warning.component';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public request: LoginRequest = {
    Username: '',
    Password: ''
  };
  public recoverRequest: RecoverPasswordRequest = {
    Niss: '',
    Email: ''
  };
  public isLoggedIn = false;
  public errorMessage = '';
  public loginFailed = false;
  public hide = true;
  public errors: string[] = [];
  public disabledButton = false;
  public isRecoverPassword = false;
  public isFirstAccess = false;
  public secondForm = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public recoverMatcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public FirstAcessMatcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedFormError = false;
  public counter = 0;
  public availableRegex = RegexPatterns;

  constructor(
    private loginService: LoginService,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    private router: Router,
    public errorDialog: MatDialog,
    public _snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.router.navigate(['']);
    }
  }

  public onSubmit() {
    // stop here if form is invalid
    if (!(this.request.Username && this.request.Password)) {
      this.submittedFormError = true;
      return;
    }

    this.disabledButton = true;

    this.loginService.login(this.request)
      .subscribe(
        response => {
          this.tokenStorage.saveToken(response.token);
          this.tokenStorage.saveUser(response.user);

          this.isLoggedIn = true;
          this.reloadPage();
          this.disabledButton = false;
        },
        err => {
          this.loginFailed = true;
          if (err.statusText == 'Unknown Error') {
            this.showError(['-1']);
          }
          else if (err.error?.errors?.find((x : any) => x.errorCode == '-57')) {
            this.errorMessage = this.translate.instant('error.-57');
          }
          else if (err.error?.errors?.find((x : any) => x.errorCode == '-28')) {
            this.errorMessage = this.translate.instant('error.-28');
          }
          else {
            this.errorMessage = this.translate.instant('error.-2');
          }

          this.disabledButton = false;
        }
      );
  }

  showError(error: string[])
  {
    const dialogRef = openErrorsDialog(error, this.errorDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public reloadPage(): void {
    window.location.reload();
  }

  public recoverPassword(): void {
    this.secondForm = true;
    this.isRecoverPassword = true;
    this.isFirstAccess = false;
    this.submittedFormError = false;
    this.counter = 0;
  }

  public firstAccess(): void {
    this.secondForm = true;
    this.isRecoverPassword = false;
    this.isFirstAccess = true;
    this.submittedFormError = false;
    this.counter = 0;
  }

  public back(): void {
    this.secondForm = false;
    this.isRecoverPassword = false;
    this.isFirstAccess = false;
    this.submittedFormError = false;
    this.counter = 0;
    this.recoverRequest = {
      Niss: '',
      Email: ''
    }
  }

  public recoverSubmit(): void {
    // stop here if form is invalid
    if (!(this.recoverRequest.Niss && this.recoverRequest.Email)) {
      this.submittedFormError = true;
      return;
    }
    this.disabledButton = true;
    if (this.isFirstAccess){
      this.loginService.firstAcess(this.recoverRequest)
      .subscribe(
        () => {
          let msg = this.translate.instant('login_form.emailSent');
          openSnackBar(msg, this._snackBar);
          this.counter += 1;
          this.disabledButton = false;
        },
        () => {
          this.translate.get('error.temporary').subscribe((translated: string) => {
            const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
              id: 'desvincularDialog',
              minHeight: '300px',
              width: '40%',
              height: '30%',
              panelClass: 'warningModal',
              data: {msg: translated, noConfirmation: true}
              });
              dialogRef.afterClosed().subscribe(() => {});
          });
          this.disabledButton = false;
        }
      );
    }
    else {
      this.loginService.recoverPassword(this.recoverRequest)
      .subscribe(
        () => {
          let msg = this.translate.instant('login_form.emailSent');
          openSnackBar(msg, this._snackBar);
          this.counter += 1;
          this.disabledButton = false;
        },
        () => {
          this.translate.get('error.temporary').subscribe((translated: string) => {
            const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
              id: 'desvincularDialog',
              minHeight: '300px',
              width: '40%',
              height: '30%',
              panelClass: 'warningModal',
              data: {msg: translated, noConfirmation: true}
              });
              dialogRef.afterClosed().subscribe(() => {});
          });
          this.disabledButton = false;
        }
      );
    }
  }

  public keyPressNumbers(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode;
    // Only Numbers 0-9
    if ((charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
}
