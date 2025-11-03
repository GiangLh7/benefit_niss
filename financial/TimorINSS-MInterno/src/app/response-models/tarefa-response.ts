import { ComponenteOrcamento } from "../models/componenteOrcamento";
import { PreencherTarefa } from "../models/preencherTarefa";
import { ComponenteAccoesTarefa, ComponenteAcessoPerfil, ComponenteAcessoUtilizador, ComponenteClassificacaoSubClassificTarefa, ComponenteConciliacaoMovimentos, ComponenteDespesa, ComponenteDocumentoTarefa, ComponenteReceita, ComponenteTexto } from "../models/tarefa";
import { ComponenteListagem } from "./componente-response";

export interface TarefaListagemResponse {
  rows: number;
  tarefa: TarefaListagem[];
}


export interface TarefaListagem {
  id: number;
  numero: string;
  nome: string;
}

export interface ComponenteTarefaConfiguradaResponse {
  nomeTarefa: string;
  prazoTarefa: number;
  listaTexto: boolean;
  listaDocumento: boolean;
  componenteTexto: ComponenteTexto;
  componenteCabecalhoProcesso: boolean;
  componenteAccoesTarefa: ComponenteAccoesTarefa[];
  componenteClassificacaoSubClassific: ComponenteClassificacaoSubClassificTarefa[];
  componenteControleAcessoPerfil: ComponenteAcessoPerfil[];
  componenteControleAcessoUtilizador: ComponenteAcessoUtilizador[];
  componenteCarregarDocumentos: ComponenteDocumentoTarefa[];
  listaComponente: ComponenteListagem[];
  componenteBotaoArquivar: boolean;
  componenteOrcamento: ComponenteOrcamento;
  componenteDespesa: ComponenteDespesa;
  componenteConciliacaoMovimentos: ComponenteConciliacaoMovimentos;
  componenteReceita: ComponenteReceita;

}

export interface TarefaConfigListagem {
  id: number;
  tarefaInicial: boolean;
  nome: string;
}

export interface TarefaAtivoListagemResponse {
  rows: number;
  tarefas: TarefaAtivoListagem[];
}

export interface TarefaAtivoListagem {
  id: number;
  dataInicioProcesso: string;
  nomeProcesso: string;
  nome: string;
  estado: number;
  estadoDays: number;
  ultimaAtualizacao: Date;
  numeroProcesso: string;
}

export interface TarefaDataResponse {
  data: PreencherTarefa;
}