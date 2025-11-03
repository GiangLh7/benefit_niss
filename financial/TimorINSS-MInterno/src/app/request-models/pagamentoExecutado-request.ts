import { Destinatario } from "../models/destinatario";
import { ClassificacaoContabilisticaExecucao, PagamentoExecutado, PagamentoExecutadoDestinatario } from "../models/pagamentos_executados";
import { FilterRequest } from "./utils-request";


export interface SavePagamentoExecutadoRequest {
  destinatario: Destinatario
  pagamento: PagamentoExecutado
  importId?: number;
}

export interface GetDestinatarioPagamentoRequest {
  numPagamento: string;
}

export interface DeletePagamentoRequest {
  id: number;
}


export interface GetPagamentoExecutadoRequest {
  idDestinatario: number;
}

export interface EditPagamentoExecutadoRequest {
  listaIdPagamento: number[];
}

export interface GetOrdensPagamentoRelatoriosRequest extends FilterRequest {
  search?: string;
  estado?: number;
  numeroPagamento?: string;
  contaOGE?: number;
  centroCusto?: number;
}

export interface ReportsDropdownContasOGERequest extends FilterRequest {
  centroCusto?: number;
}

export interface ListagemPagamentosProcessoRequest {
  processoAtivo: number;
}

export interface FornecedoresRelatoriosRequest extends FilterRequest {
  niss?: string;
  tin?: string;
}

export interface BalancoRelatoriosRequest extends FilterRequest {
  nivel?: number;
  compararAnoAnterior?: boolean;
}

export interface SaveClassificacaoContabilisticaExecucaoRequest {
  despesasIds: number[];
  tarefaAtivoId: number;
  classificacao: ClassificacaoContabilisticaExecucao
}


