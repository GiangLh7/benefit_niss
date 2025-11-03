import { ProcessoConfigTarefa } from "../request-models/processo-request";

export interface ProcessosListagemResponse {
  rows: number;
  processos: ProcessoListagem[];
}

export interface ProcessoListagem {
    id: number;
    data: string;
    nome: string;
    indAtivo: boolean;
  }

export interface ProcessoConfigResponse {
    id: number;
    nome: string;
    tarefas: ProcessoConfigTarefa[];
    perfis: number[];
}

export interface ProcessosArquivadosListagemResponse {
  rows: number;
  processos: ProcessosArquivadosListagem[];
}

export interface ProcessosArquivadosListagem {
  id: number;
  nome: string;
  data: string;
}

export interface ProcessoDataResponse {
  id: number;
  nome: string;
  data: Date;
  nomeUtilizadorUltimaEdicao: string;
  quantidadeTarefas: number;
  arquivado: boolean;
}


export interface RelatoriosProcessosListagemResponse {
  rows: number;
  processos: RelatoriosProcessosListagem[];
}

export interface RelatoriosProcessosListagem {
  id: number;
  tipo: string;
  perfis: string[];
  arquivado: boolean;
  ultimaTarefa: RelatoriosProcessosListagemUltimaTarefa;
}

export interface TipoProcessosRelatoriosResponse {
  tipoProcessos: TipoProcessosRelatorios[];
}

export interface TipoProcessosRelatorios {
  id: number;
  nome: string;
}

export interface RelatoriosProcessosListagemUltimaTarefa {
  id: number;
  nome: string;
}