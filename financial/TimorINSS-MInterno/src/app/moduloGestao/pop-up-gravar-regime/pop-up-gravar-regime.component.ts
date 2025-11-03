import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyErrorStateMatcher } from '../../matcher';
import { ValorCamposEditaveis } from '../../models/camposEditaveis';
import { CamposEditaveisService } from '../../services/camposEditaveis.service';
import { DominiosService } from '../../services/dominios.service';
import { openErrorsDialog } from '../../utils';
import { DominioDescricaoString } from '../../response-models/dominios-response';

export interface PopUpGravarRegimeData {
  edicao: boolean;
  valorCampo: ValorCamposEditaveis;
}

@Component({
  selector: 'app-pop-up-gravar-regime',
  templateUrl: './pop-up-gravar-regime.component.html',
  styleUrls: ['./pop-up-gravar-regime.component.css']
})

export class PopUpGravarRegimeComponent implements OnInit {
  public submittedTry: boolean = false;
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public tiposDeRegime: DominioDescricaoString[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public selectedTipoRegime: DominioDescricaoString = <DominioDescricaoString>{};

  constructor(
    public dialogRef: MatDialogRef<PopUpGravarRegimeComponent>,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private dominiosService: DominiosService,
    private camposEditaveisService: CamposEditaveisService,
    @Inject(MAT_DIALOG_DATA) public data: PopUpGravarRegimeData) { }

  ngOnInit(): void {
    this.showLoader();
    this.dominiosService.GetAllTiposDeRegime()
    .subscribe(res => {
      this.tiposDeRegime = res.dominios;
      if(this.data.valorCampo.parametros && this.data.valorCampo.parametros.length)
      {
        var selectedTipoRegime = this.tiposDeRegime.find(tr => tr.descricao == this.data.valorCampo.parametros[0].valor);
        if(selectedTipoRegime)
          this.selectedTipoRegime = selectedTipoRegime;
      }

      this.hideLoader();
    },
    err => {
      err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
      this.hideLoader();
    });
  }

  public submitRegime()
  {
    this.submittedTry = true;
  }

  public saveRegime()
  {
    this.showLoader();

    if(this.data.valorCampo.parametros && this.data.valorCampo.parametros.length)
      this.data.valorCampo.parametros[0].valor = this.selectedTipoRegime.descricao
    else
    {
      if(!this.data.valorCampo.parametros)
        this.data.valorCampo.parametros = [];

      this.data.valorCampo.parametros.push(
      {
        nome: 'TipoRegime',
        size: '1',
        type: 'text',
        valor: this.selectedTipoRegime.descricao,
        suffix: '',
        optional: false,
        naoVisivel: false
      });
    }

    let request = {
      valorCampo: this.data.valorCampo
    }

    this.camposEditaveisService.SaveRegimeCampoEditavel(request).subscribe(x => {
      this.hideLoader();
      this.dialogRef.close(true);
    },
    err => {
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public closePopUp(): void {
    this.dialogRef.close();
  }

  public showLoader() {
    this.spinner.show();
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public showError() {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

}
