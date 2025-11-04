import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { DominioDescricaoString } from 'src/app/response-models/dominios-response';
import { blobExcelSaveAs, customCurrencyMaskConfig, openErrorsDialog, openSnackBar, showExpiredError } from "src/app/utils";
import { TokenStorageService } from "src/app/services/token-storage.service";
import { SelectDescription } from "src/app/models/utils";
import { faFileExcel, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { componenteOrcamentoRegistoService } from "src/app/services/componenteOrcamentoRegisto.service";
import { GetComponenteOrcamentoRegistoAprovadoRequest } from "src/app/request-models/componenteOrcamentoRegisto-request";
import { DepartamentoService } from "src/app/services/departamento.service";
import { forkJoin } from "rxjs";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AgrupamentosConfig } from "src/app/models/agrupamentosConfig";
import { CodigoConta } from "src/app/models/codigoConta";
import { AgrupamentoConfigService } from "src/app/services/agrupamentoConfig.service";
import { GetAgrupamentoConfigRequest } from "src/app/request-models/agrupamentoConfig-request";
import { MyErrorStateMatcher } from "src/app/matcher";
import { GetAllDespesaRegistadaRequest, GetDespesasCompromissoRequest, GetValoresDespesaByIdCodigoOrcamentoRequest, RegistoDespesaRequest } from "src/app/request-models/componenteDespesaRegisto-request";
import { Despesa, ValoresDespesaRegistada } from "src/app/models/despesa";
import { ComponenteDespesaRegistoService } from "src/app/services/componenteDespesaRegisto.service";
import { DespesaCompromisso, DespesaCabimentadasParaExecucao, DespesaRegistada } from "src/app/models/despesaRegistada";
import { PopUpWarningComponent } from "src/app/componentes/pop-up-warning/pop-up-warning.component";
import { ComponenteDespesa } from "src/app/models/tarefa";
import { ComponenteDespesaConfigService } from "src/app/services/componenteDespesaConfig.service";
import { GetComponenteDespesaConfigRequest } from "src/app/request-models/componenteDespesaConfig-request";
import { ComponenteDespesaConfig } from "src/app/models/componenteDespesaConfig";
import { Destinatario } from "src/app/models/destinatario";
import { DestinatarioService } from "src/app/services/destinatario.service";
import { PagamentoExecutado, PagamentoExecutadoDestinatario } from "src/app/models/pagamentos_executados";
import { PopUpExecutarPagamentosComponent } from './pop-up-executar-pagamentos/pop-up-executar-pagamentos.component';
import { PagamentoExecutadoService } from "src/app/services/pagamentoExecutado.service";
import { GetDestinatarioPagamentoRequest, ListagemPagamentosProcessoRequest } from "src/app/request-models/pagamentoExecutado-request";
import { PopUpListarPagamentosExecutadosComponent } from "./pop-up-listar-pagamentos-executados/pop-up-listar-pagamentos-executados.component";
import { Compromisso } from "src/app/models/compromisso";
import { PopUpCompromissosComponent } from './pop-up-compromissos/pop-up-compromissos.component';
import { PopUpEditDespesaCabimentadaComponent } from "./pop-up-edit-despesa-cabimentada/pop-up-edit-despesa-cabimentada.component";




@Component({
  standalone: false,
  selector: 'app-componente-despesa',
  templateUrl: './componente-despesa.component.html',
  styleUrls: ['./componente-despesa.component.css']
})
export class ComponenteDespesaComponent implements OnInit {
  public faTimesCircle = faTimesCircle;
  public errors: string[] = [];
  public currencyOptions = customCurrencyMaskConfig;
  public faFileExcel = faFileExcel;

  //matcher
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();

  public submittedTry: boolean = false;

  //processo id
  public processoId: number = 0;
  //id Componente Orçamento Registo Aprovado
  public idOrcamentoRegisto: number = 0;
  //edit
  public idDespesa: number = 0;
  public editar: boolean = false;

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
  public contabilidadeListagem: CodigoConta[] = [];
  public filtersContabilidade: number[] = [];
  public filtersContabilidadeFiltered: CodigoConta[] = [];

  // Conta OSS
  public filtersContaOSS: number[] = [];
  public filtersContaOSSFiltered: AgrupamentosConfig[] = [];
  public contaOSS = <AgrupamentosConfig>{};
  public contaOSSListagem: AgrupamentosConfig[] = [];
  public idContaOssEdit: number = 0;

