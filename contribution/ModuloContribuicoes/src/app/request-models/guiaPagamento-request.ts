import { FilterRequest } from "./utils-request";

export interface GuiaPagamentoRequest {
  guiaPagamento: GuiaPagamento;
  idContaCorrente: number;
}

export interface GuiaPagamento {
  idGuia: number;
  guiaEntidadeFk: number;
  dtEmissao: Date;
  valorApagar: number;
  descricao: string;
  valor: number;
  juros?: number;
  total: number;
  indPago: number;
  dtValidade: Date;
  tipoGuia: number;
  guiaPagamentoPai?: number;
  mesAno: Date;
}

export interface GetAllGuiasStatesFromYearByFilterRequest
{
  idEntidade: number;
  filter: FilterRequest;
}

export interface GetGuiasDetailsRequest
{
  idGuiaPagamento: number;
  filter: FilterRequest;
}

export interface useCreditInGuiaPagamentoRequest{
  idEntidade: number;
  idGuia: number;
}

export interface insertComprovativoPagamentoRequest{
  idEntidade: number;
  idGuia: number;
  valorComprovativoPag: number;
  dataComprovativoPag: Date;
  comprovativoPag: string;
  bankCode: string;
}

export interface approveComprovativoPagamentoRequest{
  idEntidade: number;
  idGuia: number;
  valorComprovativoPag: number;
  dataComprovativoPag: Date;
  comprovativoPag: string;
  rejectReason: string;
  rejectStatus: string;

}


