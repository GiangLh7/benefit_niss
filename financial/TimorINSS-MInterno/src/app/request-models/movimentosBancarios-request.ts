import { MovimentosAConciliar, MovimentosPorConciliarListagemType } from "../models/movimentosDespesaReceita";
import { FilterRequest } from "./utils-request";

export interface MovimentosListagemRequest {
  CaixaId?: number;
  BancoId?: number;
  GetBalance?: boolean;
  filter: FilterRequest;
}

export interface MovimentosAConciliarListagemRequest {
  filter: MovimentosAConciliarFilterRequest;
}

export interface MovimentosUpsertRequest {
  data: MovimentosUpsertDataRequest;
}

export interface MovimentosUpsertDataRequest {
  id?: number;
  caixaId?: number;
  bancoId?: number;
  descricao: string;
  data?: Date;
  valor: number;
  tarefaAtivoId?: number;
}

export interface MovimentosDespesaReceitaUpsertRequest {
  id?: number;
  tarefaAtivoId: number;
  tipoMovimento: number;
  movimentoBancarioId?: number;
  isReceita: boolean;
  valor: number;
  tipoDocumento: string;
  numeroDocumento: string;
  comprovativo?: string;
  nomeComprovativo: string;
  //coisas novas
  contabilidadeCredito: number;
  contabilidadeDebito: number;
  departamentoINSS?: number;
  centroCusto?: number;
  tipoConta?: number;
  contaOSS?: number;
  guiaOrReserva?: boolean;
  type: MovimentosPorConciliarListagemType,
  isGuia?: boolean;
  isReserva?: boolean;
}

export interface MovimentosAConciliarFilterRequest {
  tarefaAtivoId?: number;
  filtroConciliado?: FiltroConciliado;
  isReceita?: boolean;
  filter: FilterRequest;
}

export interface MovimentosAConciliarConciliacaoFilterRequest {
  tarefaAtivoId?: number;
  conciliadoCom?: number;
  filter: FilterRequest;
}

export interface MovimentosBancariosConciliacaoFilterRequest {
  tarefaAtivoId?: number;
  conciliadoCom?: number;
  conciliadoComType?: MovimentosPorConciliarListagemType;
  filter: FilterRequest;
}


export enum FiltroConciliado {
  Todos = 0,
  Conciliados = 1,
  NaoConciliados = 2
}

export interface DesfazerConciliacaoRequest {
  id: number;
  tarefaAtivoId: number;
  type?: MovimentosPorConciliarListagemType;
}
export interface GetMovimentosConciliadosRequest {
  filter: FilterRequest;
}

export interface ConciliarMovimentosRequest {
  tarefaAtivoId: number;
  movimentosBancarios: number[];
  movimentosAConciliar: MovimentosAConciliar[];
}

export interface ConciliarMovimentosPermissionsListRequest {
  tarefaAtivoId: number;
}