  //Descricao Despesa
  public descricaoDespesa: string = '';

  //Valor da Despesa
  public valorDespesa: number | undefined;

  //existe orcamento aprovado?
  public naoExisteOrcamentoAprovado: boolean = false;

  //despesa registada - Painel 2
  public despesaRegistadaAutorizada = <DespesaRegistada>{};
  public despesaRegistadaAutorizadaListagem: DespesaRegistada[] = [];
  public valorDespesaListagem: ValoresDespesaRegistada[] = [];
  public displayedColumns: string[] = ['descricao', 'valorOrcamentado', 'valorExecutado', 'valorCabimentado', 'valorAutorizado'];
  public allDespesasAutorizadas: boolean = false;

  //Listagem Despesas Registadas - Painel 3
  public listaDespesaRegistadas: DespesaRegistada[] = [];
  public displayedColumnsListaDespesaRegistada: string[] = ['descricao', 'contaOSS', 'valor', 'accoes'];
  public totalDespesasRegistadas: number = 0;

  //Listagem Despesas Autorizadas - Painel 4
  public listaDespesaAutorizadas: DespesaRegistada[] = [];
  public totalDespesasAutorizadas: number = 0;

  //Listagem Despesas Cabimentadas - Painel 5
  public listaDespesaCabimentadas: DespesaRegistada[] = [];
  public totalDespesasCabimentadas: number = 0;

  //Despesas Executadas - painel 6
  public listaDespesaAExecutar: DespesaCabimentadasParaExecucao[] = [];
  public totalDespesasExecutadas: number = 0;
  public displayedColumnsDespesasAExecutar: string[] = ['descricao', 'valor', 'valorExecutado', 'faltaExecutar'];

  //Despesas Executadas - painel 6
  public listaDespesaCompromissoAExecutar: DespesaCabimentadasParaExecucao[] = [];
  public totalDespesasCompromissoExecutadas: number = 0;
  public displayedColumnsDespesasCompromissoAExecutar: string[] = ['descricao', 'valor', 'valorExecutado', 'faltaExecutar'];

  //Compromissos - painel 7
  public listaCompromissos: DespesaCompromisso[] = [];
  public totalCompromissos: number = 0;
  public displayedColumnsCompromissos: string[] = ['despesaCabimentada', 'compromisso', 'valorCompromisso', 'accoes'];

  //executar Pagamentos
  public listaPagamentosDestinatario: PagamentoExecutadoDestinatario[] = [];
  public numPagamento: string = '';
  public totalValorCabimentado: number = 0;
  public totalValorExecutado: number = 0;
  public totalValorFaltaExecutar: number = 0;
  public totalValorDestinatarioExecutado: number = 0;


  // Autorizar Despesa
  public isValueCabimentarDespesaNegative: boolean = false;

  @Input() tarefaActivoId: number = 0;
  @Input() isExpanded: boolean = false;

