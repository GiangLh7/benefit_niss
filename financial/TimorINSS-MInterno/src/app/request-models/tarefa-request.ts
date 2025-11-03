import { ComponenteOrcamento } from 'src/app/models/componenteOrcamento';
import { PreencherTarefa } from '../models/preencherTarefa';
import {ComponenteAccoesTarefa, ComponenteAcessoPerfil, ComponenteAcessoUtilizador, ComponenteClassificacaoSubClassificTarefa, ComponenteConciliacaoMovimentos, ComponenteDespesa, ComponenteDocumentoTarefa, ComponenteReceita, ComponenteTexto } from "../models/tarefa";
import { ComponenteListagem } from "../response-models/componente-response";
import { FilterRequest } from "./utils-request";


export interface TarefaListagemRequest {
  filter: FilterRequest;
}

export interface EditarTarefaRequest {
  idTarefa: number;
  nomeTarefa: String;
  listaTexto: boolean;
  listaDocumento: boolean;
  componenteCabecalhoProcesso: boolean;
  componenteBotaoArquivar: boolean;
}

export interface ConfigurarTarefaRequest {
  idTarefa: number;
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
  componenteOrcamento?: ComponenteOrcamento;
  componenteDespesa?: ComponenteDespesa;
  componenteConciliacaoMovimentos?: ComponenteConciliacaoMovimentos;
  componenteReceita?: ComponenteReceita;
}

export interface SwitchTarefaAtivoRequest {
  id: number;
}

export interface GetHistoricoTextoRequest {
  tarefaAtivoId: number;
}

export interface GetAllSubClassificacaoByTarefaAtivaIdRequest {
  tarefaAtivoId: number;
}

export interface GetAllTarefasASeguirRequest {
  tarefaAtivoId: number;
}

export interface GetTarefaDataRequest {
  tarefaAtivoId: number;
}
export interface TarefaDataRequest {
  tarefaAtivoId: number;
  data: PreencherTarefa;
}