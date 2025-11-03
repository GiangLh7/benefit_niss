import { ListaPagamentosDoProcesso, PagamentoExecutadoDestinatario } from "../models/pagamentos_executados";

export interface DestinatarioPagamentoExecutadosResponse {
  destinatarioPagamentosExecutados: PagamentoExecutadoDestinatario[];
  excelExtraido: string;
}

export interface RelatoriosOrdensPagamentoListagemResponse {
  rows: number;
  pagamentos: RelatoriosOrdensPagamentoListagem[];
}

export interface RelatoriosOrdensPagamentoListagem {
  numeroPagamento: string;
  destinatario: string;
  conta: string;
  iban: string;
  dataEmissao: Date;
  estado: string;
  valor: number;
  countDestinatarios: number;
  countContas: number;
}


export interface ListagemPagamentosProcessoResponse {
  pagamentos: ListaPagamentosDoProcesso[];
}



