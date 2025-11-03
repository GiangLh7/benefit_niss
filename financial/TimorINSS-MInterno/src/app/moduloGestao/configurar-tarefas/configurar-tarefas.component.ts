import { ConfigurarTarefaRequest } from './../../request-models/tarefa-request';
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from "ngx-spinner";
import { getSelectFilter, openErrorsDialog, openSnackBar, RegexPatterns, showExpiredError } from "../../utils";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from '@ngx-translate/core';
import { MyErrorStateDependentMatcher, MyErrorStateMatcher } from "../../matcher";
import { TokenStorageService } from "../../services/token-storage.service";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ComponenteListagem } from "../../response-models/componente-response";
import { ComponenteService } from "../../services/componente.service";
import { MatTable } from "@angular/material/table";
import { ComponenteAcessoPerfil, ComponenteAcessoUtilizador, ComponenteAccoesTarefa, ComponenteClassificacaoSubClassificTarefa, ComponenteDocumentoTarefa, ComponenteTexto, Tarefa, ComponenteDespesa, ComponenteConciliacaoMovimentos, ComponenteReceita } from "../../models/tarefa";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UtilizadoresListagem } from "src/app/response-models/utilizadores-response";
import { SelectDescription } from "src/app/models/utils";
import { UtilizadorService } from "src/app/services/utilizador.service";
import { FilterRequest } from "src/app/request-models/utils-request";
import { UtilizadorListagemRequest } from "src/app/request-models/utilizador-request";
import { TarefaService } from "src/app/services/tarefa.service";
import { DominiosService } from "src/app/services/dominios.service";
import { ClassificacaoService } from "src/app/services/classificacao.service";
import { SubClassificacaoService } from "src/app/services/subClassificacao.service";
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { DominioDescricaoString } from "src/app/response-models/dominios-response";
import { PerfilService } from "src/app/services/perfil.service";
import { RelTarefaComponenteService } from "src/app/services/relTarefaComponente.service";
import { ComponenteOrcamento } from "src/app/models/componenteOrcamento";
import { ComponenteTarefaConfiguradaResponse } from 'src/app/response-models/tarefa-response';


@Component({
  selector: 'configurar-tarefas',
  templateUrl: './configurar-tarefas.component.html',
  styleUrls: ['./configurar-tarefas.component.css']
})
export class ConfigurarTarefasComponent implements OnInit {
  public isLoggedIn = false;
  public faTimesCircle = faTimesCircle;
  public filterBy = '';
  public errors: string[] = [];
  public errorMessage = "";
  public submittedTry: boolean = false;
  public availableRegex = RegexPatterns;

  //mathers
  public matcher: MyErrorStateMatcher = new MyErrorStateMatcher();
  public dependentMatcher: MyErrorStateDependentMatcher = new MyErrorStateDependentMatcher(true);

  public nomeTarefa: string = '';

  public ELEMENT_DATA: ComponenteListagem[] = [];

  public dataSourceComponentes: ComponenteListagem[] = [];
  public displayedColumnscomponentes: string[] = ['expandir', 'descricao', 'select'];
  @ViewChild('table') table!: MatTable<ComponenteListagem>;

  public idTarefa: number = 0;

  //componente texto
  public componenteTexto: ComponenteTexto = <ComponenteTexto>{};
  public componenteTextoOpenState = false;

  //compenente prazo da tarefa
  public prazoTarefa: number = 0;
  public componentePrazoTarefaOpenState = false;

  //componente cabeçalho processo
  public componenteCabecalhoProcessoOpenState = false;

  //componente accoes da tarefa
  public componenteAccoesTarefaOpenState = false;
  public componenteAccoesTarefa = <ComponenteAccoesTarefa>{};
  public tarefaListagem: Tarefa[] = [];
  public dataSourceAccoesTarefa: ComponenteAccoesTarefa[] = [];
  public displayedColumnsAccoesTarefa: string[] = ['tarefa', 'apelidoTarefa', 'eliminar']

  //componente documentos da Tarefa
  public componenteDocumentoTarefaOpenState = false;
  public componenteDocumentosTarefa = <ComponenteDocumentoTarefa>{};
  public documentoListagem: DominioDescricaoString[] = [];
  public dataSourceDocumentoTarefa: ComponenteDocumentoTarefa[] = [];
  public displayedColumnsDocumentosTarefa: string[] = ['documento', 'obrigatorio', 'eliminar']

  //componente Classificacao/SubClassificacao da tarefa
  public componenteClassificSubClassificOpenState = false;
  public classificacaoListagem: SelectDescription[] = [];
  public classificacao: SelectDescription[] = []; ///
  public classificacaoTarefa: SelectDescription = <SelectDescription>{};
  public subClassificacaoTarefa: SelectDescription = <SelectDescription>{};
  public subClassificacaoListagem: SelectDescription[] = [];
  public subClassificacaoListagemFilter: SelectDescription[] = [];
  public dataSourceClassificacaoTarefa: ComponenteClassificacaoSubClassificTarefa[] = [];
  public displayedColumnsClassificacaoTarefa: string[] = ['classificacao', 'subClassificacao', 'eliminar'];

