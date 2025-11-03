import { ComponenteOrcamento } from 'src/app/models/componenteOrcamento';
import { ComponenteAccoesTarefa, ComponenteAcessoPerfil, ComponenteAcessoUtilizador, ComponenteClassificacaoSubClassificTarefa, ComponenteConciliacaoMovimentos, ComponenteDespesa, ComponenteDocumentoTarefa, ComponenteReceita, ComponenteTexto } from "../models/tarefa";

export interface ComponenteTextoRequest {
  idTarefa: number;
  componenteTexto: ComponenteTexto;
}

export interface ComponentePrazoTarefaRequest {
  idTarefa: number;
  prazoTarefa: number;
}

export interface ComponenteAccaoTarefaRequest {
  idTarefa: number;
  accaoTarefa: ComponenteAccoesTarefa[];
}

export interface ComponenteDocumentoTarefaRequest {
  idTarefa: number;
  documentoTarefa: ComponenteDocumentoTarefa[];
}

export interface ComponenteClassificacaoSubClassificTarefaRequest {
  idTarefa: number;
  classificacaoSubClassific: ComponenteClassificacaoSubClassificTarefa[];
}

export interface ComponenteControloAcessoPerfilTarefaRequest {
  idTarefa: number;
  controloAcessoPerfil: ComponenteAcessoPerfil[];
}

export interface ComponenteControloAcessoUtilizadorTarefaRequest {
  idTarefa: number;
  controloAcessoUtilizador: ComponenteAcessoUtilizador[];
}

export interface ComponenteOrcamentoRequest {
  componenteOrcamento: ComponenteOrcamento;
}

export interface ComponenteDespesaRequest {
  componenteDespesa: ComponenteDespesa;
}

export interface ComponenteConciliacaoMovimentosRequest {
  componenteConciliacaoMovimentos: ComponenteConciliacaoMovimentos;
}

export interface ComponenteReceitaRequest {
  componenteReceita: ComponenteReceita;
}

