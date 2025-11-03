import { MovimentosPorConciliar } from "./movimentosBancarios";

export interface ComponenteReceitaRegisto
{
  id: number;
  idOrcamentoRegistoAprovado: number;
  tarefaAtivoFK: number;
  departamentoFk: number;
  centroCustoFk?: number;
  tipoContaFk: number;
  codigoContaFk: number;
  codigoContaDebitoFk: number;
  agrupamentoConfigFk: number;
  descricao: string;
  valor: number|undefined;
  listaMovimentosConciliados: MovimentosPorConciliar [];
}


export interface ValoresReceita
{
  descricao: string;
  valorOrcamentado: number;
  valorExecutado: number;
}

export interface ReceitaRelatorioResponse {
  rows: number;
  despesas: ReceitaRelatorio[];
}


export interface ReceitaRelatorio
{
  id: number;
  departamentoINSS: string;
  centroCusto: string;
  tipoConta: string;
  descricao: string;
  valor: number;
  data: Date;
  numeroProcesso: string;
  utilizadorAlteracao: string;
}

export interface ReceitaNaoConciliadaRelatorioResponse {
  rows: number;
  receitas: ReceitaNaoConciliadaRelatorio[];
}


export interface ReceitaNaoConciliadaRelatorio
{
  descricao: string;
  numeroDocumento: string;
  valor: number;
  data: Date;
  contribuinte?: string;
}