  //componente Perfil/Utilizador da tarefa
  public componentePerfilUtilizadorOpenState = false;
  public perfilTarefa: SelectDescription = <SelectDescription>{};
  public perfilListagem: SelectDescription[] = [];
  public utilizadorTarefa: UtilizadoresListagem = <UtilizadoresListagem>{};
  public utilizadorListagem: UtilizadoresListagem[] = [];
  public dataSourcePerfil: ComponenteAcessoPerfil[] = [];
  public dataSourceUtilizador: ComponenteAcessoUtilizador[] = [];

  public displayedColumnsPerfilTarefa: string[] = ['perfil', 'eliminar'];
  public displayedColumnsUtilizadorTarefa: string[] = ['utilizador', 'eliminar'];

  //componente Orçamento
  public componenteOrcamentoTarefaOpenState: boolean = false;
  public componenteOrcamento: ComponenteOrcamento = <ComponenteOrcamento>{};

  // componente Despesa
  public componenteDespesaTarefaOpenState: boolean = false;
  public componenteDespesa: ComponenteDespesa = <ComponenteDespesa>{};
  public disabledRegistar: boolean = false;
  public disabledVisualizarDespesaRparaA: boolean = false;


  // componente Conciliação de Movimentos
  public componenteConciliacaoMovimentosOpenState = false;
  public componenteConciliacaoMovimentos = <ComponenteConciliacaoMovimentos>{};

  
  // componente Receita
  public componenteReceitaOpenState = false;
  public componenteReceita = <ComponenteReceita>{};



  //componente listagem texto
  public componenteListagemTextoOpenState = false;

  //componente listagem documentos
  public componenteListagemDocumentoOpenState = false;

  //componente botão arquivar
  public componenteBotaoArquivarOpenState = false;

  //editar configuração tarefa
  public editarConfiguracao: boolean = false;


  // dados originais
  public dadosEdicaoTarefa: ComponenteTarefaConfiguradaResponse = <ComponenteTarefaConfiguradaResponse>{};
  public updates: any = [];

  constructor(
    private router: Router,
    private spinner: NgxSpinnerService,
    public errorDialog: MatDialog,
    public translate: TranslateService,
    private tokenStorage: TokenStorageService,
    private actRoute: ActivatedRoute,
    private componenteService: ComponenteService,
    public _snackBar: MatSnackBar,
    private utilizadorService: UtilizadorService,
    private tarefaService: TarefaService,
    private dominioService: DominiosService,
    private classificacaoService: ClassificacaoService,
    private subClassificacaoService: SubClassificacaoService,
    private perfilService: PerfilService,
    public warningDialog: MatDialog,
    public relTarefaComponenteService: RelTarefaComponenteService,
  ) {
  }

  ngOnInit(): void {

    if (!this.tokenStorage.getToken()) {
      this.router.navigate([''])
    }
    else if (this.tokenStorage.getToken() && !this.tokenStorage.tokenExpired()) {
      this.isLoggedIn = true;

      //editar perfil
      let idTarefa = this.actRoute.snapshot.paramMap.get('idTarefa');

      if (idTarefa != null && +idTarefa > 0) {
        this.idTarefa = +idTarefa;
        this.editarConfiguracao = true;
        this.showLoader();
        this.getAllComponentesTarefaConfigurada(this.idTarefa);
      }
      else {
        this.showLoader();
        this.getComponentes();
      }

      this.getListDropDown();
    }
    else {
      showExpiredError(this.errorDialog, this.tokenStorage, this.translate);
    }

  }

