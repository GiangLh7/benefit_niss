import { CamposEditaveisListagem } from './../../response-models/camposEditaveis-response';
import { ValorCamposEditaveis, ValorCamposEditaveisParents, CamposEditaveisParents, ParametrosAdicionais } from './../../models/camposEditaveis';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MyErrorStateMatcher } from '../../matcher';
import { customCurrencyMaskConfig, formatDate, openErrorsDialog, RegexPatterns } from '../../utils';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { CamposEditaveisService } from '../../services/camposEditaveis.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

export interface PopUpGravarCampoData {
  edicao: boolean;
  valorCampo: ValorCamposEditaveis;
  valoresCamposEditavelParent: CamposEditaveisParents;
  campo: CamposEditaveisListagem;
  idSelectedCampo: number;
  parentId?: number;
}

@Component({
  standalone: false,
  selector: 'app-pop-up-gravar-campo',
  templateUrl: './pop-up-gravar-campo.component.html',
  styleUrls: ['./pop-up-gravar-campo.component.css']
})
export class PopUpGravarCampoComponent implements OnInit {
  public errors: string[] = [];
  public faTimesCircle = faTimesCircle;
  public availableRegex = RegexPatterns;
  public currencyOptions = customCurrencyMaskConfig;

  public parents: ValorCamposEditaveisParents[] = [];
  public parentsF: ValorCamposEditaveisParents[] = [];
  public submittedTry: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

  public initialValueFilled = false;

  constructor(
    public dialogRef: MatDialogRef<PopUpGravarCampoComponent>,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private spinner: NgxSpinnerService,
    private camposEditaveisService: CamposEditaveisService,
    private datepipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: PopUpGravarCampoData
    ) { }

  ngOnInit(): void {
    if(this.data.valoresCamposEditavelParent && this.data.valoresCamposEditavelParent.valores)
    {
      this.parents = this.data.valoresCamposEditavelParent.valores;
      this.parentsF = JSON.parse(JSON.stringify(this.parents));
    }

    if(this.data.valorCampo.parametros)
      this.data.valorCampo.parametros.forEach((element, index) => {
        // if(element.valuesList)
        //   element.filteredValuesList = element.valuesList;
        // else 
        if(element.type == 'mesAno')
          element.dateValorFormatted = formatDate(this.datepipe, element.dateValor);
        if(element.type == 'currency' && element.nome == 'ValorInicial')
          this.initialValueFilled = parseFloat(element.valor) > 0;
      });
  }

  public changesValidation(form: any)
  {
    if(form.valid)
      this.gravar();
  }

  public gravar()
  {
    this.showLoader();

    let request = {
      valorCampo: this.data.valorCampo,
      idCampo: this.data.idSelectedCampo
    }

    this.camposEditaveisService.SaveValorCampoEditavel(request).subscribe(x => {
      this.hideLoader();
      this.dialogRef.close(true);
    },
    err => {
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public submitCampo()
  {
    this.submittedTry = true;
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

  public filterMyOptions(event: any)
  {
    this.parentsF = this.parents.filter(p => p.nome.toLowerCase().startsWith(event.toLowerCase()));
  }

  // public filterCustomOptions(event: any, parametro: ParametrosAdicionais)
  // {
  //   if(parametro.valuesList)
  //     parametro.filteredValuesList = parametro.valuesList.filter(p => p.nome.toLowerCase().startsWith(event.toLowerCase()));
  // }

  // public selectMultiples(event: any, parametro: ParametrosAdicionais)
  // {
  //   if(event && event.source && event.source.value && event.isUserInput)
  //   {
  //     if(!parametro.selectedValuesList)
  //       parametro.selectedValuesList = [];

  //     var index = parametro.selectedValuesList.indexOf(event.source.value)
  //     if(index >= 0)
  //       parametro.selectedValuesList.splice(index, 1);
  //     else
  //       parametro.selectedValuesList.push(event.source.value);
  //   }
  // }

  chosenYearHandler(normalizedYear: any, parametro: ParametrosAdicionais) {
    parametro.dateValor = normalizedYear;
    parametro.dateValorFormatted = formatDate(this.datepipe, parametro.dateValor);
  }

  chosenMonthHandler(normalizedMonth: any, datepicker: MatDatepicker<any>, parametro: ParametrosAdicionais) {
    parametro.dateValor = normalizedMonth;
    parametro.dateValorFormatted = formatDate(this.datepipe, parametro.dateValor);
    datepicker.close();
  }

  addedValue(value: any){
    this.initialValueFilled = value > 0;
  }
}