  //configurações componenente despesa
  public componenteDespesaConfig: ComponenteDespesaConfig = <ComponenteDespesaConfig>{};


  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService,
    private orcamentoService: componenteOrcamentoRegistoService,
    private departamentoService: DepartamentoService,
    public _snackBar: MatSnackBar,
    public agrupamentoService: AgrupamentoConfigService,
    public componenteDespesaService: ComponenteDespesaRegistoService,
    public warningDialog: MatDialog,
    public componenteDespesaConfigService: ComponenteDespesaConfigService,
    public destinatarioService: DestinatarioService,
    public executarPagamentosDialog: MatDialog,
    public pagamentoExecutadoService: PagamentoExecutadoService,
  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {

      //obter configuração despesa
      this.getComponenteDespesaConfig();
      // validar se existe orçamento aprovado para a data de inicio do processo


      this.getOrcamentoAprovado(this.tarefaActivoId);

      this.updateFilteredAgrupamentos(false);

      // TODO: traduzir
      //parte 2- valores Orçamento/Despesa
      this.valorDespesaListagem[0] = <ValoresDespesaRegistada>{};
      this.valorDespesaListagem[0].descricao = "Valor Inicial/Atual";
      this.valorDespesaListagem[1] = <ValoresDespesaRegistada>{};
      this.valorDespesaListagem[1].descricao = "Valor Disponível";
      this.valorDespesaListagem[2] = <ValoresDespesaRegistada>{};
      this.valorDespesaListagem[2].descricao = "Valor Após Execução";
      this.valorDespesaListagem[3] = <ValoresDespesaRegistada>{};
      this.valorDespesaListagem[3].descricao = "Valor Após Cabimentação";
      this.valorDespesaListagem[4] = <ValoresDespesaRegistada>{};
      this.valorDespesaListagem[4].descricao = "Valor Após Autorização";
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getComponenteDespesaConfig() {
    this.showLoader();
    let request = <GetComponenteDespesaConfigRequest>{
      tarefaAtivoId: this.tarefaActivoId,
    };

    this.componenteDespesaConfigService.getComponenteDespesaConfigByTarefaAtivoId(request).subscribe(x => {
      this.componenteDespesaConfig = x.componenteDespesaConfig;
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
    this.orcamentoService.GetOrcamentoAprovadoDespesaByIdTarefaActivo(request).subscribe(x => {
      if (x != null && x.existeOrcamentoAprovado) {
        this.idOrcamentoRegisto = x.idOrcamentoRegisto;
        this.centroCustoListagem = x.centrosCusto;
        this.tipoContaListagem = x.tiposDeConta;
        this.tipoContaFiltered = this.tipoContaListagem.filter(tipoConta => tipoConta.descricao == 'Despesa' 
          || tipoConta.descricao == 'Neutro Despesa' || tipoConta.descricao == 'Expense' );
        this.tipoConta.id = this.tipoContaFiltered[0].id;
        this.contabilidadeListagem = x.codigoConta;
        this.filtersContabilidadeFiltered = x.codigoConta;
        this.numPagamento = x.numPagamento;
        this.listaPagamentosDestinatario = x.listaPagamentosDestinatario;
        this.processoId = x.processoId;
        this.getAllDadosDropDown();


        if (this.listaPagamentosDestinatario != null && this.listaPagamentosDestinatario.length > 0) {
          this.listaPagamentosDestinatario.forEach(element => {
           this.totalValorDestinatarioExecutado = Math.round((this.totalValorDestinatarioExecutado + element.valorExecutado) * 100) / 100;
          });
        }
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

  public getAllDadosDropDown() {
    this.showLoader();

    let departamentoInss = this.departamentoService.getAllDepartamentosAtivo();

    let request = <GetAllDespesaRegistadaRequest>{
      tarefaAtivoId: this.tarefaActivoId
    }

    let compromissoRequest = <GetDespesasCompromissoRequest> {
      tarefaAtivoId: this.tarefaActivoId
    }

    let despesaRegistada = this.componenteDespesaService.GetAllDespesaRegistadaByTarefaAtivoId(request);

    let despesaCabimentadaParaExecutar = this.componenteDespesaService.GetAllDespesaCabimentadasParaExecucaoByTarefaAtivoId(request);

    let despesaCompromissoParaExecutar = this.componenteDespesaService.GetAllDespesaCompromissosParaExecucaoByTarefaAtivoId(request);

    let despesaCompromisso = this.componenteDespesaService.GetDespesasCompromissoByTarefaAtivoId(compromissoRequest);


    forkJoin([departamentoInss, despesaRegistada, despesaCabimentadaParaExecutar, despesaCompromisso, despesaCompromissoParaExecutar]).subscribe(([departamentoInss, despesaRegistada, despesaCabimentadaParaExecutar, despesaCompromisso, despesaCompromissoParaExecutar]) => {
      this.departamentoINSSListagem = departamentoInss.selects;

      if (despesaRegistada.componenteDespesaRegisto != null && despesaRegistada.componenteDespesaRegisto.length > 0) {
        this.despesaRegistadaAutorizadaListagem = despesaRegistada.componenteDespesaRegisto.filter(estadoDespesa => estadoDespesa.estado == 'R');

        if (this.despesaRegistadaAutorizadaListagem == null || this.despesaRegistadaAutorizadaListagem.length == 0) {
          this.despesaRegistadaAutorizadaListagem = despesaRegistada.componenteDespesaRegisto.filter(estadoDespesa => estadoDespesa.estado == 'A');

        }
        if (this.despesaRegistadaAutorizadaListagem != null && this.despesaRegistadaAutorizadaListagem.length > 0) {
          let ultimaDespesaRegistada: DespesaRegistada[] = this.despesaRegistadaAutorizadaListagem.filter(estadoDespesa => estadoDespesa.estado == 'R');

          if (ultimaDespesaRegistada == null || ultimaDespesaRegistada.length == 0) {
            ultimaDespesaRegistada = this.despesaRegistadaAutorizadaListagem.filter(estadoDespesa => estadoDespesa.estado == 'A');
            this.allDespesasAutorizadas = true;

          }

          if (ultimaDespesaRegistada != null && ultimaDespesaRegistada.length > 0) {
            this.despesaRegistadaAutorizada.id = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].id;
            //this.despesaRegistadaAutorizada.idContabilidade = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].idContabilidade;
            //this.despesaRegistadaAutorizada.descricaoContabilidade = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].descricaoContabilidade;
            this.despesaRegistadaAutorizada.idOrcamento = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].idOrcamento;
            this.despesaRegistadaAutorizada.descricaoOrcamento = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].descricaoOrcamento;
            this.despesaRegistadaAutorizada.valorRegistado = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].valorRegistado;
            this.despesaRegistadaAutorizada.idDepartamento = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].idDepartamento;
            this.despesaRegistadaAutorizada.idCentroCusto = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].idCentroCusto;
            this.despesaRegistadaAutorizada.idTipoConta = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].idTipoConta;
            this.despesaRegistadaAutorizada.descricaoDespesa = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].descricaoDespesa;
            this.despesaRegistadaAutorizada.estado = ultimaDespesaRegistada[ultimaDespesaRegistada.length - 1].estado;

            this.updateDespesaRegistada();
          }
          else {
            this.allDespesasAutorizadas = true;
          }
        }
        this.listaDespesaRegistadas = despesaRegistada.componenteDespesaRegisto.filter(estadoDespesa => estadoDespesa.estado == 'R');

        if (this.listaDespesaRegistadas != null && this.listaDespesaRegistadas.length > 0) {
          this.totalDespesasRegistadas = 0;
          this.listaDespesaRegistadas.forEach(element => {
            this.totalDespesasRegistadas = Math.round((this.totalDespesasRegistadas + element.valorRegistado) * 100) / 100;
          });
        }

        this.listaDespesaAutorizadas = despesaRegistada.componenteDespesaRegisto.filter(estadoDespesa => estadoDespesa.estado == 'A');
        if (this.listaDespesaAutorizadas != null && this.listaDespesaAutorizadas.length > 0) {
          this.totalDespesasAutorizadas = 0;
          this.listaDespesaAutorizadas.forEach(element => {
            this.totalDespesasAutorizadas = Math.round((this.totalDespesasAutorizadas + element.valorRegistado) * 100) / 100;
          });
        }

        this.listaDespesaCabimentadas = despesaRegistada.componenteDespesaRegisto.filter(estadoDespesa => estadoDespesa.estado == 'C');
        if (this.listaDespesaCabimentadas != null && this.listaDespesaCabimentadas.length > 0) {
          this.totalDespesasCabimentadas = 0;
          this.listaDespesaCabimentadas.forEach(element => {
            this.totalDespesasCabimentadas = Math.round((this.totalDespesasCabimentadas + element.valorRegistado) * 100) / 100;
          });
        }

        this.listaDespesaCompromissoAExecutar = despesaCompromissoParaExecutar.despesasParaExecucao;
        if (this.listaDespesaCompromissoAExecutar != null && this.listaDespesaCompromissoAExecutar.length > 0) {
          this.listaDespesaCompromissoAExecutar.forEach(element => {
            this.totalValorCabimentado = Math.round((this.totalValorCabimentado + element.valorCabimentado) * 100) / 100;
            this.totalValorExecutado = Math.round((this.totalValorExecutado + element.valorExecutado) * 100) / 100;
            this.totalValorFaltaExecutar = Math.round((this.totalValorFaltaExecutar + element.faltaExecutar) * 100) / 100;
          });
        }

        this.listaCompromissos = despesaCompromisso.componenteDespesaObrigacao;
        this.totalCompromissos = despesaCompromisso.componenteDespesaObrigacao.length;

        this.hideLoader();

      }

      else {
        this.hideLoader();

      }

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

  public filterCustomOptionsContabilidade(event: any) {
    this.filtersContabilidadeFiltered = this.contabilidadeListagem.filter(p => p.designacao.toLowerCase().startsWith(event.toLowerCase()));
  }

  public clearValorDespesa(): void {
    this.valorDespesa = 0;
  }

  public submitDespesa() {
    this.submittedTry = true;
  }

  public registarEditarDespesa() {
    this.showLoader();

    let despesaRegisto: Despesa = {
      id: this.editar ? this.idDespesa : 0,
      idOrcamentoRegistoAprovado: this.idOrcamentoRegisto,
      tarefaAtivoFK: this.tarefaActivoId,
      departamentoFk: this.departamentoINSS != null && this.departamentoINSS.id > 0 ? this.departamentoINSS.id : undefined,
      centroCustoFk: this.centroCusto.id,
      tipoContaFk: this.tipoConta.id,
      codigoContaFk: this.contabilidade.id,
      agrupamentoConfigFk: this.contaOSS.id,
      descricao: this.descricaoDespesa,
      valor: this.valorDespesa
    };

    let request: RegistoDespesaRequest = {
      despesa: despesaRegisto
    };

    this.componenteDespesaService.addEditComponenteDespesaRegisto(request).subscribe(x => {
      this.hideLoader();
      this.contabilidade = <CodigoConta>{};
      this.contaOSS = <AgrupamentosConfig>{};
      this.descricaoDespesa = '';
      this.valorDespesa = undefined;
      this.submittedTry = false;
      this.getAllDadosDropDown();

      if (this.editar) {
        this.editar = false;
        this.departamentoINSS = <SelectDescription>{};
        this.centroCusto = <SelectDescription>{};
        this.tipoConta = <DominioDescricaoString>{};
      }
      openSnackBar(this.translate.instant('snackBar.registoDespesa'), this._snackBar);

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

  public updateDespesaRegistada() {
    this.despesaRegistadaAutorizada.id = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].id;
    this.despesaRegistadaAutorizada.idContabilidade = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idContabilidade;
    this.despesaRegistadaAutorizada.descricaoContabilidade = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].descricaoContabilidade;
    this.despesaRegistadaAutorizada.idOrcamento = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idOrcamento;
    this.despesaRegistadaAutorizada.descricaoOrcamento = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].descricaoOrcamento;
    this.despesaRegistadaAutorizada.valorRegistado = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].valorRegistado;
    this.despesaRegistadaAutorizada.idDepartamento = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idDepartamento;
    this.despesaRegistadaAutorizada.idCentroCusto = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idCentroCusto;
    this.despesaRegistadaAutorizada.idTipoConta = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idTipoConta;
    this.despesaRegistadaAutorizada.descricaoDespesa = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].descricaoDespesa;
    this.despesaRegistadaAutorizada.estado = this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].estado;


