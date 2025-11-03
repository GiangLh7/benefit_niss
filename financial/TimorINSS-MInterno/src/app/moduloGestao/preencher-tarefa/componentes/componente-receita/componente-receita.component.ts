import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { base64ToArrayBuffer, customCurrencyMaskConfig, openErrorsDialog, openSnackBar, showExpiredError } from "src/app/utils";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ContaBancaria } from "src/app/models/contaBancaria";
import { MyErrorStateMatcher } from "src/app/matcher";
import { SelectDescription } from "src/app/models/utils";
import { DominioDescricaoString } from "src/app/response-models/dominios-response";
import { CodigoConta } from "src/app/models/codigoConta";
import { AgrupamentosConfig } from "src/app/models/agrupamentosConfig";
import { AgrupamentoConfigService } from "src/app/services/agrupamentoConfig.service";
import { GetAgrupamentoConfigRequest } from "src/app/request-models/agrupamentoConfig-request";
import { ComponenteReceitaConfigService } from "src/app/services/componenteReceitaConfig.service";
import { GetComponenteReceitaConfigRequest } from "src/app/request-models/componenteReceitaConfig-request";
import { ComponenteReceitaConfig } from "src/app/models/componenteReceitaConfig";
import { GetComponenteOrcamentoRegistoAprovadoRequest } from "src/app/request-models/componenteOrcamentoRegisto-request";
import { componenteOrcamentoRegistoService } from "src/app/services/componenteOrcamentoRegisto.service";
import { forkJoin } from "rxjs";
import { DepartamentoService } from "src/app/services/departamento.service";
import { PopUpSelecionarValoresParaRegistoComponent } from './pop-up-selecionar_valores/pop-up-selecionar_valores.component';
import { movimentosBancariosService } from "src/app/services/movimentosBancarios.service";
import { MovimentosConciliados, MovimentosPorConciliar } from "src/app/models/movimentosBancarios";
import { FilterRequest } from "src/app/request-models/utils-request";
import { ComponenteReceitaRegisto, ValoresReceita } from "src/app/models/componenteReceitaRegisto";
import { ComponenteReceitaRegistoService } from "src/app/services/componenteReceitaRegisto.service";
import { GetComponenteReceitaRegistoByIdContaOSSRequest, RegistoReceitaRequest } from "src/app/request-models/componenteReceitaRegisto-request";
import { GetValoresDespesaByIdCodigoOrcamentoRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { ComponenteDespesaComponent } from "../componente-despesa/componente-despesa.component";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { ComponenteReceita, MovimentoReceita } from "src/app/response-models/componenteReceitaRegisto-response";
import { PopUpWarningComponent } from "src/app/componentes/pop-up-warning/pop-up-warning.component";



@Component({
    selector: 'app-componente-receita',
    templateUrl: './componente-receita.component.html',
    styleUrls: ['./componente-receita.component.css']
})
export class ComponenteReceitaComponent implements OnInit {
    public errors: string[] = [];
    public currencyOptions = customCurrencyMaskConfig;
    public faFilePdf = faFilePdf;

    //existe orcamento aprovado?
    public naoExisteOrcamentoAprovado: boolean = false;
    //processo id
    public processoId: number = 0;
    //id Componente Orçamento Registo Aprovado
    public idOrcamentoRegisto: number = 0;

    //mather
    public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

    public submittedTry: boolean = false;


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


    //Contabilidade
    public contabilidade = <CodigoConta>{};
    public contabilidadeDebito = <CodigoConta>{};
    public contabilidadeListagem: CodigoConta[] = [];
    public filtersContabilidade: number[] = [];
    public filtersContabilidadeFilteredCredito: CodigoConta[] = [];
    public filtersContabilidadeFilteredDebito: CodigoConta[] = [];

    // Conta OSS
    public filtersContaOSS: number[] = [];
    public filtersContaOSSFiltered: AgrupamentosConfig[] = [];
    public contaOSS = <AgrupamentosConfig>{};
    public contaOSSListagem: AgrupamentosConfig[] = [];
    public idContaOssEdit: number = 0;

    //Descricao Receita
    public descricaoReceita: string = '';

    //Valor da Receita
    public valorReceita: number | undefined;


    public componenteReceitaConfig: ComponenteReceitaConfig = <ComponenteReceitaConfig>{};

    public movimentosSelecionados: MovimentoReceita[] = [];

    //ValoresReceitaListagem
    public valoresReceitaListagem: ValoresReceita[] = [];
    public displayedColumns: string[] = ['descricao', 'valorOrcamentado', 'valorExecutado'];
    public totalMovimentoSelecionado: number = 0;

    public isRegistado: boolean = false;
    public editar: boolean = false;
    public idReceita: number = 0;
    public dataSourceMovimentosRegistados: ComponenteReceita[] = [];
    public totalMovimentosRegistados: number = 0;
    public displayedColumnsMovimentos: string[] = ['descricao', 'documentoAssociado', 'comprovativo', 'valor', 'acoes'];
    public totalRows: number = 0;
    public pageSize = 20;
    public pageIndex = 0;
    public receitasMovimentos: MovimentoReceita[] = [];


    @Input() tarefaActivoId: number = 0;
    @Input() isExpanded: boolean = false;


    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        public errorDialog: MatDialog,
        public translate: TranslateService,
        private tokenStorage: TokenStorageService,
        public _snackBar: MatSnackBar,
        public agrupamentoService: AgrupamentoConfigService,
        public componenteReceitaConfigService: ComponenteReceitaConfigService,
        private orcamentoService: componenteOrcamentoRegistoService,
        private departamentoService: DepartamentoService,
        public selecionarMovimentosDialog: MatDialog,
        private componenteReceitaService: ComponenteReceitaRegistoService,
        private componenteDespesaService: ComponenteDespesaRegistoService,
        public warningDialog: MatDialog,
    ) {
    }

    ngOnInit(): void {

        if (!this.tokenStorage.getToken()) {
            this.router.navigate([''])
        }
        else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

            //obter configuração receita
            this.getComponenteReceitaConfig();

            // validar se existe orçamento aprovado para a data de inicio do processo

            this.getOrcamentoAprovado(this.tarefaActivoId);

            this.updateFilteredAgrupamentos(false);

            //verificar execução orçamento
            this.valoresReceitaListagem[0] = <ValoresReceita>{};
            this.valoresReceitaListagem[0].descricao = "Valor Inicial/Atual";
            this.valoresReceitaListagem[1] = <ValoresReceita>{};
            this.valoresReceitaListagem[1].descricao = "Valor a Registar";
            this.valoresReceitaListagem[2] = <ValoresReceita>{};
            this.valoresReceitaListagem[2].descricao = "Valor Após Envio para Conciliação";

        }
        else {
            showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
        }

    }

    public getComponenteReceitaConfig() {
        this.showLoader();
        let request = <GetComponenteReceitaConfigRequest>{
            tarefaAtivoId: this.tarefaActivoId,
        };

        let componenteReceitaConfig = this.componenteReceitaConfigService.getComponenteReceitaConfigByTarefaAtivoId(request);
        let departamentoInss = this.departamentoService.getAllDepartamentosAtivo();

        forkJoin([departamentoInss, componenteReceitaConfig]).subscribe(([departamentoInss, componenteReceitaConfig]) => {
            this.departamentoINSSListagem = departamentoInss.selects;
            this.componenteReceitaConfig = componenteReceitaConfig.componenteReceitaConfig;
            this.hideLoader();

        },
            err => {
                this.hideLoader();
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
            });
    }

    public getOrcamentoAprovado(idTarefaActivo: number) {
        this.showLoader();
        let request = <GetComponenteOrcamentoRegistoAprovadoRequest>{
            idTarefaActivo: idTarefaActivo,
        };
        this.orcamentoService.GetOrcamentoAprovadoReceitaByIdTarefaActivo(request).subscribe(x => {
            if (x != null && x.existeOrcamentoAprovado) {
                this.idOrcamentoRegisto = x.idOrcamentoRegisto;
                this.centroCustoListagem = x.centrosCusto;
                this.tipoContaListagem = x.tiposDeConta;
                this.tipoContaFiltered = this.tipoContaListagem.filter(tipoConta => tipoConta.descricao == 'Receita' || tipoConta.descricao == 'Neutro Receita'
                    ||  tipoConta.descricao == 'Revenue' 
                );
                this.tipoConta.id = this.tipoContaFiltered[0].id;
                this.contabilidadeListagem = x.codigoConta;
                this.filtersContabilidadeFilteredCredito = x.codigoConta;
                this.filtersContabilidadeFilteredDebito = x.codigoConta;
                this.processoId = x.processoId;
            }
            else if (!x.existeOrcamentoAprovado) {

                this.naoExisteOrcamentoAprovado = true;
            }
            this.hideLoader();

        },
            err => {

                this.hideLoader();
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
            });

    }


    public updateFilteredAgrupamentos(editar: boolean) {
        this.contaOSSListagem = [];
        this.filtersContaOSSFiltered = [];

          this.showLoader();
          let request = <GetAgrupamentoConfigRequest>{
            idOrcamento: this.idOrcamentoRegisto
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

    public filterCustomOptionsContabilidadeCredito(event: any) {
        this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
    }

    public filterCustomOptionsContabilidadeDebito(event: any) {
        this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
    }

    public filterCustomOptionsContaOSS(event: any) {
        this.filtersContaOSSFiltered = this.contaOSSListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
    }

    public registarEditarReceita() {

        if (this.movimentosSelecionados != null && this.movimentosSelecionados.length > 0) {

            this.showLoader();

            let receita: ComponenteReceitaRegisto = {
                id: this.editar ? this.idReceita : 0,
                idOrcamentoRegistoAprovado: this.idOrcamentoRegisto,
                tarefaAtivoFK: this.tarefaActivoId,
                departamentoFk: this.departamentoINSS.id,
                centroCustoFk: this.centroCusto.id,
                tipoContaFk: this.tipoConta.id,
                codigoContaFk: this.contabilidade.id,
                codigoContaDebitoFk: this.contabilidadeDebito.id,
                agrupamentoConfigFk: this.contaOSS.id,
                descricao: this.descricaoReceita,
                valor: this.valorReceita,
                listaMovimentosConciliados: this.movimentosSelecionados
            };

            let request: RegistoReceitaRequest = {
                componenteReceitaRegisto: receita
            };

            this.componenteReceitaService.addEditComponenteReceitaRegisto(request).subscribe(x => {
                this.hideLoader();
                this.getValoresOrcamento();
                this.getReceitaRegistadaByContaOSSId(this.contaOSS.id);
                //this.contabilidade = <CodigoConta>{};
                //this.contaOSS = <AgrupamentosConfig>{};
                this.descricaoReceita = '';
                this.valorReceita = undefined;
                this.submittedTry = false;
                this.movimentosSelecionados = [];
                this.totalMovimentosRegistados = 0;
                this.isRegistado = true;
                openSnackBar(this.translate.instant('snackBar.registoReceita'), this._snackBar);

            },
                err => {
                    this.hideLoader();
                    err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                    this.showError();
                });

        }
    }

    public getValoresOrcamento() {
        this.showLoader();

        let request = <GetValoresDespesaByIdCodigoOrcamentoRequest>{
            agrupamentoFk: this.contaOSS.id,
            orcamentoRegistoFk: this.idOrcamentoRegisto
        };

        this.componenteDespesaService.GetValoresDespesaByIdCodigoOrcamento(request).subscribe(x => {
            if (x != null && x.valoresDespesa != null) {
                this.valoresReceitaListagem[0].valorOrcamentado = x.valoresDespesa.valorOrcamentado;

            }
            this.hideLoader();
        },
            err => {

                this.hideLoader();
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
            });
    }

    public getReceitaRegistadaByContaOSSId(idContaOSS: number) {
        this.showLoader();


        let filterRequest: FilterRequest;
        filterRequest = {};
        filterRequest.index = this.pageIndex;
        filterRequest.rows = this.pageSize;

        let request = <GetComponenteReceitaRegistoByIdContaOSSRequest>{
            contaOSSId: this.contaOSS.id,
            filter: filterRequest
        };

        this.componenteReceitaService.GetComponenteReceitaRegistoByContaOSSId(request).subscribe(x => {
            x.rows == null ? this.totalRows = 0 : this.totalRows = x.rows;
            x.componenteReceita == null ? this.dataSourceMovimentosRegistados = [] : this.dataSourceMovimentosRegistados = x.componenteReceita;

            this.receitasMovimentos = (this.dataSourceMovimentosRegistados.map(e => e.movimentos.map(a => ({...a, receita: e}))) as any).flat();

            if (this.dataSourceMovimentosRegistados != null && this.dataSourceMovimentosRegistados.length > 0) {

                this.dataSourceMovimentosRegistados.forEach(row => {
                    this.totalMovimentosRegistados = Math.round((this.totalMovimentosRegistados + row.movimentos.map(e => e.valor).reduce((a, b) => a + b, 0)) * 100) / 100;
                });
                this.valoresReceitaListagem[0].valorExecutado = this.totalMovimentosRegistados > 0 ? Math.round((this.totalMovimentosRegistados - this.totalMovimentoSelecionado) * 100) / 100 : this.totalMovimentoSelecionado;
                this.valoresReceitaListagem[1].valorExecutado = this.totalMovimentoSelecionado;

                this.valoresReceitaListagem[2].valorExecutado = this.totalMovimentoSelecionado = Math.round((this.valoresReceitaListagem[0].valorExecutado + this.valoresReceitaListagem[1].valorExecutado) * 100) / 100;



            }
            this.hideLoader();

            document.getElementById("movimentosRegistados")?.scrollIntoView({ behavior: "smooth" });

        },
            err => {

                this.hideLoader();
                err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
                this.showError();
            });

    }

    public selecionarMovimentos() {
        const dialogRef = this.selecionarMovimentosDialog.open(PopUpSelecionarValoresParaRegistoComponent, {
            id: 'selecionarMovimentos',
            minHeight: '500px',
            width: '80%',
            height: '70%',
            panelClass: 'modalWithBorder',
            data: {
                componenteReceitaConfig: this.componenteReceitaConfig,
                listaMovimentosSelecionados: this.movimentosSelecionados,
                editar: this.editar
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.movimentosSelecionados = result;
                this.totalMovimentoSelecionado = 0;
                this.movimentosSelecionados.forEach(row => {
                    this.totalMovimentoSelecionado = this.totalMovimentoSelecionado + row.valor;
                });
                this.totalMovimentoSelecionado = Math.round(this.totalMovimentoSelecionado * 100) / 100;
                this.valorReceita = this.totalMovimentoSelecionado;
            }
        });
    }


    public submitReceita() {
        this.submittedTry = true;

        if (this.movimentosSelecionados == null || this.movimentosSelecionados.length <= 0) {
            this.errors.push(this.translate.instant('componente_receita.oBrigatorioSelecionarMovimento'));
            this.showError();
        }
    }

    public editarMovimento(element: MovimentoReceita) {
        this.editar = true;
        this.idReceita = element.receita.id;
        this.departamentoINSS.id = element.receita.departamentoFk;
        this.centroCusto.id = element.receita.centroCustoFk;
        this.tipoConta.id = element.receita.tipoContaFk;
        this.contabilidade.id = element.receita.codigoContaFk;
        this.contaOSS.id = element.receita.agrupamentoConfigFk;
        this.descricaoReceita = element.receita.descricao,
            this.valorReceita = element.valor;
        element.checked = true;
        this.movimentosSelecionados = [];
        this.movimentosSelecionados.push(element);
        document.getElementById("firstPanel")?.scrollIntoView({ behavior: "smooth" });
    }

    public deleteMovimento(element: MovimentoReceita) {

        const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
            id: 'deleteMovimentoReceitaRegistado',
            minHeight: '300px',
            width: '40%',
            height: '30%',
            panelClass: 'warningModal',
            data: { function: this.componenteReceitaService.deleteReceita({ id: element.receita.id, movimentoId: element.id }), msg: this.translate.instant('warnings.deleteMovimentoWarningMsg') }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.totalMovimentoSelecionado = 0;
                this.totalMovimentosRegistados = 0;
                this.movimentosSelecionados = [];
                this.getValoresOrcamento;
                this.getReceitaRegistadaByContaOSSId(this.contaOSS.id);
                openSnackBar(this.translate.instant('snackBar.removeMovimento'), this._snackBar);
            }
        });
    }

    public updateTable(event: any) {
        this.pageIndex = event.pageIndex;
        this.pageSize = event.pageSize;
        this.showLoader();
        this.getReceitaRegistadaByContaOSSId(this.contaOSS.id);
    }

    public openPdf(element: MovimentosConciliados) {
        // Open PDF document in browser's new tab
        const arrayBuffer = base64ToArrayBuffer(element.comprovativo);
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        window.open(URL.createObjectURL(blob));
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

    public scroll(e: any) {
        e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    public updateContabilidadeDebito(contabilidadeId: number){
            this.filtersContabilidadeFilteredDebito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
    }

    public updateContabilidadeCredito(contabilidadeId: number){
            this.filtersContabilidadeFilteredCredito = this.contabilidadeListagem.filter(p => p.id != contabilidadeId);
    }
}
