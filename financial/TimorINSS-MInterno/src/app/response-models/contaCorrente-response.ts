import { DecimalPipe } from "@angular/common";

export interface ContaCorrenteListagemResponse {
  rows: number;
  contaCorrente: ContaCorrenteListagem[];
}

export interface ResumoContaCorrenteListagemResponse {
  data: ReumoContaCorrenteListagem[];
}

export interface ContaCorrenteListagem {
  idContaCorrente: number;
  idEntidade?: number;
  idTrabalhador?: number;
  tipoDivida: string;
  dataVencimento: Date;
  valorEntidade: number;
  valorTrabalhador: number;
  valorTotal: number;
  pagoEm?: Date;
  situacaoPagamento: number;
  mesAno: Date;
  valorPago?: number;
  numDocumento: string;
  niss: string;
  juroApurado?: number;
  gerarGuia: boolean;
  guiaPagamentoFK?: number;
}

export interface ReumoContaCorrenteListagem {
  ano: number;
  contribuicoes: number;
  quotizacoes: number;
  valorAPagar: number;
  totalJuros: number;
  totalPago: number;
  totalDivida: number;
}


export interface ResumoContaListagem {
  ano: number;
  somatorioContribuicoes: string;
  somatorioQuotizacoes: string;
  totalPagar: string;
  totalJuros: string;
  totalPago: string;
  totalDivida: string;
}

export interface GetAllContasStatesFromYearByFilterResponse
{
  contasState : ContasState[];
}

export interface ContasState
{
  id: number;
  state: string;
  month: number;
  stateId: number;
}
