import { DatePipe } from '@angular/common';
import { AgrupamentosConfig } from './../../../../models/agrupamentosConfig';
import { Component, Input, OnInit, Output } from '@angular/core';
import { MyErrorStateMatcher } from 'src/app/matcher';
import { ComponenteOrcamento } from 'src/app/models/componenteOrcamento';
import { ComponenteOrcamentoRegisto } from 'src/app/models/componenteOrcamentoRegisto';
import { SelectDescription } from 'src/app/models/utils';
import { blobExcelSaveAs, blobToSaveAs, customCurrencyMaskConfig, formatDecimal, openErrorsDialog, openSnackBar, stringErrorFormat } from 'src/app/utils';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { componenteOrcamentoRegistoService } from 'src/app/services/componenteOrcamentoRegisto.service';
import { GetComponenteOrcamentoRegistoRequest, OrcamentoExtractRequest, UpdateComponenteOrcamentoRegistoDatesRequest } from 'src/app/request-models/componenteOrcamentoRegisto-request';
import { forkJoin, Observable } from 'rxjs';
import { DepartamentoService } from 'src/app/services/departamento.service';
import { DominioDescricaoString } from 'src/app/response-models/dominios-response';
import { TranslateService } from '@ngx-translate/core';
import { ComponenteOrcamentoValor, ComponenteOrcamentoValorFull, ComponenteOrcamentoValorSearch } from 'src/app/models/componenteOrcamentoValor';
import { componenteOrcamentoValorService } from 'src/app/services/componenteOrcamentoValor.service';
import { AddComponenteOrcamentoValorRequest, SearchComponenteOrcamentoValorRequest } from 'src/app/request-models/componenteOrcamentoValor-request';
import { PopUpEditarComponenteOrcamentoValorComponent } from './pop-up-editar-componente-orcamento-valor/pop-up-editar-componente-orcamento-valor.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DecimalPipe } from '@angular/common';
import { PopUpWarningComponent } from 'src/app/componentes/pop-up-warning/pop-up-warning.component';
import { faFilePdf, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { GetComponenteOrcamentoConfigRequest } from 'src/app/request-models/componenteOrcamentoConfig-request';
import { ComponenteOrcamentoConfigService } from 'src/app/services/componenteOrcamentoConfig.service';
import { TokenStorageService } from 'src/app/services/token-storage.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-componente-orcamento',
  templateUrl: './componente-orcamento.component.html',
  styleUrls: ['./componente-orcamento.component.scss']
})

export class ComponenteOrcamentoComponent implements OnInit {

  public faFilePdf = faFilePdf;
  public faFileExcel = faFileExcel;

  public errors: string[] = [];
  public orcamentoValorSubmitted: boolean = false;
  public currencyOptions = customCurrencyMaskConfig;

  public componenteConfig: ComponenteOrcamento = <ComponenteOrcamento>{};
  public registoOrcamento: ComponenteOrcamentoRegisto = <ComponenteOrcamentoRegisto>{};
  public componenteOrcamentoValor: ComponenteOrcamentoValor = <ComponenteOrcamentoValor>{};
  public selectedAgrupamento?: number;
  public selectedTipoDeConta?: number;

  public filteredOrcamentoValores: ComponenteOrcamentoValorFull[] = [];

  public centrosCusto: SelectDescription[] = [];
  public tiposDeConta: DominioDescricaoString[] = [];
  public agrupamentos: AgrupamentosConfig[] = [];
  public departamentos: SelectDescription[] = [];
  public filteredAgrupamentos: AgrupamentosConfig[] = [];
  public filteredAgrupamentosSearch: AgrupamentosConfig[] = [];

  public filtersDepartamento: number[] = [];
  public filtersCentrosDeCusto: number[] = [];
  public filtersTipoDeConta: number[] = [];

  public displayedColumns: string[] = ['tipo', 'departamento', 'centroCusto', 'contaOSS', 'valor', 'editar'];

  public datasRegistadas: boolean = false;
  public submitted: boolean = false;
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();


  @Input() tarefaActivoId: number = 0;
  @Input() isExpanded: boolean = false;

