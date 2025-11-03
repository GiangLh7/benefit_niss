import { Component, HostListener, Inject } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TokenStorageService } from '../../services/token-storage.service';
import { DialogComponent } from '../../componentes/dialog/dialog.component';
import { openErrorsDialog, RegexPatterns } from "../../utils";
import { ContatoService } from '../../services/contato.service';
import { ContactoDataContract } from "../../request-models/contato-request";
import { FormControl, Validators } from "@angular/forms";
import { MyErrorStateMatcher } from "../../matcher";
import { TranslateService } from "@ngx-translate/core";



export interface PopUpAdicionarEditarContatoData {
  idContato: number;
  idEntidade?: number;
  idTrabalhador?: number;
  telemovel: string;
  email: string;

  editar: boolean;
  adicionar: boolean;
}

@Component({
  selector: 'app-popUp-adicionar-editar-contato',
  templateUrl: 'pop-up-adicionar-editar-contato.component.html',
  styleUrls: ['./pop-up-adicionar-editar-contato.component.css']
})
export class PopUpAdicionarEditarContatoComponent {
  public availableRegex = RegexPatterns;
  public fileControlDocumento: FormControl = new FormControl;

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public idEntidade = 0;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public submittedTry: boolean = false;

  constructor(
    public contatoService: ContatoService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpAdicionarEditarContatoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopUpAdicionarEditarContatoData
  ) {
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public gravar($event: any, data: PopUpAdicionarEditarContatoData): void {
    this.submittedTry = true;


    let valid = true;
    if (!this.data.telemovel || !this.data.email) {
      valid = false;
    }

    if (valid) {

      this.showLoader();

      if (this.tokenStorage.getToken()) {
        let contato = {
          idContacto: data.idContato != null ? data.idContato : 0,
          idEntidade: data.idEntidade,
          idTrabalhador: data.idTrabalhador,
          telemovel: data.telemovel,
          email: data.email,
        };

        this.saveContato(contato);
      }
    }
  }

  public saveContato(contato: ContactoDataContract) {
    let request = {
      contato: contato
    }
    if (contato.idContacto == 0) {
      this.contatoService.saveContato(request).subscribe(x => {
        this.dialogRef.close(true);
        this.hideLoader();
      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    }
    else {
      this.contatoService.updateContato(request).subscribe(x => {
        this.dialogRef.close(true);
        this.hideLoader();
      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
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

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

}
