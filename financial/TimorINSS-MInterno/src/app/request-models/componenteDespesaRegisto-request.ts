import { MyMaxNumberStateMatcher } from "../matcher";
import { Compromisso } from "../models/compromisso";
import { Despesa } from "../models/despesa";
import { FilterRequest } from "./utils-request";

export interface RegistoDespesaRequest {
  despesa: Despesa;
}

export interface GetAllDespesaRegistadaRequest{
  tarefaAtivoId: number;
}

export interface DeleteDespesaRequest{
  id: number;
}

export interface DeleteRequest{
  id: number;
}

export interface CompromissoUpsertRequest {
  compromisso: Compromisso;
}
export interface GetValoresDespesaByIdCodigoOrcamentoRequest{
  agrupamentoFk: number;
  orcamentoRegistoFk: number;
}

export interface DeleteListaDespesaRequest{
  ids: number[];
}

export interface UpdateDespesaRequest{
  id: number;
  estado: string;
}

export interface DespesasRelatorioRequest {
  EstadoDespesa?: number;
  filter: FilterRequest;
}

export interface GetDespesasCompromissoRequest {
  tarefaAtivoId: number;
}

export interface CompromissoUpsertRequest {
  compromisso: Compromisso;
  tarefaAtivoId: number;
}

export interface UpdateDespesaCabimentadaRequest {
  id: number;
  valor: number;
}
