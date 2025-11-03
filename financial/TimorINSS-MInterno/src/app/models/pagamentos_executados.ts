import { Destinatario } from "./destinatario";

export interface PagamentoExecutado
{
  id: number;
  compromissoFk: number;
  destinatarioFk: number;
  numeroPagamento: string;
  valorExecutado: number;
  estado: string;
  iban?: string;
  swift?: string;
  numeroConta?: string;
  processoId: number;
  codigoContaDebito?: number;
  codigoContaCredito?: number;
  dataObrigacao?: Date;
}


export interface PagamentoExecutadoDestinatario
{
  id: number;
  compromissoFk: number;
  descricaoDespesa: string;
  destinatario: Destinatario;
  numeroPagamento: string;
  valorExecutado: number;
  estado: string;
  iban?: string;
  swift?: string;
  numeroConta?: string;
  processoId: number;
  codigoContaDebito?: number;
  codigoContaCredito?: number;
  dataObrigacao?: Date;
}

export interface ListaPagamentosDoProcesso
{
  id: number;
  valor: number;
  numeroPagamento: string;
  destinatario: Destinatario;
  contaOGE:string;
  iban?: string;
  numeroConta?: string;
  processoId: number;
  codigoContaDebito?: number;
  codigoContaCredito?: number;
  dataObrigacao?: Date;
}

export interface ClassificacaoContabilisticaResponse{
  rows: number;
  movimentos: ClassificacaoContabilistica[];
}

export interface ClassificacaoContabilistica
{
  data?: Date;
  credito: string;
  debito: string;
  valor: number;
  numeroPagamento: string;
  nomeDestinatario: string;
  niss: string;
  tin: string;
  isExecucao: boolean;
}

export interface FornecedoresResponse{
  rows: number;
  movimentos: Fornecedores[];
}

export interface Fornecedores
{
  niss: string;
  tin: string;
  nome: string;
  pagamento: string;
  descricao: string;
  valor: number;
  data: Date;
  conciliado: boolean;
}



export interface BalancoResponse{
  lista: BalancoRelatorio[];
}

export interface BalancoRelatorio
{
  id: number;
  parentId?: number;
  nome: string;
  codigo: string;
  credito: number;
  debito: number;
  creditoAntes: number;
  debitoAntes: number;
  temFilhos: boolean;
}

export interface ClassificacaoContabilisticaExecucao
{
  codigoContaDebito: number;
  codigoContaCredito: number;
  dataExecucao: Date;
}
