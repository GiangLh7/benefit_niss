import { AgrupamentosConfig } from '../models/agrupamentosConfig';



export interface AgrupamentoConfigResponse {
  agrupamentos: AgrupamentosConfig[];
}



export interface RelatoriosExecucaoOrcamentalListagemResponse {
  rows: number;
  lista: RelatoriosExecucaoOrcamentalListagem[];
}

export interface RelatoriosExecucaoOrcamentalListagem {
  contaOGE: string;
  centrosCusto: string[];
  rubricas: string[];
  valorOrcamentado: number;
  valorAnoAnterior: number;
  janeiro: number;
  fevereiro: number;
  marco: number;
  abril: number;
  maio: number;
  junho: number;
  julho: number;
  agosto: number;
  setembro: number;
  outubro: number;
  novembro: number;
  dezembro: number;
  totalExecucao: number;
  taxaExecucao: number;
  variacaoExecucao: number;
}

