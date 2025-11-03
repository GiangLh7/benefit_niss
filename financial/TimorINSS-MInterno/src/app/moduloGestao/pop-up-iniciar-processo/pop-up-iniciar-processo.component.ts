import { Component, HostListener, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from '../../services/token-storage.service';
import { DialogComponent } from '../../componentes/dialog/dialog.component';
import { openErrorsDialog, openSnackBar, RegexPatterns, showExpiredError } from "../../utils";
import { ContatoService } from '../../services/contato.service';
import { ContactoDataContract } from "../../request-models/contato-request";
import { FormControl, Validators } from "@angular/forms";
import { MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";
import { SelectDescription } from "src/app/models/utils";
import { Router } from "@angular/router";
import { ProcessoService } from "src/app/services/processos.service";
import { ProcessoUpdateRequest } from "src/app/request-models/processo-request";


@Component({
  selector: 'app-pop-up-iniciar-processo',
  templateUrl: './pop-up-iniciar-processo.component.html',
  styleUrls: ['./pop-up-iniciar-processo.component.css']
})
export class PopUpIniciarProcessoComponent {

  public availableRegex = RegexPatterns;
  public fileControlDocumento: FormControl = new FormControl;

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;
  public selectedProcessId?: number;
  public request = <ProcessoUpdateRequest>{};

  constructor(
    public contatoService: ContatoService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    private router: Router,
    public processoService: ProcessoService,
    public dialogRef: MatDialogRef<PopUpIniciarProcessoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SelectDescription[]
  ) {
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public gravar(): void {
    this.submittedTry = true;

    if (this.selectedProcessId) {

      this.showLoader();

      if (!this.tokenStorage.getToken()) {
        this.router.navigate(['/login'], { skipLocationChange: true });
        this.closePopUp();
      }
      else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
      {
        // Chamar função para iniciar processo
        this.request.id = this.selectedProcessId;
        this.spinner.show();
        this.processoService.StartProcess(this.request).subscribe(() => {
          this.spinner.hide();
          this.dialogRef.close(true);
        },
          err => {
            this.spinner.hide();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
      else{
        showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
      }
    }
  }


  public submitContato()
  {
    this.submittedTry = true;
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }


  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(() => {
      this.errors = [];
    });
  }

}

