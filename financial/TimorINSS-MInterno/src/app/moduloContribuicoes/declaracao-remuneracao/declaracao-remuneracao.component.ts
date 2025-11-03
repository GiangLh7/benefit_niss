import { NgForm } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { forkJoin } from 'rxjs';
import { MyErrorStateMatcher, MyMaxNumberStateMatcher } from '../../matcher';
import { PopUpInfoLegalRemuneracaoComponent } from '../pop-up-info-legal-remuneracao/pop-up-info-legal-remuneracao.component';
import { PopUpResumoDeclaracaoComponent } from '../pop-up-resumo-declaracao/pop-up-resumo-declaracao.component';
import { PopUpWarningComponent } from '../../componentes/pop-up-warning/pop-up-warning.component';
import { FilterRequest } from '../../request-models/utils-request';
import { ContasState } from '../../response-models/contaCorrente-response';
import { DeclaracaoListagem } from '../../response-models/declaracao-response';
import { EntidadeEmpregadoraDeclaracaoViewResponse } from '../../response-models/entidadeEmpregadora-response';
import { ContaCorrenteService } from '../../services/contaCorrente.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { customCurrencyMaskConfig, focusCurrency, getCurrentDateUTC, openErrorsDialog, openSnackBar, RegexPatterns, showExpiredError } from '../../utils';
import { DeclaracaoService } from './../../services/declaracao.service';
import { DominiosService } from './../../services/dominios.service';
import { EntidadeEmpregadoraService } from './../../services/entidadeEmpregadora.service';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
const XLSTYLE = require('ng-xlsx-style');


@Component({
  selector: 'app-declaracao-remuneracao',
  templateUrl: './declaracao-remuneracao.component.html',
  styleUrls: ['./declaracao-remuneracao.component.css']
})
export class DeclaracaoRemuneracaoComponent implements OnInit {
  public selectedMonth = 0;
  public date?: Date = new Date();
  public translatedMonth: string = '';
  public year: string = '';
  public entidade: EntidadeEmpregadoraDeclaracaoViewResponse = <EntidadeEmpregadoraDeclaracaoViewResponse>{};
  public errors: string[] = [];
  public displayedColumns: string[] = ['niss','nome','nacionalidade','regime','diasContrato','faltasInjustific','diasParentalidade','diasEfecTrabalhados','diasTrabcontabSegSocial','remunDeclarada','decimoTerceiro'];
  public declaracoes: DeclaracaoListagem[] = [];
  public declaracoesOriginal: DeclaracaoListagem[] = [];
  public contas: ContasState[] = [];
  public idEntidade: number = 0;
  public endDate: Date = new Date();
  public beginDate: Date = new Date();
  public availableRegex = RegexPatterns;
  public submittedTry: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public maxMonthDateMatcher: MyMaxNumberStateMatcher = new MyMaxNumberStateMatcher(30, false);
  public maxDayPerWeekMatcher: MyMaxNumberStateMatcher = new MyMaxNumberStateMatcher(7, false);
  public currencyOptions = customCurrencyMaskConfig;
  public salarioMinimo: number = 115;
  public canOverWrite: boolean = false;
  public saving: boolean = false;
  @ViewChild('declaracaoForm') myForm: NgForm | undefined;

  constructor(private tokenStorage: TokenStorageService,
              private router: Router,
              private spinner: NgxSpinnerService,
              public translate: TranslateService,
              public dialog: MatDialog,
              private declaracaoService: DeclaracaoService,
              private contaCorrentService: ContaCorrenteService,
              private dominiosService: DominiosService,
              public decimalpipe: DecimalPipe,
              public datepipe: DatePipe,
              public entidadeService: EntidadeEmpregadoraService,
              public snackBar: MatSnackBar,
              private elem: ElementRef) { }

