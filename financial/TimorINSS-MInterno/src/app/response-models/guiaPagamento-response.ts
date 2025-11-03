export interface GuiaListagemResponse
{
  rows: number;
  guias: GuiaListagem[];
}

export interface GuiaListagem
{
  idGuia: number;
  numDocumento: string;
  mesAno: Date;
  descricao: string;
  valor: number;
  juros: number;
  total: number;
  dtValidade: Date;
  dataCriacao: Date;
  tipo: number;
  valorPago: number;
  dtValorPago?: Date;
  comprovativoPagamento?: string;
  estadoPagamento: number;
  niss: string;
  paymentRef: string;
  qrInvoice: string;
  bankCode: string;
  approveFile: string;
}


export interface RelatoriosGuiasListagemResponse {
  rows: number;
  guias: RelatoriosGuiasListagem[];
}

export interface RelatoriosGuiasListagem {
  numeroGuia: string;
  empregador: string;
  periodo: Date;
  estado: string;
  valorGuia: number;
  valorComprovativo: number;
  pdf: number[];
  valorDivida: number;
}
