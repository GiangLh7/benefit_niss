import { Declaracao } from "../models/declaracao";
import { FilterRequest } from "./utils-request";

export interface GetDeclaracaoByEntidadeAndFilterRequest {
  IdEntidade: number;
  filter: FilterRequest;
}

export interface SaveDeclaracoesRequest
{
  declaracoes: Declaracao[];
  data: Date;
  entidadeId: number;
}

export interface GetResumoDeclaracaoRequest
{
  declaracoes: Declaracao[];
}