  ngOnInit(): void {
    if(!this.tokenStorage.getToken()){
        this.router.navigate([''], { skipLocationChange: true });
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired())
    {
      this.translate.onLangChange.subscribe(() => {
        this.updateDateFormated();
      });
      this.showLoader();
      let idEntidade = this.tokenStorage.getUser()?.idEntidade;
      if(idEntidade != null)
      {
        this.idEntidade = idEntidade;

        let requestEntidadeInfo = {
          idEntidade: idEntidade
        };

        //get the general info for the page
        let entidadeRequest = this.entidadeService.GetEntidadeInfoForDeclaracao(requestEntidadeInfo)
        let salarioMinimoRequest = this.dominiosService.GetSalarioMinimo();
        let declarationDayRequest = this.dominiosService.GetDeclarationDay();

        forkJoin([entidadeRequest,salarioMinimoRequest,declarationDayRequest])
        .subscribe( ([entidadeRequest,salarioMinimoRequest,declarationDayRequest]) => {
          this.entidade = entidadeRequest;
          this.salarioMinimo = salarioMinimoRequest.dominio.value;
          this.beginDate = entidadeRequest.dataInicioDeclaracao;

          var declarationDay = 0;
          if(declarationDayRequest.dominio)
          {
            var declarationDay = declarationDayRequest.dominio.value;
            let currentDate = getCurrentDateUTC();
            let lessThenDeclaration = false;

            //set the date for the correct month (subtracts 1 if before the declaration day)
            if(currentDate.getDate() <= declarationDay)
            {
              let auxDate = moment().subtract(1, 'months');
              this.endDate = new Date(Date.UTC(auxDate.year(),auxDate.month(),1));
              lessThenDeclaration = true;
            }

            if(entidadeRequest.dataFimActiv)
            {
              if(entidadeRequest.dataFimActiv < currentDate)
              {
                if(!lessThenDeclaration)
                  this.endDate = entidadeRequest.dataFimActiv;
                else if(entidadeRequest.dataFimActiv < this.endDate)
                  this.endDate = entidadeRequest.dataFimActiv;
              }
            }
          }

          let date = getCurrentDateUTC();
          let day = new Date().getDate();
          if(day <= declarationDay)
            date.setMonth(date.getMonth() - 1);

          this.date = date;
          this.updateDateFormated();

          //get the info for the date selected
          this.dateUpdated();
        },
        err => {
          err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
      }
      else{
        this.errors.push('-7');
        this.showError();
      }
    }
    else{
      showExpiredError(this.dialog, this.tokenStorage, this.translate);
    }
  }

  public dateUpdated() {
    this.showLoader();
    this.updateDateFormated();

    if(this.date){
      let newDate: string = this.date.toString();
      let newDateFormat: Date = new Date(newDate);
      this.selectedMonth = newDateFormat.getMonth();
    }

    let filter =
    {
      dateFilterBegin: this.date
    };

    let requestGuia = {
      idEntidade: this.idEntidade,
      filter: filter
    };
    let tableRequest = this.getTable();
    let contasCorrentes = this.contaCorrentService.getAllContasStatesFromYearByFilter(requestGuia);

    //get the declarations for the selected date and check the guia status
    forkJoin([tableRequest,contasCorrentes])
    .subscribe( ([tableRequest,contasCorrentes]) => {
      this.declaracoesOriginal = tableRequest.declaracoes;
      this.declaracoes = JSON.parse(JSON.stringify(tableRequest.declaracoes));
      this.contas = contasCorrentes.contasState;
      let contaCurrente = this.contas.find(c => c.month == (moment(this.date).month() + 1));
      this.canOverWrite = contaCurrente?.state === "Sem Guia Gerada";
      this.hideLoader();
    },
    err => {
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }

  public getTable() {
    let filter: FilterRequest;
    filter = {};
    filter.dateFilterBegin = this.date;
    let request = {
      IdEntidade: this.idEntidade,
      filter: filter,
    };
    return this.declaracaoService.getDeclaracaoByEntidadeAndFilter(request);
  }

  public updateDateFormated() {
    if(this.date)
    {
      this.translatedMonth = 'month.' + moment(this.date).month();
      this.year = moment(this.date)?.year().toString();
    }
  }

  public showLoader()
  {
    this.spinner.show();
  }

  public hideLoader()
  {
    this.spinner.hide();
  }

  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.dialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe(result => {
      this.errors = [];
    });
  }

  public focusCurrency(event: any)
  {
    focusCurrency(event);
  }

  public showWarning(msg: string, noConfirm: boolean) {
    try
    {
      return this.dialog.open(PopUpWarningComponent,
      {
        id: 'warningDialog',
        minHeight: '300px',
        width: '40%',
        height: '30%',
        panelClass: 'warningModal',
        data: {msg: msg, noConfirmation: noConfirm}
      });
    }
    catch
    {
      return null;
    }
  }

  public updateDiasContab(input: DeclaracaoListagem)
  {
    let a = +input.declaracao.diasEfecTrabalhados + +input.declaracao.diasParentalidade + +input.declaracao.faltasInjustific;
    let b = a - +input.declaracao.diasContrato;
    input.declaracao.diasEfecTrabalhados = +input.declaracao.diasEfecTrabalhados - b;
    input.declaracao.diasTrabcontabSegSocial = +input.declaracao.diasContrato;
    if(input.declaracao.diasEfecTrabalhados < 0)
    {
      input.declaracao.diasParentalidade = 0;
      input.declaracao.faltasInjustific = 0;
      this.updateDiasContab(input);
      this.showWarning('declaracaoremunerao.diasEfecTrabalhadosNegativos', true);
    }
  }

  public checkFaltasInjustific(input: DeclaracaoListagem)
  {
    if(input.declaracao.faltasInjustific > 5)
    {
      let warn = this.showWarning('declaracaoremunerao.faltasInjustificSuperiores', false);
      warn?.afterClosed().subscribe(result => {
        if (!result) {
          input.declaracao.faltasInjustific = 5;
        }
        this.updateDiasContab(input);
      });
    }
    else
      this.updateDiasContab(input);
  }

  public checkDiasParentalidade(input: DeclaracaoListagem)
  {
    if(input.declaracao.diasParentalidade > 5 && input.trabalhadorInfo.sexo === 'Masculino')
    {
      let warn = this.showWarning('declaracaoremunerao.diasParentalidadeSuperiores', false);
      warn?.afterClosed().subscribe(result => {
        if (!result) {
          input.declaracao.diasParentalidade = 0;
        }
        this.updateDiasContab(input);
      });
    }
    else
      this.updateDiasContab(input);
  }

  public checkRemuneracaoDeclarada(input: DeclaracaoListagem)
  {
    if(input.declaracao.remunDeclarada < this.salarioMinimo)
    {
      let warn = this.showWarning('declaracaoremunerao.abaixoSalarioMinimo', false);
      warn?.afterClosed().subscribe(result => {
        if (!result) {
          input.declaracao.remunDeclarada = this.salarioMinimo;
        }
      });
    }
  }

  public showResumo(form: any)
  {
    if(form.valid)
    {
      const resumoDialog = this.dialog.open(PopUpResumoDeclaracaoComponent, {
          id: 'resumoDialog',
          minHeight: '300px',
          width: '90%',
          maxWidth: '90vw',
          height: '80%',
          data: { declaracoes: this.declaracoes }
        });
      }
  }

  public saveDeclaracao(form: any)
  {
    this.saving = true;
    if(form.valid)
    {
      this.showLoader();
      let requestSave  = {
        declaracoes: this.declaracoes.map(x=>x.declaracao),
        data: this.date ?? getCurrentDateUTC(),
        entidadeId: this.entidade.idEntidadeEmpreg
      };
      this.declaracaoService.saveDeclaracao(requestSave)
      .subscribe( res => {
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.saveDeclaracao'), this.snackBar);
        this.router.navigate(['/contribHomePage'], { skipLocationChange: true });
      },
      err => {
        err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
        if(!this.errors[0].startsWith('-27ÿ'))
          this.saving = false;
      });
    }
    else
      this.saving = false;
  }

  public goToDeclaracaoMonth(month: number)
  {
    if(this.date)
    {
      this.declaracoes = [];
      this.declaracoesOriginal = [];
      this.date = new Date(Date.UTC(moment(this.date).year(),month-1,1));
      this.dateUpdated();
    }
  }

  public cancelDeclaracao()
  {
    this.declaracoes = JSON.parse(JSON.stringify(this.declaracoesOriginal));
  }

  public showInfoLegalRemuneracao()
  {
    this.dialog.open(PopUpInfoLegalRemuneracaoComponent, {
      id: 'dialog',
      minHeight: '300px',
      width: '90%',
      maxWidth: '90vw',
      height: '80%'
    });
  }

  public return(): void {
    this.router.navigate(['/contribHomePage/'], { skipLocationChange: true });
  }

  //from here on is the excel logic not being used at the moment (requires refinement)

  public onFileChange(ev: any) {
    let workBook: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      this.updateDeclaracoes(jsonData);
    }
    reader.readAsBinaryString(file);
  }

  private updateDeclaracoes(jsonData: any)
  {
    let currentDeclaracao;
    jsonData.Template.forEach((excelLine: any) =>
      {
        currentDeclaracao = this.declaracoes.find(d => d.trabalhadorInfo.niss == excelLine.niss);
        if(currentDeclaracao && !currentDeclaracao?.declaracao.flagImportado)
        {
          if(currentDeclaracao.trabalhadorInfo.tipoRegime !== 'E')
            currentDeclaracao.declaracao.remunDeclarada = excelLine.remunDeclarada;

          currentDeclaracao.declaracao.decimoTerceiro = excelLine.decimoTerceiro;
          currentDeclaracao.declaracao.diasContrato = excelLine.diasContrato;
          currentDeclaracao.declaracao.diasEfecTrabalhados = excelLine.diasEfecTrabalhados;
          currentDeclaracao.declaracao.diasParentalidade = excelLine.diasParentalidade;
          currentDeclaracao.declaracao.diasTrabcontabSegSocial = excelLine.diasTrabcontabSegSocial;
          currentDeclaracao.declaracao.faltasInjustific = excelLine.faltasInjustific;
        }
      }
    );

    this.updateFormErrors();
  }

  public updateFormErrors()
  {
    if(this.myForm)
    {
      Object.keys(this.myForm.controls).forEach(control => {
        this.myForm?.controls[control].markAsDirty();
      });
    }

  }

  public s2ab(s: any) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
  }

  public createXLSX()
  {
    var wb = XLSX.utils.book_new();
    wb.Props = {
      Title: "Template",
      Subject: "Template",
      Author: "INSS Timor",
      CreatedDate: new Date()
    };
    wb.SheetNames.push("Template");
    var ws_data = [
      ['niss','diasContrato','diasEfecTrabalhados','faltasInjustific','diasParentalidade',
        'remunDeclarada','decimoTerceiro'],
      [this.translate.instant('declaracaoremunerao.excelDontChange')],
      [this.translate.instant('general.niss'),this.translate.instant('declaracaoremunerao.tabelaHeader5'),
        this.translate.instant('declaracaoremunerao.tabelaHeader6'),this.translate.instant('declaracaoremunerao.tabelaHeader7'),
        this.translate.instant('declaracaoremunerao.tabelaHeader8'),this.translate.instant('declaracaoremunerao.tabelaHeader9'),
        this.translate.instant('declaracaoremunerao.tabelaHeader11'),this.translate.instant('declaracaoremunerao.tabelaHeader12')]];
    var ws = XLSX.utils.aoa_to_sheet(ws_data);

    var wscols = [];

    for(var i = 0; i < 8; i++)
    {
      wscols.push({wpx: 175});
    }

    ws['!cols'] = wscols;

    let merge = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
    ];

    ws["!merges"] = merge;

    //mapping header
    var list = ["A1", "B1","C1","D1","E1","F1","G1","H1","A2"];

    list.forEach(element => {
      ws[element].s = {
        fill:{
          fgColor:{ rgb: "FF0000" }
        },
        font:{
          bold: true
        },
        alignment: {
          horizontal: "center",
        }
      };
    })

    //translated header
    var list = ["A3", "B3","C3","D3","E3","F3","G3","H3"];

    list.forEach(element => {
      ws[element].s = {
        fill:{
          fgColor:{ rgb: "2A81CC" }
        },
        font:{
          color:{ rgb: "FFFFFF" },
          bold: true
        },
        alignment: {
          horizontal: "center",
        }
      };
    })

    wb.Sheets["Template"] = ws;

    var wbout = XLSTYLE.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([this.s2ab(wbout)],{type:"application/octet-stream"}), 'Template.xlsx');
  }
}