    //obter valor orçamento, somatorio despesas executadas, cabimentadas e autorizadas para o Código de orçamento
    // this.contaOSSListagem = [];
    // this.filtersContaOSSFiltered = [];

    let request = <GetValoresDespesaByIdCodigoOrcamentoRequest>{
      agrupamentoFk: this.despesaRegistadaAutorizadaListagem.filter((c: { id: number; }) => c.id === this.despesaRegistadaAutorizada.id)[0].idOrcamento,
      orcamentoRegistoFk: this.idOrcamentoRegisto
    };

    this.showLoader();
    this.componenteDespesaService.GetValoresDespesaByIdCodigoOrcamento(request).subscribe(x => {

      //valor inicial/atual
      if (x != null && x.valoresDespesa != null) {
        this.valorDespesaListagem[0].valorOrcamentado = x.valoresDespesa.valorOrcamentado;
        this.valorDespesaListagem[0].valorAutorizado = x.valoresDespesa.valorAutorizado + x.valoresDespesa.valorCabimentado;
        this.valorDespesaListagem[0].valorCabimentado = x.valoresDespesa.valorCabimentado;
        this.valorDespesaListagem[0].valorExecutado = x.valoresDespesa.valorExecutado;
      }


      //valores disponiveis
      if (this.valorDespesaListagem[0].valorOrcamentado != null && this.valorDespesaListagem[0].valorOrcamentado > 0) {

        this.valorDespesaListagem[1].valorOrcamentado = this.valorDespesaListagem[0].valorOrcamentado - this.valorDespesaListagem[0].valorExecutado;
        this.valorDespesaListagem[1].valorExecutado = this.valorDespesaListagem[0].valorOrcamentado - this.valorDespesaListagem[0].valorExecutado;


        if(this.valorDespesaListagem[0].valorCabimentado != null && this.valorDespesaListagem[0].valorCabimentado > 0 ){
          this.valorDespesaListagem[1].valorCabimentado = this.valorDespesaListagem[0].valorOrcamentado  - this.valorDespesaListagem[0].valorCabimentado;
        }
        else{
          this.valorDespesaListagem[1].valorCabimentado = this.valorDespesaListagem[0].valorOrcamentado;
        }


        if(this.valorDespesaListagem[0].valorAutorizado != null && this.valorDespesaListagem[0].valorAutorizado > 0 ){
          this.valorDespesaListagem[1].valorAutorizado = this.valorDespesaListagem[0].valorOrcamentado  - this.valorDespesaListagem[0].valorAutorizado;
        }
        else{
          this.valorDespesaListagem[1].valorAutorizado = this.valorDespesaListagem[0].valorOrcamentado;
        }

      }
      else {
        this.valorDespesaListagem[1].valorOrcamentado = 0;
        this.valorDespesaListagem[1].valorExecutado = 0;
      }


      //valor após execução
      if (this.valorDespesaListagem[0].valorOrcamentado != null && this.valorDespesaListagem[0].valorOrcamentado > 0
        && this.despesaRegistadaAutorizada.valorRegistado != null) {

          if(this.valorDespesaListagem[0].valorExecutado != null && this.valorDespesaListagem[0].valorExecutado > 0){
            this.valorDespesaListagem[2].valorExecutado = this.valorDespesaListagem[1].valorExecutado - this.despesaRegistadaAutorizada.valorRegistado;

          }
          else{
            this.valorDespesaListagem[2].valorExecutado = this.valorDespesaListagem[1].valorOrcamentado - this.despesaRegistadaAutorizada.valorRegistado;
          }

      }
      else {
        this.valorDespesaListagem[2].valorExecutado = 0;
      }


      //valor após cabimentação
      // if (this.valorDespesaListagem[0].valorCabimentado != null && this.valorDespesaListagem[0].valorCabimentado > 0
      //   && this.despesaRegistadaAutorizada.valorRegistado != null) {

      //   this.valorDespesaListagem[3].valorCabimentado = this.valorDespesaListagem[0].valorCabimentado - this.despesaRegistadaAutorizada.valorRegistado;
      // }
      // else {

      //   if(this.valorDespesaListagem[1].valorCabimentado != null && this.valorDespesaListagem[1].valorCabimentado > 0){
      //     this.valorDespesaListagem[3].valorCabimentado = this.valorDespesaListagem[1].valorCabimentado - this.despesaRegistadaAutorizada.valorRegistado;
      //   }
      //   else{
      //     this.valorDespesaListagem[3].valorCabimentado = this.valorDespesaListagem[1].valorOrcamentado - this.despesaRegistadaAutorizada.valorRegistado;

      //   }
      // }

      // 1º caso
      this.valorDespesaListagem[3].valorCabimentado = this.valorDespesaListagem[1].valorCabimentado - this.despesaRegistadaAutorizada.valorRegistado;

      //valor após aprovação
      // 1º caso
      if (this.despesaRegistadaAutorizada.estado == 'A') {
        this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[1].valorAutorizado
      }
      else {
        this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[1].valorAutorizado - this.despesaRegistadaAutorizada.valorRegistado;
      }
      // if (this.valorDespesaListagem[0].valorAutorizado != null && this.valorDespesaListagem[0].valorAutorizado > 0
      //   && this.despesaRegistadaAutorizada.valorRegistado != null) {

      //     if(this.despesaRegistadaAutorizada.estado == 'A'){
      //       this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[0].valorAutorizado;

      //     }
      //     else{
      //       this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[0].valorAutorizado - this.despesaRegistadaAutorizada.valorRegistado;
      //     }
      // }
      // else {
      //   if(this.valorDespesaListagem[1].valorOrcamentado != null && this.valorDespesaListagem[1].valorOrcamentado > 0){
      //     this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[1].valorOrcamentado - this.despesaRegistadaAutorizada.valorRegistado;
      //   }
      //   else{
      //     this.valorDespesaListagem[4].valorAutorizado = this.valorDespesaListagem[1].valorOrcamentado - this.despesaRegistadaAutorizada.valorRegistado;

      //   }
      // }
      this.hideLoader();
    },
      err => {

        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public editarComponente(componenteDespesa: DespesaRegistada) {
    this.departamentoINSS.id = componenteDespesa.idDepartamento ?? <number>{};
    this.centroCusto.id = componenteDespesa.idCentroCusto;
    this.tipoConta = this.tipoContaFiltered.filter((c: { id: number; }) => c.id === componenteDespesa.idTipoConta)[0];
    this.contabilidade.id = componenteDespesa.idContabilidade;
    this.idContaOssEdit = componenteDespesa.idOrcamento;
    this.updateFilteredAgrupamentos(true);
    this.descricaoDespesa = componenteDespesa.descricaoDespesa;
    this.valorDespesa = componenteDespesa.valorRegistado;
    this.idDespesa = componenteDespesa.id;
    this.editar = true;
    document.getElementById("registoDepartamento")?.scrollIntoView({ behavior: "smooth" });
  }

  public deleteComponente(componenteDespesa: DespesaRegistada) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteDespesa',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.componenteDespesaService.deleteDespesa({ id: componenteDespesa.id }), msg: this.translate.instant('warnings.despesaWarningMsg') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllDadosDropDown();
        openSnackBar('Despesa eliminado com sucesso', this._snackBar);
      }
    });
  }


  public deleteAllComponente(ids: number[]) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteDespesa',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.componenteDespesaService.deleteAllDespesasRegistadas({ ids: ids }), msg: this.translate.instant('warnings.allDespesaWarningMsg') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllDadosDropDown();
        openSnackBar('Despesa eliminado com sucesso', this._snackBar);
      }
    });
  }


  public autorizarDespesa() {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'updateDespesa',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: this.valorDespesaListagem[3] != null && this.valorDespesaListagem[3].valorCabimentado != null && this.valorDespesaListagem[3].valorCabimentado <= 0 ?
        { function: this.autorizarDespesaValue(), msg: this.translate.instant('warnings.valorCabimentacaoNegativo'), noConfirmation: true } :
        this.valorDespesaListagem[3] != null && this.valorDespesaListagem[3].valorCabimentado > 0 &&
          this.valorDespesaListagem[4].valorAutorizado != null && this.valorDespesaListagem[4].valorAutorizado < 0 ?
          { function: this.componenteDespesaService.UpdateDespesa({ id: this.despesaRegistadaAutorizada.id, estado: this.despesaRegistadaAutorizada.estado }), msg: this.translate.instant('warnings.valorAutorizacaoNegativo') } :
          { function: this.componenteDespesaService.UpdateDespesa({ id: this.despesaRegistadaAutorizada.id, estado: this.despesaRegistadaAutorizada.estado }), msg: this.translate.instant('warnings.autorizacaoDespesa') }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!this.isValueCabimentarDespesaNegative) {
          this.getAllDadosDropDown();
          openSnackBar(this.translate.instant('snackBar.despesaAutorizada'), this._snackBar);
        }
      }
    });
  }

  public autorizarDespesaValue() {
    this.isValueCabimentarDespesaNegative = true;
  }

  public cabimentarDespesa() {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'updateDespesa',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: this.valorDespesaListagem[3] != null && this.valorDespesaListagem[3].valorCabimentado != null && this.valorDespesaListagem[3].valorCabimentado <= 0 ?
        { function: this.cabimentarDespesaValue(), msg: this.translate.instant('warnings.valorCabimentacaoNegativo'), noConfirmation: true } :
        { function: this.componenteDespesaService.UpdateDespesa({ id: this.despesaRegistadaAutorizada.id, estado: this.despesaRegistadaAutorizada.estado }), msg: this.translate.instant('warnings.cabimentacaoDespesa') }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!this.isValueCabimentarDespesaNegative) {
          this.getAllDadosDropDown();
          openSnackBar(this.translate.instant('snackBar.despesaCabimentada'), this._snackBar);
        }
      }
    });
  }

  public cabimentarDespesaValue() {
    this.isValueCabimentarDespesaNegative = true;
  }

  public deleteDespesaRegistada() {
    let componenteDespesa: DespesaRegistada = <DespesaRegistada>{};
    componenteDespesa.id = this.despesaRegistadaAutorizada.id;

    this.deleteComponente(componenteDespesa);
  }

  public deleteAllDespesasRegistadas() {
    let ids: number[] = [];
    this.despesaRegistadaAutorizadaListagem.forEach(element => {
      if (element.estado == 'R') {
        ids.push(element.id);
      }
    });
    this.deleteAllComponente(ids);
  }

  public editarDespesaRegistada() {
    this.editarComponente(this.despesaRegistadaAutorizada);
  }

  public executarPagamento() {
    const dialogRef = this.executarPagamentosDialog.open(PopUpExecutarPagamentosComponent, {
      id: 'executarPagamentos',
      minHeight: '500px',
      width: '80%',
      height: '70%',
      panelClass: 'modalWithBorder',
      data: {
        listaDespesaAExecutar: this.listaDespesaCompromissoAExecutar,
        naoExisteOrcamentoAprovado: this.naoExisteOrcamentoAprovado,
        numPagamento: this.numPagamento,
        tarefaActivoId: this.tarefaActivoId,
        listaPagamentosDestinatario: this.listaPagamentosDestinatario,
        processoId: this.processoId,
        totalValorCabimentado: this.totalValorCabimentado,
        totalValorExecutado: this.totalValorExecutado,
        totalValorFaltaExecutar: this.totalValorFaltaExecutar,
        totalValorDestinatarioExecutado: this.totalValorDestinatarioExecutado,
        componenteDespesaConfig: this.componenteDespesaConfig,
        despesaCabimentada: this.listaDespesaCabimentadas
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.totalValorExecutado = 0;
      this.totalValorFaltaExecutar = 0;
      this.totalValorCabimentado = 0;
      this.getOrcamentoAprovado(this.tarefaActivoId);

    });
  }

  public listarPagamentos() {

    this.showLoader();
    let request = <ListagemPagamentosProcessoRequest>{
      processoAtivo: this.processoId
    }
    this.pagamentoExecutadoService.GetListaPagamentoExcel(request).subscribe(x => {

      this.hideLoader();
      blobExcelSaveAs(x.excelExtraido, 'Lista_Pagamentos_Executados');


    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public listarPagamentosPDF(){
    const dialogRef = this.executarPagamentosDialog.open(PopUpListarPagamentosExecutadosComponent, {
      id: 'executarPagamentos',
      minHeight: '500px',
      width: '80%',
      height: '70%',
      panelClass: 'modalWithBorder',
      data: {
        processoAtivoId: this.processoId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
    });
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

  public registarCompromisso() {
    const dialogRef = this.executarPagamentosDialog.open(PopUpCompromissosComponent, {
      id: 'registarCompromisso',
      minHeight: '500px',
      width: '80%',
      height: '70%',
      panelClass: 'modalWithBorder',
      data: {
        listaDespesaAExecutar: this.listaDespesaCabimentadas,
        naoExisteOrcamentoAprovado: this.naoExisteOrcamentoAprovado,
        tarefaActivoId: this.tarefaActivoId,
        processoId: this.processoId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getAllDadosDropDown();
    });
  }

  public deleteCompromisso(compromisso: DespesaCompromisso) {
    const dialogRef = this.warningDialog.open(PopUpWarningComponent, {
      id: 'deleteDespesa',
      minHeight: '300px',
      width: '40%',
      height: '30%',
      panelClass: 'warningModal',
      data: { function: this.componenteDespesaService.deleteCompromisso({ id: compromisso.id }), msg: this.translate.instant('warnings.warningDeleteCompromisso') }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllDadosDropDown();
        openSnackBar(this.translate.instant('snackBar.removeCompromisso'), this._snackBar);
      }
    });
  }

  public editarCompromisso(compromisso: DespesaCompromisso) {
    const dialogRef = this.executarPagamentosDialog.open(PopUpCompromissosComponent, {
      id: 'registarCompromisso',
      minHeight: '500px',
      width: '80%',
      height: '70%',
      panelClass: 'modalWithBorder',
      data: {
        listaDespesaAExecutar: this.listaDespesaCabimentadas,
        naoExisteOrcamentoAprovado: this.naoExisteOrcamentoAprovado,
        tarefaActivoId: this.tarefaActivoId,
        processoId: this.processoId,
        compromisso: compromisso
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
      this.getAllDadosDropDown();
    });
  }

  public editarDespesaCabimentada(despesaCabimentada: DespesaRegistada) {
    const dialogRef = this.executarPagamentosDialog.open(PopUpEditDespesaCabimentadaComponent, {
      id: 'editarDespesaCabimentada',
      minHeight: '500px',
      width: '60%',
      height: '60%',
      panelClass: 'modalWithBorder',
      data: {
        despesaCabimentada: despesaCabimentada,
        tarefaActivoId: this.tarefaActivoId,
        processoId: this.processoId,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result)
      this.getAllDadosDropDown();
    });
  }
}