  public getComponentes() {

    this.componenteService.getAllComponentes().subscribe(x => {
      x.componentes == null ? this.ELEMENT_DATA = [] : this.ELEMENT_DATA = x.componentes;

      this.dataSourceComponentes = this.ELEMENT_DATA;
      this.hideLoader();
    },
      err => {
        this.ELEMENT_DATA = [];
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getListDropDown() {
    this.showLoader();

    let filter: FilterRequest;
    filter = {};
    filter.filterBy = this.filterBy;

    let request: UtilizadorListagemRequest;
    request = { "filter": filter };

    let utilizadorResponsavel = this.utilizadorService.GetAllUtilizadoresInterno(request);
    let tarefa = this.tarefaService.getAllTarefaAtivo();
    let documentosTarefa = this.dominioService.GetAllTiposDeDocumentoTarefa();
    let classificacao = this.classificacaoService.getAllClassificacao();
    let subclassificacao = this.subClassificacaoService.getAllSubClassificacao();
    let perfil = this.perfilService.getAllPerfisAtivo();

    forkJoin([utilizadorResponsavel, tarefa, documentosTarefa, classificacao, subclassificacao, perfil]).subscribe(([utilizadorResponsavel, tarefa, documentosTarefa, classificacao, subclassificacao, perfil]) => {
      this.utilizadorListagem = utilizadorResponsavel.utilizador;
      this.documentoListagem = documentosTarefa.dominios;
      this.tarefaListagem = tarefa.selects;
      this.classificacaoListagem = classificacao.selects;
      this.subClassificacaoListagem = subclassificacao.selects;
      this.perfilListagem = perfil.selects;
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
  }

  public getAllComponentesTarefaConfigurada(idTarefa: number) {

    this.tarefaService.getAllComponentesByIdTarefa(idTarefa).subscribe(x => {

      this.dadosEdicaoTarefa = JSON.parse(JSON.stringify(x));;

      x.listaComponente == null ? this.dataSourceComponentes = [] : this.dataSourceComponentes = x.listaComponente;

      x.nomeTarefa == null ? this.nomeTarefa = '' : this.nomeTarefa = x.nomeTarefa;

      x.prazoTarefa == null || x.prazoTarefa == 0 ?
        this.prazoTarefa = 0 : this.prazoTarefa = x.prazoTarefa;

      x.componenteAccoesTarefa == null || x.componenteAccoesTarefa.length <= 0 ?
        this.dataSourceAccoesTarefa = [] : this.dataSourceAccoesTarefa = x.componenteAccoesTarefa;

      x.componenteClassificacaoSubClassific == null || x.componenteClassificacaoSubClassific.length <= 0 ?
        this.dataSourceClassificacaoTarefa = [] : this.dataSourceClassificacaoTarefa = x.componenteClassificacaoSubClassific;

      x.componenteControleAcessoPerfil == null || x.componenteControleAcessoPerfil.length <= 0 ?
        this.dataSourcePerfil = [] : this.dataSourcePerfil = x.componenteControleAcessoPerfil;

      x.componenteControleAcessoUtilizador == null || x.componenteControleAcessoUtilizador.length <= 0 ?
        this.dataSourceUtilizador = [] : this.dataSourceUtilizador = x.componenteControleAcessoUtilizador;

      x.componenteCarregarDocumentos == null || x.componenteCarregarDocumentos.length <= 0 ?
        this.dataSourceDocumentoTarefa = [] : this.dataSourceDocumentoTarefa = x.componenteCarregarDocumentos;

      x.listaTexto ? this.componenteListagemTextoOpenState = true : this.componenteListagemTextoOpenState = false;

      x.listaDocumento ? this.componenteListagemDocumentoOpenState = true : this.componenteListagemDocumentoOpenState = false;

      x.componenteCabecalhoProcesso ? this.componenteCabecalhoProcessoOpenState = true : this.componenteCabecalhoProcessoOpenState = false;

      x.componenteBotaoArquivar ? this.componenteBotaoArquivarOpenState = true : this.componenteBotaoArquivarOpenState = false;

      if (x.componenteTexto){
        this.componenteTexto = x.componenteTexto;
      }
      else{
        this.dadosEdicaoTarefa.componenteTexto = <ComponenteTexto>{};
      }

      if (x.componenteOrcamento){
        this.componenteOrcamento = x.componenteOrcamento;
      }
      else{
        this.dadosEdicaoTarefa.componenteOrcamento = <ComponenteOrcamento>{};
      }

      if (x.componenteDespesa){
        this.componenteDespesa = x.componenteDespesa;
      }
      else{
        this.dadosEdicaoTarefa.componenteDespesa = <ComponenteDespesa>{};
      }

      if (x.componenteConciliacaoMovimentos){
        this.componenteConciliacaoMovimentos = x.componenteConciliacaoMovimentos;
      }
      else{
        this.dadosEdicaoTarefa.componenteConciliacaoMovimentos = <ComponenteConciliacaoMovimentos>{};
      }

      if (x.componenteReceita){
        this.componenteReceita = x.componenteReceita;
      }
      else{
        this.dadosEdicaoTarefa.componenteReceita = <ComponenteReceita>{};
      }


      if (this.prazoTarefa > 0) {
        this.componentePrazoTarefaOpenState = true;
      }

      if (x.componenteTexto) {
        this.componenteTextoOpenState = true;
      }

      if (this.dataSourceAccoesTarefa.length > 0) {
        this.componenteAccoesTarefaOpenState = true;
      }

      if (this.dataSourceClassificacaoTarefa.length > 0) {
        this.componenteClassificSubClassificOpenState = true;
      }

      if (this.dataSourcePerfil.length > 0) {
        this.componentePerfilUtilizadorOpenState = true;
      }

      if (this.dataSourceUtilizador.length > 0) {
        this.componentePerfilUtilizadorOpenState = true;
      }

      if (this.dataSourceDocumentoTarefa.length > 0) {
        this.componenteDocumentoTarefaOpenState = true;
      }

      if (x.componenteOrcamento)
        this.componenteOrcamentoTarefaOpenState = true;

      if (x.componenteDespesa)
        this.componenteDespesaTarefaOpenState = true;

      if (x.componenteConciliacaoMovimentos)
        this.componenteConciliacaoMovimentosOpenState = true;

      if (x.componenteReceita)
      this.componenteReceitaOpenState = true;

      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });

  }

  public dropTable(event: CdkDragDrop<ComponenteListagem[]>) {
    const prevIndex = this.dataSourceComponentes.findIndex((d) => d === event.item.data);
    moveItemInArray(this.dataSourceComponentes, prevIndex, event.currentIndex);
    this.table.renderRows();
  }

  public updateSelect(event: any, element: ComponenteListagem) {
    if (element.select) {
      element.select = false;

      if (element.descricao == 'Texto') {
        this.componenteTextoOpenState = false;
        this.componenteTexto = <ComponenteTexto>{};
      }

      if (element.descricao == 'Prazo da Tarefa') {
        this.componentePrazoTarefaOpenState = false;
        this.prazoTarefa = 0;
      }

      if (element.descricao == 'Cabeçalho de Processo') {
        this.componenteCabecalhoProcessoOpenState = false;
      }

      if (element.descricao == 'Acções da Tarefa') {
        this.componenteAccoesTarefaOpenState = false;
        this.componenteAccoesTarefa = <ComponenteAccoesTarefa>{};
        this.dataSourceAccoesTarefa = [];
      }

      if (element.descricao == 'Carregar Documentos') {
        this.componenteDocumentoTarefaOpenState = false;
        this.componenteDocumentosTarefa = <ComponenteDocumentoTarefa>{};
        this.dataSourceDocumentoTarefa = [];

      }

      if (element.descricao == 'Classificação / Sub-Classificação') {
        this.componenteClassificSubClassificOpenState = false;
        this.classificacaoTarefa = <SelectDescription>{};
        this.subClassificacaoTarefa = <SelectDescription>{};
        this.dataSourceClassificacaoTarefa = [];
      }

      if (element.descricao == 'Controlo de Acesso') {
        this.componentePerfilUtilizadorOpenState = false;
        this.perfilTarefa = <SelectDescription>{};
        this.utilizadorTarefa = <UtilizadoresListagem>{};
        this.dataSourcePerfil = [];
        this.dataSourceUtilizador = [];
      }

      if (element.descricao == 'Histórico de Texto') {
        this.componenteListagemTextoOpenState = false;
      }

      if (element.descricao == 'Listagem de Documentos Associados') {
        this.componenteListagemDocumentoOpenState = false;
      }

      if (element.descricao == 'Botão Arquivar') {
        this.componenteBotaoArquivarOpenState = false;
      }

      if (element.descricao == 'Orçamento') {
        this.componenteOrcamentoTarefaOpenState = false;
        this.componenteOrcamento = <ComponenteOrcamento>{};
      }

      if (element.descricao == 'Despesa' || element.descricao == 'Expense') {
        this.componenteDespesaTarefaOpenState = false;
        this.componenteDespesa = <ComponenteDespesa>{};
      }

      if (element.descricao == 'Conciliação de Movimentos') {
        this.componenteConciliacaoMovimentosOpenState = false;
        this.componenteConciliacaoMovimentos = <ComponenteConciliacaoMovimentos>{};
      }

      if (element.descricao == 'Receita' || element.descricao == 'Revenue') {
        this.componenteReceitaOpenState = false;
        this.componenteReceita = <ComponenteReceita>{};
      }
    }
    else {
      element.select = true;

      if (element.descricao == 'Texto') {
        this.componenteTextoOpenState = true;
        this.componenteTexto.texto1 = true;
        setTimeout(() => {
          document.getElementById("compTexto")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Prazo da Tarefa') {
        this.componentePrazoTarefaOpenState = true;
        setTimeout(() => {
          document.getElementById("prazoTarefa")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Cabeçalho de Processo') {
        this.componenteCabecalhoProcessoOpenState = true;
      }

      if (element.descricao == 'Acções da Tarefa') {
        this.componenteAccoesTarefaOpenState = true;
        setTimeout(() => {
          document.getElementById("accoesTarefa")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Carregar Documentos') {
        this.componenteDocumentoTarefaOpenState = true;
        setTimeout(() => {
          document.getElementById("documentosTarefa")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Classificação / Sub-Classificação') {
        this.componenteClassificSubClassificOpenState = true;
        setTimeout(() => {
          document.getElementById("classificacaoSubClassificTarefa")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Controlo de Acesso') {
        this.componentePerfilUtilizadorOpenState = true;
        setTimeout(() => {
          document.getElementById("perfilUtilizadorTarefa")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Histórico de Texto') {
        this.componenteListagemTextoOpenState = true;
      }

      if (element.descricao == 'Listagem de Documentos Associados') {
        this.componenteListagemDocumentoOpenState = true;
      }

      if (element.descricao == 'Botão Arquivar') {
        this.componenteBotaoArquivarOpenState = true;
      }

      if (element.descricao == 'Orçamento') {
        this.componenteOrcamentoTarefaOpenState = true;
        this.componenteOrcamento.tarefaFk = this.idTarefa;
        this.componenteOrcamento.permissaoAprovacao = 0;
        this.componenteOrcamento.permissaoDatas = 0;
        this.componenteOrcamento.permissaoDetalhes = 0;
        this.componenteOrcamento.permissaoInsercoes = 0;
        setTimeout(() => {
          document.getElementById("orcamentoComponent")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Despesa' || element.descricao == 'Expense') {
        this.componenteDespesaTarefaOpenState = true;
        this.componenteDespesa.id = 0;
        this.componenteDespesa.registarDespesa = 0;
        this.componenteDespesa.visualizarDespesaRParaA = 0;
        this.componenteDespesa.visualizarDespesaAParaC = 0;
        this.componenteDespesa.visualizarDespesaA = 0;
        this.componenteDespesa.visualizarDespesaR = 0;
        this.componenteDespesa.visualiazarDespesaC = 0;
        this.componenteDespesa.emitirOrdemPagamento = 0;
        this.componenteDespesa.visualizarDespesaComCompromisso = 0;
        this.componenteDespesa.executarPagamentos = 0;
        this.componenteDespesa.visualizarExecucaoDespesaCabimentada = 0;


        setTimeout(() => {
          document.getElementById("despesaComponent")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Conciliação de Movimentos') {
        this.componenteConciliacaoMovimentosOpenState = true;
        this.componenteConciliacaoMovimentos.tarefaFk = this.idTarefa;
        this.componenteConciliacaoMovimentos.permissaoSelecionarMovimentos = 0;
        this.componenteConciliacaoMovimentos.permissaoMovimentosConciliar = 0;
        this.componenteConciliacaoMovimentos.permissaoMovimentosBancarios = 0;
        this.componenteConciliacaoMovimentos.permissaoVerMovimentosAconciliar = 0;
        this.componenteConciliacaoMovimentos.permissaoConciliar = 0;
        this.componenteConciliacaoMovimentos.permissaoDesfazerConciliar = 0;
        setTimeout(() => {
          document.getElementById("conciliacaoMovimentosComponent")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }

      if (element.descricao == 'Receita' || element.descricao == 'Revenue') {
        this.componenteReceitaOpenState = true;
        this.componenteReceita.tarefaFk = this.idTarefa;
        this.componenteReceita.classificarMovSelecionados = 0;
        this.componenteReceita.selecionarMovRecebidosParaRegisto = 0;
        this.componenteReceita.verificarExecucaoOrcamentoEditarSelecao = 0;
        setTimeout(() => {
          document.getElementById("receitaComponent")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  }

  public updateExpandir(event: any, element: ComponenteListagem) {
    if (element.expandir) {
      element.expandir = false;
    }
    else {
      element.expandir = true;
    }
  }

  public submitConfiguracao() {
    this.submittedTry = true;
  }

  public adicionartarefa() {
    this.showLoader();

    if (this.editarConfiguracao) {
      this.editarTarefa();
    }

    else {
      let request: ConfigurarTarefaRequest = {
        idTarefa: this.idTarefa,
        nomeTarefa: this.nomeTarefa,
        prazoTarefa: this.prazoTarefa,
        listaTexto: this.componenteListagemTextoOpenState,
        listaDocumento: this.componenteListagemDocumentoOpenState,
        componenteTexto: this.componenteTexto,
        componenteCabecalhoProcesso: this.componenteCabecalhoProcessoOpenState,
        componenteAccoesTarefa: this.dataSourceAccoesTarefa,
        componenteClassificacaoSubClassific: this.dataSourceClassificacaoTarefa,
        componenteControleAcessoPerfil: this.dataSourcePerfil,
        componenteControleAcessoUtilizador: this.dataSourceUtilizador,
        componenteCarregarDocumentos: this.dataSourceDocumentoTarefa,
        listaComponente: this.dataSourceComponentes,
        componenteBotaoArquivar: this.componenteBotaoArquivarOpenState,
      }

      
      if (this.componenteOrcamentoTarefaOpenState)
        request.componenteOrcamento = this.componenteOrcamento;

      if (this.componenteDespesaTarefaOpenState)
        request.componenteDespesa = this.componenteDespesa;

      if (this.componenteConciliacaoMovimentosOpenState)
        request.componenteConciliacaoMovimentos = this.componenteConciliacaoMovimentos;

      if (this.componenteReceitaOpenState)
        request.componenteReceita = this.componenteReceita;

      this.tarefaService.addTarefaConfigurada(request).subscribe(x => {
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.tarefaConfigurada'), this._snackBar);
        this.router.navigate(['/tarefa/'], { skipLocationChange: true });

      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
  }

  public editarTarefa() {
    this.showLoader();

    // update rel tarefa componente
    let listaComponenteAtual = {};

    var updateListaComponente: boolean = this.listAreIdentical(this.dataSourceComponentes, this.dadosEdicaoTarefa.listaComponente);


    if (!updateListaComponente) {

      let request = {
        idTarefa: this.idTarefa,
        componenteListagem: this.dataSourceComponentes
      }
      listaComponenteAtual = this.relTarefaComponenteService.updateRelTarefaComponente(request);
      this.updates.push(listaComponenteAtual);
    }

    // atualizar tarefa
    let tarefaAtual = {};
    if (this.nomeTarefa != this.dadosEdicaoTarefa.nomeTarefa || 
      this.componenteListagemTextoOpenState != this.dadosEdicaoTarefa.listaTexto ||
      this.componenteListagemDocumentoOpenState != this.dadosEdicaoTarefa.listaDocumento || 
      this.componenteCabecalhoProcessoOpenState != this.dadosEdicaoTarefa.componenteCabecalhoProcesso || 
      this.componenteBotaoArquivarOpenState != this.dadosEdicaoTarefa.componenteBotaoArquivar) {
      let request = {
        idTarefa: this.idTarefa,
        nomeTarefa: this.nomeTarefa,
        listaTexto: this.componenteListagemTextoOpenState,
        listaDocumento: this.componenteListagemDocumentoOpenState,
        componenteCabecalhoProcesso: this.componenteCabecalhoProcessoOpenState,
        componenteBotaoArquivar: this.componenteBotaoArquivarOpenState
      }
      tarefaAtual = this.tarefaService.editarTarefa(request);
      this.updates.push(tarefaAtual);
    }

    //Prazo Tarefa
    let prazoTarefaAtual = {};
    if (this.prazoTarefa != this.dadosEdicaoTarefa.prazoTarefa) {

      let request = {
        idTarefa: this.idTarefa,
        prazoTarefa: this.prazoTarefa
      }
      prazoTarefaAtual = this.componenteService.editarComponentePrazoTarefa(request);
      this.updates.push(prazoTarefaAtual);
    }

    // componenteTexto
    let componenteTextoAtual = {};
    if (JSON.stringify(this.componenteTexto) !== JSON.stringify(this.dadosEdicaoTarefa.componenteTexto)) {

      let request = {
        idTarefa: this.idTarefa,
        componenteTexto: this.componenteTexto
      }
      componenteTextoAtual = this.componenteService.editarComponenteTexto(request);
      this.updates.push(componenteTextoAtual);

    }

    //componenteAccoesTarefa
    let listaComponenteAccoesTarefaAtual = {};
    var updateListaComponenteAccoesTarefa: boolean = this.listAreIdentical(this.dataSourceAccoesTarefa, this.dadosEdicaoTarefa.componenteAccoesTarefa);
    if (!updateListaComponenteAccoesTarefa) {

      let request = {
        idTarefa: this.idTarefa,
        accaoTarefa: this.dataSourceAccoesTarefa
      }
      listaComponenteAccoesTarefaAtual = this.componenteService.editarComponenteAccaoTarefa(request);
      this.updates.push(listaComponenteAccoesTarefaAtual);

    }

    //componenteClassificacaoSubClassific
    let listaComponenteClassificacaoSubClassificAtual = {};
    var updateListaComponenteClassificacaoSubClassific: boolean = this.listAreIdentical(this.dataSourceClassificacaoTarefa, this.dadosEdicaoTarefa.componenteClassificacaoSubClassific);
    if (!updateListaComponenteClassificacaoSubClassific) {

      let request = {
        idTarefa: this.idTarefa,
        classificacaoSubClassific: this.dataSourceClassificacaoTarefa
      }
      listaComponenteClassificacaoSubClassificAtual = this.componenteService.editarComponenteClassificacaoSubClassifTarefa(request);
      this.updates.push(listaComponenteClassificacaoSubClassificAtual);

    }

    //componenteControloAcessoPerfil
    let listaComponenteControloAcessoPerfilAtual = {};
    var updateListaComponenteControloAcessoPerfil: boolean = this.listAreIdentical(this.dataSourcePerfil, this.dadosEdicaoTarefa.componenteControleAcessoPerfil);
    if (!updateListaComponenteControloAcessoPerfil) {

      let request = {
        idTarefa: this.idTarefa,
        controloAcessoPerfil: this.dataSourcePerfil
      }
      listaComponenteControloAcessoPerfilAtual = this.componenteService.editarComponenteControloAcessoPerfilTarefa(request);
      this.updates.push(listaComponenteControloAcessoPerfilAtual);

    }

    //componenteControloAcessoUtilizador
    let listaComponenteControloAcessoUtilizadorAtual = {};
    var updateListaComponenteControloAcessoUtilizador: boolean = this.listAreIdentical(this.dataSourceUtilizador, this.dadosEdicaoTarefa.componenteControleAcessoUtilizador);
    if (!updateListaComponenteControloAcessoUtilizador) {

      let request = {
        idTarefa: this.idTarefa,
        controloAcessoUtilizador: this.dataSourceUtilizador
      }
      listaComponenteControloAcessoUtilizadorAtual = this.componenteService.editarComponenteControloAcessoUtilizadorTarefa(request);
      this.updates.push(listaComponenteControloAcessoUtilizadorAtual);

    }

    //componenteCarregarDocumentos
    let listaComponenteCarregarDocumentosAtual = {};
    var updateListaComponenteCarregarDocumentos: boolean = this.listAreIdentical(this.dataSourceDocumentoTarefa, this.dadosEdicaoTarefa.componenteCarregarDocumentos);
    if (!updateListaComponenteCarregarDocumentos) {

      let request = {
        idTarefa: this.idTarefa,
        documentoTarefa: this.dataSourceDocumentoTarefa
      }
      listaComponenteCarregarDocumentosAtual = this.componenteService.editarComponenteDocumentoTarefa(request);
      this.updates.push(listaComponenteCarregarDocumentosAtual);
    }


    //componenteOrcamento
    let componenteOrcamento = {};
    if (JSON.stringify(this.componenteOrcamento) !== JSON.stringify(this.dadosEdicaoTarefa.componenteOrcamento)) {
      this.componenteOrcamento.tarefaFk = this.idTarefa;
      let request = {
        componenteOrcamento: this.componenteOrcamento
      }
      componenteOrcamento = this.componenteService.editarComponenteOrcamento(request)
      this.updates.push(componenteOrcamento);
    }

    //componenteDespesa
    let componenteDespesa = {};
    if (JSON.stringify(this.componenteDespesa) !== JSON.stringify(this.dadosEdicaoTarefa.componenteDespesa)) {
      this.componenteDespesa.tarefaFk = this.idTarefa;
      let request = {
        componenteDespesa: this.componenteDespesa
      }
      componenteDespesa = this.componenteService.editarComponenteDespesa(request)
      this.updates.push(componenteDespesa);
    }

    //componenteConciliacaoMovimentos
    let componenteConciliacaoMovimentos = {};
    if (JSON.stringify(this.componenteConciliacaoMovimentos) !== JSON.stringify(this.dadosEdicaoTarefa.componenteConciliacaoMovimentos)) {
      this.componenteConciliacaoMovimentos.tarefaFk = this.idTarefa;
      let request = {
        componenteConciliacaoMovimentos: this.componenteConciliacaoMovimentos
      }
      componenteConciliacaoMovimentos = this.componenteService.editarComponenteConciliacaoMovimentos(request)
      this.updates.push(componenteConciliacaoMovimentos);
    }

    //componenteReceita
    let componenteReceita = {};
    if (JSON.stringify(this.componenteReceita) !== JSON.stringify(this.dadosEdicaoTarefa.componenteReceita)) {
      this.componenteReceita.tarefaFk = this.idTarefa;
      let request = {
        componenteReceita: this.componenteReceita
      }
      componenteReceita = this.componenteService.editarComponenteReceita(request)
      this.updates.push(componenteReceita);
    }

    if(this.updates.length > 0){
    forkJoin(this.updates)
      .subscribe((updates: any) => {
        this.hideLoader();
        openSnackBar(this.translate.instant('snackBar.tarefaConfigurada'), this._snackBar);
        this.router.navigate(['/tarefa/'], { skipLocationChange: true });
      },
        err => {
          this.hideLoader();
          err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
          this.showError();
        });
    }
    else{
      this.hideLoader();
    }
  }



  public listAreIdentical(list1: any, list2: any) {
    if (list1.length !== list2.length) return false;
    for (var i = 0, len = list1.length; i < len; i++) {
      if (JSON.stringify(list1[i]) !== JSON.stringify(list2[i])
      ) {
        return false;
      }
    }
    return true;
  }

  public EditRegistar(){
    if(this.componenteDespesa.visualizarDespesaRParaA == 0){
      this.componenteDespesa.registarDespesa = 2;
      this.disabledRegistar = true;
    }
    else{
      this.disabledRegistar = false;
    }
  }

  public clearPrazoTarefa() {
    this.prazoTarefa = 0;
  }

  public adicionarAccao(id: number, apelidoTarefa: string) {

    var tarefa: Tarefa = this.tarefaListagem.filter((c: { id: number; }) => c.id === id)[0]

    var tarefaAdicionar: ComponenteAccoesTarefa;
    tarefaAdicionar = { "id": 0, "idTarefa": tarefa.id, "nomeTarefa": tarefa.nome, "apelidoTarefa": apelidoTarefa };

    var index = this.dataSourceAccoesTarefa.findIndex(x => x.idTarefa === id);

    if (index == null || index == -1) {
      this.dataSourceAccoesTarefa.push(tarefaAdicionar);
      this.dataSourceAccoesTarefa = [...this.dataSourceAccoesTarefa];
    }
  }

  public adicionarDocumento(id: number, obrigatorio: boolean) {

    var documento: DominioDescricaoString = this.documentoListagem.filter((c: { id: number; }) => c.id === id)[0]

    var documentoAdicionar: ComponenteDocumentoTarefa;
    documentoAdicionar = { "id": 0, "idDocumento": documento.id, "obrigatorio": obrigatorio, nomeDocumento: documento.descricao };

    var index = this.dataSourceDocumentoTarefa.findIndex(x => x.idDocumento === id);

    if (index == null || index == -1) {
      this.dataSourceDocumentoTarefa.push(documentoAdicionar);
      this.dataSourceDocumentoTarefa = [...this.dataSourceDocumentoTarefa];
    }
  }

  public adicionarClassificacao(idClassificacao: number, idSubClassificacao: number) {

    var classificacao: SelectDescription = this.classificacaoListagem.filter((c: { id: number; }) => c.id === idClassificacao)[0]
    var subClassificacao: SelectDescription = this.subClassificacaoListagem.filter((c: { id: number; }) => c.id === idSubClassificacao)[0]

    var classificacaoAdicionar: ComponenteClassificacaoSubClassificTarefa;
    classificacaoAdicionar = {
      "id": 0, "idClassificacao": idClassificacao, "idSubClassificacao": idSubClassificacao,
      "nomeClassificacao": classificacao.nome, "nomeSubClassificacao": subClassificacao.nome
    };

    var index = this.dataSourceClassificacaoTarefa.findIndex(x => x.idSubClassificacao === idSubClassificacao);

    if (index == null || index == -1) {
      this.dataSourceClassificacaoTarefa.push(classificacaoAdicionar);
      this.dataSourceClassificacaoTarefa = [...this.dataSourceClassificacaoTarefa];
    }
  }

  public adicionarPerfil(idPerfil: number) {

    var perfil: SelectDescription = this.perfilListagem.filter((c: { id: number; }) => c.id === idPerfil)[0]

    var perfilAdicionar: ComponenteAcessoPerfil;
    perfilAdicionar = { "id": 0, "idPerfil": idPerfil, "nomePerfil": perfil.nome };

    var index = this.dataSourcePerfil.findIndex(x => x.idPerfil === idPerfil);

    if (index == null || index == -1) {

      if (this.editarConfiguracao) {
        this.dataSourcePerfil.push(perfilAdicionar);
        this.dataSourcePerfil = [...this.dataSourcePerfil];
      }
    }
  }

  public adicionarUtilizador(idUtilizador: number) {

    var utilizador: UtilizadoresListagem = this.utilizadorListagem.filter((c: { id: number; }) => c.id === idUtilizador)[0]

    var utilizadorAdicionar: ComponenteAcessoUtilizador;
    utilizadorAdicionar = { "id": 0, "idUtilizador": idUtilizador, "nomeUtilizador": utilizador.utilizador };

    var index = this.dataSourceUtilizador.findIndex(x => x.idUtilizador === idUtilizador);

    if (index == null || index == -1) {

      if (this.editarConfiguracao) {
        this.dataSourceUtilizador.push(utilizadorAdicionar);
        this.dataSourceUtilizador = [...this.dataSourceUtilizador];
      }
    }
  }


  public deleteAccao(element: ComponenteAccoesTarefa) {
    var index = this.dataSourceAccoesTarefa.findIndex(x => x.nomeTarefa == element.nomeTarefa);
    this.dataSourceAccoesTarefa.splice(index, 1)
    this.dataSourceAccoesTarefa = [...this.dataSourceAccoesTarefa];
  }

  public deleteDocumento(element: ComponenteDocumentoTarefa) {
    var index = this.dataSourceDocumentoTarefa.findIndex(x => x.nomeDocumento == element.nomeDocumento);
    this.dataSourceDocumentoTarefa.splice(index, 1)
    this.dataSourceDocumentoTarefa = [...this.dataSourceDocumentoTarefa];
  }

  public deleteClassificacao(element: ComponenteClassificacaoSubClassificTarefa) {

    var index = this.dataSourceClassificacaoTarefa.findIndex(x => x.nomeSubClassificacao == element.nomeSubClassificacao);
    this.dataSourceClassificacaoTarefa.splice(index, 1)
    this.dataSourceClassificacaoTarefa = [...this.dataSourceClassificacaoTarefa];
  }

  public deletePerfil(element: ComponenteAcessoPerfil) {
    var index = this.dataSourcePerfil.findIndex(x => x.nomePerfil === element.nomePerfil);
    this.dataSourcePerfil.splice(index, 1)
    this.dataSourcePerfil = [...this.dataSourcePerfil];
  }

  public deleteUtilizador(element: ComponenteAcessoUtilizador) {
    var index = this.dataSourceUtilizador.findIndex(x => x.nomeUtilizador == element.nomeUtilizador);
    this.dataSourceUtilizador.splice(index, 1)
    this.dataSourceUtilizador = [...this.dataSourceUtilizador];
  }

  public updateSubClassificacao() {
    this.subClassificacaoListagemFilter = getSelectFilter(this.classificacaoTarefa.id, this.subClassificacaoListagem);
  }


  public updateUtilizadorListagem() {
    let filter: FilterRequest;
    filter = {};
    filter.filterBy = ''+this.perfilTarefa.id;

    let request: UtilizadorListagemRequest;
    request = { "filter": filter };

    this.utilizadorService.GetUtilizadoresInternoByPerfil(request).subscribe(x => {
      this.utilizadorListagem = x.utilizador;
      // alert('📦 Số lượng phần tử:'+ this.utilizadorListagem.length);
      this.hideLoader();
    },
      err => {
        this.hideLoader();
        err.error?.errors ? err.error.errors.map((x: any) => this.errors.push(x.errorCode)) : this.errors.push('-1');
        this.showError();
      });
    
  }

  public updateExpandir1(event: any, element: ComponenteTexto) {
    if (element.expandir1) {
      element.expandir1 = false;
    }
    else {
      element.expandir1 = true;
    }
  }

  public updateTexto1(event: any, element: ComponenteTexto) {
    if (element.texto1) {
      element.texto1 = false;
    }
    else {
      element.texto1 = true;
    }
  }

  public updateExpandir2(event: any, element: ComponenteTexto) {
    if (element.expandir2) {
      element.expandir2 = false;
    }
    else {
      element.expandir2 = true;
    }
  }

  public updateTexto2(event: any, element: ComponenteTexto) {
    if (element.texto2) {
      element.texto2 = false;
    }
    else {
      element.texto2 = true;
    }
  }


  public updateObrigatorio1(event: any, element: ComponenteTexto) {
    if (element.obrigatorio1) {
      element.obrigatorio1 = false;
    }
    else {
      element.obrigatorio1 = true;
    }
  }

  public updateObrigatorioArquivar1(event: any, element: ComponenteTexto) {
    if (element.obrigatorioArquivar1) {
      element.obrigatorioArquivar1 = false;
    }
    else {
      element.obrigatorioArquivar1 = true;
    }
  }

  public updateObrigatorio2(event: any, element: ComponenteTexto) {
    if (element.obrigatorio2) {
      element.obrigatorio2 = false;
    }
    else {
      element.obrigatorio2 = true;
    }
  }

  public updateObrigatorioArquivar2(event: any, element: ComponenteTexto) {
    if (element.obrigatorioArquivar2) {
      element.obrigatorioArquivar2 = false;
    }
    else {
      element.obrigatorioArquivar2 = true;
    }
  }



  public updateObrigatorio(event: any, element: ComponenteDocumentoTarefa) {
    if (element.obrigatorio) {
      element.obrigatorio = false;
    }
    else {
      element.obrigatorio = true;
    }
  }

  public cancelar() {
    this.router.navigate(['/tarefa/'], { skipLocationChange: true });
  }

  public updateApelidoTarefa (){
    this.componenteAccoesTarefa.apelidoTarefa = '';

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
    e._body.nativeElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  

}
