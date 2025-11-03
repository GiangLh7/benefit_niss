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
  dataCriacao: Date;
  descricao: string;
  valor: number;
  juros: number;
  total: number;
  dtValidade: Date;
  tipo: number;
  valorPago: number;
  dtValorPago?: Date;
  comprovativoPagamento?: string;
  paymentRef?: string;
  bankCode: string;
  estadoPagamento: number;
  userName: string;
}