  constructor(private orcamentoRegistoService: componenteOrcamentoRegistoService,
    private orcamentoValorService: componenteOrcamentoValorService,
    public translate: TranslateService,
    private departamentoService: DepartamentoService,
    private spinner: NgxSpinnerService,
    public decimalPipe: DecimalPipe,
    public datePipe: DatePipe,
    public errorDialog: MatDialog,
    public editComponenteOrcamentoValorDialog: MatDialog,
    public snackBar: MatSnackBar,
    public componenteOrcamentoConfigService: ComponenteOrcamentoConfigService,
    private tokenStorageService: TokenStorageService,
    private router: Router,
  ) {
  }



  ngOnInit(): void {

    if (!this.tokenStorageService.getToken()) {
      this.router.navigate([''],);
    }
    else {
      this.getComponenteOrcamentoConfig();

      let requests: Observable<any>[] = [];
      requests.push(this.departamentoService.getAllDepartamentosAtivo());

      this.registoOrcamento.tarefaActivoFk = this.tarefaActivoId;
      let request = <GetComponenteOrcamentoRegistoRequest>{
        idTarefaActivo: this.tarefaActivoId
      };
      requests.push(this.orcamentoRegistoService.GetComponenteOrcamento(request));

      forkJoin(requests).subscribe(
        x => {
          this.departamentos = x[0].selects;
          let getRegistoResponse = x[1].componenteOrcamentoRegisto;
          if (getRegistoResponse != null) {
            this.filteredOrcamentoValores = x[1].valoresCorrentes;
            this.registoOrcamento = getRegistoResponse;
            this.datasRegistadas = true;
            this.centrosCusto = x[1].centrosCusto;
            this.tiposDeConta = x[1].tiposDeConta;
            this.agrupamentos = x[1].agrupamentos;
          }
          this.hideLoader();
        },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        }
      );
    }
  }


  public getComponenteOrcamentoConfig() {
    this.showLoader();
    let request = <GetComponenteOrcamentoConfigRequest>{
      tarefaAtivoId: this.tarefaActivoId,
    };

    this.componenteOrcamentoConfigService.getComponenteOrcamentoConfigByTarefaAtivoId(request).subscribe(x => {
      this.componenteConfig = x.componenteOrcamentoConfig;
      this.hideLoader();
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }


  public getComponenteOrcamentoRegistado() {
    this.showLoader();
    let request = <GetComponenteOrcamentoRegistoRequest>{
      idTarefaActivo: this.tarefaActivoId
    };
    this.orcamentoRegistoService.GetComponenteOrcamento(request).subscribe(x => {
      this.registoOrcamento = x.componenteOrcamentoRegisto;
      this.hideLoader();
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public updateTable() {
    this.showLoader();
    let filter: ComponenteOrcamentoValorSearch =
    {
      id: this.registoOrcamento.id,
      departamentos: this.filtersDepartamento,
      centrosDeCusto: this.filtersCentrosDeCusto,
      tiposDeConta: this.filtersTipoDeConta
    }

    let request: SearchComponenteOrcamentoValorRequest =
    {
      filter: filter
    }

    this.orcamentoValorService.SearchOrcamentoValor(request).subscribe(
      x => {
        this.filteredOrcamentoValores = x.valoresCorrentes;
        this.hideLoader();
      },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      }
    );
  }

  public changeDatas() {
    if (this.registoOrcamento.dataInicio && this.registoOrcamento.dataFim) {
      this.showLoader();
      let request = <UpdateComponenteOrcamentoRegistoDatesRequest>{
        idTarefaActivo: this.tarefaActivoId,
        dataInicio: this.registoOrcamento.dataInicio,
        dataFim: this.registoOrcamento.dataFim
      };

      this.orcamentoRegistoService.UpdateComponenteOrcamentoRegistoDates(request).subscribe(x => {
        if (x.updateValues) {
          this.tiposDeConta = x.tiposDeConta;
          this.agrupamentos = x.agrupamentos;
          this.getComponenteOrcamentoRegistado();
        }
        this.centrosCusto = x.centrosCusto;
        this.datasRegistadas = true;
        this.clearFilters();
        openSnackBar(this.translate.instant('snackBar.periodoGravadoComSucesso'), this.snackBar);
        this.hideLoader();
      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.hideLoader();
          if (this.errors[0].startsWith('-40ÿ')) {
            let splitted: string[] = this.errors[0].split('ÿ');
            splitted.shift();
            var msg = stringErrorFormat(this.translate.instant('error.' + -40), splitted);
            this.errors = [];
            let warn = this.showWarning(msg, false, true);
            warn?.afterClosed().subscribe(result => {
              if (result) {
                this.rectificarOrcamento();
                this.hideLoader();
              }
            });
            this.hideLoader();
          }
          else {
            this.showError();
            this.hideLoader();
          }
        }
      );
    }
  }

  public rectificarOrcamento() {
    this.showLoader();
    let request = <UpdateComponenteOrcamentoRegistoDatesRequest>{
      idTarefaActivo: this.tarefaActivoId,
      dataInicio: this.registoOrcamento.dataInicio,
      dataFim: this.registoOrcamento.dataFim
    };
    this.orcamentoRegistoService.RetificarOrcamentoAprovado(request)
      .subscribe(
        x => {
          this.registoOrcamento = x.componenteOrcamentoRegisto;
          this.centrosCusto = x.centrosCusto;
          this.agrupamentos = x.agrupamentos;
          this.tiposDeConta = x.tiposDeConta;
          this.filteredOrcamentoValores = x.valoresCorrentes;
          this.datasRegistadas = true;
          this.clearFilters();
          openSnackBar(this.translate.instant('snackBar.orcamentoRetificado'), this.snackBar);
          this.hideLoader();
        },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        }
      );
  }

  public selectMultiples(event: any, array: number[]) {
    if (event && event.source && event.source.value) {
      var index = array.indexOf(event.source.value.id)
      if (index >= 0)
        array.splice(index, 1);
      else
        array.push(event.source.value.id);
    }
  }

  public clearFilters() {
    this.filtersDepartamento = [];
    this.filtersTipoDeConta = [];
    this.filtersCentrosDeCusto = [];
    this.filteredAgrupamentos = [];
    this.filteredAgrupamentosSearch = [];
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

  public updateFilteredAgrupamentos() {
    if (this.componenteOrcamentoValor.tipoContaFk) {
      this.filteredAgrupamentos = this.agrupamentos.filter(a => a.tipoDeConta == this.componenteOrcamentoValor.tipoContaFk);
      this.filteredAgrupamentosSearch = this.filteredAgrupamentos;
      this.selectedAgrupamento = undefined;
    }
  }

  public submitOrcamentoValorForm() {
    this.orcamentoValorSubmitted = true;
  }

  public addOrcamentoValor() {
    if (this.componenteOrcamentoValor.valor > 0) {
      //if (this.selectedAgrupamento) {
        this.showLoader();
        this.componenteOrcamentoValor.agrupamentoFk = this.selectedAgrupamento!;

        this.componenteOrcamentoValor.componenteOrcamentoRegistoFk = this.registoOrcamento.id;
        let request = <AddComponenteOrcamentoValorRequest>{
          componenteOrcamentoValor: this.componenteOrcamentoValor
        };
        this.orcamentoValorService.AddOrcamentoValor(request)
          .subscribe(
            x => {
              this.componenteOrcamentoValor.componenteOrcamentoRegistoFk = 0;
              this.componenteOrcamentoValor.agrupamentoFk = 0;
              this.componenteOrcamentoValor.id = 0;
              this.componenteOrcamentoValor.valor = 0;
              this.selectedAgrupamento = undefined;
              this.orcamentoValorSubmitted = false;
              openSnackBar(this.translate.instant('snackBar.orcamentoValorAdiconado'), this.snackBar);
              this.updateTable();
            },
            err => {
              this.hideLoader();
              err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
              if (this.errors[0].startsWith('-45ÿ')) {
                let splitted: string[] = this.errors[0].split('ÿ');
                splitted.shift();
                var msg = stringErrorFormat(this.translate.instant('error.' + -45), splitted);
                this.errors = [];
                let warn = this.showWarning(msg, false, true);
                warn?.afterClosed().subscribe(result => {
                  if (result) {
                    this.editarOrcamentoValor();
                  }
                });
                this.hideLoader();
              }
              else
                this.showError();
            }
          );
      //}
    }
    else {
      this.hideLoader();
      this.errors.push('valueNotZero');
      this.showError();
    }
  }

  public editarOrcamentoValor() {
    this.showLoader();
    let request = {
      componenteOrcamentoValor: this.componenteOrcamentoValor
    }

    this.orcamentoValorService.editarOrcamentoValor(request).subscribe(x => {
      this.componenteOrcamentoValor = <ComponenteOrcamentoValor>{};
      this.selectedAgrupamento = undefined;
      this.selectedTipoDeConta = undefined;
      this.orcamentoValorSubmitted = false;
      openSnackBar(this.translate.instant('snackBar.campoGravadoSucesso'), this.snackBar);
      this.updateTable();
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public clearDepartamentoSelection(event: any) {
    this.filtersDepartamento = [];
    event.stopPropagation();
  }

  public clearCentroDeCustoSelection(event: any) {
    this.filtersCentrosDeCusto = [];
    event.stopPropagation();
  }

  public clearTipoDeContaSelection(event: any) {
    this.filtersTipoDeConta = [];
    event.stopPropagation();
  }

  public editPopUpComponenteOrcamentoValor(element: ComponenteOrcamentoValorFull) {
    const dialogRef = this.editComponenteOrcamentoValorDialog.open(PopUpEditarComponenteOrcamentoValorComponent, {
      id: 'editComponenteORcamentoValor',
      minHeight: '300px',
      width: '40%',
      height: '40%',
      panelClass: 'modalWithBorder',
      data: {
        componenteOrcamentoValor: element
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        openSnackBar(this.translate.instant('snackBar.campoGravadoSucesso'), this.snackBar);
        this.updateTable();
      }
    });
  }

  public AprovarOrcamento() {
    this.showLoader();
    let request = <GetComponenteOrcamentoRegistoRequest>{
      idTarefaActivo: this.tarefaActivoId
    };
    this.orcamentoRegistoService.AprovarOrcamento(request)
      .subscribe(x => {
        openSnackBar(this.translate.instant('snackBar.orcamentoAprovadoSucesso'), this.snackBar);
        this.registoOrcamento.aprovado = true;
        this.hideLoader();
      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
  }

  public formatDecimal(number: number) {
    return formatDecimal(this.decimalPipe, number);
  }

  public filterCustomOptions(event: any) {
    this.filteredAgrupamentosSearch = this.filteredAgrupamentos.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public showWarning(msg: string, noConfirm: boolean, hideQuestion: boolean) {
    try {
      return this.errorDialog.open(PopUpWarningComponent,
        {
          id: 'warningDialog',
          minHeight: '300px',
          width: '40%',
          height: '30%',
          panelClass: 'warningModal',
          data: { msg: msg, noConfirmation: noConfirm, hideQuestion: hideQuestion }
        });
    }
    catch
    {
      return null;
    }
  }

  public extractToExcel() {
    this.showLoader();
    let request = <OrcamentoExtractRequest>{
      idComponenteOrcamentoRegisto: this.registoOrcamento.id,
      filtrosDepartamento: this.filtersDepartamento,
      filtrosCentroDeCusto: this.filtersCentrosDeCusto,
      filtrosTipoDeConta: this.filtersTipoDeConta
    };

    this.orcamentoRegistoService.ExtractToExcel(request).subscribe((response: any) => {
      this.hideLoader();
      blobExcelSaveAs(response.excelExtraido, 'extraction_' + this.datePipe.transform(this.registoOrcamento.dataInicio, 'dd-MM-yyyy') + '_' + this.datePipe.transform(this.registoOrcamento.dataFim, 'dd-MM-yyyy'));
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public extractToPDF() {
    this.showLoader();
    let request = <OrcamentoExtractRequest>{
      idComponenteOrcamentoRegisto: this.registoOrcamento.id,
      filtrosDepartamento: this.filtersDepartamento,
      filtrosCentroDeCusto: this.filtersCentrosDeCusto,
      filtrosTipoDeConta: this.filtersTipoDeConta
    };

    this.orcamentoRegistoService.ExtractToPDF(request).subscribe((response: any) => {
      this.hideLoader();
      blobToSaveAs(response.pdfExtraido, 'extraction_' + this.datePipe.transform(this.registoOrcamento.dataInicio, 'dd-MM-yyyy') + '_' + this.datePipe.transform(this.registoOrcamento.dataFim, 'dd-MM-yyyy'));
    },
      err => {
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public deleteComponenteOrcamentoValor(element: ComponenteOrcamentoValorFull) {
    var msg = this.translate.instant('warnings.eliminarOrcamentoValor');
    let warn = this.showWarning(msg, false, false);
    warn?.afterClosed().subscribe(result => {
      if (result) {
        this.showLoader();
        let request = {
          id: element.id
        }

        this.orcamentoValorService.eliminarOrcamentoValor(request).subscribe(x => {
          openSnackBar(this.translate.instant('snackBar.orcamentoValorEliminado'), this.snackBar);
          this.updateTable();
        },
          err => {
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
          });
      }
    });
  }

  public scroll(e: any) {
    e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
