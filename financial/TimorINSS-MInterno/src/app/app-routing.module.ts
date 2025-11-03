import { NgModule, Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import { Routes, RouterModule } from '@angular/router';
import { GerirCamposEditaveisComponent } from './moduloGestao/gerir-campos-editaveis/gerir-campos-editaveis.component';
import { PerfilComponent } from './moduloGestao/perfil/perfil.component';
import { AdicionarPerfilComponent } from './moduloGestao/adicionar_perfil/adicionar_perfil.component';
import { LoginComponent } from './login/login.component';
import { UtilizadorComponent } from './moduloGestao/utilizador/utilizador.component';
import { NovoUtilizadorComponent } from './moduloGestao/novo-utilizador/novo-utilizador.component';
import { LogsComponent } from './moduloAuditoria/logs/logs.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ContribHomeSearchComponent } from './moduloContribuicoes/modulo-contribuicoes-search-page/modulo-contribuicoes-main-search';
import { ContribValidationHomeSearchComponent } from './moduloContribuicoes/modulo-contribuicoes-validation-search-page/modulo-contribuicoes-validation-main-search';
import { ConfigurarTarefasComponent } from './moduloGestao/configurar-tarefas/configurar-tarefas.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { EntidadeEmpregadoraComponent } from './moduloContribuicoes/entidadeEmpregadora/entidadeEmpregadora.component';
import { TrabalhadoresComponent } from './moduloContribuicoes/trabalhadores/trabalhadores.component';
import { VincularTrabalhadorComponent } from './moduloContribuicoes/vincular-trabalhador/vincular-trabalhador.component';
import { NovoTrabalhadorComponent } from './moduloContribuicoes/novo-trabalhador/novo-trabalhador.component';
import { RegistoSuspensaoComponent } from './moduloContribuicoes/registoSuspensao/registoSuspensao.component';
import { NovoResponsavelLegalComponent } from './moduloContribuicoes/novo-responsavelLegal/novo-responsavelLegal.component';
import { EditarResponsavelLegalComponent } from './moduloContribuicoes/editar-responsavelLegal/editar-responsavelLegal.component';
import { DeclaracaoRemuneracaoComponent } from './moduloContribuicoes/declaracao-remuneracao/declaracao-remuneracao.component';
import { ContaCorrenteComponent } from './moduloContribuicoes/conta_corrente/conta_corrente.component';
import { GuiaPagamentoComponent } from './moduloContribuicoes/guia-pagamento/guia-pagamento.component';
import { TarefaComponent } from './moduloGestao/tarefa/tarefa.component';
import { ConfigurarProcessosComponent } from './moduloGestao/configurar-processos/configurar-processos.component';
import { NovoConfigurarProcessosComponent } from './moduloGestao/create-edit-configurar-processos/create-edit-configurar-processos.component';
import { PreencherTarefaComponent } from './moduloGestao/preencher-tarefa/preencher-tarefa.component';
import { HomePageComponent } from './moduloGestao/home-page/home-page.component';
import { ProcessosArquivadosComponent } from './moduloGestao/processos-arquivados/processos-arquivados.component';
import { ProcessoDetalheComponent } from './moduloGestao/processo-detalhe/processo-detalhe.component';
import { ControloDeAcessoComponent } from './moduloGestao/controlo-de-acesso/controlo-de-acesso.component';
import { ConsultasProcessosComponent } from './moduloRelatorios/consultas/processos/consultas-processos.component';
import { ConsultasSituacoesContributivasComponent } from './moduloRelatorios/consultas/situacao-contributiva/consultas-situacao.component';
import { ConsultasOrdensPagamentoComponent } from './moduloRelatorios/consultas/ordens-pagamento/consultas-ordens-pag.component';
import { ConsultasGuiasComponent } from './moduloRelatorios/consultas/guias/consultas-guias.component';
import { ConsultasExtratosBancariosComponent } from './moduloRelatorios/consultas/extratos-bancarios/consultas-extratos-bancarios.component';
import { RelatoriosPagamentosEmiditosComponent } from './moduloRelatorios/relatorios/pagamentos-emitidos/reports-pag-emitidos.component';
import { RelatoriosExecucaoOrcamentalComponent } from './moduloRelatorios/relatorios/execucao-orcamental/reports-execucao-orcamental.component';
import { PopUpListarPagamentosExecutadosComponent } from './moduloGestao/preencher-tarefa/componentes/componente-despesa/pop-up-listar-pagamentos-executados/pop-up-listar-pagamentos-executados.component';
import { ConsultasDespesasComponent } from './moduloRelatorios/consultas/despesas/consultas-despesas.component';
import { ConsultasClassificacaoContabilisticaComponent } from './moduloRelatorios/consultas/classificacao-contab/consultas-classificacao-contab.component';
import { ConsultasReceitasComponent } from './moduloRelatorios/consultas/receitas/consultas-receitas.component';
import { ConsultasReceitasNaoConciliadasComponent } from './moduloRelatorios/consultas/receitas-nao-conc/consultas-receitas-nao-conc.component';
import { ConsultasFornecedoresComponent } from './moduloRelatorios/consultas/fornecedores/consultas-fornecedores.component';
import { ConsultasBalancoComponent } from './moduloRelatorios/consultas/balanco/consultas-balanco.component';


const routes: Routes = [
  { path: 'camposEditaveis', component: GerirCamposEditaveisComponent },
  { path: 'login', component: LoginComponent },
  { path: '', component: HomePageComponent },
  { path: 'relatoriosExecucaoOrcamental', component: RelatoriosExecucaoOrcamentalComponent },
  { path: 'relatoriosPagamentosEmitidos', component: RelatoriosPagamentosEmiditosComponent },
  { path: 'consultasGuiasPagamento', component: ConsultasGuiasComponent },
  { path: 'consultasSituacaoContributiva', component: ConsultasSituacoesContributivasComponent },
  { path: 'consultasOrdensPagamento', component: ConsultasOrdensPagamentoComponent },
  { path: 'consultasProcessos', component: ConsultasProcessosComponent },
  { path: 'consultasDespesas', component: ConsultasDespesasComponent },
  { path: 'consultasReceitas', component: ConsultasReceitasComponent },
  { path: 'consultasReceitasNaoConciliadas', component: ConsultasReceitasNaoConciliadasComponent },
  { path: 'consultasFornecedores', component: ConsultasFornecedoresComponent },
  { path: 'consultasBalanco', component: ConsultasBalancoComponent },
  { path: 'consultasExtratosBancarios', component: ConsultasExtratosBancariosComponent },
  { path: 'consultasClassificacaoContabilistica', component: ConsultasClassificacaoContabilisticaComponent },
  { path: 'processosArquivados', component: ProcessosArquivadosComponent },
  { path: 'processoDetalhe/:id', component: ProcessoDetalheComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'adicionarPerfil', component: AdicionarPerfilComponent },
  { path: 'utilizador', component: UtilizadorComponent },
  { path: 'novoUtilizador', component: NovoUtilizadorComponent },
  { path: 'logs', component: LogsComponent },
  { path: 'recover/:token/:username', component: RecoverPasswordComponent},
  { path: 'firstAcess/:token', component: RecoverPasswordComponent},
  { path: 'contribHomePage', component: ContribHomeSearchComponent },
  { path: 'contribValidationHomePage', component: ContribValidationHomeSearchComponent },
  { path: 'configurarTarefas', component: ConfigurarTarefasComponent },
  { path: 'entidadeEmpregadora', component: EntidadeEmpregadoraComponent},
  { path: 'trabalhadores', component: TrabalhadoresComponent},
  { path: 'vincularTrabalhador', component: VincularTrabalhadorComponent},
  { path: 'novoTrabalhador', component: NovoTrabalhadorComponent},
  { path: 'novoTrabalhador/:id', component: NovoTrabalhadorComponent},
  { path: 'registoSuspensao', component: RegistoSuspensaoComponent},
  { path: 'registoSuspensao/:id', component: RegistoSuspensaoComponent},
  { path: 'novoResponsavelLegal', component: NovoResponsavelLegalComponent},
  { path: 'novoResponsavelLegal/:id', component: NovoResponsavelLegalComponent},
  { path: 'editarResponsavelLegal/:id', component: EditarResponsavelLegalComponent},
  { path: 'declaracaoRemuneracao', component: DeclaracaoRemuneracaoComponent},
  { path: 'contaCorrente', component: ContaCorrenteComponent},
  { path: 'guiaPagamento', component: GuiaPagamentoComponent},
  { path: 'tarefa', component: TarefaComponent },
  { path: 'processos', component: ConfigurarProcessosComponent},
  { path: 'novoConfigurarProcesso', component: NovoConfigurarProcessosComponent},
  { path: 'novoConfigurarProcesso/:id', component: NovoConfigurarProcessosComponent},
  { path: 'preencherTarefa/:id', component: PreencherTarefaComponent},
  { path: 'controloDeAcesso', component: ControloDeAcessoComponent},
  { path: 'popupListarPagamentosPDF', component: PopUpListarPagamentosExecutadosComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes),MatFormFieldModule,MatInputModule],
  exports: [RouterModule,MatIconModule,MatFormFieldModule,
  MatSelectModule,MatInputModule,MatExpansionModule]
})
export class AppRoutingModule { }
