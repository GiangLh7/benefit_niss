import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {customCurrencyMaskConfig, openSnackBar, RegexPatterns} from "../../utils";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {MyErrorStateMatcher} from "../../matcher";
import {
  PopUpAdicionarEditarContatoData
} from "../../moduloContribuicoes/pop-up-adicionar-editar-contato/pop-up-adicionar-editar-contato.component";
import {DialogComponent} from "../../componentes/dialog/dialog.component";
import {NgxSpinnerService} from "ngx-spinner";
import {GuiaPagamentoService} from "../../services/guiaPagamento.service";
import {LoginService} from "../../services/login.service";
import CreateNISSInfoRequest from "../../request-models/createNISSInfo-request";
import {TranslateService} from "@ngx-translate/core";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface PopUpAddUserData {
  Name: string;
  NISS: string;
  Email?: string;
  InternalUser?: boolean;

}
@Component({
  standalone: false,
  selector: 'app-pop-up-add-user',
  templateUrl: './pop-up-add-user.component.html',
  styleUrls: ['./pop-up-add-user.component.scss']
})
export class PopUpAddUserComponent implements OnInit {
  public availableRegex = RegexPatterns;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public errors: string[] = [];
  constructor(
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public dialogRef: MatDialogRef<PopUpAddUserComponent>,
    public loginService: LoginService,
    public translate: TranslateService,
    public _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: PopUpAddUserData
  ) { }

  ngOnInit(): void {
  }

  public closePopUp(value: boolean = false): void {
    this.dialogRef.close(value);
  }


  public approve() {

    if (this.data.NISS && this.data.Email?.match(this.availableRegex.emailPattern)) {
      this.showLoader();
      const request: CreateNISSInfoRequest = {Name: this.data.Name,Niss: this.data.NISS, Email: this.data.Email, InternalUser: this.data.InternalUser};
      this.loginService.createNISSInfor(request)
        .subscribe(x => {
            this.hideLoader();
            openSnackBar(this.translate.instant('snackBar.createUser'), this._snackBar);
            this.closePopUp(true);
          },
          err => {
            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
    }
  }


  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }
  public showError() {
    this.hideLoader();
    const dialogRef = this.errorDialog.open(DialogComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '80%',
      height: '60%',
      data: {errors: this.errors}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

}
