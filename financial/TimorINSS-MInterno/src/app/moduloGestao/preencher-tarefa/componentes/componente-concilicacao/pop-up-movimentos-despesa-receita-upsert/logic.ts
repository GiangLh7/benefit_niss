import { Component, Inject, OnInit } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NgxSpinnerService } from "ngx-spinner";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from "@ngx-translate/core";
import { base64ArrayBuffer, openErrorsDialog, base64ToArrayBuffer, customPositiveCurrencyMaskConfig, customNegativeCurrencyMaskConfig, focusCurrency } from "src/app/utils";
import { MovimentosDespesaReceitaUpsertRequest } from "src/app/request-models/movimentosBancarios-request";
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { FormControl, Validators } from "@angular/forms";
import { MaxSizeValidator } from 'src/app/utils/file-validators';
import { MyErrorStateMatcher, MyNumberDifferentStateMatcher } from "src/app/matcher";
import { MovimentoBancarioDropListResponseDominions } from "src/app/response-models/movimentosBancarios-response";
import { CodigoConta } from "src/app/models/codigoConta";
import { GetComponenteOrcamentoRegistoAprovadoRequest, GetGuiaMovimentoRequest } from "src/app/request-models/componenteOrcamentoRegisto-request";
import { componenteOrcamentoRegistoService } from "src/app/services/componenteOrcamentoRegisto.service";
import { SelectDescription } from "src/app/models/utils";
import { DominioDescricaoString } from "src/app/response-models/dominios-response";
import { AgrupamentosConfig } from "src/app/models/agrupamentosConfig";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { DepartamentoService } from "src/app/services/departamento.service";
import { GetAllDespesaRegistadaRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { forkJoin } from "rxjs";
import { GetAgrupamentoConfigRequest } from "src/app/request-models/agrupamentoConfig-request";
import { AgrupamentoConfigService } from "src/app/services/agrupamentoConfig.service";



@Component({
  selector: 'app-pop-up-movimentos-despesa-receita-upsert',
  templateUrl: './index.html',
  styleUrls: ['./styles.css'],
  standalone: false
})
export class PopUpMovimentosDespesaReceitaUpsertComponent implements OnInit{

  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public diffNumberMatcher: MyNumberDifferentStateMatcher = new MyNumberDifferentStateMatcher(0);
  public submittedTry: boolean = false;
  public hasSubmitted: boolean = false;
  public submitMore: boolean = false;
  public currencyOptions: any;
  public movimentosOptions: MovimentoBancarioDropListResponseDominions[] = [];

  // File
  public fileControlDocumento: FormControl;
  public wrongFormat: boolean = false;
  private maxSize: number = 52428800;
  public nomeDocumento: string = "";
  public accept = ".pdf";
  public documentPlaceholder: string = "general.document";
  public previewPdf: any = null;

  //Contabilidade
  public contabilidadeCredito = <CodigoConta>{};
  public contabilidadeDebito = <CodigoConta>{};
  public contabilidadeListagem: CodigoConta[] = [];
  public filtersContabilidade: number[] = [];
  public filtersContabilidadeFilteredCredito: CodigoConta[] = [];
  public filtersContabilidadeFilteredDebito: CodigoConta[] = [];

  // Departamento INSS
  public departamentoINSS = <SelectDescription>{};
  public departamentoINSSListagem: SelectDescription[] = [];

  // Centro de Custo
  public centroCusto = <SelectDescription>{};
  public centroCustoListagem: SelectDescription[] = [];

  // Tipo de Conta
  public tipoConta = <DominioDescricaoString>{};
  public tipoContaListagem: DominioDescricaoString[] = [];
  public tipoContaFiltered: DominioDescricaoString[] = [];

  // Conta OSS
  public filtersContaOSS: number[] = [];
  public filtersContaOSSFiltered: AgrupamentosConfig[] = [];
  public contaOSS = <AgrupamentosConfig>{};
  public contaOSSListagem: AgrupamentosConfig[] = [];
  public idContaOssEdit: number = 0;

  constructor(
    public movimentosBancariosService: movimentosBancariosService,
    public spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    // private tokenStorage: TokenStorageService,
    public translate: TranslateService,
    public dialogRef: MatDialogRef<PopUpMovimentosDespesaReceitaUpsertComponent>,
    private orcamentoService: componenteOrcamentoRegistoService,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    private departamentoService: DepartamentoService,
    public agrupamentoService: AgrupamentoConfigService,

    @Inject(MAT_DIALOG_DATA) public data: MovimentosDespesaReceitaUpsertRequest
  ) {

    this.data = {...{
      tipoDocumento: "",
      numeroDocumento: "",
      nomeComprovativo: "",
      valor: 0,
      contabilidadeCredito: <number>{},
      contabilidadeDebito: <number>{},
    }, ...(this.data || {})};

    this.fetchDropdownList();

    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().subscribe(() => {
      this.dialogRef.close(this.hasSubmitted);
    });
    this.dialogRef.keydownEvents().subscribe(event => {
      if (event.key === "Escape") {
        this.dialogRef.close(this.hasSubmitted);
      }
    });

    this.currencyOptions = this.data.isReceita ? customPositiveCurrencyMaskConfig : customNegativeCurrencyMaskConfig;

    this.fileControlDocumento = new FormControl({}, []);

    if (this.data.id && this.data.comprovativo) {
      this.fileControlDocumento.setValue({ name: this.data.nomeComprovativo }, { emitEvent: false });
      this.previewPdf = base64ToArrayBuffer(this.data.comprovativo!);
    }

    this.fileControlDocumento.valueChanges.subscribe((file: any) => {
      if (this.maxSize >= file?.size && file.type == 'application/pdf') {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        this.data.nomeComprovativo = file.name;
        reader.onloadend = (evt) => {
          this.addDocumentoRequired();
          if (evt.target)
            if (evt.target.readyState == FileReader.DONE) {
              var arrayBuffer = evt.target.result;

              if (arrayBuffer instanceof ArrayBuffer) {
                this.data.comprovativo = base64ArrayBuffer(arrayBuffer);
                this.previewPdf = arrayBuffer;
              }

            }
        }
        this.wrongFormat = false;
      }
      else if(file){
        this.wrongFormat = true;
        this.fileControlDocumento.setValue(undefined);
      }
    });

  }

  public ngOnInit(): void {

    this.showLoader();

    //obter configuração codigos
    this.getOrcamentoAprovado(this.data.tarefaAtivoId);
    this.updateFilteredAgrupamentos(false);

    if (this.data.guiaOrReserva){
      this.getClassificacaoContabilistica(this.data);
    }
  }

  public addDocumentoRequired() {
    this.fileControlDocumento.get('Documento')?.setValidators([Validators.required, MaxSizeValidator.maxContentSize(this.maxSize)]);
  }

  public closePopUp(): void {
    this.dialogRef.close(this.hasSubmitted);
  }

  public saveMovimento() {
    this.showLoader();
    let request : MovimentosDespesaReceitaUpsertRequest = {...this.data};

    if (!this.data.isReceita) {
      request.valor = -request.valor;
    }

    const apiCall = this.data.id ? this.movimentosBancariosService.updateMovimentoDespesaReceita(request) : this.movimentosBancariosService.saveMovimentoDespesaReceita(request);

    apiCall.subscribe(x => {
      if (this.submitMore) {
        this.submittedTry = false;
        this.diffNumberMatcher = new MyNumberDifferentStateMatcher(0);
        this.data = { ...this.data, ...{
          tipoDocumento: "",
          numeroDocumento: "",
          nomeComprovativo: "",
          comprovativo: undefined,
          valor: 0,
          movimentoBancarioId: undefined,
          contabilidadeCredito: <number>{},
          contabilidadeDebito: <number>{},
          departamentoINSS: <number>{},
          centroCusto: <number>{},
          tipoConta: <number>{},
          contaOSS: <number>{},
        }};
        this.hasSubmitted = true;
      }
      else this.dialogRef.close(true);
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });

  }


  public submitMovimento(submitMore: boolean)
  {
    this.submittedTry = true;
    this.submitMore = submitMore;
    this.diffNumberMatcher = new MyNumberDifferentStateMatcher(0, true);
  }

  public showLoader() {
    this.spinner.show();
  }

  private fetchDropdownList() {

    this.showLoader();

    this.movimentosBancariosService.GetMovimentoBancarioDropList(this.data.tipoMovimento).subscribe(resp => {
      this.movimentosOptions = resp.dominios;
      this.hideLoader();
    },
    err => {
      this.hideLoader();
      err.error?.errors ? err.error.errors.map((x : any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
      this.showError();
    });
  }


  public hideLoader() {
    this.spinner.hide();
  }

  public clearValor() {
    this.data.valor = <number>{};
  }

  public focusCurrency(event: any)
  {
    focusCurrency(event);
  }


  public showError()
  {
    const dialogRef = openErrorsDialog(this.errors, this.errorDialog);
    this.hideLoader();

    dialogRef.afterClosed().subscribe((result: any) => {
      this.errors = [];
    });
  }

  public getOrcamentoAprovado(idTarefaActivo: number) {
    let request = <GetComponenteOrcamentoRegistoAprovadoRequest>{
        idTarefaActivo: idTarefaActivo,
    };
    this.orcamentoService.GetOrcamentoAprovadoReceitaByIdTarefaActivo(request).subscribe(x => {
        if (x != null) {
          this.centroCustoListagem = x.centrosCusto;
          this.tipoContaListagem = x.tiposDeConta;
          this.tipoContaFiltered = this.tipoContaListagem.filter(tipoConta => tipoConta.descricao == 'Despesa' || tipoConta.descricao == 'Neutro Despesa'
            || tipoConta.descricao == 'Expense' 
          );
          this.tipoConta.id = this.tipoContaFiltered[0].id;
            this.contabilidadeListagem = x.codigoConta;
            this.filtersContabilidadeFilteredCredito = x.codigoConta;
            this.filtersContabilidadeFilteredDebito = x.codigoConta;
            this.getAllDadosDropDown();
        }
        this.hideLoader();

    },
        err => {

            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
        });

  }

  public filterCustomOptionsContabilidadeCredito(event: any) {
    this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public filterCustomOptionsContabilidadeDebito(event: any) {
      this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public updateContabilidadeDebito(contabilidadeId: number){
    this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
  }

  public updateContabilidadeCredito(contabilidadeId: number){
      this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
  }

  public getAllDadosDropDown() {
    this.showLoader();

    let departamentoInss = this.departamentoService.getAllDepartamentosAtivo();


    forkJoin([departamentoInss]).subscribe(([departamentoInss]) => {
      this.departamentoINSSListagem = departamentoInss.selects;
      this.hideLoader();

    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public filterCustomOptionsContaOSS(event: any) {
    this.filtersContaOSSFiltered = this.contaOSSListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public updateFilteredAgrupamentos(editar: boolean) {
    this.contaOSSListagem = [];
    this.filtersContaOSSFiltered = [];

      let request = <GetAgrupamentoConfigRequest>{
        idOrcamento: 1
      };

      this.agrupamentoService.getAgrupamentoConfigByIdCodigoContaTipoConta(request).subscribe(x => {
        if (x != null && x.agrupamentos != null) {
          this.contaOSSListagem = x.agrupamentos;
          this.filtersContaOSSFiltered = x.agrupamentos;
          this.contaOSS = <AgrupamentosConfig>{};
        }

        if (editar) {
          this.contaOSS = this.filtersContaOSSFiltered.filter((c: { id: number; }) => c.id === this.idContaOssEdit)[0];
        }
        this.hideLoader();
      },
        err => {

          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
  }

  public getClassificacaoContabilistica(movimento: MovimentosDespesaReceitaUpsertRequest) {
    let request = <GetGuiaMovimentoRequest>{
      id: movimento.id,
      type: movimento.type,
    };
    this.movimentosBancariosService.getMovimentoGuia(request).subscribe(x => {
        if (x.movimento != null) {
          this.data.contabilidadeCredito = x.movimento.codigoContaCreditoFk;
          this.data.contabilidadeDebito = x.movimento.codigoContaDebitoFk;
        }
        this.hideLoader();

    },
        err => {

            this.hideLoader();
            err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
            this.showError();
        });

  }
}
