import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { DialogComponent } from "../componentes/dialog/dialog.component";
import { MyErrorConfirmPasswordStateMatcher, MyErrorStateMatcher } from "../matcher";
import { PopUpWarningComponent } from "../componentes/pop-up-warning/pop-up-warning.component";
import { RecoverSetPasswordRequest } from "../request-models/recoverPassword-request";
import { LoginService } from "../services/login.service";
import { TokenStorageService } from "../services/token-storage.service";
import { openSnackBar, RegexPatterns } from "../utils";


@Component({
    selector: 'app-recover-password',
    templateUrl: './recover-password.component.html',
    styleUrls: ['./recover-password.component.css']
  })

export class RecoverPasswordComponent implements OnInit {

    public request: RecoverSetPasswordRequest = {
        Token: '',
        Username: '',
        Password: '',
        ConfirmPassword: '',
        UsernameChange: false,
    };
    public isLoggedIn = false;
    public expiredError = true;
    private token : string = <string>{};
    public errorMessage = '';
    public loginFailed = false;
    public hide = true;
    public errors: string[] = [];
    public disabledButton = false;
    public isRecoverPassword = false;
    public isFirstAccess = false;
    public secondForm = false;
    public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
    public passwordMatcher: MyErrorConfirmPasswordStateMatcher = new MyErrorConfirmPasswordStateMatcher(<string>{});
    public submittedFormError = false;
    public isAdmin = false;
    public availableRegex = RegexPatterns;
    public isValidPattern = false;

    constructor(
        private tokenStorage: TokenStorageService,
        private loginService: LoginService,
        private router: Router,
        public translate: TranslateService,
        private spinner: NgxSpinnerService,
        public errorDialog: MatDialog,
        public warningDialog: MatDialog,
        private actRoute: ActivatedRoute,
        public _snackBar: MatSnackBar,
        ) { }

    public ngOnInit(): void {
        if (this.tokenStorage.getToken()) {
            this.isLoggedIn = true;
            this.router.navigate(['']);
          }
        this.token = this.actRoute.snapshot.params.token;
        if (this.tokenStorage.recoverTokenExpired(this.token)){
            this.translate.get('login_form.expiredRecoverToken').subscribe((translated: string) => {
                const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
                    id: 'desvincularDialog',
                    minHeight: '300px',
                    width: '40%',
                    height: '30%',
                    panelClass: 'warningModal',
                    data: {msg: translated, noConfirmation: true}
                    });
                    dialogRef.afterClosed().subscribe(() => {
                        this.router.navigate(['']);
                    });

            });
        }
        else {
            
            this.loginService.validToken({token: this.token, isRecover: this.actRoute.snapshot.params.username != undefined}).subscribe(() => {
                this.expiredError = false;
                this.request.Username = this.actRoute.snapshot.params.username ?? '';
                this.isAdmin = this.request.Username.toLocaleLowerCase() == "admin";
                if (!this.actRoute.snapshot.params.username){
                    this.isFirstAccess = true;
                    this.request.UsernameChange = true;
                }
                this.request.Token = this.token;
              },
                err => {
                    this.translate.get('login_form.expiredRecoverToken').subscribe((translated: string) => {
                        const dialogRef = this.errorDialog.open(PopUpWarningComponent, {
                            id: 'desvincularDialog',
                            minHeight: '300px',
                            width: '40%',
                            height: '30%',
                            panelClass: 'warningModal',
                            data: {msg: translated, noConfirmation: true}
                            });
                            dialogRef.afterClosed().subscribe(() => {
                                this.router.navigate(['']);
                            });
        
                    });
                });
            
        }
    }

    public setUpPassword(): void {
        // stop here if form is invalid
        if (!(this.request.Username && this.request.Password)) {
            this.submittedFormError = true;
            return;
        }
        if (this.request.Password != this.request.ConfirmPassword) {
            this.submittedFormError = true;
            return;
        }
        this.passwordMatcher = new MyErrorConfirmPasswordStateMatcher(this.request.Password);
        this.spinner.show();
        this.disabledButton = true;
        if (this.isFirstAccess){
            this.loginService.createUser(this.request)
            .subscribe(
                response => {
                    this.spinner.hide();
                    openSnackBar('Utilizador criado com sucesso!', this._snackBar);
                    setTimeout(() => {
                        this.router.navigate(['']);
                      }, 2000);

                },
                err => {
                    this.spinner.hide();
                    if (err.error.errors[0].errorCode == '-21' || err.error.errors[0].errorCode == '-22' || err.error.errors[0].errorCode == '-69'){
                        this.showError([err.error.errors[0].errorCode]);
                    }
                    else
                        this.showError(['-1']);
                    this.disabledButton = false;
                }
            );
        }
        else{
            this.loginService.setUpPassword(this.request)
            .subscribe(
                response => {
                    this.spinner.hide();
                    openSnackBar('Password alterada com sucesso!', this._snackBar);
                    setTimeout(() => {
                        this.router.navigate(['']);
                      }, 2000);

                },
                err => {
                    this.spinner.hide();
                    if (err.error.errors[0].errorCode == '-21' || err.error.errors[0].errorCode == '-22' || err.error.errors[0].errorCode == '-69'){
                        this.showError([err.error.errors[0].errorCode]);
                    }
                    else
                        this.showError(['-1']);
                    this.disabledButton = false;
                }
            );
        }
    }

    showError(error: string[])
    {
        error.map(x => this.errors.push(x));
        this.errorDialog.closeAll();
        const dialogRef = this.errorDialog.open(DialogComponent, {
        id: 'dialog',
        minHeight: '300px',
        width: '50%',
        height: '50%',
        panelClass: 'modalWithBorder',
        data: {errors: this.errors}
        });


        dialogRef.afterClosed().subscribe((result) => {
        if (result)
            this.errors = [];
        });
    }

    public updatePasswordMatcherState()
    {
        this.passwordMatcher = new MyErrorConfirmPasswordStateMatcher(this.request.Password);
        this.isValidPattern = this.validPassword();
    }

    private validPassword(): boolean {
        return new RegExp(this.availableRegex.passwordPattern).test(this.request.ConfirmPassword);
    }
}
