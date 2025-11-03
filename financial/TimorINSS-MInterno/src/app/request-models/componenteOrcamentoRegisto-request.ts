import { MovimentosPorConciliarListagemType } from "../models/movimentosDespesaReceita";

export interface GetComponenteOrcamentoRegistoRequest {
  idTarefaActivo: number;
}

export interface UpdateComponenteOrcamentoRegistoDatesRequest {
  idTarefaActivo: number;
  dataInicio: Date;
  dataFim: Date;
}

export interface GetComponenteOrcamentoRegistoAprovadoRequest {
  idTarefaActivo: number;
}

export interface  OrcamentoExtractRequest {
    idComponenteOrcamentoRegisto: number;
    filtrosDepartamento: number[];
    filtrosCentroDeCusto: number[];
    filtrosTipoDeConta: number[];
}

export interface GetGuiaMovimentoRequest {
  id: number;
  type: MovimentosPorConciliarListagemType;
}
