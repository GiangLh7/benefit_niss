import { FilterRequest } from "./utils-request";

export interface ProcessosListagemRequest {
    filter: FilterRequest;
  }

  export interface ProcessoUpdateRequest {
    id: number;
  }

  export interface ProcessoConfigRequest {
    id?: number;
    nome: string;
    tarefas: ProcessoConfigTarefa[];
    perfis: number[];
  }

  export interface ProcessoConfigTarefa {
    id: number;
    tarefaInicial: boolean;
  }

  export interface ListProcessoConfiRequest {
    id: number;
  }

  export interface GetProcessoDataRequest {
    processoId: number;
  }

  export interface GetHistoricoTextoRequest {
    processoId: number;
  }

  export interface GetProcessosRelatoriosRequest extends FilterRequest {
    processoConfigId?: number;
    viewType: GetProcessosRelatoriosRequestViewType;
  }

  export enum GetProcessosRelatoriosRequestViewType {
    All = 0,
    NotArchived = 1,
    Archived = 2
  }