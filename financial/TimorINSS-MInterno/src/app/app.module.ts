import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {HttpClient, HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppComponent } from './app.component';
import { NgxSpinnerModule } from "ngx-spinner";
import { GerirCamposEditaveisComponent } from './moduloGestao/gerir-campos-editaveis/gerir-campos-editaveis.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopUpWarningComponent } from './componentes/pop-up-warning/pop-up-warning.component';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { AppRoutingModule } from './app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PerfilComponent } from './moduloGestao/perfil/perfil.component';
import { AdicionarPerfilComponent } from './moduloGestao/adicionar_perfil/adicionar_perfil.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from "@angular/common";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSortModule } from '@angular/material/sort';
import { MatRippleModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatTreeModule } from '@angular/material/tree';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatNativeDateModule } from '@angular/material/core';
import { DialogComponent } from './componentes/dialog/dialog.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import {MatSnackBarModule } from '@angular/material/snack-bar';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PopUpGravarCampoComponent } from './moduloGestao/pop-up-gravar-campo/pop-up-gravar-campo.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginComponent } from './login/login.component';
import { PopUpGravarRegimeComponent } from './moduloGestao/pop-up-gravar-regime/pop-up-gravar-regime.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { NgxCurrencyDirective } from 'ngx-currency';
import { UtilizadorComponent } from './moduloGestao/utilizador/utilizador.component';
import { NovoUtilizadorComponent } from './moduloGestao/novo-utilizador/novo-utilizador.component';
import { MatMenuModule } from '@angular/material/menu';
import { LogsComponent } from './moduloAuditoria/logs/logs.component';
import { MenuPanelComponent } from './menu-panel/menu-panel.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { HttpInterceptorService } from './services/httpInterceptor.service';
import { ContribHomeSearchComponent } from './moduloContribuicoes/modulo-contribuicoes-search-page/modulo-contribuicoes-main-search';
import { ContribValidationHomeSearchComponent } from './moduloContribuicoes/modulo-contribuicoes-validation-search-page/modulo-contribuicoes-validation-main-search';
import { ConfigurarTarefasComponent } from './moduloGestao/configurar-tarefas/configurar-tarefas.component';
import { EntidadeEmpregadoraComponent } from './moduloContribuicoes/entidadeEmpregadora/entidadeEmpregadora.component';
import { PopUpAdicionarEditarMoradaComponent } from './moduloContribuicoes/pop-up-adicionar-editar-morada/pop-up-adicionar-editar-morada.component';
import { PopUpAdicionarEditarContatoComponent } from './moduloContribuicoes/pop-up-adicionar-editar-contato/pop-up-adicionar-editar-contato.component';
import { PopUpNissFacultativoComponent } from './moduloContribuicoes/pop-up-NISSFacultativo/pop-up-NISSFacultativo.component';
import { MatRadioModule } from '@angular/material/radio';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TrabalhadoresComponent } from './moduloContribuicoes/trabalhadores/trabalhadores.component';
import { PopUpDesvincularTrabalhadorComponent } from './moduloContribuicoes/pop-up-desvincular-trabalhador/pop-up-desvincular-trabalhador.component';
import { DatePickerComponent } from './componentes/date-picker/date-picker.component';
import { ExcelImporterComponent } from './componentes/excel-importer/excel-importer.component';
import { ExcelImporterPopupDestinatarioComponent } from './componentes/excel-importer/excel-importer-popups/excel-importer-popup-destinatarios/excel-importer-popup-destinatarios.component';
import { ExcelImporterPopupMovimentosComponent } from './componentes/excel-importer/excel-importer-popups/excel-importer-popup-movimentos/excel-importer-popup-movimentos.component';
import { ImporterToastsComponent } from './componentes/importer-toasts/importer-toasts.component';
import { ImporterToastComponent } from './componentes/importer-toast/importer-toast.component';
import { VincularTrabalhadorComponent } from './moduloContribuicoes/vincular-trabalhador/vincular-trabalhador.component';
import { PopUpVincularTrabalhadorComponent } from './moduloContribuicoes/pop-up-vincular-trabalhador/pop-up-vincular-trabalhador.component';
import { RegistoSuspensaoComponent } from './moduloContribuicoes/registoSuspensao/registoSuspensao.component';
import { NovoTrabalhadorComponent } from './moduloContribuicoes/novo-trabalhador/novo-trabalhador.component';
// TEMPORARILY DISABLED: Not compatible with Angular 20
// import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { PopUpAdicionarEditarDocumentoComponent } from './moduloContribuicoes/pop-up-adicionar-editar-documento/pop-up-adicionar-editar-documento.component';
import { PopUpAdicionarEditarEntidadeComponent } from './moduloContribuicoes/pop-up-adicionar-editar-entidade/pop-up-adicionar-editar-entidade.component';
import { EditarResponsavelLegalComponent } from './moduloContribuicoes/editar-responsavelLegal/editar-responsavelLegal.component';
import { NovoResponsavelLegalComponent } from './moduloContribuicoes/novo-responsavelLegal/novo-responsavelLegal.component';
import { DeclaracaoRemuneracaoComponent } from './moduloContribuicoes/declaracao-remuneracao/declaracao-remuneracao.component';
import { PopUpInfoLegalRemuneracaoComponent } from './moduloContribuicoes/pop-up-info-legal-remuneracao/pop-up-info-legal-remuneracao.component';
import { PopUpResumoDeclaracaoComponent } from './moduloContribuicoes/pop-up-resumo-declaracao/pop-up-resumo-declaracao.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { provideCharts, withDefaultRegisterables, BaseChartDirective } from 'ng2-charts';
import { ContaCorrenteComponent } from './moduloContribuicoes/conta_corrente/conta_corrente.component';
import { GuiaPagamentoComponent } from './moduloContribuicoes/guia-pagamento/guia-pagamento.component';
import { PopUpComprovativoPagamentoComponent } from './moduloContribuicoes/pop-up-comprovativo-pagamento/pop-up-comprovativo-pagamento.component';
import { TarefaComponent } from './moduloGestao/tarefa/tarefa.component';
import { ConfigurarProcessosComponent } from './moduloGestao/configurar-processos/configurar-processos.component';
import { NovoConfigurarProcessosComponent } from './moduloGestao/create-edit-configurar-processos/create-edit-configurar-processos.component';
import { PreencherTarefaComponent } from './moduloGestao/preencher-tarefa/preencher-tarefa.component';
import { ComponenteOrcamentoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-orcamento/componente-orcamento.component';
import { ComponenteTextoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-texto/componente-texto.component';
import { HomePageComponent } from './moduloGestao/home-page/home-page.component';
import { ProcessosArquivadosComponent } from './moduloGestao/processos-arquivados/processos-arquivados.component';
import { ProcessoDetalheComponent } from './moduloGestao/processo-detalhe/processo-detalhe.component';
import { PopUpIniciarProcessoComponent } from './moduloGestao/pop-up-iniciar-processo/pop-up-iniciar-processo.component';
import { PopUpEditarComponenteOrcamentoValorComponent } from './moduloGestao/preencher-tarefa/componentes/componente-orcamento/pop-up-editar-componente-orcamento-valor/pop-up-editar-componente-orcamento-valor.component';
import { ComponenteDespesaComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/componente-despesa.component';
import { ComponenteListDocumentosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-list-documentos/componente-list-documentos.component';
import { ComponenteCabecalhoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-cabecalho/componente-cabecalho.component';
import { ComponenteCabecalhoProcessoComponent } from './moduloGestao/processo-detalhe/components/componente-cabecalho/componente-cabecalho.component';
import { ComponentePrazoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-prazo/componente-prazo.component';
import { ComponenteDocumentosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-documentos/componente-documentos.component';
import { ComponenteHistoricoTextoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-historico-texto/componente-historico-texto.component';
import { ComponenteClassificacaoSubComponent } from './moduloGestao/preencher-tarefa/componentes/componente-classificacao-sub/componente-classificacao-sub.component';
import { ComponenteTarefaASeguirComponent } from './moduloGestao/preencher-tarefa/componentes/componente-tarefa-a-seguir/componente-tarefa-a-seguir.component';
import { ControloDeAcessoComponent } from './moduloGestao/controlo-de-acesso/controlo-de-acesso.component';
import { PopUpExecutarPagamentosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/pop-up-executar-pagamentos/pop-up-executar-pagamentos.component';
import { ComponenteConcilicacaoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-concilicacao/componente-concilicacao.component';
import { PopUpMovimentosUpsertComponent } from './moduloGestao/preencher-tarefa/componentes/componente-concilicacao/pop-up-movimentos-upsert/logic';
import { PopUpMovimentosDesfazerConciliacaoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-concilicacao/pop-up-movimentos-desfazer-conciliacao/logic';
import { PopUpMovimentosDespesaReceitaUpsertComponent } from './moduloGestao/preencher-tarefa/componentes/componente-concilicacao/pop-up-movimentos-despesa-receita-upsert/logic';
import { ComponenteReceitaComponent } from './moduloGestao/preencher-tarefa/componentes/componente-receita/componente-receita.component';
import { PopUpSelecionarValoresParaRegistoComponent } from './moduloGestao/preencher-tarefa/componentes/componente-receita/pop-up-selecionar_valores/pop-up-selecionar_valores.component';
import { ConsultasProcessosComponent } from './moduloRelatorios/consultas/processos/consultas-processos.component';
import { ConsultasSituacoesContributivasComponent } from './moduloRelatorios/consultas/situacao-contributiva/consultas-situacao.component';
import { ConsultasOrdensPagamentoComponent } from './moduloRelatorios/consultas/ordens-pagamento/consultas-ordens-pag.component';
import { ConsultasGuiasComponent } from './moduloRelatorios/consultas/guias/consultas-guias.component';
import { ConsultasExtratosBancariosComponent } from './moduloRelatorios/consultas/extratos-bancarios/consultas-extratos-bancarios.component';
import { ConsultasDespesasComponent } from './moduloRelatorios/consultas/despesas/consultas-despesas.component';
import { RelatoriosPagamentosEmiditosComponent } from './moduloRelatorios/relatorios/pagamentos-emitidos/reports-pag-emitidos.component';
import { RelatoriosExecucaoOrcamentalComponent } from './moduloRelatorios/relatorios/execucao-orcamental/reports-execucao-orcamental.component';
import { PopUpListarPagamentosExecutadosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/pop-up-listar-pagamentos-executados/pop-up-listar-pagamentos-executados.component';
import { ConsultasClassificacaoContabilisticaComponent } from './moduloRelatorios/consultas/classificacao-contab/consultas-classificacao-contab.component';
import { ConsultasReceitasComponent } from './moduloRelatorios/consultas/receitas/consultas-receitas.component';
import { ConsultasReceitasNaoConciliadasComponent } from './moduloRelatorios/consultas/receitas-nao-conc/consultas-receitas-nao-conc.component';
import { ConsultasFornecedoresComponent } from './moduloRelatorios/consultas/fornecedores/consultas-fornecedores.component';
import { ConsultasBalancoComponent } from './moduloRelatorios/consultas/balanco/consultas-balanco.component';
import { PopUpClassificacaoContabilisticaComponent } from './moduloGestao/preencher-tarefa/componentes/componente-concilicacao/pop-up-classificacao-contabilistica/pop-up-classificacao-contabilistica.component';
import { PopUpCompromissosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/pop-up-compromissos/pop-up-compromissos.component';
import { PopUpEditDespesaCabimentadaComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/pop-up-edit-despesa-cabimentada/pop-up-edit-despesa-cabimentada.component';
import { DatePickerFullComponent } from './componentes/date-picker-full/date-picker-full.component';
import { PopUpHandleInvoiceComponent } from './moduloContribuicoes/pop-up-handle-invoice/pop-up-handle-invoice.component';
import { PopUpAddUserComponent } from './moduloGestao/pop-up-add-user/pop-up-add-user.component';
import { CustomInMemoryApiService } from './moduloBenefit/services/custom-in-memory-api.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
  }

@NgModule({
  declarations: [
    AppComponent,
    GerirCamposEditaveisComponent,
    PerfilComponent,
    RelatoriosPagamentosEmiditosComponent,
    ConsultasSituacoesContributivasComponent,
    DialogComponent,
    PopUpWarningComponent,
    RelatoriosExecucaoOrcamentalComponent,
    AdicionarPerfilComponent,
    PopUpGravarCampoComponent,
    LoginComponent,
    ConsultasGuiasComponent,
    ConsultasOrdensPagamentoComponent,
    ConsultasProcessosComponent,
    ConsultasReceitasComponent,
    ConsultasReceitasNaoConciliadasComponent,
    ConsultasFornecedoresComponent,
    ConsultasBalancoComponent,
    ConsultasExtratosBancariosComponent,
    ConsultasClassificacaoContabilisticaComponent,
    ConsultasDespesasComponent,
    PopUpGravarRegimeComponent,
    UtilizadorComponent,
    NovoUtilizadorComponent,
    LogsComponent,
    MenuPanelComponent,
    RecoverPasswordComponent,
    ContribHomeSearchComponent,
    ContribValidationHomeSearchComponent,
    ConfigurarTarefasComponent,
    EntidadeEmpregadoraComponent,
    PopUpAdicionarEditarMoradaComponent,
    PopUpAdicionarEditarContatoComponent,
    PopUpNissFacultativoComponent,
    TrabalhadoresComponent,
    PopUpDesvincularTrabalhadorComponent,
    DatePickerComponent,
    ExcelImporterComponent,
    ExcelImporterPopupDestinatarioComponent,
    ExcelImporterPopupMovimentosComponent,
    ImporterToastsComponent,
    ImporterToastComponent,
    VincularTrabalhadorComponent,
    PopUpVincularTrabalhadorComponent,
    PopUpMovimentosUpsertComponent,
    PopUpMovimentosDesfazerConciliacaoComponent,
    PopUpMovimentosDespesaReceitaUpsertComponent,
    RegistoSuspensaoComponent,
    NovoTrabalhadorComponent,
    PopUpAdicionarEditarDocumentoComponent,
    PopUpAdicionarEditarEntidadeComponent,
    EditarResponsavelLegalComponent,
    NovoResponsavelLegalComponent,
    DeclaracaoRemuneracaoComponent,
    PopUpInfoLegalRemuneracaoComponent,
    PopUpResumoDeclaracaoComponent,
    ContaCorrenteComponent,
    GuiaPagamentoComponent,
    PopUpComprovativoPagamentoComponent,
    TarefaComponent,
    ConfigurarProcessosComponent,
    NovoConfigurarProcessosComponent,
    PreencherTarefaComponent,
    ComponenteOrcamentoComponent,
    ComponenteTextoComponent,
    HomePageComponent,
    ProcessosArquivadosComponent,
    ProcessoDetalheComponent,
    PopUpIniciarProcessoComponent,
    PopUpEditarComponenteOrcamentoValorComponent,
    ComponenteDespesaComponent,
    ComponenteCabecalhoComponent,
    ComponenteCabecalhoProcessoComponent,
    ComponenteListDocumentosComponent,
    ComponentePrazoComponent,
    ComponenteDocumentosComponent,
    ComponenteHistoricoTextoComponent,
    ComponenteClassificacaoSubComponent,
    ComponenteTarefaASeguirComponent,
    ControloDeAcessoComponent,
    PopUpExecutarPagamentosComponent,
    ComponenteConcilicacaoComponent,
    ComponenteReceitaComponent,
    PopUpSelecionarValoresParaRegistoComponent,
    PopUpListarPagamentosExecutadosComponent,
    PopUpClassificacaoContabilisticaComponent,
    PopUpCompromissosComponent,
    PopUpEditDespesaCabimentadaComponent,
    DatePickerFullComponent,
    PopUpHandleInvoiceComponent,
    PopUpAddUserComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatBadgeModule,
    MatTabsModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatGridListModule,
    MatStepperModule,
    MatSortModule,
    MatRippleModule,
    MatSliderModule,
    MatTreeModule,
    MatBottomSheetModule,
    MatNativeDateModule,
    FormsModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    DragDropModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatMomentDateModule,
    NgxCurrencyDirective,
    MatRadioModule,
    MatMenuModule,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    // TEMPORARILY DISABLED: Not compatible with Angular 20
    // NgxMatFileInputModule,
    BaseChartDirective,
    PdfViewerModule,
    TranslateModule.forRoot({
      loader: {
      provide: TranslateLoader,
      useFactory: HttpLoaderFactory,
      deps: [HttpClient]
      }
    }),
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    CurrencyPipe,
    { provide: LOCALE_ID, useValue: 'en-US'},
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true} },
    { provide: HTTP_INTERCEPTORS, useClass: HttpInterceptorService, multi: true },
    // Custom In-Memory API Service for mock data (only in development)
    // Remove this when connecting to real API
    { provide: HTTP_INTERCEPTORS, useClass: CustomInMemoryApiService, multi: true },
    provideCharts(withDefaultRegisterables()),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' }
    }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
